# Deployment Guide

## Architecture

```
GitHub Repository
       │
       ▼ (auto-deploy)
  Vercel (Main App)
  ├── Web Chat UI
  ├── /api/chat              (web chatbot)
  ├── /api/whatsapp/webhook  (WhatsApp AI)
  ├── /api/voice/incoming    (Voice TwiML)
  ├── /api/voice/status      (Call status)
  ├── /api/voice/outbound    (Outbound calls)
  └── /api/config-check      (Health check)
       │
       └─────────────────────────────────────────┐
                                                  │
  Railway (Voice WebSocket — separate service)    │
  └── /api/voice/ws  ◄────── Twilio ConversationRelay
```

## Vercel Deployment

### Environment Variables

Add these in **Vercel → Project → Settings → Environment Variables**.
Select **All Environments** (Production + Preview + Development) for each.

**Required:**
- `ANTHROPIC_API_KEY` — Anthropic API key
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key

**Required for WhatsApp:**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`

**Required for Voice:**
- `TWILIO_ACCOUNT_SID` (same as above)
- `TWILIO_AUTH_TOKEN` (same as above)
- `TWILIO_PHONE_NUMBER`
- `VOICE_WS_URL` — WebSocket URL from Railway deployment
- `APP_BASE_URL` — your Vercel app URL (for Twilio webhook validation)

**Security:**
- `OUTBOUND_CALL_SECRET` — generate with `openssl rand -hex 32`

**Optional:**
- `HUMAN_TRANSFER_NUMBER` — phone number for human escalation
- `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID` — Google Calendar

### Deployment Steps

1. Push your code to the `main` branch on GitHub
2. Vercel picks up the push and deploys automatically
3. Check the Vercel deployment logs for any errors
4. After deploy, visit `https://your-app.vercel.app/api/config-check` to verify configuration

### After Adding Environment Variables

Trigger a new deployment: **Vercel → Project → Deployments → Redeploy**
(environment variable changes require a fresh deployment to take effect)

---

## Railway Voice WebSocket Deployment

The ConversationRelay WebSocket server must run on a persistent host (not serverless).

### Steps

1. Log in to https://railway.app
2. Create a **New Project → Deploy from GitHub repo**
3. Select your repository
4. Set the following environment variables in Railway:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `VOICE_WS_PORT=8080`
5. Set the **start command**:
   ```
   npx ts-node server/voice-ws.ts
   ```
6. Generate a public domain in **Settings → Networking**
7. Copy the Railway domain and set in Vercel:
   - `VOICE_WS_URL=wss://your-service.railway.app/api/voice/ws`

---

## Supabase Database Setup

Run these migrations in order in your Supabase SQL editor:

1. `migrations/001_create_appointments_table.sql` (if not already run)
2. `migrations/002_omnichannel_tables.sql` (new — run this now)

---

## Local Development

```bash
# Copy env file
cp .env.example .env.local
# Fill in values in .env.local

# Install dependencies
npm install

# Start Next.js dev server
npm run dev

# In a separate terminal, start the voice WebSocket server
npx ts-node server/voice-ws.ts

# Use ngrok to expose local server for Twilio webhooks
ngrok http 3000
# Then update Twilio webhook URLs to your ngrok URL
```

---

## Health Check

After deployment, verify at:
```
GET https://your-app.vercel.app/api/config-check
```

Expected response (all configured):
```json
{
  "status": "ok",
  "checks": {
    "anthropic_api_key": true,
    "supabase_url": true,
    "twilio_voice": true,
    "twilio_whatsapp": true
  }
}
```
