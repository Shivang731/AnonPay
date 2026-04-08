# Project Status

Current status for AnonPay on Midnight.

## Completed

### Whole Project

- Repo migrated to AnonPay on Midnight.
- Legacy `aleo`, `leo`, and `nullpay` references removed from the repo.
- Frontend builds successfully.
- Contract source exists and compiled/generated artifacts exist.
- Deployment script improved to use the active Nightforge wallet.
- Contract deployed on Midnight preprod at `3da1d5acee80df7d796747a1c9e14aa9b384b77c15a3e11e2802a8cc65f84bf1`.

### Backend

Implemented in [backend/index.js](/home/shivang/AnonPay/backend/index.js):

- Express server setup
- Supabase client wiring
- Merchant registration route
- SDK validation route
- Invoice create/fetch/update routes
- Checkout session create/fetch/update routes
- User profile routes
- Disclosure route
- Verify disclosure route
- AI assistant routes
- DPS / Provable helper routes
- Midnight indexer polling startup

### Frontend

- Main app shell and routing
- Desktop and mobile apps
- Create-invoice flow wired enough to compile and build
- Checkout flow
- Profile / dashboard pages
- Developer page
- Wallet provider
- Shared API layer
- Realtime listeners for invoice/session state in several flows

### Contract

Main contract: [contracts/anonpay.compact](/home/shivang/AnonPay/contracts/anonpay.compact)

Implemented circuits:

- `create_invoice`
- `pay_invoice`
- `generate_disclosure_proof`
- `get_invoice_status`

Generated outputs exist in:

- [contracts/managed/anonpay](/home/shivang/AnonPay/contracts/managed/anonpay)

## Partially Done

### Backend

- Midnight indexer settlement flow exists, but still needs real preprod verification.
- Disclosure / verify routes exist, but need schema and data validation against real Supabase tables.
- Production env and CORS hardening is only partially cleaned up.
- Some backend assistant knowledge text still talks about deleted package flows.

### Frontend

- Payment flow exists, but some verification/scanner features are still stubbed.
- Explorer page exists, but on-chain verification is still TODO.
- Developer SDK dashboard exists, but receipt verification behavior is still stubbed.
- Invoice details page exists, but chain receipt scan/verify behavior is still stubbed.
- Burner wallet UI exists, but scanner implementation is missing.
- Env usage is inconsistent: some files use `VITE_API_URL`, others use `VITE_BACKEND_URL`.

### Deployment

- Proof server flow works.
- Deploy script works better than before.
- Contract deployment is finished on preprod and recorded in [deployment.json](/home/shivang/AnonPay/deployment.json).
- Final hosted infrastructure is not configured yet.

## Not Done / Remaining

### Backend Remaining

- Production backend deployment
- Final backend env setup on the chosen host
- Real preprod validation of Midnight indexer settlement
- Final Supabase schema reconciliation
- Cleanup of stale assistant/docs text inside backend logic

### Frontend Remaining

- Burner wallet scanner in [frontend/src/shared/pages/Profile/components/BurnerWallet/scanner.ts](/home/shivang/AnonPay/frontend/src/shared/pages/Profile/components/BurnerWallet/scanner.ts)
- Explorer contract verification in [frontend/src/desktop/pages/Explorer/index.tsx](/home/shivang/AnonPay/frontend/src/desktop/pages/Explorer/index.tsx)
- SDK dashboard receipt verification in [frontend/src/shared/pages/Developer/components/SdkDashboard.tsx](/home/shivang/AnonPay/frontend/src/shared/pages/Developer/components/SdkDashboard.tsx)
- Invoice details receipt scan/verify in [frontend/src/shared/pages/InvoiceDetails/index.tsx](/home/shivang/AnonPay/frontend/src/shared/pages/InvoiceDetails/index.tsx)
- Final frontend env cleanup and API URL unification

### Contract / Blockchain Remaining

- End-to-end payment test against deployed contract

### Hosting Remaining

- Frontend host finalization
- Backend host finalization
- Supabase production configuration finalization

## Feature Status

### Private Invoice Creation

- Partially done
- UI and backend metadata flow exist
- Intended flow: merchant enters amount, memo, and invoice type; browser generates a local 128-bit salt; SHA-256 of merchant address + amount + salt is committed through `create_invoice`
- Only the hash is intended to touch chain state; backend keeps invoice metadata off-chain and encrypted; merchant receives a payment link carrying the salt
- Real deployed-contract production usage not finalized

### Private Payment

- Partially done
- Payment hook and checkout flow exist
- Real deployed-contract preprod validation still pending

### Selective Disclosure

- Partially done
- Backend disclosure and verify routes exist
- Full end-to-end proof UX and chain-backed validation still need verification

### Merchant Dashboard

- Mostly done
- UI and API are present
- Some realtime and verification details still need finishing

### Hosted Checkout

- Mostly done
- Checkout session backend and frontend pages exist
- Final production validation is still pending

### Burner Wallet Privacy Flow

- Partially done
- UI and profile pieces exist
- Scanner/private balance logic is still not implemented

### Developer SDK / Dashboard

- Partially done
- Merchant registration and developer pages exist
- Some docs/code still reflect transitional behavior
- Verification parts are still stubbed

## Frontend <-> Backend Connection

Main frontend API client:

- [frontend/src/shared/services/api.ts](/home/shivang/AnonPay/frontend/src/shared/services/api.ts)

Other places that call backend directly:

- [frontend/src/shared/hooks/useCreateInvoice.ts](/home/shivang/AnonPay/frontend/src/shared/hooks/useCreateInvoice.ts)
- [frontend/src/shared/hooks/Payments/useSharedPayment.ts](/home/shivang/AnonPay/frontend/src/shared/hooks/Payments/useSharedPayment.ts)
- [frontend/src/shared/pages/Checkout/hooks/useCheckoutSession.ts](/home/shivang/AnonPay/frontend/src/shared/pages/Checkout/hooks/useCheckoutSession.ts)
- [frontend/src/shared/pages/Developer/index.tsx](/home/shivang/AnonPay/frontend/src/shared/pages/Developer/index.tsx)

Current frontend envs in use:

- `VITE_API_URL`
- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ANONPAY_CONTRACT_ADDRESS`
- `VITE_FRONTEND_URL`

Current backend envs in use:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `GOOGLE_API_KEY`
- `GOOGLE_GEMINI_MODEL`
- `GOOGLE_GEMINI_MODELS`
- `PROVABLE_API_KEY`
- `PROVABLE_CONSUMER_ID` or `PROVABLE_CONSUMER_KEY`
- `RELAYER_PRIVATE_KEY`
- `FRONTEND_URL`
- `MIDNIGHT_INDEXER_URL`
- `ANONPAY_CONTRACT_ADDRESS`

## Recommended Hosting Split

- Frontend: Vercel
- Backend: Render, Railway, Fly.io, DigitalOcean App Platform, or VPS
- Supabase: hosted separately
- Midnight proof server: separate machine/container only when needed for proving/deploy flows

Why:

- Frontend is standard Vite static output.
- Backend is long-lived Express with polling and runtime env dependencies, so it fits a normal Node host better than serverless by default.
- Proof/deploy operations are operationally separate from the public web app.

## Suggested Remaining Order

1. Unify frontend API env usage
2. Finish stubbed Midnight scanner / verification pieces
3. Clean stale docs/comments/backend assistant text
4. Verify Supabase schema matches backend expectations
5. Deploy backend host
6. Deploy frontend host
7. Run full end-to-end payment/disclosure test against the deployed preprod contract
