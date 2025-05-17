/*
Example from AG-UI docs showing RUN_STARTED and RUN_ENDED events along with a simulated TEXT stream
*/
import express from "express";
import { RunAgentInputSchema, EventType } from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";
import { v4 as uuidv4 } from "uuid";
import { setTimeout } from "timers/promises";
import ollama from 'ollama';
const app = express();
app.use(express.json());
app.post("/awp", async (req, res) => {
    try {
        // Parse and validate the request body
        const input = RunAgentInputSchema.parse(req.body);
        console.log("\n-----------\n Request received ", JSON.stringify(input, null, 0));
        // Set up SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        await setTimeout(1000);
        // Create an event encoder
        const encoder = new EventEncoder();
        // Send run started event
        const runStarted = {
            type: EventType.RUN_STARTED,
            threadId: input.threadId,
            runId: input.runId,
        };
        res.write(encoder.encode(runStarted));
        const messageId = uuidv4();
        // Send text message start event
        const textMessageStart = {
            type: EventType.TEXT_MESSAGE_START,
            messageId,
            role: "assistant",
        };
        res.write(encoder.encode(textMessageStart));
        /////////////////////////////////////////
        // Ollama inference
        const userMsg = input.messages[1].content;
        const prompt = input.messages[1].content;
        console.log("Prompt :", prompt);
        const msgArray = input.messages;
        const response = await ollama.chat({ model: 'llama3.2', messages: msgArray, stream: true });
        for await (const part of response) {
            const content = part.message.content;
            const textMessageContent = {
                type: EventType.TEXT_MESSAGE_CONTENT,
                messageId,
                delta: content,
            };
            res.write(encoder.encode(textMessageContent));
        }
        //
        // Send text message end event
        const textMessageEnd = {
            type: EventType.TEXT_MESSAGE_END,
            messageId,
        };
        res.write(encoder.encode(textMessageEnd));
        // Send run finished event
        const runFinished = {
            type: EventType.RUN_FINISHED,
            threadId: input.threadId,
            runId: input.runId,
        };
        res.write(encoder.encode(runFinished));
        // End the response
        res.end();
    }
    catch (error) {
        res.status(422).json({ error: error.message });
    }
});
app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});
