
import { MemorySaver, StateGraph } from "@langchain/langgraph";
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
const toolNode= new ToolNode(expenseTracker())

 const graph= new StateGraph(StateAnnotation)
.addNode("initialize",initializeModal)
.addNode("toolNode",toolNode)
.addEdge("__start__","initialize")
.addEdge("initialize","toolNode")
.addEdge("toolNode","__end__")
const app =graph.compile({ checkpointer })
export {app}
