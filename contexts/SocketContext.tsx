import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

const SocketCtx = createContext<Socket | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const s = io(window.location.origin, {
      path: '/api/socket',
      transports: ['websocket'],
    })
    setSocket(s)
    return () => s.close()
  }, [])

  return <SocketCtx.Provider value={socket}>{children}</SocketCtx.Provider>
}

export function useSocket() {
  return useContext(SocketCtx)
}

