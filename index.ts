import { dbConnection } from "./config/db"
import { app } from "./graph/graph"
/**maintain session */
const config=  { configurable: { thread_id: "1" } }
dbConnection()

async function main()
{
     const result = await app.invoke({
      messages: [{ role: "user", content:"give all expense of this month" }],
    },config)

    console.log(JSON.stringify(result.messages,null,2))
}
main()

