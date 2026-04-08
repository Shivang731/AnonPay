# AnonPay Feature Implementation Roadmap

This file converts the product feature list into an execution order tied to the current repository state.

## Sequence

1. Shielded payment runtime
2. Private invoice creation hardening
3. Invoice type behavior
4. Receipt model
5. Selective disclosure proof UX and validation
6. Merchant dashboard correctness
7. Invoice explorer verification
8. Hosted checkout stability
9. Wallet balance accuracy
10. Profile page completeness
11. Burner wallet completion
12. Developer portal cleanup
13. Privacy page truthfulness
14. MCP server support

## Acceptance Criteria

### 1. Shielded payment runtime

- Wallet connection uses configured network instead of a hardcoded value.
- Payment link verification checks backend invoice state and invoice hash consistently.
- A live payment produces a transaction reference and receipt commitment in the UI.
- Backend invoice row updates correctly after settlement.

### 2. Private invoice creation hardening

- Invoice creation writes all fields needed by payment and explorer flows.
- Generated payment links always contain enough data for payer-side verification.
- Create-invoice behavior is consistent across desktop and mobile.

### 3. Invoice type behavior

- Standard invoices close permanently after a successful payment.
- Multi-pay invoices remain open and accumulate payment references.
- Donation invoices accept payer-selected amounts without breaking hash validation rules.

### 4. Receipt model

- The current single stored receipt commitment is reconciled with the claimed dual-receipt product story.
- Merchant and payer proof surfaces use actual stored evidence instead of placeholder text.

### 5. Selective disclosure proof UX and validation

- Disclosure creation validates invoice settlement and selected reveal fields.
- Verifier page shows only selected facts and does not imply broader proofs than the data supports.
- Backend proof records match the schema actually present in Supabase.

### 6. Merchant dashboard correctness

- Realtime updates reflect actual invoice transitions.
- Stats and charts derive from real invoice data without stubbed assumptions.

### 7. Invoice explorer verification

- Explorer can resolve invoice hash data from backend and contract state.
- On-chain verification path reports contract status explicitly.

### 8. Hosted checkout stability

- Checkout sessions stay synchronized with invoice settlement.
- Redirect and webhook flows are verified with the current backend.

### 9. Wallet balance accuracy

- Displayed balances come from the active wallet mode and current network.
- Failure states are visible when balance queries cannot run.

### 10. Profile page completeness

- Created and received invoice views use real persisted data.
- QR and summary information matches current wallet/profile state.

### 11. Burner wallet completion

- Scanner and sweep flows work with the current wallet/network stack.
- Copy and warnings reflect actual privacy boundaries.

### 12. Developer portal cleanup

- Docs and examples match the current Midnight implementation.
- Testing console avoids advertising stubbed capabilities as complete.

### 13. Privacy page truthfulness

- Claims match what the code and contract actually do.
- Public vs private statements are tightened where the product copy overstates guarantees.

### 14. MCP server support

- Optional assistant-facing flows are only documented and shipped once the backend operations are stable.

## Current Turn

- Fix wallet connection network handling and runtime error surfacing.
- Keep shielded payment on the critical path until a real payment is verified.
