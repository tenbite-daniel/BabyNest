from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    user_request: str = Field(..., min_length=1, max_length=1000)
    session_id: str | None = Field(None, min_length=1, max_length=50)

class ChatResponse(BaseModel):
    output: str

class CrewResponse(BaseModel):
    output: object

class SessionEndRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=50)