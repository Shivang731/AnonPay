# Hackathon Deployment

Target stack:

- Frontend: Vercel
- Backend API: Render
- Database and realtime: Supabase Free

## Current Status

This repo is not feature-complete across the full product list yet.
The critical payment path has received the most work, but several areas still remain partial or stubbed.

## Frontend on Vercel

Deploy the `frontend` directory as a separate Vercel project.

Set these environment variables in Vercel:

```env
VITE_API_URL=https://YOUR-RENDER-BACKEND.onrender.com/api
VITE_FRONTEND_URL=https://YOUR-VERCEL-FRONTEND.vercel.app
VITE_NETWORK=preprod
VITE_ANONPAY_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHED_OR_ANON_KEY
```

Recommended project settings:

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

## Backend on Render

Deploy the `backend` directory as a Node Web Service on Render.

Set these environment variables in Render:

```env
PORT=4000
FRONTEND_URL=https://YOUR-VERCEL-FRONTEND.vercel.app
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHED_OR_ANON_KEY
MIDNIGHT_INDEXER_URL=https://indexer.preprod.midnight.network/api/v3/graphql
ANONPAY_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
```

Optional backend envs if you use those features:

- `PROVABLE_API_KEY`
- `PROVABLE_CONSUMER_ID`
- `GOOGLE_API_KEY`
- `GOOGLE_GEMINI_MODEL`
- `GOOGLE_GEMINI_MODELS`
- `RELAYER_PRIVATE_KEY`

Recommended Render settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/`

## Supabase

Required tables currently used by the app:

- `invoices`
- `payment_intents`
- `merchants`
- `disclosures`
- `users`

If your project was empty, you must run the SQL migrations in `backend/`.

## What Still Needs Manual Validation

1. Lace wallet connect on the deployed frontend
2. Fresh invoice creation
3. Payment link opening from the deployed frontend URL
4. Real `pay_invoice` signing flow
5. Invoice settlement persistence
6. Disclosure proof generation and verification

## Recommendation

For the hackathon, keep Supabase. Replacing it now would increase risk and slow deployment materially.
