# AgentTreasury Lite App Kit Send Design

Date: 2026-07-18

## Goal

Upgrade AgentTreasury Lite from a command-line dry-run policy evaluator into a minimal browser demo that can execute one real Arc Testnet USDC payment through Circle App Kit after an explicit MetaMask signature.

The implementation must preserve the existing policy decision layer, never handle a private key, and produce reviewer-friendly transaction evidence for Encode Checkpoint 2.

## Success Criteria

- Run a single-page demo locally.
- Connect the main MetaMask wallet:
  `0x8b615E587C9636db67Dd93f4982116ce053EabDD`.
- Operate only on Arc Testnet, chain ID `5042002`.
- Evaluate a payment request before wallet execution.
- Default to a `0.01 USDC` payment to the verified auxiliary wallet:
  `0x9240e82aE80D70875BA854F480ba412b410cd54a`.
- Reject requests that violate the recipient allowlist, maximum payment, minimum remaining balance, or invoice ID requirements.
- Use Circle App Kit Send for an approved payment.
- Require the user to confirm the final transaction in MetaMask.
- Display the transaction hash and ArcScan link after confirmation.
- Produce a copyable audit record that links the invoice ID and deterministic memo ID to the transaction hash.
- Keep the CLI workflow and its automated policy tests working.

## Chosen Approach

Use a Vite-powered, framework-free TypeScript single-page application with:

- `@circle-fin/app-kit`
- `@circle-fin/adapter-viem-v2`
- `viem`
- MetaMask through the injected EIP-1193 `window.ethereum` provider

The browser adapter will use `createViemAdapterFromProvider`. No backend, database, Circle API key, or exported wallet key is required.
The browser build targets Node.js 22 or newer, matching the current App Kit quickstart requirement.

### Rejected Alternatives

1. A raw Viem ERC-20 transfer would be smaller, but it would not demonstrate App Kit Send.
2. A server-side App Kit script would closely follow the official quickstart, but it would require an exported private key and is outside the security boundary.
3. A full React or Next.js application would add implementation and review overhead without improving the Checkpoint 2 demonstration.

## Architecture

### Policy Core

Move browser-safe request and policy validation into a focused module. It owns:

- EVM address validation
- exact six-decimal USDC arithmetic
- recipient allowlist checks
- maximum single-payment checks
- minimum remaining balance checks
- approve/reject reasons

The CLI and browser application both consume this module so policy behavior cannot drift.

### CLI Adapter

Keep file loading, command-line argument handling, JSON output, and Node-specific hashing in the CLI entry point. The existing `npm start -- ...` flow remains supported.

### Browser Application

The single page contains:

- wallet connection and chain status
- connected account and balances
- recipient, amount, and invoice ID inputs
- policy decision and reasons
- transaction preview
- App Kit Send execution
- pending, rejected, failed, and confirmed states
- a copyable audit record and ArcScan link

### Wallet and App Kit Adapter

Create the App Kit Viem adapter from `window.ethereum` with a user-controlled address context and Arc Testnet support.

The application must never:

- request an exported private key
- store wallet credentials
- sign without a visible MetaMask confirmation
- retry a rejected or failed transaction automatically

## Data Flow

1. The user connects MetaMask.
2. The application confirms the connected address and Arc Testnet chain ID.
3. The application reads spendable USDC and native gas balances.
4. The user reviews the prefilled auxiliary address, `0.01 USDC` amount, and invoice ID.
5. The policy core evaluates the request using the live spendable balance.
6. A rejected request displays reasons and exposes no execution action.
7. An approved request displays a final transaction preview.
8. The application estimates the App Kit Send operation.
9. One user action invokes `kit.send()`.
10. MetaMask presents the final signature request.
11. While pending, the execution control remains disabled to prevent duplicates.
12. On success, the page shows the transaction hash, ArcScan link, and audit record.
13. After independent explorer verification, the transaction may be added to README as Checkpoint 2 evidence.

## Memo Semantics

App Kit Send performs a token transfer and does not attach the invoice ID to Arc's Memo contract.

For this milestone:

- the deterministic memo ID is an offchain reconciliation identifier
- the audit record links that memo ID and invoice ID to the real App Kit transaction hash
- existing Memo contract transactions remain separate evidence of the project's onchain memo capability

The README and interface must not claim that the App Kit Send transaction contains an onchain memo.

## Default Demo Policy

- Allowed recipient:
  `0x9240e82aE80D70875BA854F480ba412b410cd54a`
- Default amount: `0.01 USDC`
- Maximum single payment: `0.05 USDC`
- Minimum remaining spendable balance: `0.05 USDC`
- Required invoice ID: non-empty

The browser policy is explicit and reviewer-visible. If the wallet lacks sufficient testnet assets, the workflow stops and directs the user to the official Arc/Circle testnet faucet before continuing.

## State and Error Handling

The page uses a finite set of visible states:

- disconnected
- wrong network
- ready
- rejected
- approved
- estimating
- awaiting wallet
- pending
- confirmed
- failed

Errors must distinguish:

- MetaMask unavailable
- user rejected wallet connection
- wrong account
- wrong network
- insufficient spendable USDC
- insufficient gas balance
- policy rejection
- user rejected signature
- App Kit estimation failure
- transaction failure or timeout

No error triggers an automatic transaction retry.

## Testing

Automated tests cover:

- existing approval and rejection policy behavior
- browser demo policy defaults
- exact six-decimal amount handling
- expected App Kit Send parameters
- execution disabled for rejected requests
- duplicate execution prevention while pending
- successful audit record construction
- rejected-signature and failed-transaction state mapping

Verification also includes:

- existing CLI test suite
- Vite production build
- local browser smoke test without signing
- one user-confirmed `0.01 USDC` Arc Testnet transaction
- ArcScan verification of sender, recipient, amount, and status

## Encode and Agentic Economy Alignment

The demo shows a clear agent workflow:

`payment request -> policy decision -> explicit human authorization -> App Kit execution -> settlement evidence`

It demonstrates:

- autonomous decision logic tied to real payment constraints
- USDC treasury controls
- Arc Testnet settlement
- Circle App Kit Send
- a safe human authorization boundary
- auditable reconciliation data

The project will describe this as Agent Stack-aligned architecture. It will not claim an Agent Stack SDK integration unless an actual Agent Stack dependency or starter component is added later.

## Out of Scope

- mainnet transactions
- automatic or unattended signing
- private-key or seed-phrase handling
- Circle developer-controlled wallets
- Swap, Bridge, or Unified Balance
- an onchain Memo wrapper around App Kit Send
- cloud deployment or persistent database storage
- multiple simultaneous payments

## Acceptance

The milestone is complete when:

1. Tests pass.
2. The production build succeeds.
3. The browser demo connects to MetaMask on Arc Testnet.
4. The policy approves the intended `0.01 USDC` auxiliary-wallet test payment and rejects requests outside the configured rules.
5. The user confirms one MetaMask transaction.
6. ArcScan shows a successful transaction with the expected sender, recipient, and amount.
7. The audit record and README accurately document the transaction and App Kit integration.
