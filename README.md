# generative_ui

## Project Overview

`generative_ui` is a full-stack AI-driven expense tracker with a chat interface. It is designed to let users interact with an AI agent to:

- add expenses,
- query expense history,
- generate chart summaries,
- call tools automatically from chat.

The backend is responsible for AI workflow, tool execution, streaming updates, and database access. The frontend is responsible for displaying chat, receiving streamed responses, and rendering charts.

---

## Architecture Summary

The system is split into two main layers:

1. **Backend** (`index.ts`, `graph/graph.ts`, `tool/tools.ts`, `modal/llm.ts`)
2. **Frontend** (`client/src/`)

### High-level diagram

```text
[Browser UI] <-- SSE / POST --> [Express Backend] <---> [LangGraph AI Workflow]
                                  |                         |
                                  |                         +--> [ChatOpenAI LLM]
                                  |                         |
                                  |                         +--> [ToolNode / MongoDB]
                                  |
                                  +--> [SSE event streaming]
```

The frontend sends a message to `/chat` and the backend streams partial responses back while the AI graph evaluates and optionally executes tools.

---

## Backend Concepts

### 1. Server and SSE

- `index.ts` starts an Express server on port `3000`.
- The `/chat` route uses `Content-Type: text/event-stream` to keep the connection open.
- The backend writes events in SSE format:
  - `data: {...}\n\n`
- SSE allows the client to receive incremental AI output instead of waiting for the full response.

### 2. LangGraph workflow

The backend uses `@langchain/langgraph` to build a state-based AI graph in `graph/graph.ts`.

Key nodes:

- `initialize`: sends the user message to the LLM along with tool bindings.
- `toolNode`: executes a matching tool when the AI decides a tool call is needed.
- `whereShouldGo`: checks if the returned AI output contains tool calls and routes the graph.
- `ShouldGoAI`: decides whether to go back to AI after tool execution or end the graph.

This structure allows the backend to alternate between normal AI responses and tool execution, while preserving conversation state.

### 3. Tool definitions

`tool/tools.ts` defines expense tools exposed to the AI agent.

Tools include:

- `createExpense`
  - Saves expense records to MongoDB.
  - Takes `title`, `price`, `purchaseDate`.
- `getExpense`
  - Queries expenses using `from`/`to` date ranges.
- `getChart`
  - Aggregates expenses by `day`, `week`, or `month`.
  - Returns structured data for chart rendering.

The tools use `langchain` tool wrappers and `zod` schemas for validation.

### 4. Streaming messages

Backend emits structured messages over SSE in the shape of `streamMessage`:

- `type: 'ai'` with `payload.text`
- `type: 'toolCall'` with `payload.name` and `payload.args`
- `type: 'toolResult'` with `payload.name` and `payload.result`

The client uses this type contract to render chat updates correctly.

### 5. State tracking

`state/State.ts` defines the graph state using `Annotation.Root` and `MessagesAnnotation.spec`.

This means the conversation history is preserved across graph passes, so the AI can maintain context and use tool results in later responses.

---

## Frontend Concepts

### 1. Chat flow and UI

The main frontend components are:

- `ChatContainer.tsx`
  - Main conversation screen.
  - Manages `messages` state and message streaming.
  - Handles SSE connection with `fetchEventSource`.
- `ChatInput.tsx`
  - Textarea for user input.
  - Sends messages to the backend and resets input.
- `ChatMessage.tsx` (not shown but implied)
  - Renders each chat bubble type.
- `ChartLayout.tsx`
  - Receives chart data results and renders a dynamic chart.

### 2. SSE handling

The frontend uses `@microsoft/fetch-event-source` to connect to `/chat`.

Behavior:

- User submits a message in `ChatInput`.
- `ChatContainer` appends the user text locally.
- `fetchEventSource` opens a streamed POST request.
- On each `onmessage`, the app parses the SSE payload and updates the chat state.
- If `type === 'ai'`, it appends text to the last AI message or creates a new one.
- If `type === 'toolCall'` or `type === 'toolResult'`, it adds separate tool-related chat items.

This gives the impression of a live AI assistant typing back answers and tool actions.

### 3. Rendering charts

`ChartLayout.tsx` is designed for dynamic charts produced by `getChart`.

Its responsibilities:

- normalize data records by removing `_id`
- determine the x-axis field from string values
- find numeric fields for bars
- generate a dynamic `chartConfig` for each numeric series
- render `BarChart`, `XAxis`, `YAxis`, and `Bar` components

This supports any aggregated data shape returned by the chart tool.

### 4. Frontend state model

`messages` state in `ChatContainer` stores an array of `streamMessage` objects.

Because SSE events may arrive incrementally, the frontend must:

- append partial AI text to the latest AI message
- ignore invalid or empty SSE events
- avoid duplicate rendering when the stream closes or retries

---

## Detailed Interaction Sequence

### User request path

```text
[User types message] --> [ChatInput] --> [ChatContainer.handleSendMessage()] --> [ChatContainer.fetchData()] --> POST /chat
```

### Backend processing path

```text
POST /chat
  --> Express receives request
  --> Write SSE response headers
  --> app.stream() executes LangGraph
       --> initialize node calls LLM with user message and tool bindings
       --> if AI wants a tool, toolNode executes matched tool
       --> return tool output to AI or end graph
  --> For each event, write SSE payload to client
  --> res.end() when done
```

### Client receive path

```text
SSE event received
  --> onmessage(ev)
  --> parse ev.data as JSON
  --> if type === 'ai' then append/merge text
  --> if type === 'toolCall' or 'toolResult' then add tool message
  --> rerender chat bubbles
```

### Example full flow

1. User: "Add expense for lunch 20 dollars"
2. Backend AI decides to call `createExpense`
3. Backend streams a `toolCall` object
4. Tool executes, returns a `toolResult`
5. Backend streams `toolResult` and then final AI confirmation
6. Frontend updates chat in real time with each step

---

## Technical Diagrams

### Backend component diagram

```text
+-------------------+       +-------------------------------+
| Express / SSE     | <-->  | LangGraph AI workflow         |
| /chat endpoint    |       |  - initialize node            |
|                   |       |  - toolNode                  |
|                   |       |  - conditional routing       |
+-------------------+       +-------------------------------+
           |                             |
           | SSE / JSON payloads         | tool execution / LLM calls
           v                             v
+-------------------+       +-------------------------------+
| ChatOpenAI LLM    |       | MongoDB / Mongoose            |
| (assistant model) |       |  - save expense               |
+-------------------+       |  - query expense              |
                                |  - aggregate charts         |
                                +-------------------------------+
```

### Frontend component diagram

```text
+-------------------+
| ChatContainer     |
|  - messages state |
|  - SSE receiver   |
+-------------------+
          |
          v
+-------------------+      +------------------+
| ChatInput         | ---> | fetchEventSource |
+-------------------+      +------------------+
          |
          v
+-------------------+
| ChatMessage list  |
+-------------------+
          |
          v
+-------------------+
| ChartLayout       |
+-------------------+
```

---

## Why this design?

- **SSE streaming** gives a smoother chat experience compared to waiting for a full response.
- **LangGraph** enables a structured agent flow with tool execution and state tracking.
- **Separate frontend state** keeps UI rendering simple while the backend handles AI logic.
- **Tool-based architecture** makes it easy to extend with new actions like budgeting, forecasting, or export features.

---

## Troubleshooting notes

- If the frontend receives repeated duplicate stream messages, verify that the backend sends only valid JSON events and a proper end-of-stream marker.
- If the chart does not show, verify that `ChartLayout` receives `result.data` and that bar keys are numeric.
- If SSE reconnects unexpectedly, disable `fetchEventSource` retry or add a `[DONE]` sentinel in the backend.

---

## Summary

This project is a practical example of a conversational AI assistant that can:

- handle user intent in natural language,
- execute backend tools automatically,
- persist expense data,
- stream progress in real time,
- and render charts from structured tool output.

The backend is focused on AI orchestration and data logic; the frontend is focused on chat UX and streamed message rendering.
