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
const config = { configurable: { thread_id: "1" }, streamMode: ["updates", "custom"] }


dotenv.config()
dbConnection()

async function main() {
  const result = await app.stream({
    messages: [{ role: "user", content: "give graph for yestruday expense" }],
  }, config)
  for await (const chunk of result) {
    console.log("chunk", chunk);
  }
  //console.log('result',JSON.stringify(result,null,2))
  //console.log(result.messages[result.messages.length-1]?.content)
}

 

const server = express();

server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  res.setHeader("X-Accel-Buffering", "no");
  next();
});

server.post("/chat", (req, res) => {

  console.log("Received:", req.body.message);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  res.write(
    `data: ${JSON.stringify({
      message: "SSE connected",
    })}\n\n`
  );

  const interval = setInterval(() => {

    const data = {
      time: new Date(),
      random: Math.random(),
      userMessage: req.body.message,
    };

    console.log("sending", data);

    res.write(`data: ${JSON.stringify(data)}\n\n`);

  }, 1000);

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 5000);

  res.on("close", () => {

    console.log("Client disconnected");

    clearInterval(interval);
    clearInterval(heartbeat);

    res.end();
  });

});

server.listen(3000, () => {
  console.log("Server running on 3000");
});


