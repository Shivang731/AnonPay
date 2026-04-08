# AnonPay

Privacy-first invoice and payment protocol on Midnight.

AnonPay lets merchants create invoices without exposing sensitive business data on-chain, accept shielded payments, and later produce selective disclosure proofs for audits, compliance, or financing.

Preprod contract deployment:
- Contract address: `3da1d5acee80df7d796747a1c9e14aa9b384b77c15a3e11e2802a8cc65f84bf1`
- Deployer: `mn_addr_preprod1skp9qahcf2xkuvakyydte8mr3w8w3jfz46gfeajsj3j3fmc66p4qmg4zst`
- Deployed at: `2026-04-08T18:25:12.941Z`

Core stack:
- `contracts/anonpay.compact`
- `frontend/` React + Vite app
- `backend/` Express + Supabase API
- `packages/anonpay-midnight/` Midnight helper workspace
