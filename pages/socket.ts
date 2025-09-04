// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export const config = {
  api: { bodyParser: false }, // Socket.IO no usa bodyParser
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Evita chocar con los tipos de Next: castea en el punto necesario
  const resAny = res as NextApiResponse & { socket: any }
  const server: HTTPServer & { io?: IOServer } = resAny.socket.server

  if (!server.io) {
    const io = new IOServer(server, {
      path: '/api/socket',
      transports: ['websocket'], // evita long-polling en Vercel
    })
    server.io = io

    io.on('connection', (socket) => {
      socket.on('ping', (msg) => socket.emit('pong', msg))
    })
  }

  res.end() // necesario para que la lambda termine
}
