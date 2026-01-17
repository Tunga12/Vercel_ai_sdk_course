import { google } from '@ai-sdk/google';
import { convertToModelMessages, Output, streamText } from 'ai';
import 'dotenv/config';
import express, { Request, Response } from 'express';
import z from 'zod';

const app = express();
app.use(express.json({ strict: false })); // Allow primitives (for analyze endpoint)

app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, selectedModel } = req.body;
  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    messages: await convertToModelMessages(messages),
  });

  result.pipeUIMessageStreamToResponse(res);
});

app.post('/api/completion', async (req: Request, res: Response) => {
  const { prompt } = req.body;

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    prompt,
  });

  result.pipeTextStreamToResponse(res);
});

app.post('/api/analyze', express.raw(), async (req: Request, res: Response) => {
  const input = req.body.toString('utf8');

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    output: Output.object({
        schema: z.object({
        title: z.string(),
        summary: z.string(),
        tags: z.array(z.string()),
        sentiment: z.enum(['positive', 'negative', 'neutral']),
      })
    }),
    prompt: `Analyze this content: ${input}`,
  });

  result.pipeTextStreamToResponse(res);
});

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`);
});
