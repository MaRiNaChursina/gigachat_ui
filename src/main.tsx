import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ChatProvider } from './state/chat/ChatProvider'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatProvider>
      <BrowserRouter basename={routerBasename}>
        <App />
      </BrowserRouter>
    </ChatProvider>
  </StrictMode>,
)
