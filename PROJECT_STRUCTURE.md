# Project Structure

Current high-level structure for the AnonPay repo after the Midnight migration.

```text
AnonPay/
├── contracts/
│   ├── anonpay.compact              # Main Midnight Compact smart contract
│   ├── build/                       # Compiled contract artifacts
│   └── managed/                     # Generated managed contract outputs
│
├── frontend/
│   ├── public/                      # Static assets served by Vite
│   ├── src/
│   │   ├── contract/                # Generated frontend contract bindings
│   │   ├── desktop/                 # Desktop UI
│   │   ├── mobile/                  # Mobile UI
│   │   ├── shared/                  # Shared hooks, services, pages, utils, types
│   │   ├── App.tsx                  # App router/bootstrap
│   │   ├── index.css                # Main global styles
│   │   ├── main.tsx                 # Frontend entry point
│   │   └── style.css                # Additional shared styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── index.js                     # Express API entry point
│   ├── package.json
│   ├── Dockerfile
│   ├── supabase_migration.sql
│   ├── migration_sdk_invoices.sql
│   └── migration_invoice_items.sql
│
├── packages/
│   └── anonpay-midnight/
│       ├── src/
│       │   └── index.ts             # Midnight helper exports and shared types
│       ├── package.json
│       └── README.md
│
├── assets/
│   └── mobile/                      # Reference screenshots
│
├── claude.md/
│   └── claude.md                    # Project guidance/context
│
├── .env.example
├── .gitignore
├── deploy.mjs                       # Deployment helper
├── midnight.config.js               # Midnight/Nightforge config
├── midnightwalletsync.config.json   # Wallet sync config
├── package.json                     # Root workspace config
├── package-lock.json
├── PROJECT_STRUCTURE.md
├── README.md
└── supabase_sdk_schema.sql          # Supabase schema helpers for SDK flows
```

Notes:

- `node_modules/` and `frontend/dist/` are generated and intentionally omitted from the main tree above.
- Legacy Aleo/Leo/NullPay directories were removed from this repo.
- The active workspace/package namespace is now AnonPay on Midnight.
