from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import List
from dotenv import load_dotenv
from db_handler import logger, stored_data
import os

load_dotenv()

@tool
def internet_research_tool(query: str) -> str:
    """
    Searches the internet for information based on a user's query.
    The 'query' must be a simple, single string (e.g., 'postpartum depression stories').
    This is useful for finding up-to-date information not present in the internal knowledge base.
    """
    try:
        logger.info("Looking for internet information regarding your query")
        search_tool_instance = DuckDuckGoSearchRun()
        result = search_tool_instance.run(query)
        logger.info("Web search tool successfully retrieved search results")
        return result
    except Exception as e:
        logger.exception("Failed to search the internet for your query")
        return f"No information collected regarding {query}"


@tool
def rag_tool(query: str) -> str:
    """
    Retrieves relevant documents from the vector database based on a user's query.
    The 'query' must be a simple, single string (e.g., 'community testimonials').
    Use this tool to get information from the internal knowledge base.
    """
    try:
        result = stored_data.invoke(query)
        logger.info("Successfully searched the vector db")
        return result if result else "No relevant documents found in the db"
    except Exception as e:
        logger.exception("Failed to search the vector db")
        return "No relevant documents found"

llm_clients = {
    "groq": ChatGroq(model="groq/llama-3.3-70b-versatile", temperature=0.7, api_key=os.getenv("GROQ_API_KEY")),
    "gemini": ChatGoogleGenerativeAI(model="gemini/gemini-1.5-pro", temperature=0.7, google_api_key=os.getenv("GOOGLE_API_KEY"))  
}
   
def get_llm():
    try:
        return LLM(
            model="gemini/gemini-1.5-flash",
            api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.5
        )
    except Exception as e:
        logger.error(f"Failed to connect to Gemini... : {e}")
        raise ValueError(f"Failed to connect to Gemini")


@CrewBase
class Babynest:
    """Babynest crew"""

    def __init__(self):
        import os, yaml

        base_dir = os.path.dirname(__file__)
        config_dir = os.path.join(base_dir, "config")

        try:
            with open(os.path.join(config_dir, "agents.yaml"), "r") as f:
                self.agents_config = yaml.safe_load(f)
            with open(os.path.join(config_dir, "tasks.yaml"), "r") as f:
                self.tasks_config = yaml.safe_load(f)
            logger.info("Configuration files loaded successfully")
        except Exception as e:
            logger.warning("Failed to load config files: %s", e)
            self.agents_config, self.tasks_config = {}, {}

    # New Agents
    @agent
    def planner(self) -> Agent:
        return Agent(
            config=self.agents_config.get('planner', {}),
            verbose=True,
            llm=get_llm(),
        )

    @agent
    def refiner(self) -> Agent:
        return Agent(
            config=self.agents_config.get('refiner', {}),
            verbose=True,
            llm=get_llm(),
            tools=[] # No tools needed for this agent
        )

    # Existing Agents
    @agent
    def maternal_health_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config.get('maternal_health_researcher', {}),
            verbose=True,
            tools=[internet_research_tool, rag_tool],
            llm=get_llm()
        )

    @agent
    def personalized_guidance(self) -> Agent:
        return Agent(
            config=self.agents_config.get('personalized_guidance', {}),
            verbose=True,
            llm=get_llm(),
            tools=[rag_tool, internet_research_tool]
        )

    @agent
    def community_testimonials(self) -> Agent:
        return Agent(
            config=self.agents_config.get('community_testimonials', {}),
            verbose=True,
            llm=get_llm(),
            tools=[rag_tool, internet_research_tool]
        )

    @agent
    def summarizer(self) -> Agent:
        return Agent(
            config=self.agents_config.get('summarizer', {}),
            verbose=True,
            llm=get_llm()
        )

    @agent
    def moderator(self) -> Agent:
        return Agent(
            config=self.agents_config.get('moderator', {}),
            verbose=True,
            llm=get_llm()
        )

    # New Sequential Tasks
    @task
    def plan_conversation(self) -> Task:
        return Task(
            config=self.tasks_config.get('plan_conversation', {}),
            agent=self.planner() # Ensure the agent is an instance
        )

    @task
    def research_and_draft(self) -> Task:
        return Task(
            config=self.tasks_config.get('research_and_draft', {}),
            agent=self.maternal_health_researcher()
        )
    
    @task
    def refine_health_info(self) -> Task:
        return Task(
            config=self.tasks_config.get('refine_health_info', {}),
            agent=self.refiner(),
            context=[self.research_and_draft()]
        )

    @task
    def get_testimonials(self) -> Task:
        return Task(
            config=self.tasks_config.get('get_testimonials', {}),
            agent=self.community_testimonials(),
            context=[self.refine_health_info()]
        )

    @task
    def synthesize_and_personalize(self) -> Task:
        return Task(
            config=self.tasks_config.get('synthesize_and_personalize', {}),
            agent=self.personalized_guidance(),
            context=[self.refine_health_info(), self.get_testimonials()]
        )

    @task
    def moderation_and_finalization(self) -> Task:
        return Task(
            config=self.tasks_config.get('moderation_and_finalization', {}),
            agent=self.moderator(),
            context=[self.synthesize_and_personalize()]
        )

    @task
    def final_summarization(self) -> Task:
        return Task(
            config=self.tasks_config.get('final_summarization', {}),
            agent=self.summarizer(),
            context=[self.moderation_and_finalization()]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Babynest crew with the new sequential process."""
        return Crew(
            agents=[
                self.planner(),
                self.maternal_health_researcher(),
                self.refiner(),
                self.community_testimonials(),
                self.personalized_guidance(),
                self.moderator(),
                self.summarizer()
            ],
            tasks=[
                self.plan_conversation(),
                self.research_and_draft(),
                self.refine_health_info(),
                self.get_testimonials(),
                self.synthesize_and_personalize(),
                self.moderation_and_finalization(),
                self.final_summarization()
            ],
            process=Process.sequential,
            verbose=True,
        )