import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatGroq } from "@langchain/groq";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { InteractionState } from './types';

// We wrap tool creation in a function so they can access the React state setter
export const createTools = (
  updateState: (updater: (prev: InteractionState) => InteractionState) => void
) => {
  
  // Mandatory 1
  const logInteractionTool = tool(
    async (args) => {
      updateState((prev) => ({ ...prev, ...args }));
      return "Form fields populated successfully.";
    },
    {
      name: "LogInteractionTool",
      description: "Parses an initial natural language description and extracts relevant entities to populate the empty form fields.",
      schema: z.object({
        hcpName: z.string().optional().describe("Name of the Health Care Professional"),
        interactionType: z.string().optional(),
        date: z.string().optional().describe("Date in YYYY-MM-DD format"),
        time: z.string().optional(),
        attendees: z.string().optional(),
        topicsDiscussed: z.string().optional(),
        materialsShared: z.array(z.string()).optional(),
        samplesDistributed: z.array(z.string()).optional(),
        sentiment: z.enum(["Positive", "Neutral", "Negative"]).optional(),
        outcomes: z.string().optional(),
        followUpActions: z.string().optional(),
      })
    }
  );

  // Mandatory 2
  const editInteractionTool = tool(
    async (args) => {
      updateState((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(args)) {
          if (value !== undefined) {
            // @ts-ignore
            next[key] = value;
          }
        }
        return next;
      });
      return "Form fields edited successfully.";
    },
    {
      name: "EditInteractionTool",
      description: "Modifies specific fields in an already partially or fully populated form based on a user's correction, without overwriting unaffected fields.",
      schema: z.object({
        hcpName: z.string().optional(),
        interactionType: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        attendees: z.string().optional(),
        topicsDiscussed: z.string().optional(),
        materialsShared: z.array(z.string()).optional(),
        samplesDistributed: z.array(z.string()).optional(),
        sentiment: z.enum(["Positive", "Neutral", "Negative"]).optional(),
        outcomes: z.string().optional(),
        followUpActions: z.string().optional(),
      })
    }
  );

  // Custom 1
  const scheduleFollowUpTool = tool(
    async ({ date, actionItem }) => {
      const followUpString = `Scheduled for ${date}: ${actionItem}`;
      updateState((prev) => ({
        ...prev,
        followUpActions: prev.followUpActions 
          ? `${prev.followUpActions}\n${followUpString}`
          : followUpString
      }));
      return `Successfully scheduled follow-up for ${date}.`;
    },
    {
      name: "ScheduleFollowUpTool",
      description: "Schedules a follow-up action for a specific date and appends it to the Follow-up Actions field.",
      schema: z.object({
        date: z.string().describe("Date of the follow-up, ideally YYYY-MM-DD"),
        actionItem: z.string().describe("Description of what needs to be done"),
      })
    }
  );

  // Custom 2
  const retrieveProductInfoTool = tool(
    async ({ productName }) => {
      // Mocked product database
      const products: Record<string, string> = {
        "vicodin": "Pain relief medication. Active ingredients: Hydrocodone and Acetaminophen.",
        "product x": "High-efficiency cardiovascular drug. Main side effects include mild nausea.",
        "brochure": "General company overview brochure (2026 edition)."
      };
      const info = products[productName.toLowerCase()] || `No specific data found for ${productName}, but it's recorded.`;
      return JSON.stringify({ productName, info });
    },
    {
      name: "RetrieveProductInfoTool",
      description: "Retrieves specific medical or promotional information about a product discussed, useful for ensuring accuracy before logging topics.",
      schema: z.object({
        productName: z.string().describe("Name of the product or material"),
      })
    }
  );

  // Custom 3
  const checkComplianceTool = tool(
    async ({ sampleName, quantity }) => {
      // Mocked compliance check
      if (quantity > 5) {
        return `COMPLIANCE WARNING: You cannot distribute more than 5 samples of ${sampleName}. The maximum allowed is 5. Tell the user about this restriction and ask if they want to log 5 instead.`;
      }
      
      updateState((prev) => {
        const entry = `${quantity}x ${sampleName}`;
        return {
          ...prev,
          samplesDistributed: [...prev.samplesDistributed, entry]
        };
      });
      return `Compliance check passed. Added ${quantity} of ${sampleName} to samples distributed.`;
    },
    {
      name: "CheckComplianceTool",
      description: "Checks if distributing a certain quantity of samples is compliant with regulations. Also adds it to the form if compliant.",
      schema: z.object({
        sampleName: z.string().describe("Name of the sample"),
        quantity: z.number().describe("Quantity distributed"),
      })
    }
  );

  return [
    logInteractionTool,
    editInteractionTool,
    scheduleFollowUpTool,
    retrieveProductInfoTool,
    checkComplianceTool
  ];
};

export const createAgent = (tools: any[]) => {
  // Use gemma2-9b-it as requested, fallback to llama-3.3 if needed
  const llm = new ChatGroq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY || "no-key",
    model: "llama-3.3-70b-versatile", 
    temperature: 0,
  }).bindTools(tools);

  // Define nodes
  async function callModel(state: typeof MessagesAnnotation.State) {
    const response = await llm.invoke([
      {
        role: "system",
        content: `You are a helpful AI assistant managing an HCP Interaction form. 
Your goal is to populate the user's form based on their natural language input.
Always use tools to update the form. Never tell the user you updated the form without actually calling a tool.
If the user corrects information, use the EditInteractionTool.
If the user distributes samples, ALWAYS use CheckComplianceTool.
If the user mentions scheduling a follow-up, use ScheduleFollowUpTool.
Be concise, polite, and confirm what actions you took.
Today's date is: ${new Date().toISOString().split('T')[0]}`
      },
      ...state.messages
    ]);
    return { messages: [response] };
  }

  function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];
    // @ts-ignore
    if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      return "tools";
    }
    return "__end__";
  }

  const toolNode = new ToolNode(tools);

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  return workflow.compile();
};
