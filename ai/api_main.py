from fastapi import FastAPI
from pydantic import BaseModel
import digipurse_ai 
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat(data: MessageRequest):
    return digipurse_ai.request_chat(data.message)
