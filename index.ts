import { dbConnection } from "./config/db"
import { app } from "./graph/graph"
/**maintain session */
const config=  { configurable: { thread_id: "1" } }
dbConnection()

async function main()
{
     const result = await app.invoke({
      messages: [{ role: "user", content:"generate expense chart for this year" }],
    },config)
    console.log('result',JSON.stringify(result,null,2))
    //console.log(result.messages[result.messages.length-1]?.content)
}
main()

