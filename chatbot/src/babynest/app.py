from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from uuid import uuid4
import logging
import os
import httpx

from langchain_groq import ChatGroq
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_google_genai import ChatGoogleGenerativeAI

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from chat_models import ChatRequest, ChatResponse, SessionEndRequest
from components import retriever, AdaptiveConversation, session_memory, ValidationTool, ReasoningTool, GeneralChatTool
from db_handler import text_splitter
from dotenv import load_dotenv
from crew import Babynest, get_llm, llm_clients


load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

file = __name__.strip("__")
logger = logging.getLogger(file)

limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])

os.environ["LANGSMITH_TRACING_V2"] = "true"
os.environ["LANGSMITH_PROJECT"] = "BabyNest"
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_ENDPOINT"] = "https://api.smith.langchain.com"

try:
    app = FastAPI(
        title="BabyNest",
        description="A pregnancy and postpartum platform backend",
        version="0.0.1"
    )
    logger.info("Successfully initialized FastAPI app")
except Exception as e:
    logger.error("Failed to initialize the FastAPI backend")
    raise


async def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handles rate limit exceptions with a custom JSON response."""
    return JSONResponse(
        status_code=429,
        content={"detail": "Sorry, you have exceeded the rate limit (5/minute)"}
    )

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

origins = [

    "https://baby-nest-five.vercel.app",
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000"
    "http://localhost:8000",
    "http://127.0.0.1:8000"

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_headers=["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET"]
)
def get_langchain_llm():
    if os.getenv("GOOGLE_API_KEY"):
        logger.info("Using ChatGoogleGenerativeAI for LangChain components.")
        return ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=os.getenv("GOOGLE_API_KEY"), temperature=0.5)
    else:
        logger.error("No valid API key found for Gemini.")
        raise ValueError("GOOGLE_API_KEY not found.")

# llm = get_llm()
langchain_llm = get_langchain_llm()
adaptive_convo = AdaptiveConversation(summarizing_llm=langchain_llm)
crew_instance = Babynest().crew()
reasoning_tool = ReasoningTool(llm=langchain_llm)
validation_tool = ValidationTool(llm=langchain_llm)
general_chat_tool = GeneralChatTool(llm=langchain_llm)




async def route_query(user_request: str) -> str:
    """Route queries intelligently between CrewAI (health) or LangChain (general chat)."""
    router_prompt = ChatPromptTemplate.from_template(
        """
        You are a routing expert. Decide whether to route the user query to 
        'crewai' (for health) or 'langchain' (for general chat).
        
        Respond with one word only: crewai or langchain.
        
        User: "{query}"
        Response:
        """
    )
    router_chain = router_prompt | langchain_llm | StrOutputParser()

    try:
        decision = await router_chain.ainvoke({"query": user_request})
        return decision.strip().lower()
    except Exception as e:
        logger.warning(f"Router LLM failed, using keyword fallback: {e}")
        health_keywords = ["symptoms", "pain", "doctor", "swollen", "vomiting", "bleeding", "postpartum"]
        if any(keyword in user_request.lower() for keyword in health_keywords):
            return "crewai"
        return "langchain"


async def invoke_llm_with_fallback(chain, user_input, chat_history):
    """Invoke primary LLM with fallback to Gemini if it fails."""
    primary_llm_chain = chain
    fallback_llm_chain = chain.with_config(run_name="fallback", configurable={"llm": llm_clients["gemini"]})

    try:
        return await primary_llm_chain.ainvoke({"user_input": user_input, "chat_history": chat_history})
    except Exception as e:
        logger.error(f"Primary LLM failed, trying fallback: {e}")
        try:
            return await fallback_llm_chain.ainvoke({"user_input": user_input, "chat_history": chat_history})
        except Exception as fallback_e:
            logger.error(f"Fallback LLM failed: {fallback_e}")
            raise HTTPException(status_code=500, detail="Failed with all models.")


async def mcp_pipeline(user_request: str, session_id: str = None):
    """
    Modular Conversational Pipeline (MCP):
    - Route query
    - Retrieve knowledge
    - Reason and validate
    - Generate response
    """
    if not session_id:
        session_id = str(uuid4())
        session_memory[session_id] = []
    elif session_id not in session_memory:
        session_memory[session_id] = []

    history = session_memory[session_id]
    formatted_history = "\n".join([f"User: {q}\nAI: {a}" for q, a in history])

    route = await route_query(user_request)

    if route == "crewai":
        logger.info("Routing to CrewAI...")
        try:
            raw_response = crew_instance.kickoff(inputs={'user_input': user_request})
        except Exception as e:
            logger.error(f"CrewAI failed: {e}")
            raise HTTPException(status_code=500, detail="CrewAI workflow failed.")
    else:
        logger.info("Routing to LangChain RAG...")
        retrieved_docs = retriever.get_documents(user_request)
        
        raw_response = await general_chat_tool.chat(
            user_input=user_request,
            chat_history=formatted_history,
            retrieved_docs=retrieved_docs
        )

    session_memory[session_id].append((user_request, raw_response))

    return {"session_id": session_id, "response": raw_response}


@app.get("/")
async def root():
    return {"message": "Backend running. Visit /docs"}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    return await mcp_pipeline(request.user_request, request.session_id)

@app.post("/api/n8n_webhook")
async def handle_n8n_webhook(request: Request):
    """
    Endpoint to receive data and forward it to the n8n webhook.
    """
    try:
        data = await request.json()
        logger.info(f"Received data for n8n webhook: {data}")
        
        # The n8n webhook URL to forward the data to
        n8n_webhook_url = "https://unverifiedtwo.app.n8n.cloud/webhook/e77bbcc7-772f-4f7e-93ca-d16daa68e0be"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(n8n_webhook_url, json=data)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
        logger.info(f"Successfully forwarded data to n8n. Status: {response.status_code}")
        return {"status": "success", "message": "Data forwarded to n8n webhook."}
        
    except Exception as e:
        logger.error(f"Failed to handle n8n webhook request: {e}")
        raise HTTPException(status_code=500, detail="Failed to process webhook request.")


# New Pydantic model for the user's data
class UserDataRequest(BaseModel):
    name: str
    email: str
    pregnancyWeek: str

@app.post("/api/user_onboard")
async def onboard_user(request: UserDataRequest):
    """
    Endpoint to receive user's name, email, and pregnancy week, and forward it to the n8n webhook.
    """
    try:
        # Convert the Pydantic model to a dictionary to send as JSON
        user_data = request.model_dump()
        logger.info(f"Received user onboarding data: {user_data}")
        
        # The n8n webhook URL to forward the data to
        n8n_webhook_url = "https://unverifiedtwo.app.n8n.cloud/webhook/e77bbcc7-772f-4f7e-93ca-d16daa68e0be"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(n8n_webhook_url, json=user_data)
            response.raise_for_status()  # Raise an exception for HTTP errors
            
        logger.info(f"Successfully forwarded user data to n8n. Status: {response.status_code}")
        return {"status": "success", "message": "User data forwarded to n8n webhook."}
        
    except Exception as e:
        logger.error(f"Failed to onboard user and send data to n8n webhook: {e}")
        raise HTTPException(status_code=500, detail="Failed to process user data and send to webhook.")


@app.post("/api/end_session")
async def end_session(request: SessionEndRequest):
    """Summarize session and save to DB."""
    session_id = request.session_id
    if session_id not in session_memory:
        raise HTTPException(status_code=404, detail="Session not found.")

    conversation = session_memory[session_id]
    if not conversation:
        del session_memory[session_id]
        return {"message": "Session empty. Nothing saved."}

    try:
        summary = adaptive_convo.summarize_conversation(conversation)
        adaptive_convo.add_convo_history_to_db(summary)
        del session_memory[session_id]
        return {"message": "Session summarized and saved.", "summary": summary}
    except Exception as e:
        logger.exception("Failed to save session.")
        raise HTTPException(status_code=500, detail="Failed to save session data.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)