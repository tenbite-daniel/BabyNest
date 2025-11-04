from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_cohere import CohereEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from tavily import TavilyClient
import logging
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)

project_root = Path(__file__).resolve().parent.parent.parent
knowledge_directory = project_root/"knowledge"
db_directory = project_root/"db"

try:
    embeddings = CohereEmbeddings(
    model="embed-english-v3.0",
    cohere_api_key=os.getenv("COHERE_API_KEY")
)
    logger.info("Successfully initialized Generative AI embeddings.")
except Exception as e:
    embeddings=None
    logger.error("Encountered an error in loading the embedding model!")

try:
    stored_data = Chroma(
    persist_directory=db_directory,
    embedding_function=embeddings   
)
    logger.info("Successfully connected to the vector database")
except Exception as e:
    logger.exception("Failed to load vector db")

try:
    logger.info("Setting up Tavily for web search.")
    client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    logger.info("Successfully set up Tavily client")
except Exception as e:
    logger.exception("Failed to set up Tavily client.")

class ContentRetriever():
    async def get_documents(self, query: str) -> str:
        try:
            docs = stored_data.similarity_search(query, k=4)
            return "\n\n".join(doc.page_content for doc in docs)
        except Exception as e:
            logger.exception("Failed to retrieve documents from Chroma.")
            return ""
    
    async def web_search_tool(self,query):
        results = client.search(query=query, max_results=7)
        logger.info("Tavily query successfull.")
        formatted_results = []
        for x in results["results"]:
            answer = f'Title:\n {x["title"]}\n\nContent: {x["content"]}'
            logger.info("Successfully formatted Tavily responses.")
            formatted_results.append(answer)

retriever = ContentRetriever()

class AIModels():
    async def router_model(self):
        try:
            load_dotenv()
            logger.info("Connecting to the router LLM...")
            load_dotenv()
            router_llm = ChatGroq(
                # model=os.getenv("ROUTER_MODEL"),
                model = "llama-3.3-70b-versatile",
                api_key=os.getenv("GROQ_API_KEY"),
                temperature=0.7
            )
            logger.info("Successfully connected to router llm")
            return  router_llm
        except Exception as e:
            logger.exception("Failed to connect to the routing llm")
            return "Could not set up routing AI model"
        
    async def general_model(self):
        try:
            logger.info("Connecting to general chat LLM")
            general_llm = ChatGroq(
                model=os.getenv("GENERAL_MODEL"),
                api_key=os.getenv("GROQ_API_KEY"),
                temperature=0.7
            )
            return general_llm
        except Exception as e:
            logger.critical("Failed to connect to the general chat LLM")
            return "Coild not connect to the general chat LLM"
models = AIModels()

class PurposeModels():
    async def router(self,query):
        router_template = ChatPromptTemplate.from_template("""
        You are **BabyNest's Intelligent Routing System**.  
        Your goal is to deeply analyze the user's message and decide the correct processing route.

        ###  Routing Rules

        You must output only **one word**:
        - `'langchain'` → for general conversational queries, FAQs, emotional support, or brand information.
        - `'crewai'` → for complex requests requiring multi-step reasoning, data retrieval, or specialized research (e.g., generating medical reports, summaries, or research documents).

        ###  Decision Framework
        1. If the user asks about **a disease, condition, symptom, or BabyNest’s purpose/services**, route to `'langchain'`.
        2. If the user requests **a report, research, analysis, treatment guide, plan, or information synthesis**, route to `'crewai'`.
        3. If the query is **ambiguous, incomplete, or emotionally charged but unclear**, route to `'langchain'` and allow for clarification.

        ###  Examples
        - “What is postpartum depression?” → `langchain`
        - “Can you create a report about breastfeeding techniques?” → `crewai`
        - “I feel tired all the time after delivery.” → `langchain`
        - “Please research and summarize WHO guidelines on infant nutrition.” → `crewai`
        - “Tell me what BabyNest does.” → `langchain`
        - “Help me find clinical evidence for home births.” → `crewai`

        ###  Output Format
        Respond with exactly one token:
        `langchain` or `crewai`

        ### User Query:
        {input}
        """)
        
        try:
            router_llm = await models.router_model()
            router_chain = router_template | router_llm | StrOutputParser()
            route = await router_chain.ainvoke({"input": query})
            logger.info(f"Successfully determined route: {route}")
            return route
        except Exception as e:
            logger.exception("Failed to authoritatively determine the route. Proceeding with langchain")
            return "langchain"
        
    async def general_chat(self, query):
        general_chat_prompt = ChatPromptTemplate.from_template("""
            You are the **General Chat Assistant for BabyNest**, an organization dedicated to supporting maternal health, baby care, and family wellness.

            Your personality blends **warmth, intelligence, and professionalism**.  
            You communicate like a thoughtful human — brief, natural, and emotionally aware.

            ---

            ### Your Core Purpose:
            - Answer questions related to **BabyNest** — who we are, what we do, our services, and general maternal or baby-care information.  
            - Provide **accurate, caring, and empathetic** responses.  
            - For **unclear or vague queries**, ask smart follow-up questions to clarify.  
            - If a query is **off-topic**, you may answer briefly but **politely remind** the user that your main focus is BabyNest.  
            - Be subtle and vary your phrasing so it feels human and not scripted (warn first time, hint gently later, then remind more directly if repeated).

            ---

            ### Style Guidelines:
            - **Tone:** Warm, caring, yet professional.  
            - **Length:** 1–3 short sentences max.  
            - **Format:** Use simple structure; emojis are okay when natural (e.g., 👶❤️).  
            - **No robotic repetition** — respond like a human who remembers context.  
            - Show gentle empathy when users mention emotions, health, or stress.

            ---

            ### Behavioral Rules:
            1. If the question is **about BabyNest** → Answer confidently and naturally.  
            2. If it’s **off-topic** → Give a friendly brief answer, then gently mention your main focus.  
            3. If **ambiguous** → Ask for clarification in a natural, conversational way.  
            4. If **medical** but within scope → Give safe, informative responses and remind users to consult a professional for diagnosis or treatment.  
            5. Keep every message concise but genuinely helpful.

            ---

            Context: {context}  
            User: {user_query}  
            BabyNest Assistant:
            """)
        
        try:
            general_llm = await models.general_model()
            general_chain = general_chat_prompt | general_llm |StrOutputParser() 
            output = await general_chain.ainvoke({"context":retriever.get_documents(query=query),
             "user_query": query })
            logger.info("General chat: Successful")
            return output
        except Exception as e:
            logger.exception("General chat: Failed")
            return "General chat failed to return an answer"

    