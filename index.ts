import { dbConnection } from "./config/db"
import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { app } from "./graph/graph"
import type { streamMessage } from "./type"
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
// const config = { configurable: { thread_id: "1" }, streamMode: ["updates", "custom"] }


const config = { configurable: { thread_id: "1" }, streamMode: ["messages","custom"] }



dotenv.config()
dbConnection()

// async function main(input:string) {
//   const result = await app.stream({
//     messages: [{ role: "user", content: input }],
//   }, config)
//   for await (const [eventType, chunk] of result) {
//     console.log("eventType", eventType);
//     console.log("chunk",  JSON.stringify(chunk[0].content, null, 2));
//   }
//   //console.log('result',JSON.stringify(result,null,2))
//   //console.log(result.messages[result.messages.length-1]?.content)
// }

 

const server = express();

server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  res.setHeader("X-Accel-Buffering", "no");
  next();
});

server.post("/chat", async (req, res) => {

  console.log("Received:", req.body.message);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
   const result = await app.stream({
    messages: [{ role: "user", content: req.body.message }],
  }, config)
  for await (const [eventType, chunk] of result) {
    let message: streamMessage= {} as streamMessage
    console.log("eventType****", eventType);
    if(eventType==="custom"){
      console.log("chunk",chunk)
      message=chunk
    }
    else if(eventType==="messages"){
        const messageType=chunk[0].type
        if(chunk[0].content=="")continue
          if(messageType==="ai"){
       message={type:"ai",payload: {text: chunk[0].content as string}}
    }
    else if(messageType==="tool"){
        message={type:"toolResult",payload:{
           name:chunk[0].name,
           result:JSON.parse(chunk[0].content as string)
        }}
    }
    }
   
     res.write(`data: ${JSON.stringify(message)}\n\n`);
  }
  
  res.end();
});

server.listen(3000, () => {
  console.log("Server running on 3000");
});


