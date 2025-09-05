import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../contexts/SocketContext'
import Head from 'next/head'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { socket, sendMessage } = useSocket()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 👇 Listeners para WebSocket nativo
  useEffect(() => {
    if (!socket) return

    const onOpen = () => {
      setIsConnected(true)
      console.log('Conectado al servidor WebSocket')
    }

    const onClose = () => {
      setIsConnected(false)
      console.log('Desconectado del servidor WebSocket')
    }

    const onMessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data as string)
        if (data?.type === 'bot-message') {
          const newMessage: Message = {
            id: Date.now().toString(),
            text: data.message,
            sender: 'bot',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, newMessage])
        }
      } catch {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: String(ev.data),
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, newMessage])
      }
    }

    socket.addEventListener('open', onOpen)
    socket.addEventListener('close', onClose)
    socket.addEventListener('message', onMessage)

    return () => {
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('close', onClose)
      socket.removeEventListener('message', onMessage)
    }
  }, [socket])

  // 👇 Manejo del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    const messageToSend = inputMessage
    setInputMessage('')

    // Aquí solo enviamos, la respuesta llegará por onMessage
    try {
      sendMessage(messageToSend)
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error al procesar tu mensaje.',
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  return (
    <>
      <Head>
        <title>ChatBot con WebSocket</title>
        <meta
          name="description"
          content="Chatbot con comunicación en tiempo real usando WebSocket nativo en Vercel"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-gray-800">ChatBot WebSocket</h1>
            <div className="flex items-center mt-2">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isConnected ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              ></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'WebSocket Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
          <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>¡Hola! Soy tu chatbot. Escribe un mensaje para comenzar.</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!isConnected}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || !isConnected}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
