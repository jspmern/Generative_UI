import React, { useEffect } from 'react'
import { ChatContainer } from './component/ChatContainer';

function App() {
  useEffect(()=>{
     const eventSource = new EventSource("http://localhost:3000/chat");
     eventSource.addEventListener("open",()=>{
      console.log("Connection opened");
     })
      eventSource.addEventListener("message",(data)=>{
        console.log("Received data",data)
      })
       eventSource.addEventListener("error",(err)=>{
           console.error("Error",err)
       })
  },[])
   return <ChatContainer />;
}

export default App