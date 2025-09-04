import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

type Ctx = {
  socket: Socket | null
  sendMessage: (text: string) => Promise<string>
}

const Ctx = createContext<Ctx>({ socket: null, sendMessage: async () => '' })

export function SocketContextProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(window.location.origin, {
      path: '/api/socket',
      transports: ['websocket'], // importante
    })
    setSocket(s)
    return () => s.close()
  }, [])

  // Si ya tienes /pages/api/chat.ts, úsalo aquí. Si no, déjalo igual.
  const sendMessage = async (text: string) => {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    })
    const data = await r.json().catch(() => ({}))
    return data.reply ?? ''
  }

  return <Ctx.Provider value={{ socket, sendMessage }}>{children}</Ctx.Provider>
}

export const useSocket = () => useContext(Ctx)
