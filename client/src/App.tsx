import React, { useEffect } from "react";
import { ChatContainer } from "./component/ChatContainer";
import { fetchEventSource } from "@microsoft/fetch-event-source";

function App() {
    useEffect(() => {

    async function fetchData() {

      await fetchEventSource("http://localhost:3000/chat", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: "hello world",
        }),

        async onopen() {
          console.log("Connection opened");
        },

        onmessage(ev) {
          console.log("Received:", ev.data);
        },

        onerror(err) {
          console.log("Error:", err);
        },

        onclose() {
          console.log("Connection closed");
        },
      });
    }

    fetchData();

  }, []);
  return <ChatContainer />;
}

export default App;
