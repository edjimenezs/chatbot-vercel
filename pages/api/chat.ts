import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Mensaje requerido' })
    }

    // Simular procesamiento del chatbot
    const botResponse = generateBotResponse(message)
    
    // Simular delay
    setTimeout(() => {
      res.status(200).json({ 
        message: botResponse,
        timestamp: new Date().toISOString()
      })
    }, 1000 + Math.random() * 2000)
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

// Función simple para generar respuestas del bot
function generateBotResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  // Respuestas predefinidas
  const responses = {
    greeting: [
      '¡Hola! ¿Cómo estás?',
      '¡Saludos! ¿En qué puedo ayudarte?',
      '¡Hola! Me da mucho gusto verte por aquí.'
    ],
    question: [
      'Esa es una excelente pregunta. ¿Podrías ser más específico?',
      'Interesante pregunta. Déjame pensar en eso...',
      'Me gusta tu curiosidad. ¿Hay algo más que te gustaría saber?'
    ],
    help: [
      'Estoy aquí para ayudarte. ¿Qué necesitas?',
      'Puedo ayudarte con información general. ¿Qué te interesa?',
      '¡Por supuesto! Estoy aquí para asistirte.'
    ],
    goodbye: [
      '¡Hasta luego! Fue un placer charlar contigo.',
      '¡Adiós! Que tengas un excelente día.',
      '¡Nos vemos pronto! Cuídate mucho.'
    ],
    default: [
      'Eso es muy interesante. ¿Podrías contarme más?',
      'Entiendo. ¿Hay algo específico en lo que pueda ayudarte?',
      'Gracias por compartir eso conmigo. ¿Qué más te gustaría saber?',
      'Me parece fascinante. ¿Tienes alguna pregunta?'
    ]
  }

  // Detectar el tipo de mensaje
  if (message.includes('hola') || message.includes('hi') || message.includes('buenos días') || message.includes('buenas tardes') || message.includes('buenas noches')) {
    return responses.greeting[Math.floor(Math.random() * responses.greeting.length)]
  }
  
  if (message.includes('?') || message.includes('qué') || message.includes('cómo') || message.includes('cuándo') || message.includes('dónde') || message.includes('por qué')) {
    return responses.question[Math.floor(Math.random() * responses.question.length)]
  }
  
  if (message.includes('ayuda') || message.includes('help') || message.includes('asistencia')) {
    return responses.help[Math.floor(Math.random() * responses.help.length)]
  }
  
  if (message.includes('adiós') || message.includes('bye') || message.includes('hasta luego') || message.includes('nos vemos')) {
    return responses.goodbye[Math.floor(Math.random() * responses.goodbye.length)]
  }
  
  // Respuesta por defecto
  return responses.default[Math.floor(Math.random() * responses.default.length)]
}
