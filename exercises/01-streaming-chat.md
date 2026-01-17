# Exercise: Build a Streaming AI Chat

## Goal

Build a complete streaming chat experience using the Vercel AI SDK:

1. **Backend:** Use `streamText` from AI SDK Core to stream responses from an LLM
2. **Frontend:** Use the `Chat` class from `@ai-sdk/angular` to display streaming messages

**What you'll learn:**
- How `streamText` works and how to pipe responses to the client
- How the `Chat` class manages conversations and streaming state
- How messages flow between frontend and backend

---

## Your Starting Point

You've been given:
- ✅ An Express server shell (`src/server.ts`)
- ✅ An Angular chat component with styling ready (`src/app/chat/`)
- ✅ All dependencies installed (`ai`, `@ai-sdk/angular`, `@ai-sdk/google`)

**Your job:** Implement the streaming logic on both ends.

---

# Part 1: Backend (AI SDK Core)

## Step 1: Set Up the Chat Endpoint

Open `src/server.ts`. You'll see a basic Express setup.

First, add the imports you need at the top:

```typescript
import { google } from '@ai-sdk/google';
import { streamText, convertToModelMessages } from 'ai';
```

**What these do:**
- `google` - Provider that connects to Google's Gemini models
- `streamText` - Core function that streams text from any LLM
- `convertToModelMessages` - Converts frontend message format to what models expect

---

## Step 2: Create the `/api/chat` Endpoint

Add a POST endpoint that receives messages and streams back a response:

```typescript
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  const result = streamText({
    model: google('gemini-2.0-flash-lite'),
    messages: convertToModelMessages(messages),
  });

  result.pipeUIMessageStreamToResponse(res);
});
```

**Let's break this down:**

1. **`req.body.messages`** - The frontend sends the full conversation history
2. **`streamText()`** - Starts streaming from the LLM. Key options:
   - `model` - Which LLM to use (we're using Gemini)
   - `messages` - The conversation history
3. **`convertToModelMessages()`** - Transforms UI message format → model format
4. **`pipeUIMessageStreamToResponse()`** - Streams the response back in a format the frontend `Chat` class understands

---

## Step 3: Add a System Prompt (Optional but Recommended)

Give your AI a personality or instructions:

```typescript
const result = streamText({
  model: google('gemini-2.0-flash-lite'),
  system: 'You are a helpful assistant. Keep responses concise and friendly.',
  messages: convertToModelMessages(messages),
});
```

The `system` parameter sets the AI's behavior for the entire conversation.

---

## Step 4: Test the Backend

Start the server:

```bash
pnpm start
```

Test with curl:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Say hello!"}]}'
```

You should see streamed response chunks in your terminal.

---

# Part 2: Frontend (AI SDK Angular)

Now let's connect the Angular frontend to consume this stream.

## Step 5: Import and Initialize the Chat Class

Open `src/app/chat/chat.component.ts`.

Import the `Chat` class:

```typescript
import { Chat } from '@ai-sdk/angular';
```

Inside the component class, create an instance:

```typescript
chat = new Chat({});
```

That's it! The `Chat` class automatically:
- Connects to `/api/chat` by default
- Manages conversation history
- Handles the streaming protocol

---

## Step 6: Send Messages

Find the `sendMessage()` method. Wire it up to send messages:

```typescript
sendMessage() {
  const input = this.inputField()?.nativeElement;
  if (!input || !input.value.trim()) return;

  this.chat.sendMessage({ text: input.value });
  input.value = '';
}
```

**What's happening:**
- `chat.sendMessage({ text: '...' })` sends a user message to your `/api/chat` endpoint
- The `Chat` class adds it to `chat.messages` and handles the streaming response

---

## Step 7: Display Messages

Open `src/app/chat/chat.component.html`.

Find the messages container and add:

```html
<div class="messages">
  @for (message of chat.messages; track message.id) {
    <div class="message" [class]="message.role">
      @for (part of message.parts; track $index) {
        @if (part.type === 'text') {
          <div class="message-text">{{ part.text }}</div>
        }
      }
    </div>
  }
</div>
```

**Understanding the message structure:**
- `message.role` → `'user'` or `'assistant'`
- `message.parts` → Array of content (text, reasoning, tool calls, etc.)
- `part.type === 'text'` → The actual text content

---

## Step 8: Test the Full Flow

Open http://localhost:4200 and send a message.

You should see:
- Your message appear immediately
- The AI response stream in word by word

🎉 **You've built a streaming AI chat!**

---

## Step 9: Add Loading State

The `Chat` class exposes a `status` property:
- `'ready'` - Idle, accepting input
- `'submitted'` - Waiting for first token
- `'streaming'` - Response coming in

Add a loading indicator:

```html
@if (chat.status === 'submitted') {
  <div class="loading">
    <em>Thinking...</em>
  </div>
}
```

---

## Step 10: Add Stop Button

Let users cancel mid-stream:

```html
@if (chat.status === 'ready') {
  <button type="submit">Send</button>
} @else {
  <button type="button" (click)="chat.stop()">Stop</button>
}
```

---

## Acceptance Criteria

✅ Backend streams responses (test with curl)
✅ Messages display with user/assistant styling
✅ AI responses stream progressively
✅ Loading state shows while waiting
✅ Stop button cancels streaming

---

## Bonus: Typing Cursor

Each message part has a `state` property (`'streaming'` or `'complete'`).

Add a cursor while streaming:

```html
@if (part.type === 'text') {
  <div class="message-text">
    {{ part.text }}
    @if (part.state === 'streaming') {
      <span class="typing-cursor">▌</span>
    }
  </div>
}
```

---

## Quick Reference

### Backend: streamText

```typescript
import { streamText, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';

const result = streamText({
  model: google('gemini-2.0-flash-lite'),
  system: 'You are a helpful assistant.',  // Optional
  messages: convertToModelMessages(messages),
});

// Stream to response (for Chat class)
result.pipeUIMessageStreamToResponse(res);

// Or stream raw text (for Completion class)
result.pipeTextStreamToResponse(res);
```

### Frontend: Chat Class

```typescript
import { Chat } from '@ai-sdk/angular';

chat = new Chat({
  api: '/api/chat',  // Optional, this is the default
});

// Properties
chat.messages    // Array of all messages
chat.status      // 'ready' | 'submitted' | 'streaming' | 'error'
chat.error       // Error object if failed

// Methods
chat.sendMessage({ text: 'Hello' })  // Send message
chat.stop()                           // Cancel streaming
```

### Message Structure

```typescript
{
  id: 'msg_123',
  role: 'user' | 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Hello!',
      state: 'streaming' | 'complete'
    }
  ]
}
```

---

## Solution

Finished or stuck? Check the solution branch:

```bash
git checkout exercise-01-solution
```

Compare your work:
```bash
git diff exercise-01-start exercise-01-solution
```
