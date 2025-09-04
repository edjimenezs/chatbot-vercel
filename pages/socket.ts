import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'

export const config = { api: { bodyParser: false } }

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const resAny = res as any
  const server: HTTPServer & { io?: IOServer } = resAny.socket?.server

  if (!server) {
    res.status(500).end('No server socket')
    return
  }

  if (!server.io) {
    const io = new IOServer(server, {
      path: '/api/socket',
      transports: ['websocket'], // clave en Vercel
    })
    server.io = io

    io.on('connection', (socket) => {
      socket.emit('ready', { ok: true })
      socket.on('ping', (m) => socket.emit('pong', m))
    })
  }

  res.end()
}

