import { ClinicConfig, DentalService } from './types'

export const clinicConfig: ClinicConfig = {
  name: process.env.CLINIC_NAME || 'Smile Dental Clinic',
  address: process.env.CLINIC_ADDRESS || '123 Main Street, City, State ZIP',
  phone: process.env.CLINIC_PHONE || '+1-555-123-4567',
  email: process.env.CLINIC_EMAIL || 'contact@smiledentalclinic.com',
  timezone: process.env.CLINIC_TIMEZONE || 'America/New_York',
  opening_time: process.env.CLINIC_OPENING_TIME || '09:00',
  closing_time: process.env.CLINIC_CLOSING_TIME || '19:00',
  break_start: process.env.CLINIC_BREAK_START || '13:00',
  break_end: process.env.CLINIC_BREAK_END || '14:00',
  working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  appointment_duration: 30,
}

export const dentalServices: DentalService[] = [
  {
    id: '1',
    name: 'General Dental Checkup',
    description: 'Regular dental examination and consultation',
    duration_minutes: 30,
    price: 60,
    category: 'General',
  },
  {
    id: '2',
    name: 'Teeth Cleaning and Scaling',
    description: 'Professional cleaning and scaling of teeth',
    duration_minutes: 45,
    price: 85,
    category: 'Preventive',
  },
  {
    id: '3',
    name: 'Teeth Whitening',
    description: 'Professional teeth whitening procedure',
    duration_minutes: 60,
    price: 150,
    category: 'Cosmetic',
  },
  {
    id: '4',
    name: 'Toothache Consultation',
    description: 'Emergency consultation for tooth pain',
    duration_minutes: 20,
    price: 50,
    category: 'Emergency',
  },
  {
    id: '5',
    name: 'Dental Filling',
    description: 'Filling for cavities',
    duration_minutes: 30,
    price: 120,
    category: 'Restorative',
  },
  {
    id: '6',
    name: 'Root Canal Treatment',
    description: 'Endodontic treatment for tooth infection',
    duration_minutes: 90,
    price: 400,
    category: 'Endodontics',
  },
  {
    id: '7',
    name: 'Tooth Extraction',
    description: 'Tooth removal procedure',
    duration_minutes: 30,
    price: 150,
    category: 'Surgical',
  },
  {
    id: '8',
    name: 'Dental Implants',
    description: 'Implant placement and restoration',
    duration_minutes: 60,
    price: 1500,
    category: 'Surgical',
  },
  {
    id: '9',
    name: 'Braces Consultation',
    description: 'Orthodontic consultation and treatment planning',
    duration_minutes: 30,
    price: 100,
    category: 'Orthodontics',
  },
  {
    id: '10',
    name: "Children's Dentistry",
    description: 'Dental care for children',
    duration_minutes: 30,
    price: 45,
    category: 'Pediatric',
  },
  {
    id: '11',
    name: 'Gum Treatment',
    description: 'Periodontal disease treatment',
    duration_minutes: 45,
    price: 120,
    category: 'Periodontics',
  },
  {
    id: '12',
    name: 'Emergency Dental Consultation',
    description: 'Urgent dental problems consultation',
    duration_minutes: 20,
    price: 75,
    category: 'Emergency',
  },
]

export function validateEnvironmentVariables(): string[] {
  const errors: string[] = []

  // These must be set for the app to function
  const required = [
    'ANTHROPIC_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  for (const v of required) {
    if (!process.env[v]) {
      errors.push(`Missing required environment variable: ${v}`)
    }
  }

  // Optional — warn but don't fail
  const optional = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'TWILIO_WHATSAPP_NUMBER',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_CALENDAR_ID',
  ]
  for (const v of optional) {
    if (!process.env[v]) {
      console.warn(`[CONFIG] Optional variable not set: ${v}`)
    }
  }

  return errors
}
