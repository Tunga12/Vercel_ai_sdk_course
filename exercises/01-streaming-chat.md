# Exercise: Build a Streaming AI Chat

## Goal

Build a complete streaming chat experience using the Vercel AI SDK:

1. **Backend:** Use `streamText` from AI SDK Core to stream responses from an LLM
2. **Frontend:** Use the `Chat` class from `@ai-sdk/angular` to display streaming messages

**What you'll learn:**
- How `streamText` works and streams responses to the client
- How the `Chat` class manages conversations and streaming state
- Understanding the `UIMessage` structure with parts
- How to handle status, errors, and user interactions

---

## Prerequisites

- Node.js 18+ installed
- Google AI API key configured — [Setup Guide](./00-setup-google-ai.md)
- Dependencies installed (`pnpm install`)

---

## Your Starting Point

You've been given:
- ✅ An Express server shell (`src/server.ts`)
- ✅ An Angular chat component with styling ready (`src/app/chat/`)
- ✅ All dependencies installed (`ai`, `@ai-sdk/angular`, `@ai-sdk/google`)

**Your job:** Implement the streaming logic on both ends.

---

# Part 1: Backend (AI SDK Core)

The backend creates a streaming endpoint that the frontend `Chat` class will connect to.

## Step 1: Import the AI SDK

Open `src/server.ts`. Add the imports at the top:

```typescript
import { google } from '@ai-sdk/google';
import { streamText, UIMessage } from 'ai';
```

**What these do:**
- `google` - Provider that connects to Google's Gemini models
- `streamText` - Core function that streams text from any LLM
- `UIMessage` - Type definition for the message format used by the Chat class

---

## Step 2: Create the `/api/chat` Endpoint

Add a POST endpoint that receives messages and streams back a response:

```typescript
app.post('/api/chat', async (req, res) => {
  const { messages }: { messages: UIMessage[] } = req.body;

  const result = streamText({
    model: google('gemini-2.0-flash-lite'),
    messages,
  });

  result.pipeUIMessageStreamToResponse(res);
});
```

**Let's break this down:**

| Code | What it does |
|------|--------------|
| `messages: UIMessage[]` | The frontend sends the full conversation history in UI message format |
| `streamText()` | Starts streaming from the LLM |
| `model` | Which LLM provider and model to use |
| `messages` | The conversation history (UIMessage format works directly!) |
| `pipeUIMessageStreamToResponse()` | Streams the response in the format the `Chat` class expects |

> 💡 **Note:** In AI SDK 5, `UIMessage` format can be passed directly to `streamText()` — no conversion needed for simple text messages!

---

## Step 3: Add a System Prompt

Give your AI instructions or a personality:

```typescript
const result = streamText({
  model: google('gemini-2.0-flash-lite'),
  system: 'You are a helpful assistant. Keep responses concise and friendly.',
  messages,
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
  -d '{"messages":[{"role":"user","parts":[{"type":"text","text":"Say hello!"}]}]}'
```

You should see streamed response data in your terminal.

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
- Exposes reactive properties for your template

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
- Messages update reactively as the stream arrives

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

**Understanding the UIMessage structure:**

```typescript
interface UIMessage {
  id: string;                    // Unique message ID
  role: 'user' | 'assistant';    // Who sent it
  parts: UIMessagePart[];        // Content parts
}

interface UIMessagePart {
  type: 'text' | 'reasoning' | 'tool-invocation' | 'file' | ...;
  text?: string;                 // For text parts
  state?: 'streaming' | 'complete';  // Streaming status
}
```

Messages use a **parts-based structure** because AI responses can contain multiple types of content (text, reasoning, tool calls, files, etc.).

---

## Step 8: Test the Full Flow

Open http://localhost:4200 and send a message.

You should see:
- Your message appear immediately
- The AI response stream in word by word

🎉 **You've built a streaming AI chat!**

---

## Step 9: Handle Status States

The `Chat` class exposes a `status` property that tracks the request lifecycle:

| Status | Meaning |
|--------|---------|
| `'ready'` | Idle, ready for input |
| `'submitted'` | Request sent, waiting for first token |
| `'streaming'` | Response is streaming in |
| `'error'` | Something went wrong |

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

Let users cancel mid-stream using the `stop()` method:

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

## Bonus 1: Typing Cursor

Each message part has a `state` property that indicates if it's still streaming.

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

## Bonus 2: Error Handling

The `Chat` class exposes an `error` property when something goes wrong:

```html
@if (chat.error) {
  <div class="error">
    Something went wrong: {{ chat.error.message }}
    <button (click)="chat.reload()">Retry</button>
  </div>
}
```

---

## Bonus 3: Event Callbacks

Add callbacks to the Chat constructor for logging or analytics:

```typescript
chat = new Chat({
  onFinish: (event) => {
    console.log('Response complete:', event.message);
  },
  onError: (error) => {
    console.error('Chat error:', error);
  },
});
```

---

## Quick Reference

### Backend: streamText

```typescript
import { streamText, UIMessage } from 'ai';
import { google } from '@ai-sdk/google';

app.post('/api/chat', async (req, res) => {
  const { messages }: { messages: UIMessage[] } = req.body;

  const result = streamText({
    model: google('gemini-2.0-flash-lite'),
    system: 'You are a helpful assistant.',  // Optional
    messages,
  });

  // Stream to response (for Chat class)
  result.pipeUIMessageStreamToResponse(res);
});
```

### Frontend: Chat Class

```typescript
import { Chat } from '@ai-sdk/angular';

chat = new Chat({
  api: '/api/chat',  // Optional, this is the default
  onFinish: (event) => { /* handle completion */ },
  onError: (error) => { /* handle errors */ },
});

// Properties (reactive)
chat.messages    // UIMessage[] - conversation history
chat.status      // 'ready' | 'submitted' | 'streaming' | 'error'
chat.error       // Error object if failed

// Methods
chat.sendMessage({ text: 'Hello' })  // Send user message
chat.stop()                           // Cancel streaming
chat.reload()                         // Retry last message
chat.setMessages([])                  // Clear/set messages
```

### UIMessage Structure

```typescript
{
  id: 'msg_abc123',
  role: 'user' | 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Hello, world!',
      state: 'streaming' | 'complete'  // Only during streaming
    }
  ]
}
```

---

## Further Reading

- [AI SDK UI: Chatbot](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot) - Full documentation
- [AI SDK Core: streamText](https://ai-sdk.dev/docs/ai-sdk-core/generating-text) - Backend streaming
- [Message Persistence](https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-message-persistence) - Saving chats

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
