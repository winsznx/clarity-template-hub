import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './appkit.config' // Initialize Reown AppKit for WalletConnect support
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
