// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export const config = {
  api: { bodyParser: false }, // Socket.IO no usa bodyParser
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // ⚠️ No extendemos tipos: castea SOLO aquí para acceder al server
  const resAny = res as any
  const server: HTTPServer & { io?: IOServer } = resAny.socket?.server

  if (!server) {
    res.status(500).end('No server socket')
    return
  }

  if (!server.io) {
    const io = new IOServer(server, {
      path: '/api/socket',
      transports: ['websocket'], // importante en Vercel
    })
    server.io = io

    io.on('connection', (socket) => {
      socket.emit('ready', { ok: true })
      socket.on('ping', (msg) => socket.emit('pong', msg))
    })
  }

  res.end()
}
