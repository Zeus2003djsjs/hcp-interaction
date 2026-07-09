import os
from typing import Annotated, Literal, List, TypedDict, Any
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, SystemMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from dotenv import load_dotenv

load_dotenv()

# State Definitions
class InteractionState(TypedDict):
    hcpName: str
    interactionType: str
    date: str
    time: str
    attendees: str
    topicsDiscussed: str
    materialsShared: List[str]
    samplesDistributed: List[str]
    sentiment: Literal['Positive', 'Neutral', 'Negative', '']
    outcomes: str
    followUpActions: str

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    form_state: InteractionState

# ----------------- Tools -----------------

@tool
def LogInteractionTool(
    hcpName: str = "", interactionType: str = "", date: str = "", time: str = "",
    attendees: str = "", topicsDiscussed: str = "", materialsShared: List[str] = None,
    samplesDistributed: List[str] = None, sentiment: str = "", outcomes: str = "", followUpActions: str = ""
):
    """Parses an initial natural language description and extracts relevant entities to populate the empty form fields."""
    return {
        "action": "update_form",
        "updates": {
            k: v for k, v in locals().items() if v is not None and v != ""
        }
    }

@tool
def EditInteractionTool(
    hcpName: str = None, interactionType: str = None, date: str = None, time: str = None,
    attendees: str = None, topicsDiscussed: str = None, materialsShared: List[str] = None,
    samplesDistributed: List[str] = None, sentiment: str = None, outcomes: str = None, followUpActions: str = None
):
    """Modifies specific fields in an already partially or fully populated form based on a user's correction, without overwriting unaffected fields."""
    return {
        "action": "update_form",
        "updates": {
            k: v for k, v in locals().items() if v is not None
        }
    }

@tool
def ScheduleFollowUpTool(date: str, actionItem: str):
    """Schedules a follow-up action for a specific date and appends it to the Follow-up Actions field."""
    return {
        "action": "schedule_followup",
        "date": date,
        "actionItem": actionItem
    }

@tool
def RetrieveProductInfoTool(productName: str):
    """Retrieves specific medical or promotional information about a product discussed, useful for ensuring accuracy before logging topics."""
    products = {
        "vicodin": "Pain relief medication. Active ingredients: Hydrocodone and Acetaminophen.",
        "product x": "High-efficiency cardiovascular drug. Main side effects include mild nausea.",
        "brochure": "General company overview brochure (2026 edition)."
    }
    info = products.get(productName.lower(), f"No specific data found for {productName}.")
    return {"action": "info", "info": info}

@tool
def CheckComplianceTool(sampleName: str, quantity: int):
    """Checks if distributing a certain quantity of samples is compliant with regulations. Also adds it to the form if compliant."""
    if quantity > 5:
        return {"action": "compliance_warning", "message": f"COMPLIANCE WARNING: Cannot distribute more than 5 samples of {sampleName}."}
    
    return {
        "action": "add_sample",
        "sampleName": sampleName,
        "quantity": quantity
    }

tools = [LogInteractionTool, EditInteractionTool, ScheduleFollowUpTool, RetrieveProductInfoTool, CheckComplianceTool]

# ----------------- LLM Node -----------------
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    api_key = "dummy-key-to-allow-startup"

llm = ChatGroq(
    api_key=api_key,
    model="llama-3.3-70b-versatile",
    temperature=0
).bind_tools(tools)

from datetime import datetime

def agent_node(state: AgentState):
    today_date = datetime.now().strftime("%Y-%m-%d")
    sys_msg = SystemMessage(content="You are a helpful AI assistant managing an HCP Interaction form. "
                                    "Your goal is to populate the user's form based on their natural language input.\n"
                                    f"IMPORTANT: Today's date is {today_date}. If the user mentions 'today', 'yesterday', or 'tomorrow', ALWAYS resolve it to the correct YYYY-MM-DD date and update the date field using a tool.\n"
                                    "Always use tools to update the form. Never tell the user you updated the form without actually calling a tool.\n"
                                    "If the user corrects information, use the EditInteractionTool.\n"
                                    "If the user distributes samples, ALWAYS use CheckComplianceTool.\n"
                                    "If the user mentions scheduling a follow-up, use ScheduleFollowUpTool.\n"
                                    "Be concise, polite, and confirm what actions you took.")
    response = llm.invoke([sys_msg] + state["messages"])
    return {"messages": [response]}


# ----------------- Custom Tool Node -----------------
def tool_node(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    
    # We will execute tools and also capture state mutations
    tool_messages = []
    updated_form_state = state["form_state"].copy()

    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = tool_call["args"]
        
        # Execute tool
        tool_instance = next(t for t in tools if t.name == tool_name)
        result = tool_instance.invoke(tool_args)
        
        # Process mutations based on tool action
        if isinstance(result, dict):
            if result.get("action") == "update_form":
                for k, v in result["updates"].items():
                    if k in updated_form_state:
                        if k == "sentiment" and isinstance(v, str):
                            updated_form_state[k] = v.capitalize()
                        else:
                            updated_form_state[k] = v
            elif result.get("action") == "schedule_followup":
                current_followup = updated_form_state.get("followUpActions", "")
                append_str = f"Scheduled for {result['date']}: {result['actionItem']}"
                updated_form_state["followUpActions"] = (current_followup + "\n" + append_str).strip()
            elif result.get("action") == "add_sample":
                entry = f"{result['quantity']}x {result['sampleName']}"
                if not updated_form_state.get("samplesDistributed"):
                    updated_form_state["samplesDistributed"] = []
                updated_form_state["samplesDistributed"].append(entry)

        tool_messages.append(ToolMessage(
            tool_call_id=tool_call["id"],
            name=tool_name,
            content=str(result)
        ))

    return {"messages": tool_messages, "form_state": updated_form_state}


# ----------------- Routing -----------------
def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

# ----------------- Graph -----------------
builder = StateGraph(AgentState)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)

builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", should_continue)
builder.add_edge("tools", "agent")

graph = builder.compile()
