// pages/api/socket.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'

export const config = { api: { bodyParser: false } }

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  // No extendemos tipos; hacemos un cast puntual
  const resAny = res as any
  const server: HTTPServer & { io?: IOServer } = resAny.socket?.server

  if (!server) {
    res.status(500).end('No server socket')
    return
  }

  if (!server.io) {
    const io = new IOServer(server, {
      path: '/api/socket',
      transports: ['websocket'],
    })
    server.io = io

    io.on('connection', (socket) => {
      socket.emit('ready', { ok: true })
      // ejemplo simple:
      socket.on('ping', (m) => socket.emit('pong', m))
    })
  }

  res.end()
}

