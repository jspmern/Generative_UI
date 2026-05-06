
import { END, MemorySaver, StateGraph } from "@langchain/langgraph";
 import { llm } from "../modal/llm"
import { StateAnnotation } from "../state/State"
import { expenseTracker } from "../tool/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
const checkpointer = new MemorySaver();

/**Agent modal */
async function initializeModal(state:typeof StateAnnotation.State)
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

async function whereShouldGo(state:typeof StateAnnotation.State){
const lastMessage=state.messages[state.messages.length-1]
//console.log('p',lastMessage)
if(lastMessage.tool_calls?.length)
{
    return "toolNode"
}
  return END
}
async function ShouldGoAI(state:typeof StateAnnotation.State){
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
})
const app =graph.compile({ checkpointer })
export {app}
