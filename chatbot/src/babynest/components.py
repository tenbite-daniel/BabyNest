from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationSummaryBufferMemory
from langchain_core.documents import Document
from langchain_core.runnables import RunnablePassthrough
from typing import List, Tuple, Dict

from db_handler import stored_data, logger, text_splitter

class RAGTool:
    def __init__(self, retriever_instance):
        self.retriever = retriever_instance

    def get_documents(self, query: str) -> str:
        docs = self.retriever.invoke(query)
        return "\n\n".join(doc.page_content for doc in docs)
    
retriever = RAGTool(stored_data)


class AdaptiveConversation:
    conversation_history: List[Tuple[str, str]] = []

    def __init__(self, summarizing_llm):
        self.summarizing_llm = summarizing_llm
        self.text_splitter = text_splitter
        self.stored_data = stored_data

    def summarize_conversation(self,history: List[Tuple[str:str]]):
        logger.info("Summarizing entire conversation...")
        full_conversation = "\n".join([f"User: {q} \nAI: {a}" for q, a in history])

        summary_prompt = ChatPromptTemplate.from_template(
        "Please summarize the following conversation in a concise and neutral way. The summary should be in the third person.\n\nConversation:\n{conversation}"
    )
        summarization_chain = summary_prompt | self.summarizing_llm
        summary = summarization_chain.invoke({"conversation": full_conversation})
        
        return summary.content
    
    def add_convo_history_to_db(self,text: str):
        logger.info("Adding conversation history to vector database...")
        doc = Document(page_content=text)
        chunks = text_splitter.split_documents([doc])

        try: 
            stored_data.add_documents(chunks)
            logger.info("Successfully added conveersation history to vectordb")
        except Exception as e:
            logger.exception("Failed to add summary to vectordb memory")
            raise

session_memory: Dict[str, List[Tuple[str, str]]] = {}

class ReasoningTool:
    def __init__(self, llm):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(
            """
            You are a structured reasoning assistant. First, analyze the user query step by step. Then, decide the best answer based on knowledge and chat history.
            
            User query: {user_input}
            Chat history: {chat_history}
            Knowledge: {retrieved_docs}
            
            Provide reasoning in bullet points, then give a final concise answer.
            """
        )
        self.chain = (
            {
                "user_input": RunnablePassthrough(),
                "chat_history": RunnablePassthrough(),
                "retrieved_docs": RunnablePassthrough()
            }
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
    
    async def reason(self, user_input, chat_history, retrieved_docs):
        return await self.chain.ainvoke({
            "user_input": user_input, 
            "chat_history": chat_history, 
            "retrieved_docs": retrieved_docs
        })
    
class ValidationTool:
    def __init__(self, llm):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(
            """
            Validate the following answer:
            {reasoning}

            Rules:
            - Must be safe (no harmful advice).
            - Must be relevant to the query.
            - If invalid, suggest a corrected version.
            - If valid, simply return the response as-is.

            Final Decision (Valid or Corrected Answer):
            """
        )
        self.chain = self.prompt | self.llm | StrOutputParser()

    async def validate(self, reasoning):
        return await self.chain.ainvoke({"reasoning": reasoning})

class GeneralChatTool:
    def __init__(self, llm):
        self.llm = llm
        self.prompt = ChatPromptTemplate.from_template(
            """
            You are a helpful and friendly chatbot. Your goal is to provide concise and direct answers to user questions, maintaining a positive and supportive tone. You are not a medical professional, and you should always encourage users to consult with a healthcare provider for medical advice.

            Based on the following knowledge and chat history, provide a brief and helpful response to the user's query. If the chat history or knowledge base are unrelated to the user's request, just answer without considering them and be realistic. You are an assistant, not a dictionary of words. Be as brief and as realistic as possible

            User query: {user_input}
            Chat history: {chat_history}
            Knowledge: {retrieved_docs}

            Final Answer:
            """
        )
        self.chain = (
            {
                "user_input": RunnablePassthrough(),
                "chat_history": RunnablePassthrough(),
                "retrieved_docs": RunnablePassthrough()
            }
            | self.prompt
            | self.llm
            | StrOutputParser()
        )
    
    async def chat(self, user_input, chat_history, retrieved_docs):
        return await self.chain.ainvoke({
            "user_input": user_input, 
            "chat_history": chat_history, 
            "retrieved_docs": retrieved_docs
        })
