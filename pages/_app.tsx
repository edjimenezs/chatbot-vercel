import type { AppProps } from 'next/app'
import { SocketContextProvider } from '../contexts/SocketContext'
import '../styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SocketContextProvider>
      <Component {...pageProps} />
    </SocketContextProvider>
  )
}
