import { dbConnection } from "./config/db"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
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


dotenv.config()
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

const server=express()
server.use(express.json())
server.use(cors())
server.get("/chat",(req,res)=>{
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
      const sendData = () => {

    const data = {
      time: new Date(),
      random: Math.random(),
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const interval = setInterval(sendData, 1000);

  // heartbeat
  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 2000);

  req.on("close", () => {

    clearInterval(interval);
    clearInterval(heartbeat);

    res.end();
  });
})
server.listen(3000,()=>{
    console.log("server is running on port 3000")
    // main()
})


