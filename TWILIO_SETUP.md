# Twilio Setup Guide

This guide walks through exact steps to configure Twilio for both Phone and WhatsApp AI agents.

---

## Prerequisites

1. A Twilio account — sign up at https://www.twilio.com/try-twilio
2. Your deployed Vercel app URL (e.g. `https://your-app.vercel.app`)
3. Your Railway voice WebSocket URL (e.g. `wss://your-voice-server.railway.app/api/voice/ws`)

---

## A. Phone (AI Voice Agent)

### Step 1 — Get your credentials

1. Log in to Twilio Console: https://console.twilio.com
2. On the Dashboard, copy:
   - **Account SID** → set as `TWILIO_ACCOUNT_SID` in Vercel
   - **Auth Token** → set as `TWILIO_AUTH_TOKEN` in Vercel

### Step 2 — Buy a voice-enabled phone number

1. Go to **Phone Numbers → Manage → Buy a Number**
2. Filter: `Voice` capability checked
3. Buy a number (US numbers typically ~$1.15/month)
4. Note the number in E.164 format (e.g. `+12125551234`)
5. Set as `TWILIO_PHONE_NUMBER` in Vercel

### Step 3 — Configure the incoming voice webhook

1. Go to **Phone Numbers → Manage → Active Numbers**
2. Click on your purchased number
3. Scroll to **Voice & Fax** section
4. Set:
   - **A call comes in**: `Webhook`
   - **URL**: `https://your-app.vercel.app/api/voice/incoming`
   - **HTTP Method**: `HTTP POST`
5. Set:
   - **Call Status Changes**: `https://your-app.vercel.app/api/voice/status`
   - **HTTP Method**: `HTTP POST`
6. Click **Save**

### Step 4 — Deploy the ConversationRelay WebSocket server on Railway

The voice AI requires a persistent WebSocket connection that Vercel's serverless
architecture cannot provide for long calls. Deploy the standalone server on Railway:

1. Go to https://railway.app and create a new project
2. Connect your GitHub repository
3. Select the repository root as the service root
4. In **Settings → Build**, set the start command to:
   ```
   npx ts-node server/voice-ws.ts
   ```
   Or if you compile TypeScript first:
   ```
   node dist/server/voice-ws.js
   ```
5. In **Settings → Environment**, add these variables (same values as your Vercel project):
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `VOICE_WS_PORT=8080`
6. Note the Railway public domain (e.g. `your-service.railway.app`)
7. In Vercel, set:
   - `VOICE_WS_URL=wss://your-service.railway.app/api/voice/ws`

### Step 5 — Configure ConversationRelay permissions (if required)

ConversationRelay may require you to enable it in your Twilio account:

1. Go to **Console → Voice → ConversationRelay**
2. Review and accept terms of service if prompted

### Step 6 — Test inbound call

1. Deploy all environment variables to Vercel and Railway
2. Call your Twilio phone number
3. You should hear: *"Thank you for calling Smile Dental Clinic. I'm your AI dental assistant. How can I help you today?"*
4. Speak naturally — the AI will respond
5. Check Railway logs for: `VOICE_TRANSCRIPT_RECEIVED` and `VOICE_RESPONSE_SENT`

### Step 7 — Test outbound call

Send a POST request with your `OUTBOUND_CALL_SECRET`:

```bash
curl -X POST https://your-app.vercel.app/api/voice/outbound \
  -H "Content-Type: application/json" \
  -H "x-outbound-secret: YOUR_OUTBOUND_CALL_SECRET" \
  -d '{"to": "+12125551234", "purpose": "appointment reminder"}'
```

Expected response:
```json
{"success": true, "callSid": "CA...", "to": "+12125551234"}
```

---

## B. WhatsApp (AI Messaging Agent)

### Development / Testing — Twilio WhatsApp Sandbox

The Sandbox lets you test without a verified business WhatsApp account.

#### Step 1 — Enable the Sandbox

1. Go to **Messaging → Try it Out → Send a WhatsApp Message**
2. Follow the instructions to join the sandbox by sending the join code from your WhatsApp
3. Note the sandbox number (usually `+1 415 523 8886`)
4. Set as `TWILIO_WHATSAPP_NUMBER=+14155238886` in your `.env.local`

#### Step 2 — Configure the Sandbox webhook

1. Go to **Messaging → Settings → WhatsApp Sandbox Settings**
2. Set:
   - **When a message comes in**: `https://your-app.vercel.app/api/whatsapp/webhook`
   - **Method**: `HTTP POST`
3. Click **Save**

> **Local testing**: use [ngrok](https://ngrok.com) to expose your local server:
> ```bash
> ngrok http 3000
> ```
> Then set the sandbox webhook to `https://your-ngrok-url.ngrok.io/api/whatsapp/webhook`

#### Step 3 — Test

1. Send a WhatsApp message to the sandbox number (e.g. "Hello, I want to book an appointment")
2. You should receive an AI response within 3-5 seconds
3. Send a second message — the AI will remember the conversation

---

### Production — Twilio WhatsApp Sender

For a production WhatsApp business sender, you need to go through Twilio's approval process:

1. Go to **Messaging → Senders → WhatsApp Senders**
2. Click **Add Sender**
3. Choose between:
   - **Twilio number with WhatsApp** (fastest, available in some regions)
   - **Your own business phone number** (requires Meta Business verification)
4. Complete the Meta Business Account verification
5. Once approved, configure the webhook on the production sender:
   - **Inbound webhook**: `https://your-app.vercel.app/api/whatsapp/webhook`
   - **Method**: `HTTP POST`
6. Update `TWILIO_WHATSAPP_NUMBER` to your production WhatsApp sender number

> **Important**: WhatsApp Business API requires pre-approved message templates for
> outbound messages to users who haven't messaged you in the past 24 hours.
> Inbound-initiated conversations (user messages first) are free-form.

---

## C. Environment Variables Summary

Add these to Vercel → Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude AI |
| `TWILIO_ACCOUNT_SID` | From Twilio Console Dashboard |
| `TWILIO_AUTH_TOKEN` | From Twilio Console Dashboard |
| `TWILIO_PHONE_NUMBER` | E.164 format, e.g. `+12125551234` |
| `TWILIO_WHATSAPP_NUMBER` | WhatsApp sender number (Sandbox or Production) |
| `APP_BASE_URL` | Your Vercel app URL, e.g. `https://your-app.vercel.app` |
| `VOICE_WS_URL` | Railway WebSocket URL, e.g. `wss://your-ws.railway.app/api/voice/ws` |
| `HUMAN_TRANSFER_NUMBER` | Phone number for human handoff (optional) |
| `OUTBOUND_CALL_SECRET` | Shared secret for `/api/voice/outbound` (generate with `openssl rand -hex 32`) |

---

## D. Webhook URL Reference

| Channel | Webhook URL | Method |
|---------|-------------|--------|
| WhatsApp inbound | `https://your-app.vercel.app/api/whatsapp/webhook` | POST |
| Voice inbound | `https://your-app.vercel.app/api/voice/incoming` | POST |
| Voice status | `https://your-app.vercel.app/api/voice/status` | POST |
| ConversationRelay WS | `wss://your-ws.railway.app/api/voice/ws` | WebSocket |
| Config check | `https://your-app.vercel.app/api/config-check` | GET |

---

## E. Compliance Notes

- **Outbound calls**: Only call numbers with explicit consent. Rate limiting is enforced (10 calls/hour/IP).
- **WhatsApp**: Do not initiate unsolicited messages. Inbound-first conversations are unrestricted.
- **Recording**: No call recording is implemented. Add only with appropriate disclosure and consent.
- **Data retention**: Conversation history is stored in Supabase. Implement a retention policy appropriate for your jurisdiction.
