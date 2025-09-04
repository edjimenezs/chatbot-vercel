import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  sendMessage: (message: string) => Promise<string>
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  sendMessage: async () => ''
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

interface SocketProviderProps {
  children: React.ReactNode
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [useWebSocket, setUseWebSocket] = useState(true)

  // Función para enviar mensaje usando HTTP como fallback
  const sendMessageHTTP = async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()
      return data.message
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      return 'Lo siento, hubo un error al procesar tu mensaje.'
    }
  }

  const sendMessage = async (message: string): Promise<string> => {
    if (useWebSocket && socket && isConnected) {
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve('Lo siento, el servidor tardó demasiado en responder.')
        }, 10000)

        socket.emit('user-message', { message })
        
        const handleResponse = (data: { message: string }) => {
          clearTimeout(timeout)
          socket.off('bot-message', handleResponse)
          resolve(data.message)
        }
        
        socket.on('bot-message', handleResponse)
      })
    } else {
      return sendMessageHTTP(message)
    }
  }

  useEffect(() => {
    // Inicializar socket solo en el cliente
    if (typeof window !== 'undefined') {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:3000'

      const newSocket = io(socketUrl, {
        path: '/api/socket',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })

      newSocket.on('connect', () => {
        setIsConnected(true)
        setUseWebSocket(true)
        console.log('Conectado al servidor WebSocket:', socketUrl)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
        console.log('Desconectado del servidor WebSocket')
      })

      newSocket.on('connect_error', (error) => {
        console.error('Error de conexión WebSocket:', error)
        setIsConnected(false)
        setUseWebSocket(false)
        console.log('Cambiando a modo HTTP fallback')
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected, sendMessage }}>
      {children}
    </SocketContext.Provider>
  )
}
