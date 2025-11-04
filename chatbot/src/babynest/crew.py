from crewai import Agent, Crew, Process, Task, LLM
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from .components import logger, retriever
import os

load_dotenv()


@tool
async def internet_research_tool(query: str) -> str:
    """
    Searches the internet for information based on a user's query.
    The 'query' must be a simple, single string (e.g., 'postpartum depression stories').
    This is useful for finding up-to-date information not present in the internal knowledge base.
    """
    try:
        logger.info("Looking for internet information regarding your query")
        result = await retriever.web_search_tool(query=query)
        logger.info("Web search tool successfully retrieved search results")
        return "\n\n".join(result)
    except Exception as e:
        logger.exception("Failed to search the internet for your query")
        return f"No information collected regarding {query}"


@tool
async def rag_tool(query: str) -> str:
    """
    Retrieves relevant documents from the vector database based on a user's query.
    The 'query' must be a simple, single string (e.g., 'community testimonials').
    Use this tool to get information from the internal knowledge base.
    """
    try:
        result = await retriever.get_documents(query=query)
        logger.info("Successfully searched the vector db")
        return result if result else "No relevant documents found in the db"
    except Exception as e:
        logger.exception("Failed to search the vector db")
        return "No relevant documents found"

   
def get_llm():
    try:
        return LLM(
            model="gemini/gemini-2.5-flash",
            api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.7,
            stream=True
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

    @agent
    def main_agent(self) -> Agent:
        return Agent(
            config=self.agents_config.get('main_agent', {}),
            verbose=True,
            llm=get_llm(),
            max_iter=2
        )

    @agent
    def maternal_health_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config.get('maternal_health_researcher', {}),
            verbose=True,
            llm=get_llm(),
            tools=[rag_tool, internet_research_tool],
            max_iter=3
        )

    @agent
    def community_testimonials_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config.get('community_testimonials_researcher', {}),
            verbose=True,
            tools=[internet_research_tool, rag_tool],
            llm=get_llm(),
            max_iter=2
        )

    @agent
    def personalized_health_communicator(self) -> Agent:
        return Agent(
            config=self.agents_config.get('personalized_health_communicator', {}),
            verbose=True,
            llm=get_llm(),
            tools=[],
            max_iter=3
        )

    @agent
    def final_response_synthesizer(self) -> Agent:
        return Agent(
            config=self.agents_config.get('final_response_synthesizer', {}),
            verbose=True,
            llm=get_llm(),
            max_iter=2
        )

    @task
    def routing_task(self) -> Task:
        return Task(
            config=self.tasks_config.get('main_task', {}),
            agent=self.main_agent() 
        )

    @task
    def maternal_health_task(self) -> Task:
        return Task(
            config=self.tasks_config.get('maternal_health_researcher_task', {}),
            agent=self.maternal_health_researcher() # This needs a user_query variable
        )
    
    @task
    def personalized_health_communicator_task(self) -> Task:
        return Task(
            config=self.tasks_config.get('personalized_health_communicator_task', {}),
            agent=self.personalized_health_communicator(),
            context=[self.routing_task()]
        )

    @task
    def community_testimonials(self) -> Task:
        return Task(
            config=self.tasks_config.get('community_testimonials_task', {}),
            agent=self.community_testimonials_researcher(),
        )

    @task
    def final_response_synthesizer_task(self) -> Task:
        return Task(
            config=self.tasks_config.get('final_response_synthesizer_task', {}),
            agent=self.final_response_synthesizer(),
            context=[self.personalized_health_communicator_task()]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the Babynest crew with the new sequential process."""
        return Crew(
            agents=[
                self.main_agent(),
                self.maternal_health_researcher(),
                self.community_testimonials_researcher(),
                self.personalized_health_communicator(),
                self.final_response_synthesizer()
            ],
            tasks=[
                self.routing_task(),
                # self.maternal_health_task(),
                self.personalized_health_communicator_task(),
                # self.community_testimonials(),
                self.final_response_synthesizer_task(),
            ],
            process=Process.sequential,
            verbose=True,
        )
    
