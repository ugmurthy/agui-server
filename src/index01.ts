/*
Get the input format right as per Run
*/
import express, { Request, Response } from "express"
import { RunAgentInputSchema, RunAgentInput } from "@ag-ui/core"

const app = express()

app.use(express.json())

app.post("/awp", (req: Request, res: Response) => {
  try {
    // Parse and validate the request body
    const input: RunAgentInput = RunAgentInputSchema.parse(req.body)
    res.json({ message: `Hello World from ${input.threadId}` ,input})
  } catch (error) {
    res.status(422).json({ error: (error as Error).message })
  }
})

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000")
})

