
import { MemorySaver, StateGraph } from "@langchain/langgraph";
 import { llm } from "../modal/llm"
import { StateAnnotation } from "../state/State"

const checkpointer = new MemorySaver();

 
 

 

/**Agent modal */
async function initializeModal(state:typeof StateAnnotation.State)
{
        /** */
        const response= await llm.invoke([
            {
                role:"system",
                content:"you are agent for handling expense like add expense and get expense by using group and getting graph"
            },
            ...state.messages
    ])
    return {messages:response}
    
}

 const graph= new StateGraph(StateAnnotation)
.addNode("initialize",initializeModal)
.addEdge("__start__","initialize")
.addEdge("initialize","__end__")
const app =graph.compile({ checkpointer })
export {app}
