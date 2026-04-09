import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import './index.css'
import App from './App.tsx'
import { MidnightWalletProvider } from './shared/hooks/Wallet/WalletProvider.tsx'
import { BurnerWalletProvider } from './shared/hooks/BurnerWalletProvider.tsx'

const globalScope = globalThis as typeof globalThis & { Buffer?: typeof Buffer }

if (typeof globalScope.Buffer === 'undefined') {
  globalScope.Buffer = Buffer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MidnightWalletProvider>
      <BurnerWalletProvider>
        <App />
      </BurnerWalletProvider>
    </MidnightWalletProvider>
  </StrictMode>,
)
