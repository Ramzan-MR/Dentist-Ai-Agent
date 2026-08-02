// Smart appointment assistant - completely free, no external API calls needed!

export interface ToolInput {
  [key: string]: string | number | boolean | object | null | undefined
}

// Smart appointment booking assistant - completely free, no API keys needed
function generateSmartResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  // Greeting responses
  if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
    return "Hello! Welcome to Smile Dental Clinic! I'm here to help you book an appointment or answer questions about our services. How can I assist you today?"
  }

  // Appointment booking
  if (
    message.includes('book') ||
    message.includes('appointment') ||
    message.includes('schedule')
  ) {
    return "Great! I'd be happy to help you book an appointment. What type of dental service are you interested in? We offer:\n\n• General Checkup\n• Teeth Cleaning\n• Teeth Whitening\n• Root Canal\n• Tooth Extraction\n• Dental Implants\n• Emergency Consultation\n\nWhich service interests you?"
  }

  // Availability check
  if (message.includes('available') || message.includes('slot') || message.includes('time')) {
    return "Our clinic is open:\n📅 Monday to Saturday\n⏰ 9:00 AM - 7:00 PM\n🍽️ Lunch Break: 1:00 PM - 2:00 PM\n\nWhat date would you prefer for your appointment?"
  }

  // Services inquiry
  if (
    message.includes('service') ||
    message.includes('treatment') ||
    message.includes('offer') ||
    message.includes('what can')
  ) {
    return "We offer comprehensive dental services including:\n\n✓ General Dental Checkup - $60\n✓ Teeth Cleaning & Scaling - $85\n✓ Teeth Whitening - $150\n✓ Dental Filling - $120\n✓ Root Canal Treatment - $400\n✓ Tooth Extraction - $150\n✓ Dental Implants - $1,500\n✓ Emergency Consultation - $75\n\nWould you like to book any of these services?"
  }

  // Contact info
  if (message.includes('contact') || message.includes('phone') || message.includes('address')) {
    return `📍 Smile Dental Clinic\n📍 Address: 123 Main Street, City, State ZIP\n📞 Phone: +1-555-123-4567\n📧 Email: contact@smiledentalclinic.com\n\nWe're here to help! Would you like to book an appointment?`
  }

  // Rescheduling
  if (message.includes('reschedule') || message.includes('change') || message.includes('move')) {
    return "I can help you reschedule your appointment! To do this, I'll need your booking reference number or the email you used when booking. Do you have that information?"
  }

  // Cancellation
  if (message.includes('cancel') || message.includes('delete')) {
    return "I understand you'd like to cancel your appointment. To proceed, please provide your booking reference number or the email associated with your appointment. Your cancellation will be processed immediately."
  }

  // Price inquiry
  if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
    return "Here are our service prices:\n\n💰 General Checkup: $60\n💰 Cleaning: $85\n💰 Whitening: $150\n💰 Filling: $120\n💰 Root Canal: $400\n💰 Extraction: $150\n💰 Implants: $1,500\n💰 Emergency: $75\n\nWould you like to book any of these?"
  }

  // Patient type
  if (message.includes('new') || message.includes('first time') || message.includes('patient')) {
    return "Welcome! Are you a new patient or an existing patient? This helps us provide you with the best experience. Either way, we're excited to help with your dental care!"
  }

  // Default helpful response
  return "I'm here to help you with:\n\n✓ Booking an appointment\n✓ Checking available time slots\n✓ Learning about our services\n✓ Getting pricing information\n✓ Rescheduling or canceling\n\nWhat would you like to do today?"
}

export async function chat(userMessage: string, _conversationHistory: any[] = []): Promise<{ response: string }> {
  // Generate intelligent response using local smart assistant (no API needed!)
  const response = generateSmartResponse(userMessage)
  return { response }
}
