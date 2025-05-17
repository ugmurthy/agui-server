/*
Get the input format right as per Run
*/
import express from "express";
import { RunAgentInputSchema } from "@ag-ui/core";
const app = express();
app.use(express.json());
app.post("/awp", (req, res) => {
    try {
        // Parse and validate the request body
        const input = RunAgentInputSchema.parse(req.body);
        res.json({ message: `Hello World from ${input.threadId}`, input });
    }
    catch (error) {
        res.status(422).json({ error: error.message });
    }
});
app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});
