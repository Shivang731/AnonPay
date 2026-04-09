# AnonPay
## Private Invoicing on Midnight, With Selective Disclosure as the Long-Term Goal

Version 2.1  
April 2026  
INTO THE MIDNIGHT Hackathon 2026 — Finance & DeFi Track

---

## Abstract

AnonPay is a private invoicing and checkout application built around Midnight. It is meant for merchants, freelancers, creators, and small businesses that want to accept crypto payments without making their business activity easy to inspect.

The core idea is simple: invoicing should not force a merchant to choose between usability and privacy. A merchant should be able to create an invoice, get paid, track activity, and share proof of a payment when necessary, without exposing their whole financial life by default.

That is the direction of this project. The current codebase already includes a working MVP: invoice creation, payment flows, hosted checkout, dashboard and profile pages, merchant onboarding, webhook support, and a disclosure-link flow for sharing selected invoice fields after settlement. At the same time, some of the stronger claims from the earlier whitepaper were ahead of the implementation. This version fixes that. It documents what is already built, what is partially built, and what still belongs on the roadmap.

---

## 1. Why This Exists

Public blockchains are a poor fit for normal business payments.

If a merchant accepts payments through a standard public wallet, too much becomes visible too quickly. A customer can look at prior activity. A competitor can estimate revenue. A stranger can inspect payment patterns. Even when nothing illegal is happening, the default assumption is radical transparency.

That may be fine for some on-chain applications. It is not fine for normal invoicing.

A freelancer does not want every client to infer what other clients paid. A small business does not want its incoming payments to double as a public revenue feed. A creator accepting support does not want all of that activity to be permanently exposed.

At the same time, total opacity is not enough either. In the real world, merchants sometimes need to show evidence. A bank may ask for proof of income. An accountant may need confirmation that an invoice was settled. A business partner may want to verify that a payment happened.

That tension is what AnonPay is trying to address.

---

## 2. What AnonPay Is Today

Today, AnonPay is best understood as a privacy-oriented invoicing MVP built on top of Midnight contract flows and off-chain application infrastructure.

It includes:

- a Midnight Compact contract for invoice and payment state
- a React frontend for invoice creation, payment, profile, explorer, checkout, privacy, and documentation pages
- a Node and Express backend for merchant onboarding, invoices, checkout sessions, webhooks, disclosure records, and settlement sync
- Supabase for application storage

The current product already demonstrates the user experience we care about:

1. a merchant can create invoice-related records and payment links
2. a payer can complete the payment flow
3. the merchant can track invoices and receipts in a dashboard
4. the merchant can generate a disclosure link that reveals selected settlement details

That is real and present in the repository. What is not yet complete is the stronger version of the vision, where selective disclosure is fully expressed as an end-to-end proof system with a finished public verifier flow and tighter privacy guarantees at every layer.

---

## 3. Why Midnight

Midnight is the right place for this project because the long-term shape of AnonPay depends on privacy-aware contract behavior, not just a nice frontend sitting on top of a transparent ledger.

Even in the current MVP, Midnight gives us a more credible path toward private invoicing than a standard public-chain stack would. The contract already handles invoice lifecycle logic, payment-related state, nullifier-based replay protection, and disclosure-oriented circuit support.

More importantly, Midnight gives the project room to grow into the version originally imagined: stronger shielded flows, better disclosure semantics, and less dependence on backend-side trust for privacy-sensitive workflows.

That future is the reason AnonPay is on Midnight in the first place.

---

## 4. What Is Already Built

This section stays close to the actual repository.

### 4.1 Invoice Creation

The app includes invoice creation flows and stores invoice metadata through the backend. Invoice records can include amount, memo, expiry, type, and related identifiers. The frontend and backend already support the basic merchant workflow of creating and managing invoices.

### 4.2 Payment Flow

The contract includes invoice creation, payment, invoice-status lookup, and a disclosure-related circuit. On the application side, the payment flow is tied into settlement handling and backend reconciliation. The project is not just a mock dashboard. There is an actual contract-backed payment path in the repo.

### 4.3 Merchant Dashboard

The dashboard and profile surfaces are one of the strongest parts of the MVP. Merchants can view invoices, settlement status, balances, receipts, payment history, and related profile information. There is also support for QR-related profile utilities and burner-wallet-related UI.

### 4.4 Hosted Checkout

AnonPay already supports a hosted checkout flow suitable for merchant use. A merchant can register, receive a secret key, create checkout sessions, retrieve those sessions, and receive settlement updates. That makes the project more than just a personal invoicing tool. It already gestures toward productized merchant infrastructure.

### 4.5 Webhooks

The backend can dispatch signed webhooks when checkout sessions settle. That matters because serious merchant integrations need a backend notification path, not just a frontend success screen.

### 4.6 Disclosure Links

After an invoice is settled, the merchant can create a disclosure record and choose whether to reveal amount, settlement date, and status. The backend stores only the selected fields for that disclosure entry, and there is a public verification endpoint keyed by proof ID.

This is an important part of the MVP. It is also the part that needs the most careful wording. The current implementation is a working disclosure-link product flow. It is not yet the fully realized cryptographic selective-disclosure system described in the earlier draft.

### 4.7 Supporting Product Surfaces

The repo also includes:

- an explorer page
- a privacy page
- a documentation section
- a developer portal
- merchant onboarding flows
- assistant-related backend endpoints

Taken together, these make the project feel like a product, not just a contract demo.

---

## 5. How the System Is Structured

The frontend is built with React, TypeScript, Vite, Tailwind, and Framer Motion. The backend is a single Express application connected to Supabase. The smart contract is written in Midnight Compact and built with Nightforge.

In practice, the system is split into three layers.

The first layer is the contract layer. That is where invoice and payment-related logic lives.

The second layer is the backend. It handles merchant registration, invoice APIs, checkout sessions, webhook dispatch, disclosure records, and settlement sync.

The third layer is the user-facing product. That includes invoice creation, payment, checkout, profile, developer docs, and the rest of the application surfaces.

Deployment is similarly straightforward:

- frontend on Vercel or a similar static host
- backend on a long-running Node host such as Render or Railway
- Supabase as the database layer

That is consistent with the repository structure and deployment configuration already present in the project.

---

## 6. What the Smart Contract Actually Does

This is where the earlier whitepaper needed correction.

The contract is real and meaningful, but narrower than the old document suggested.

Right now, the contract tracks invoice records with fields including:

- `invoice_hash`
- `expiry`
- `amount`
- `status`
- `payer_commitment`

It also maintains:

- an invoice counter
- a nullifier set
- a round counter

The implemented circuits are:

- `create_invoice`
- `pay_invoice`
- `generate_disclosure_proof`
- `get_invoice_status`

This gives us a credible base: invoice lifecycle state, payment progression, nullifier-based replay protection, and an early disclosure-oriented interface.

But it does not yet justify some of the strongest claims from the old paper. In particular:

- it is not accurate to say that only a minimal commitment is stored while amount and expiry never appear in contract state
- it is not accurate to say that the disclosure system already supports arbitrary field revelation entirely through contract-level semantics
- it is not accurate to present the current verifier experience as a completed proof-driven public verification workflow

Those are still goals.

---

## 7. Privacy Model

AnonPay is privacy-oriented, but this version of the paper is careful about the exact language.

The current system separates contract-facing invoice data from broader application metadata. It uses invoice hashes and related identifiers to avoid making the user-facing experience a transparent ledger mirror. It is clearly better, from a merchant privacy perspective, than a naïve public-wallet payment flow.

At the same time, the system is not yet at the point where every privacy claim from the earlier draft can be stated as a finished fact.

What is fair to say now:

- AnonPay is designed to reduce unnecessary exposure.
- It uses Midnight contract flows rather than public-by-default payment primitives.
- It already includes a selective sharing flow for settled invoices.

What should remain future-facing:

- stronger end-to-end encryption guarantees for off-chain financial metadata
- a more trust-minimized disclosure model
- a fully finished verifier experience rooted directly in proof artifacts rather than primarily backend-managed records

The difference here is not philosophical. It is just technical honesty.

---

## 8. Security Model

The MVP already includes several solid security building blocks.

Merchant onboarding is based on secret keys. The backend stores a hash for lookup and uses the key for authenticated merchant actions. Checkout webhooks are signed with HMAC-SHA256. The contract includes nullifier-based replay protection. Settlement flows are synchronized between contract-related events and the application database.

Those are meaningful implementation details, not decorative claims.

The main place we are intentionally more conservative in this paper is around encryption and disclosure guarantees. The previous version described a stronger off-chain confidentiality story than the current codebase fully enforces. Rather than stretch the truth, this paper keeps those parts in the roadmap.

---

## 9. Developer and Merchant Surface

One of the better aspects of this project is that it is already trying to behave like infrastructure rather than just a wallet toy.

Merchants can:

- register with the system
- receive a secret key
- create hosted checkout sessions
- retrieve session state
- receive webhook notifications after settlement

Developers can already work against a backend API that covers invoices, merchants, checkout sessions, profiles, and disclosures.

That said, the packaging story described in the earlier whitepaper was too ambitious for the current repo. The codebase includes developer portal content and helper code, but it does not yet contain the fully published SDK, CLI, and MCP package suite exactly as previously presented. That work is still ahead of us.

---

## 10. Where the Old Whitepaper Got Ahead of the Code

This section matters because it is the difference between a pitch deck and documentation.

The old whitepaper treated several future goals as if they were already complete:

- fully realized selective disclosure proofs with a finished verifier product flow
- a contract privacy model based purely on commitments without amount and expiry in contract state
- stronger off-chain encryption guarantees than the present backend actually enforces
- a complete standalone SDK, CLI, and MCP toolchain already shipping from this repository

Those ideas are still central to the project. They just belong in the roadmap, not the implementation summary.

---

## 11. What Comes Next

The good news is that the original vision still makes sense. It was not the wrong direction. It was just described too early as already finished.

The most important next steps are clear.

First, selective disclosure needs to become more rigorous. The current disclosure-link flow is useful, but the long-term goal is richer field-level disclosure, stronger recipient binding, and a verifier experience that feels genuinely proof-native rather than mostly application-native.

Second, the privacy model needs to tighten. That means better treatment of off-chain sensitive data, less reliance on backend trust for privacy-sensitive features, and better alignment between what the product promises and what the code enforces.

Third, the contract needs to grow into the shape the original paper envisioned. That includes more expressive disclosure behavior, stronger receipt semantics, and clearer consistency between the contract and the product story.

Fourth, the developer tooling needs to catch up with the docs. If AnonPay is going to position itself as infrastructure, then the SDK, CLI, and MCP story has to be real, packaged, and maintained, not just sketched in portal copy.

Beyond that, there is normal product work:

- mobile polish
- multi-token support
- recurring invoicing
- accounting integrations
- better reporting
- stronger production hardening

That is a healthy roadmap. It is also a realistic one.

---

## 12. Why This Is Still a Strong Hackathon Project

Even after tightening the language, the project still stands up well.

There is already a real application here, not just a concept:

- contract code exists
- backend logic exists
- merchant flows exist
- checkout exists
- dashboard exists
- webhook support exists
- disclosure sharing exists

What changed in this version of the whitepaper is not the ambition. It is the accuracy.

That matters. A privacy product should be held to a higher standard when it describes what is and is not already true.

---

## Conclusion

AnonPay is trying to solve a real problem: crypto payments are either too public to be comfortable for normal business use, or too awkward to fit into normal business workflows.

The current version shows a path forward. It already supports private-oriented invoicing, checkout, merchant tooling, and a first version of selective disclosure after settlement. It is not yet the full protocol described in the earlier whitepaper, and this document no longer pretends otherwise.

## In simple terms:

AnonPay is a real Midnight-based invoicing MVP with a serious product surface and a credible privacy roadmap. The hardest parts of the original vision are not abandoned. They are simply still ahead.

That is where the project stands today.

---

AnonPay  
Pay privately. Share carefully.
