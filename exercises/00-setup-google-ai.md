# Setup: Get Your Google AI API Key

This guide walks you through creating a Google AI account and getting an API key for the Gemini models.

---

## Step 1: Go to Google AI Studio

Visit [Google AI Studio](https://aistudio.google.com)

Sign in with your Google account. If you don't have one, you'll need to create one first.

---

## Step 2: Get Your API Key

1. Click **"Get API Key"** in the left sidebar (or top navigation)

2. Click **"Create API Key"**

3. Choose a Google Cloud project:
   - If you don't have one, select **"Create API key in new project"**
   - If you have an existing project, you can use that

4. Your API key will be generated and displayed. **Copy it now** — you won't be able to see the full key again!

> ⚠️ **Keep your API key secret!** Never commit it to git or share it publicly.

---

## Step 3: Add the Key to Your Project

1. In the project root, find the `.env` file (or create one if it doesn't exist)

2. Add your API key:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
```

Replace `your-api-key-here` with the key you copied.

---

## Step 4: Verify It Works

Start the dev server:

```bash
pnpm start
```

Open http://localhost:4200 and try sending a message in the chat. If you see a streaming response, you're all set!

---

## Troubleshooting

### "API key not valid" error

- Double-check you copied the full key (no extra spaces)
- Make sure the `.env` file is in the project root (same level as `package.json`)
- Restart the server after adding the key

### "Quota exceeded" error

The free tier has generous limits, but if you hit them:
- Wait a few minutes and try again
- Check your usage at [Google AI Studio](https://aistudio.google.com)

### Still stuck?

Ask a workshop instructor for help!

---

## Free Tier Limits

Google AI Studio provides free access with these limits (as of January 2026):

| Model | Requests/min | Tokens/min | Requests/day |
|-------|-------------|------------|--------------|
| gemini-2.5-flash-lite | 10 | 250K | 20 |

> **Note:** The "1 / 10" and "5 / 20" notation means burst/sustained limits.

This is enough for the workshop exercises, but be mindful of the 20 requests/day limit on the free tier.

---

## Next Steps

You're ready to start the exercises! Head to [Exercise 01: Streaming Chat](./01-streaming-chat.md).
