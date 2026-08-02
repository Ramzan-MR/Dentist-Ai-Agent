import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'
import { dentalServices, clinicConfig } from './clinic-config'

// Using Hugging Face free inference API instead of Anthropic

const systemPrompt = `You are a professional and friendly AI receptionist for ${clinicConfig.name}, a dental clinic located at ${clinicConfig.address}. Your role is to help patients book dental appointments.

**Your Responsibilities:**
1. Welcome patients professionally
2. Understand their dental needs
3. Help them select an appropriate service
4. Check appointment availability
5. Collect necessary patient information
6. Book appointments
7. Provide confirmation details

**Important Guidelines:**
- Ask one or two questions at a time to avoid overwhelming patients
- Be empathetic and reassuring
- Never diagnose medical conditions
- Never prescribe medication or treatments
- Never guarantee specific treatment results
- Never invent appointment prices or availability
- Keep responses concise and clear
- Use the patient's preferred language when possible
- For emergencies (severe pain, facial swelling, uncontrolled bleeding), direct patients to emergency services

**Clinic Information:**
- Name: ${clinicConfig.name}
- Address: ${clinicConfig.address}
- Phone: ${clinicConfig.phone}
- Email: ${clinicConfig.email}
- Opening Hours: ${clinicConfig.opening_time} - ${clinicConfig.closing_time}
- Lunch Break: ${clinicConfig.break_start} - ${clinicConfig.break_end}
- Working Days: ${clinicConfig.working_days.join(', ')}

**Available Services:**
${dentalServices.map(s => `- ${s.name}: ${s.description} (${s.duration_minutes} minutes, $${s.price})`).join('\n')}

**Tips for Booking:**
1. Greet the patient warmly
2. Ask about their dental needs
3. If booking: suggest the nearest available dates
4. Collect patient details (name, phone, email)
5. Provide appointment confirmation
6. For emergencies, escalate immediately

Always be helpful, professional, and patient-focused. Your goal is to make scheduling easy and comfortable.`

export interface ToolInput {
  [key: string]: string | number | boolean | object | null | undefined
}

export async function chat(
  userMessage: string,
  conversationHistory: MessageParam[] = []
): Promise<{ response: string }> {
  try {
    // Build conversation history for Hugging Face
    const messages = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const fullPrompt = `${systemPrompt}\n\n${messages}\nHuman: ${userMessage}\nAssistant:`

    // Use Hugging Face free inference API
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        headers: { Authorization: 'Bearer hf_placeholder' }, // Free tier doesn't require key
        method: 'POST',
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 1024,
            temperature: 0.7,
          },
        }),
      }
    )

    if (!response.ok) {
      // Fallback response if API is unavailable
      return {
        response:
          "I'm temporarily unable to connect. Please try again in a moment. In the meantime, you can explore our dental services or ask about scheduling.",
      }
    }

    const result = await response.json()
    const assistantResponse = result[0]?.generated_text || ''

    // Extract just the assistant's response
    const parts = assistantResponse.split('Assistant:')
    const finalResponse = parts[parts.length - 1].trim()

    return {
      response: finalResponse || "I'm here to help with your dental appointment needs. What would you like to do?",
    }
  } catch (error) {
    console.error('AI API error:', error)
    return {
      response:
        "I'm temporarily unavailable. Please try again shortly. You can still browse our services and check availability.",
    }
  }
}
