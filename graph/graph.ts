
import { END, MemorySaver, StateGraph } from "@langchain/langgraph";
 import { llm } from "../modal/llm"
import { StateAnnotation } from "../state/State"
import { expenseTracker } from "../tool/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import type { streamMessage } from "../type";
import type { AIMessage } from "langchain";
const checkpointer = new MemorySaver();

/**Agent modal */
async function initializeModal(state:typeof StateAnnotation.State,config: LangGraphRunnableConfig)
{
        /** */
        const response= await llm.bindTools(expenseTracker()).invoke([
            {
                role:"system",
                content:`you are agent for handling expense like add expense and get expense by using group and getting graph
                date is : ${new Date().toISOString()}`
            },
            ...state.messages
    ])
    return {messages:response}
    
}

async function whereShouldGo(state:typeof StateAnnotation.State,config: LangGraphRunnableConfig){
const lastMessage=state.messages[state.messages.length-1]  as AIMessage
if(lastMessage.tool_calls?.length)
{
    const customMessage:streamMessage={
      type:"toolCall",
      payload:{
        name:lastMessage.tool_calls[0]?.name,
        args:lastMessage.tool_calls[0]?.args
      }  
    }
    config.writer!(customMessage)
    return "toolNode"
}
  return END
}
async function ShouldGoAI(state:typeof StateAnnotation.State){
    const lastMessage=state.messages[state.messages.length-1]
    const type=JSON.parse(lastMessage.content )?.type
     if(type==="chart") return END
     return "initialize"
}
const toolNode= new ToolNode(expenseTracker())

 const graph= new StateGraph(StateAnnotation)
.addNode("initialize",initializeModal)
.addNode("toolNode",toolNode)
.addEdge("__start__","initialize")
.addConditionalEdges("initialize",whereShouldGo,{
    "toolNode":"toolNode",
  "__end__":END
}).addConditionalEdges("toolNode",ShouldGoAI,{
   initialize:"initialize",
    __end__:END
})
const app =graph.compile({ checkpointer })
export {app}
