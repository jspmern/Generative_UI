import { dbConnection } from "./config/db"
import { app } from "./graph/graph"
/**maintain session */
/**update stream */
// const config=  { configurable: { thread_id: "1" }, streamMode: "updates" }
/**values stream */
// const config=  { configurable: { thread_id: "1" }, streamMode: "values" }
/**messages stream */
// const config=  { configurable: { thread_id: "1" }, streamMode: "messages" }
/**checkpoint */
// const config=  { configurable: { thread_id: "1" }, streamMode: "checkpoints" }
/**custom */
// const config=  { configurable: { thread_id: "1" }, streamMode: "custom" }
/**multiple stream mode we can pass */
const config=  { configurable: { thread_id: "1" }, streamMode: ["updates","custom"] }



dbConnection()

async function main()
{
     const result = await app.stream({
      messages: [{ role: "user", content:"give graph for yestruday expense" }],
    },config)
    for await (const chunk of result) {
      console.log("chunk", chunk);
    }
    //console.log('result',JSON.stringify(result,null,2))
    //console.log(result.messages[result.messages.length-1]?.content)
}
main()

