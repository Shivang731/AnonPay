# AnonPay — Project Context for AI Assistants

## What We Are Building
AnonPay is a privacy-first invoice and payment protocol built on Midnight Network. 
Merchants create invoices and receive payments without exposing their identity, 
wallet balance, or transaction history on-chain. After payment, merchants can 
generate selective disclosure ZK proofs to prove financial information to banks, 
tax authorities, or auditors — without revealing anything else.

This was built for the INTO THE MIDNIGHT Hackathon 2026 — Finance & DeFi Track.

---

## The One Feature That Makes This Different
Selective disclosure. After a payment is settled, the merchant can generate a 
ZK proof that reveals ONLY specific fields to specific parties. For example:
- Show a bank: "I earned X tDUST this month" without revealing who paid
- Show a tax authority: "All invoices were settled" without exposing amounts
- Show an auditor: "Payment status only" without any other details

This is Midnight's core capability and the reason we chose it over Midnight or Ethereum.

---

## Tech Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- Wallet: Midnight Lace Wallet (window.midnight.lace)
- Smart Contract: Compact language on Midnight Testnet-02
- Backend: Node.js + Express + Supabase (PostgreSQL + Realtime)
- Encryption: AES-256-GCM for off-chain metadata
- ZK Proofs: Local proof server via Docker on port 6300
- Token: tDUST (Midnight's shielded token)

---

## Smart Contract
File: contracts/anonpay.compact
Compiled output: contracts/build/
Contract JS API copied to: frontend/src/contract/index.js
ZK keys copied to: frontend/src/keys/

Four exported circuits:
1. create_invoice(invoice_hash: Bytes<32>, expiry: Uint<64>, amount: Uint<64>)
   - Stores hash commitment in shielded ledger state
   - Returns invoice_id as Uint<64>

2. pay_invoice(invoice_id: Uint<64>)
   - Verifies ZK proof of payment
   - Checks nullifier to prevent replay attacks
   - Marks invoice settled
   - Mints PayerReceipt and MerchantReceipt

3. generate_disclosure_proof(invoice_id: Uint<64>, reveal_amount: Boolean)
   - Returns verifiable ZK proof
   - Merchant controls what gets revealed

4. get_invoice_status(invoice_id: Uint<64>)
   - Returns OPEN, SETTLED, or EXPIRED
   - Reveals nothing about amount or parties

---

## Wallet Connection
Always use window.midnight.lace for wallet connection.
Never use any Midnight wallet adapters — they have been removed.
The wallet hook is at: src/shared/hooks/Wallet/WalletProvider.tsx
The connect button is at: src/shared/components/ui/WalletConnectButton.tsx

Pattern for wallet calls:
const lace = window.midnight.lace
const api = await lace.enable()
const address = await api.getAddress()
const balances = await api.balances()

---

## Token
The only token is tDUST.
There is no Credits, USDCx, USAD, or any Midnight tokens.
All token references in the codebase use TDUST.
Balance is in smallest units — divide by 1_000_000 for display.

---

## Backend API Routes
Base URL: process.env.VITE_BACKEND_URL (default http://localhost:4000/api)

POST /api/invoices — create invoice metadata
GET /api/invoices/:id — get invoice details
GET /api/invoices?status=settled — get settled invoices
POST /api/invoices/:id/settle — mark invoice settled
POST /api/invoices/:id/disclose — generate disclosure proof
GET /api/verify/:proof_id — verify a disclosure proof publicly

---

## Environment Variables

Frontend (frontend/.env):
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_BACKEND_URL=http://localhost:4000/api
VITE_PROOF_SERVER_URL=http://localhost:6300
VITE_NETWORK=testnet

Backend (backend/.env):
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ENCRYPTION_KEY=your_64_char_hex_key
ANONPAY_CONTRACT_ADDRESS=deployed_contract_address
MIDNIGHT_INDEXER_URL=https://indexer.testnet.midnight.network/api/v3/graphql
MIDNIGHT_NODE_URL=https://rpc.testnet.midnight.network
FRONTEND_URL=https://anon-pay.vercel.app

---

## What Is Currently Stubbed and Needs Implementation
These files throw errors or return fake data and must be fixed:

1. src/shared/hooks/useCreateInvoice.ts
   - Must call create_invoice from src/contract/index.js
   - Must generate salt with crypto.getRandomValues
   - Must compute hash with Web Crypto API SHA-256

2. src/shared/hooks/usePayment.ts
   - Currently throws "not yet implemented"
   - Must call pay_invoice from src/contract/index.js
   - Must go through Lace wallet signing

3. src/shared/hooks/Payments/useSharedPayment.ts
   - Has wallet connection but no contract calls
   - Must verify invoice hash then call usePayment

4. src/shared/pages/Profile/components/BurnerWallet/scanner.ts
   - Returns { TDUST: 0 } always
   - Must fetch real balance from Lace wallet api.balances()

---

## What Needs To Be Built (Does Not Exist Yet)
1. src/shared/pages/Disclosure/index.tsx — disclosure proof UI
2. src/shared/pages/Verifier/index.tsx — public proof verifier
3. Backend Midnight indexer polling in backend/index.js
4. Backend POST /api/invoices/:id/disclose route
5. Backend GET /api/verify/:proof_id route

---

## What Has Been Removed — Never Add These Back
- Any legacy third-party privacy-chain packages from the removed stack
- Compact wallet, Puzzle wallet, Shield wallet adapters
- BHP256 hash function references
- Credits, USDCx, USAD token references
- Any mention of Midnight, Compact language, or Midnight explorer
- contracts/zk_pay/ folder (old Compact contract)
- anonpay references anywhere

---

## File Structure Overview
contracts/anonpay.compact     — Compact smart contract
contracts/build/              — Compiled contract artifacts
frontend/src/contract/        — Contract JS API for frontend
frontend/src/keys/            — ZK proving and verifying keys
frontend/src/shared/hooks/    — All React hooks
frontend/src/shared/pages/    — All page components
frontend/src/shared/utils/    — Utility functions
frontend/src/desktop/         — Desktop UI
frontend/src/mobile/          — Mobile UI
backend/index.js              — Express server
backend/encryption.js         — AES-256-GCM utils
packages/anonpay-mcp/         — MCP server (optional)

---

## Deployment Target
Network: Midnight Testnet-02 (also called preprod)
Proof server: Docker on port 6300
Faucet: https://faucet.preprod.midnight.network/
Explorer: https://explorer.preprod.midnight.network/
Indexer GraphQL: https://indexer.testnet.midnight.network/api/v3/graphql

---

## Hackathon Submission Deadline
April 10, 2026 at 11:59 PM UTC
Track: Finance & DeFi
Prize: $1,200
