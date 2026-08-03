// Smart appointment assistant - completely free, no external API calls needed!

// Smart appointment booking assistant - completely free, no API keys needed
function generateSmartResponse(userMessage: string): string {
  const message = userMessage.toLowerCase().trim()

  // Step 1: Collect Name
  if (message.length < 20 && !isNumeric(message) && !isValidEmail(message) && !isValidPhone(message)) {
    if (!message.includes('book') && !message.includes('appointment') && !message.includes('service')) {
      return `Welcome to Dr. Smile! I'm here to help you book an appointment. To get started, please tell me your full name.

Booking Progress: 1/7 – Name`
    }
  }

  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return "Hello! Welcome to Dr. Smile Dental Clinic. I'm your appointment booking assistant. To get started, could you please tell me your full name?"
  }

  // Appointment booking
  if (message.includes('book') || message.includes('appointment') || message.includes('schedule')) {
    return "Great! I'd be happy to help you book an appointment. First, could you please tell me your full name?"
  }

  // Services inquiry
  if (message.includes('service') || message.includes('treatment') || message.includes('offer')) {
    return "We offer comprehensive dental services:\n\n• General Checkup - $60\n• Teeth Cleaning - $85\n• Teeth Whitening - $150\n• Dental Filling - $120\n• Root Canal - $400\n• Tooth Extraction - $150\n• Dental Implants - $1,500\n• Emergency Consultation - $75\n\nWhich service would you like to book?"
  }

  // Availability/Time check
  if (message.includes('available') || message.includes('slot') || message.includes('time')) {
    return "Our clinic is open Monday to Saturday, 9:00 AM - 7:00 PM (lunch 1:00 PM - 2:00 PM). What date would you prefer for your appointment?"
  }

  // Contact info
  if (message.includes('contact') || message.includes('phone') || message.includes('address')) {
    return "Dr. Smile Dental Clinic\nAddress: 123 Main Street, City, State ZIP\nPhone: +1-555-123-4567\nEmail: contact@smiledentalclinic.com\n\nWould you like to book an appointment with us?"
  }

  // Rescheduling
  if (message.includes('reschedule') || message.includes('change') || message.includes('move')) {
    return "I can help you reschedule. Please provide your booking reference number or the email used when booking."
  }

  // Cancellation
  if (message.includes('cancel') || message.includes('delete')) {
    return "To cancel your appointment, please provide your booking reference number or the email associated with your appointment."
  }

  // Price inquiry
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return "Our service prices:\n\n• General Checkup: $60\n• Cleaning: $85\n• Whitening: $150\n• Filling: $120\n• Root Canal: $400\n• Extraction: $150\n• Implants: $1,500\n• Emergency: $75\n\nWhich service interests you?"
  }

  // Patient type question
  if (message.includes('new') || message.includes('first time') || message.includes('existing patient')) {
    return "Thank you! Are you a new patient or an existing patient? This helps us provide the best experience."
  }

  // Default: guide user
  return "I'm here to help you:\n\n• Book an appointment\n• Check available time slots\n• Learn about our services\n• Get pricing information\n• Reschedule or cancel\n\nWhat would you like to do?"
}

function isNumeric(str: string): boolean {
  return /^\d+$/.test(str)
}

function isValidEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)
}

function isValidPhone(str: string): boolean {
  return /^\+?[\d\s()-]{10,}$/.test(str)
}

export async function chat(userMessage: string, _conversationHistory: any[] = []): Promise<{ response: string }> {
  // Generate intelligent response using local smart assistant (no API needed!)
  const response = generateSmartResponse(userMessage)
  return { response }
}
