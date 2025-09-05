// app/api/socket/route.ts
export const runtime = 'edge';

export function GET() {
  // WebSocket nativo en Edge: crea el par cliente/servidor
  // @ts-expect-error: WebSocketPair existe en el runtime Edge de Vercel
  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();

  // Escuchar mensajes que manda el cliente
  server.addEventListener('message', (event: MessageEvent) => {
    const incoming = String(event.data ?? '');
    // responder con un JSON tipo "bot-message"
    const payload = JSON.stringify({
      type: 'bot-message',
      message: `Echo: ${incoming}` // por ahora solo repite lo que mandas
    });
    server.send(payload);
  });

  // 101 = Switching Protocols → indica que se abre un WebSocket
  return new

