# AI Dental Appointment Booking System

A production-ready, AI-powered dental clinic appointment booking system built with Next.js, Anthropic Claude AI, Supabase, and Google Calendar integration.

## Features

✨ **AI Receptionist**: Intelligent chatbot powered by Claude 3.5 Sonnet for natural patient interactions
📅 **Smart Scheduling**: Automatic availability checking with Google Calendar integration
🗓️ **Appointment Management**: Full lifecycle management (booking, rescheduling, cancellation)
👥 **Admin Dashboard**: Comprehensive appointment management interface for clinic staff
🔒 **Secure**: Server-side API keys, input validation, and authorization checks
📱 **Responsive**: Mobile-friendly design with Tailwind CSS
💾 **Database**: Supabase for reliable data storage
🔄 **Sync**: Two-way sync between Supabase and Google Calendar

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **AI**: Anthropic Claude 3.5 Sonnet
- **Database**: Supabase (PostgreSQL)
- **Calendar**: Google Calendar API
- **Validation**: Zod schemas
- **Testing**: Jest + React Testing Library

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key
- Supabase account and project
- Google Cloud project with Calendar API enabled
- Google Service Account credentials

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

#### Anthropic
- `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret!)

#### Google Calendar
- `GOOGLE_CLIENT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key (replace `\n` with actual newlines)
- `GOOGLE_CALENDAR_ID` - Your clinic's Google Calendar ID

#### Clinic Configuration
- `CLINIC_NAME` - Your clinic name
- `CLINIC_ADDRESS` - Your clinic address
- `CLINIC_PHONE` - Your clinic phone number
- `CLINIC_EMAIL` - Your clinic email
- `CLINIC_TIMEZONE` - IANA timezone (e.g., America/New_York)
- `CLINIC_OPENING_TIME` - Opening time in HH:MM format (e.g., 09:00)
- `CLINIC_CLOSING_TIME` - Closing time in HH:MM format (e.g., 19:00)
- `CLINIC_BREAK_START` - Break start time (e.g., 13:00)
- `CLINIC_BREAK_END` - Break end time (e.g., 14:00)

### 3. Supabase Setup

#### Create a new Supabase project or use existing one

1. Go to https://supabase.com and create a project
2. Get your project URL and keys from project settings
3. Copy the SQL migration from `migrations/001_create_appointments_table.sql`
4. In Supabase SQL Editor, paste and execute the migration

This will create:
- `appointments` table with all required fields
- `admin_users` table for staff management
- Indexes for optimal query performance
- Automatic `updated_at` timestamp management
- Unique constraints to prevent double booking

### 4. Google Calendar Setup

#### Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable the Google Calendar API
4. Create a Service Account:
   - Go to "Service Accounts" under "IAM & Admin"
   - Click "Create Service Account"
   - Fill in the details and click "Create and Continue"
   - Grant "Calendar API" role
   - Create a JSON key
5. Copy the credentials to your `.env.local`:
   - `GOOGLE_CLIENT_EMAIL` = client_email from JSON
   - `GOOGLE_PRIVATE_KEY` = private_key from JSON
   - `GOOGLE_CALENDAR_ID` = Your clinic's Google Calendar ID

#### Share Calendar with Service Account

1. In Google Calendar, open your clinic calendar settings
2. Add the service account email to share access
3. Grant "Editor" permissions

### 5. Run the Application

#### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser

#### Build

```bash
npm run build
```

#### Production

```bash
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/              # Chat API endpoint
│   │   ├── services/          # Dental services endpoint
│   │   ├── availability/      # Availability checking endpoint
│   │   ├── clinic/            # Clinic info endpoint
│   │   ├── appointments/      # Appointment endpoints
│   │   └── admin/             # Admin operations endpoints
│   ├── admin/                 # Admin dashboard pages
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Chat interface page
│   └── globals.css            # Global styles
├── components/
│   ├── ChatInterface.tsx      # Main chat interface
│   ├── ChatMessage.tsx        # Message display
│   ├── ChatInput.tsx          # Message input
│   ├── QuickActions.tsx       # Quick action buttons
│   └── AdminDashboard.tsx     # Admin dashboard
├── lib/
│   ├── types.ts               # TypeScript type definitions
│   ├── schemas.ts             # Zod validation schemas
│   ├── clinic-config.ts       # Clinic configuration and services
│   ├── supabase-client.ts     # Supabase database client
│   ├── google-calendar.ts     # Google Calendar integration
│   ├── claude-client.ts       # Claude AI client with tools
│   ├── availability.ts        # Slot generation logic
│   ├── utils.ts               # Utility functions
│   └── __tests__/             # Unit tests
├── migrations/
│   └── 001_create_appointments_table.sql # Database schema
├── .env.example               # Environment variables template
├── package.json               # Project dependencies
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── README.md                  # This file
```

## API Endpoints

### Chat
- `POST /api/chat` - Send message to AI receptionist

### Services
- `GET /api/services` - List all dental services

### Availability
- `POST /api/availability` - Check available slots
- `GET /api/availability` - Get next available dates

### Clinic Info
- `GET /api/clinic` - Get clinic information

### Appointments
- `POST /api/appointments/lookup` - Find appointments by email

### Admin
- `GET /api/admin/appointments/list` - List all appointments
- `POST /api/admin/appointments/search` - Search appointments
- `POST /api/admin/appointments/update` - Update appointment status

## Features & Capabilities

### AI Receptionist

The AI receptionist can:
- Welcome patients and understand their needs
- Recommend appropriate dental services
- Check real-time appointment availability
- Collect patient information
- Book confirmed appointments
- Provide appointment confirmation details
- Handle emergency escalations

### Appointment Booking Flow

1. Patient initiates chat
2. AI asks about dental service needed
3. Patient selects or describes service
4. AI checks availability for preferred date
5. AI presents top 3 available time slots
6. Patient selects a slot
7. AI collects contact information (name, phone, email)
8. AI confirms booking details
9. Appointment is created in Supabase
10. Event is added to Google Calendar
11. Confirmation message with booking reference

### Appointment Status Workflow

- `pending` - Awaiting confirmation
- `confirmed` - Confirmed appointment
- `rescheduled` - Appointment was rescheduled
- `cancelled` - Appointment was cancelled
- `completed` - Appointment completed
- `no_show` - Patient did not show up

### Clinic Configuration

Easily configure clinic settings via environment variables:
- Clinic name, address, phone, email
- Operating hours (including break time)
- Working days
- Default appointment duration
- Timezone for accurate scheduling

## Security Features

✅ **Server-side only API keys** - No secrets exposed to frontend
✅ **Input validation** - Zod schemas validate all inputs
✅ **Rate limiting ready** - Structure supports rate limiting middleware
✅ **Prompt injection protection** - Sanitized inputs before AI processing
✅ **Database authorization** - Row-level security policies available
✅ **HTTPS ready** - Vercel deployment compatible
✅ **No hardcoded credentials** - All config via environment variables

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Tests cover:
- Email validation
- Phone number validation
- Time parsing and formatting
- Working day detection
- Input sanitization
- Slot generation logic

## Type Checking

```bash
npm run type-check
```

## Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy

### Other Platforms

The application is compatible with:
- AWS Lambda + API Gateway
- Google Cloud Run
- Azure App Service
- DigitalOcean App Platform

## Customization

### Add New Dental Services

Edit `lib/clinic-config.ts`:

```typescript
export const dentalServices: DentalService[] = [
  {
    id: '13',
    name: 'New Service',
    description: 'Service description',
    duration_minutes: 45,
    price: 200,
    category: 'Category',
  },
  // ... other services
]
```

### Customize AI Behavior

Edit `lib/claude-client.ts` to modify the system prompt and tool definitions.

### Modify Clinic Hours

Use environment variables - no code changes needed!

### Change UI Styling

All styles use Tailwind CSS. Customize the theme in `tailwind.config.ts`.

## Emergency Handling

The AI receptionist recognizes emergency keywords and responds:

> "This may require urgent professional attention. Please contact the clinic immediately. If you are experiencing severe bleeding, breathing difficulty, or a life-threatening emergency, contact your local emergency service."

Emergency keywords include:
- Severe pain
- Facial swelling
- Uncontrolled bleeding
- Breathing difficulty
- Dental trauma

## Monitoring & Logging

The application logs:
- Chat interactions
- API calls
- Appointment operations
- Error events

For production, integrate with:
- Sentry for error tracking
- Datadog for monitoring
- LogRocket for session replay

## Troubleshooting

### Anthropic API Errors

- Verify your API key is correct
- Check rate limits haven't been exceeded
- Ensure model name is correct (`claude-3-5-sonnet-20241022`)

### Supabase Connection Issues

- Verify URL and keys are correct
- Check network connectivity
- Ensure RLS policies aren't blocking access

### Google Calendar Sync Issues

- Verify service account has Calendar API enabled
- Check if calendar is shared with service account
- Ensure private key formatting is correct (replace `\n` with newlines)

### Timezone Issues

- Use IANA timezone format (e.g., `America/New_York`)
- Verify clinic timezone matches your location
- Test with different dates to ensure DST handling

## Performance Optimization

- Next.js automatically code-splits routes
- API routes are serverless and scale automatically
- Database queries use indexes for fast lookups
- Images are optimized with Next.js Image component
- CSS is minified in production

## Future Enhancements

Potential features to add:
- SMS notifications for appointment reminders
- Automated follow-up surveys
- Payment integration
- Video consultation support
- Multi-language support
- Analytics dashboard
- Insurance verification
- Patient portal with medical history

## Support

For issues and questions:
1. Check the README troubleshooting section
2. Review API error messages
3. Check application logs
4. Open a GitHub issue with reproduction steps

## License

MIT License - feel free to use this project for commercial purposes.

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a pull request

## Changelog

### v1.0.0 (Initial Release)
- AI-powered chat interface
- Appointment booking system
- Google Calendar integration
- Admin dashboard
- Supabase database
- Complete API routes
- Security measures
- Type safety with TypeScript
# Dentist-Ai-Agent
