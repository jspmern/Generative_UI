import { app } from "./graph/graph"

async function main()
{
     const result = await app.invoke({
      messages: [{ role: "user", content:"hiii" }],
    })
    console.log(JSON.stringify(result.messages,null,2))
}
main()





