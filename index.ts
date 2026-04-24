import { app } from "./graph/graph"
/**maintain session */
const config=  { configurable: { thread_id: "1" } }

async function main()
{
     const result = await app.invoke({
      messages: [{ role: "user", content:"create expense for iphone 6000 inr " }],
    },config)

    console.log(JSON.stringify(result.messages,null,2))
}
main()





