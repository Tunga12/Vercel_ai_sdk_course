// TODO: Import the necessary modules from the AI SDK
// import { google } from '@ai-sdk/google';
// import { streamText, convertToModelMessages } from 'ai';
import 'dotenv/config';
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// TODO: Create the /api/chat endpoint
// This endpoint should:
// 1. Extract messages from req.body
// 2. Use streamText() with the google model
// 3. Pipe the response back to the client

app.post('/api/chat', async (req: Request, res: Response) => {
  // Your code here
  res.status(501).json({ error: 'Not implemented yet' });
});

app.listen(3000, () => {
  console.log(`Server listening on port 3000`);
});
