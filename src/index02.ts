/*
Example from AG-UI docs showing RUN_STARTED and RUN_ENDED events along with a simulated TEXT stream
*/

import express, { Request, Response } from "express"
import { RunAgentInputSchema, RunAgentInput, EventType } from "@ag-ui/core"
import { EventEncoder } from "@ag-ui/encoder"
import { v4 as uuidv4 } from "uuid"

const app = express()

app.use(express.json())

app.post("/awp", async (req: Request, res: Response) => {
  try {
    // Parse and validate the request body
    const input: RunAgentInput = RunAgentInputSchema.parse(req.body)

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    // Create an event encoder
    const encoder = new EventEncoder()

    // Send run started event
    const runStarted = {
      type: EventType.RUN_STARTED,
      threadId: input.threadId,
      runId: input.runId,
    }
    res.write(encoder.encode(runStarted))

    const messageId = uuidv4()
    // Send text message start event
    const textMessageStart = {
      type: EventType.TEXT_MESSAGE_START,
      messageId,
      role: "assistant",
    }
    res.write(encoder.encode(textMessageStart))

    
    // Dummy stream of messages 
    // delta content comes from dummy_str
    const dummy_str="<start> The quick brown fox jumps over lazy dog! <stop>"
    //
    for (let i=0;i<10;i++) {
      let textMessageContent = {
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId,
        delta: `${dummy_str.split(" ")[i]} `,
      }
      res.write(encoder.encode(textMessageContent))
    }
    //

    // Send text message end event
    const textMessageEnd = {
      type: EventType.TEXT_MESSAGE_END,
      messageId,
    }
    res.write(encoder.encode(textMessageEnd))

    // Send run finished event
    const runFinished = {
      type: EventType.RUN_FINISHED,
      threadId: input.threadId,
      runId: input.runId,
    }
    res.write(encoder.encode(runFinished))

    // End the response
    res.end()
  } catch (error) {
    res.status(422).json({ error: (error as Error).message })
  }
})

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000")
})
