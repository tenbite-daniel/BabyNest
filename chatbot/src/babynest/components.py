from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_cohere import CohereEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from typing import List, Tuple, Dict
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
    logger.info("Successfully initialized Generative AI embeddings!")
except Exception as e:
    logger.error("Encountered an error in loading the embedding model!")

try:
    stored_data = Chroma(
    persist_directory=db_directory,
    embedding_function=embeddings   
)
    logger.info("Successfully connected to the vector database")
except Exception as e:
    logger.exception("Failed to load vector db")

class ContentRetriever:
    def get_documents(self, query: str) -> str:
        docs = stored_data.invoke(query)
        return "\n\n".join(doc.page_content for doc in docs)
    
    def web_search_tool(self,query):
        pass

class AIModels:
    async def router(self,query):
        try:
            logger.info("Connecting to the router LLM...")
            router_llm = ChatGroq(
                model=os.getenv("ROUTER_MODEL"),
                api_key=os.getenv("GROQ_API_KEY"),
                temperature="0.7"
            )
            logger.info("Successfully connected to router llm")
        except Exception as e:
            logger.exception("Failed to connect to the routing llm")
            return "Could not set up routing AI model"
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
        {{input}}
        """)
        router_chain = router_template | router_llm | StrOutputParser()
        try:
            route = await router_chain.ainvoke({"input": query})
            logger.info(f"Successfully determined route: {route}")
            return route
        except Exception as e:
            logger.exception("Failed to authoritatively determine the route. Proceeding with langchain")
            return "langchain"
        
    