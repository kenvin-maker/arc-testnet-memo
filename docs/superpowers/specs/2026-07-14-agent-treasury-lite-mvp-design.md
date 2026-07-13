# AgentTreasury Lite MVP Design

Date: 2026-07-14

## Goal

Turn the existing Arc testnet evidence log into a minimal runnable payment-decision agent for Encode Programmable Money Hackathon Checkpoint 2. The MVP must demonstrate explicit autonomous decision logic without accessing a wallet, private key, or transaction signer.

## Scope

The MVP is a zero-dependency Node.js command-line program. It reads a payment request and a treasury policy from JSON files, evaluates the request, and prints a deterministic dry-run decision.

Included:

- Payment request validation
- Recipient allowlist enforcement
- Maximum single-payment enforcement
- Minimum remaining-balance enforcement
- `APPROVED` or `REJECTED` result with reasons
- Suggested memo ID and memo-data preview
- Example request and policy files
- Automated tests using Node's built-in test runner
- README instructions and Arc integration mapping

Excluded:

- Wallet connection or signing
- Private-key or seed-phrase handling
- Transaction broadcasting
- Automatic Arc testnet execution
- Web dashboard
- Live ArcScan or RPC ingestion
- AI/LLM dependency

## Repository Structure

```text
arc-testnet-memo/
├── README.md
├── package.json
├── config/
│   └── policy.json
├── examples/
│   └── payment-request.json
├── src/
│   └── agentTreasuryLite.js
└── test/
    └── agentTreasuryLite.test.js
```

The existing long-form Arc evidence remains in `README.md`. The new MVP section will be placed near the top so reviewers can run the project before reading the historical evidence.

## Inputs

Payment request:

```json
{
  "recipient": "0x1111111111111111111111111111111111111111",
  "amountUSDC": 0.05,
  "invoiceId": "INV-2026-001",
  "walletBalanceUSDC": 1.0
}
```

Treasury policy:

```json
{
  "maxPaymentUSDC": 0.1,
  "minimumRemainingBalanceUSDC": 0.5,
  "allowlistedRecipients": [
    "0x1111111111111111111111111111111111111111"
  ]
}
```

Addresses are compared case-insensitively. Amounts and balances must be finite non-negative numbers, and payment amounts must be greater than zero. The invoice ID must be a non-empty string.

## Decision Flow

1. Parse both JSON documents.
2. Validate their required fields and types.
3. Reject recipients that are not on the allowlist.
4. Reject amounts above `maxPaymentUSDC`.
5. Reject payments that would leave less than `minimumRemainingBalanceUSDC`.
6. Approve requests that pass every rule.
7. Return all applicable rejection reasons instead of stopping at the first policy failure.

The output contains:

- `decision`: `APPROVED` or `REJECTED`
- `reasons`: human-readable decision reasons
- `request`: normalized request summary
- `remainingBalanceUSDC`: projected post-payment balance
- `suggestedMemoId`: deterministic SHA-256-derived identifier based on `invoiceId`
- `memoDataPreview`: JSON-compatible invoice and payment metadata
- `dryRun`: always `true`

Rejected decisions include the memo preview for auditability but explicitly state that no transaction should be executed.

## CLI

Primary command:

```bash
npm start -- examples/payment-request.json config/policy.json
```

The program writes formatted JSON to stdout. Invalid JSON or structurally invalid input produces a concise error on stderr and exits non-zero. A valid request that is rejected by policy is a successful agent evaluation and therefore exits zero.

## Safety

- No dependency accepts or reads a private key.
- No `.env` file is needed for this dry-run MVP.
- No RPC endpoint is contacted.
- No transaction is constructed, signed, or broadcast.
- Future onchain execution must remain an explicit separate step requiring manual user wallet confirmation.

## Testing

Use `node --test` through `npm test`. Tests cover:

1. Approved allowlisted payment
2. Non-allowlisted recipient
3. Amount above the maximum
4. Insufficient post-payment reserve
5. Multiple simultaneous policy failures
6. Invalid address, amount, balance, invoice ID, and policy fields
7. Case-insensitive address matching
8. Deterministic memo ID generation

## Checkpoint 2 Deliverable

The repository will provide:

- Runnable Node.js agent code
- Example request and policy
- Automated test evidence
- README run instructions
- Example decision output
- Mapping from the dry-run decision to the existing Arc Memo and Multicall3From transaction evidence
- A concise progress update suitable for the Encode project page and Discord

No new Arc transaction is required until this MVP is complete and reviewed.
