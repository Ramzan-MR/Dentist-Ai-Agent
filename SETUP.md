# AI Dental Appointment Booking System - Setup Guide

This guide walks you through setting up the AI Dental Appointment Booking System for production use.

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase account
- Anthropic API key
- Google Cloud project with Calendar API enabled
- Google Service Account with Calendar API access

## Step 1: Get Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create an account or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy it to your `.env.local` file as `ANTHROPIC_API_KEY`

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up or log in
3. Create a new project:
   - Choose a project name
   - Create a strong password (save it!)
   - Choose your region
   - Click "Create new project"

### Get Your Credentials

1. Go to Project Settings > API
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Create Database Tables

1. Go to the SQL Editor in Supabase
2. Create a new query
3. Copy the contents of `migrations/001_create_appointments_table.sql`
4. Paste it into the SQL editor
5. Click "Run"
6. Wait for the migration to complete

**Table Structure Created:**
- `appointments` - Stores patient appointments
- `admin_users` - Stores clinic staff accounts
- Indexes for fast lookups
- Automatic timestamp management

## Step 3: Set Up Google Calendar

### Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click on the project selector
   - Click "New Project"
   - Enter project name
   - Click "Create"

### Enable Google Calendar API

1. In the left menu, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it
4. Click "Enable"

### Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in:
   - Service account name: e.g., "Dental Clinic Bot"
   - Service account ID: (auto-filled)
   - Click "Create and Continue"
4. Skip the optional steps, click "Done"

### Create and Download Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON"
5. Click "Create"
6. A JSON file will download

### Extract Credentials from JSON Key

Open the downloaded JSON file and copy:
- `client_email` → `GOOGLE_CLIENT_EMAIL`
- `private_key` → `GOOGLE_PRIVATE_KEY` (replace `\n` with actual newlines in `.env.local`)

### Create a Google Calendar

1. Open [Google Calendar](https://calendar.google.com)
2. On the left sidebar, find "Other calendars"
3. Click "+" button
4. Select "Create new calendar"
5. Name it "Clinic Appointments" or similar
6. Click "Create calendar"
7. Go to calendar settings
8. Copy the "Calendar ID" (looks like an email)
9. Paste it as `GOOGLE_CALENDAR_ID` in `.env.local`

### Share Calendar with Service Account

1. In your clinic calendar settings (from step 7)
2. Go to "Share with specific people"
3. Enter the service account email (the `GOOGLE_CLIENT_EMAIL` from the JSON key)
4. Grant "Editor" permissions
5. Click "Send"

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your actual credentials:

```env
# Anthropic
ANTHROPIC_API_KEY=sk-ant-v0-xxxxx...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Calendar
GOOGLE_CLIENT_EMAIL=dental-clinic-bot@xxxxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpA... (replace \n with actual newlines)\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=xxxxx@group.calendar.google.com

# Clinic Configuration
CLINIC_NAME=Smile Dental Clinic
CLINIC_ADDRESS=123 Main Street, City, State ZIP
CLINIC_PHONE=+1-555-123-4567
CLINIC_EMAIL=contact@smiledentalclinic.com
CLINIC_TIMEZONE=America/New_York
CLINIC_OPENING_TIME=09:00
CLINIC_CLOSING_TIME=19:00
CLINIC_BREAK_START=13:00
CLINIC_BREAK_END=14:00

# Admin
ADMIN_EMAIL=admin@smiledentalclinic.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Run the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Step 6: Test the Application

1. Open the chat interface
2. Type a message like "I want to book an appointment"
3. The AI should respond with greeting and offer help
4. Test the quick action buttons
5. Check that API calls work correctly

## Step 7: Deploy to Vercel

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/dental-appointment-ai.git
git push -u origin main
```

### Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables:
   - Set all variables from `.env.local`
6. Click "Deploy"

## Troubleshooting

### Anthropic API Errors
- Verify your API key is correct and has remaining credits
- Check that you're using the correct model name
- Ensure the API key is in the `.env.local` file

### Supabase Connection Issues
- Verify the URL format: `https://xxxxx.supabase.co`
- Check that the anon key is for your project
- Make sure RLS policies allow access

### Google Calendar Sync Problems
- Verify the service account has Editor access to your calendar
- Check that the private key is properly formatted (actual newlines, not `\n`)
- Ensure Calendar API is enabled in Google Cloud
- Verify the calendar ID is correct

### Build Errors
- Delete `.next` and `node_modules` folders
- Run `npm install` again
- Run `npm run build`

### Dev Server Won't Start
- Check that port 3000 is not in use
- Verify Node.js version is 18+
- Check for syntax errors with `npm run lint`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | `sk-ant-v0-...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOi...` |
| `GOOGLE_CLIENT_EMAIL` | Google service account email | `xxx@iam.gserviceaccount.com` |
| `GOOGLE_PRIVATE_KEY` | Google service account private key | `-----BEGIN RSA...` |
| `GOOGLE_CALENDAR_ID` | Google Calendar ID | `xxx@group.calendar.google.com` |
| `CLINIC_NAME` | Your clinic name | `Smile Dental Clinic` |
| `CLINIC_ADDRESS` | Clinic address | `123 Main Street...` |
| `CLINIC_PHONE` | Clinic phone | `+1-555-123-4567` |
| `CLINIC_EMAIL` | Clinic email | `contact@...` |
| `CLINIC_TIMEZONE` | IANA timezone | `America/New_York` |
| `CLINIC_OPENING_TIME` | Opening hours (24h) | `09:00` |
| `CLINIC_CLOSING_TIME` | Closing hours (24h) | `19:00` |
| `CLINIC_BREAK_START` | Break start time | `13:00` |
| `CLINIC_BREAK_END` | Break end time | `14:00` |
| `ADMIN_EMAIL` | Admin email address | `admin@...` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

## Security Notes

⚠️ **Never commit `.env.local` to version control!**

- Add `.env.local` to `.gitignore` (already done)
- Keep your API keys secret
- Rotate Google service account keys regularly
- Use strong Supabase passwords
- Enable 2FA on your accounts

## Next Steps

1. Customize dental services in `lib/clinic-config.ts`
2. Add your clinic's branding
3. Update the system prompt if needed
4. Set up email notifications (optional)
5. Add SMS reminders (optional)
6. Configure analytics and monitoring

## Support

For detailed information, see:
- [README.md](README.md) - Full documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
