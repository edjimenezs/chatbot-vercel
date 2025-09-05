import { createContext, useContext, useEffect, useState } from 'react'

type Ctx = {
  socket: WebSocket | null
  sendMessage: (text: string) => void
}

const SocketCtx = createContext<Ctx>({
  socket: null,
  sendMessage: () => {}
})

export function SocketContextProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    // cambia http(s) por ws(s) para conectarse al endpoint
    const url = `${location.origin.replace(/^http/, 'ws')}/api/socket`
    const ws = new WebSocket(url)

    setSocket(ws)

    return () => ws.close()
  }, [])

  const sendMessage = (text: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(text)
    }
  }

  return (
    <SocketCtx.Provider value={{ socket, sendMessage }}>
      {children}
    </SocketCtx.Provider>
  )
}

export const useSocket = () => useContext(SocketCtx)

