from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from .chat_models import ChatRequest, ChatResponse, CrewResponse
from .components import PurposeModels
from .crew import Babynest
from dotenv import load_dotenv
from typing import Union
import logging
import httpx
import os



load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

file = __name__.strip("__")
logger = logging.getLogger(file)

limiter = Limiter(key_func=get_remote_address, default_limits=["5/minute"])

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
    "http://127.0.0.1:3000",
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


assistant = PurposeModels()

@app.get("/")
async def root():
    return {"message": "Backend running. Visit /docs"}


@app.post("/api/chat", response_model=Union[ChatResponse, CrewResponse])
async def chat(chat_request: ChatRequest):
    try:
        route = await assistant.router(query=chat_request.user_request)
        logger.info("Successfully determined route")
    except Exception as e:
        logger.exception(f"Failed to determine route: {e}")
        route = "langchain"
    if route == "langchain":
        logger.info("Passing conversation to langchain")
        try:
            output = await assistant.general_chat(query=chat_request.user_request,session_id=chat_request.session_id)
            logger.info("Chatbot returned an answer!")
            return ChatResponse(output=output)
        except Exception as e:
            logger.exception("Chatbot failed to return an answer!")
            output = "Chatbot did not return an answer"
            return ChatResponse(output=output)
    elif route == "crewai":
        try:
            logger.info("Routing conversation to Crewai")
            crew_instance = Babynest().crew()
            response = crew_instance.kickoff(inputs={"user_query":chat_request.user_request})
            logger.info("CrewAI executed successfully!")
            return CrewResponse(output=response.raw)
        except Exception as e:
            output = "CrewAI failed"
            logger.exception("Crew Failed")
            return ChatResponse(output=output)
    

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



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
