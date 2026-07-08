from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from agent import graph, InteractionState
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    messages: List[Dict[str, Any]]
    form_state: Dict[str, Any]

@app.post("/chat")
async def chat(request: ChatRequest):
    # Convert dict messages to LangChain messages
    lc_messages = []
    for msg in request.messages:
        if msg.get("type") == "human":
            lc_messages.append(HumanMessage(content=msg.get("content", "")))
        elif msg.get("type") == "ai":
            lc_messages.append(AIMessage(content=msg.get("content", "")))
            
    # Initial state for the run
    state = {
        "messages": lc_messages,
        "form_state": request.form_state
    }
    
    # Invoke LangGraph
    new_state = graph.invoke(state)
    
    # Format messages for frontend
    output_messages = []
    for m in new_state["messages"]:
        if isinstance(m, HumanMessage):
            output_messages.append({"type": "human", "content": m.content})
        elif isinstance(m, AIMessage) and m.content:
            output_messages.append({"type": "ai", "content": m.content})
            
    return {
        "messages": output_messages,
        "form_state": new_state["form_state"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
