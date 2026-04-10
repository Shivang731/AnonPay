# Project Structure

High-level repository map for the current AnonPay codebase.

```text
AnonPay/
├── assets/
│   └── mobile/                             # Reference mobile assets
├── backend/
│   ├── .env.example                        # Backend env template
│   ├── Dockerfile
│   ├── check_arithmetic.mjs                # Utility script
│   ├── index.js                            # Main Express API and indexer entry
│   ├── migration_create_invoices_table.sql
│   ├── migration_invoice_items.sql
│   ├── migration_private_invoice_payment.sql
│   ├── migration_sdk_invoices.sql
│   ├── package.json
│   ├── supabase_migration.sql
│   └── vercel.json
├── contracts/
│   ├── anonpay.compact                     # Main Midnight Compact contract
│   ├── build/                              # Generated contract JS, keys, and zk artifacts
│   └── managed/                            # Managed contract outputs
├── frontend/
│   ├── .env.example                        # Frontend env template
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/                             # Static assets
│   ├── src/
│   │   ├── contract/                       # Generated contract bindings
│   │   ├── desktop/                        # Desktop-first app shell and pages
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │       ├── CreateInvoice/
│   │   │       ├── Docs/
│   │   │       ├── Explorer/
│   │   │       ├── Home/
│   │   │       ├── Payment/
│   │   │       ├── Privacy/
│   │   │       ├── Verification/
│   │   │       └── Vision/
│   │   ├── keys/                           # Key and chain-related helpers
│   │   ├── mobile/                         # Mobile app shell and pages
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │       ├── CreateInvoice/
│   │   │       └── Payment/
│   │   └── shared/                         # Shared pages, hooks, services, types, utils, UI
│   │       ├── components/
│   │       ├── config/
│   │       ├── hooks/
│   │       ├── pages/
│   │       │   ├── Checkout/
│   │       │   ├── Developer/
│   │       │   ├── GiftCards/
│   │       │   ├── InvoiceDetails/
│   │       │   ├── Profile/
│   │       │   └── ProfileQR/
│   │       ├── services/
│   │       ├── types/
│   │       └── utils/
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json
│   └── vite.config.ts
├── midnight-level-db/                      # Local Midnight leveldb state
├── packages/
│   └── anonpay-midnight/
│       ├── README.md
│       ├── package.json
│       └── src/
│           └── index.ts                    # Shared Midnight helpers
├── .env.example                            # Root env template
├── .gitignore
├── README.md                               # Primary project documentation
├── deploy.mjs                              # Contract deployment helper
├── deployment.json                         # Recorded deployment metadata
├── midnight.config.js                      # Nightforge / Midnight config
├── midnightwalletsync.config.json          # Wallet sync config
├── package-lock.json
├── package.json                            # Root workspace config
├── PROJECT_STRUCTURE.md
├── render.yaml                             # Render deployment configuration
├── supabase_bootstrap_schema.sql
└── supabase_sdk_schema.sql
```

