import logging
from langchain_community.document_loaders import DirectoryLoader, PDFPlumberLoader, WebBaseLoader, TextLoader
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.retrievers import BM25Retriever, EnsembleRetriever
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

# Implementing Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
file = __name__.strip("__")
logger = logging.getLogger(file)
 # Getting cwd
project_root = Path(__file__).resolve().parent.parent.parent
knowledge_directory = project_root/"knowledge"
db_directory = project_root/"db"
try:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    logger.info("Loaded gemini API key!")
except Exception as e:
    logger.exception("Failed to load Gemini Api Key!")

resources_links = []

# Websites
web_loader = WebBaseLoader(resources_links)
# PDF files
pdf_loaders = DirectoryLoader(
    str(knowledge_directory),
    loader_cls=PDFPlumberLoader,
    glob="*.pdf"
)
# Text files
text_loader = DirectoryLoader(
    str(knowledge_directory),
    loader_cls=TextLoader,
    glob="*.txt"
)
try:
    web_data = web_loader.load()
    pdf_data = pdf_loaders.load()
    text_data = text_loader.load()
    logger.info("Successfully loaded stored data...")
except Exception as e:
    logger.exception("Failed to load all the data sources")
    raise 

try:

    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001",
                                            google_api_key=GOOGLE_API_KEY)
    logger.info("Successfully initialized Generative AI embeddings!")
except Exception as e:
    logger.error("Encountered an error in loading the embedding model!")

try:
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=20)
    pdf_chunks = text_splitter.split_documents(pdf_data)
    web_chunks = text_splitter.split_documents(web_data)
    text_chunks = text_splitter.split_documents(text_data)
    chunks = pdf_chunks + web_chunks + text_chunks
    logger.info("Successfully chunked the text data")

except Exception as e:
    logger.exception("Failed to chunk the data.")



#Populating the database
try:
    vectordb = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=db_directory
    )
    logger.info("Successfully populated the Chroma database!")
except Exception as e:
    logger.exception("Failed to populate the Chroma database!")

try:
    vector_retriever = Chroma(
        persist_directory=db_directory,
        embedding_function=embeddings
    ).as_retriever()
    logger.info("Successfully loaded the vector retriever")
except Exception as e:
    logger.exception("Failed to create the retriever.")

stored_data = Chroma(
    persist_directory=db_directory,
    embedding_function=embeddings
    
)
try:
    keyword_retriever = BM25Retriever.from_documents(chunks)
    logger.info("Successfully created the keyword retriever")
except Exception as e:
    logger.exception("Failed to load the keyword retriever")

stored_data = stored_data.as_retriever()
logger.info("Successfully loaded the vector database")

try:
    stored_data = EnsembleRetriever(
        retrievers=[vector_retriever, keyword_retriever],
        weights=[0.5, 0.5]
    )
    logger.info("Successfully created the hybrid search retriever")
except Exception as e:
    logger.exception("Failed to load the retrievers.")