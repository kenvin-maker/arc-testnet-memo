# AgentTreasury Lite — Final Demo Script

Target length: 3 minutes. This script accompanies the final submission deck.

## Slide 1 — 20 seconds

AgentTreasury Lite is a policy and evidence layer for autonomous USDC payments
on Arc. The project is public, testnet-only, and designed so that wallet
signatures stay under explicit human control. It already has a live demo, open
source code, and an onchain ERC-8004 agent identity: ID 851421.

## Slide 2 — 25 seconds

The problem is not simply making an agent send a payment. The problem is
explaining why it was allowed. A useful treasury workflow needs recipient,
spend, reserve, and invoice boundaries before a wallet asks for a signature.
AgentTreasury Lite makes that decision visible and auditable.

## Slide 3 — 30 seconds

In the live demo, a request first provides a recipient, amount, and invoice.
The policy then approves or rejects it. Only an approved request can reach the
human wallet confirmation step. After execution, the project records an
ArcScan receipt and an audit record. The browser never reads or stores a
private key.

## Slide 4 — 30 seconds

The project has several independent Arc Testnet proofs. There is a real USDC
App Kit Send, structured transaction-memo work through ArcMemo, sender-
preserving batch USDC work with Multicall3From, and an ERC-8004 identity
registration. These are presented honestly as separate verified experiments,
not as one combined transaction.

## Slide 5 — 25 seconds

Everything needed for review is public: the Vercel demo, the GitHub repository,
the original video demo, ArcScan references, and the current automated tests.
This gives a reviewer a direct route from the product screen to the supporting
code and testnet evidence.

## Slide 6 — 25 seconds

The next integration target is Circle Gateway and Nanopayments. The current
repository contains a safe mock HTTP 402 authorization preview: it checks
policy and generates a deterministic non-signing reference. It does not claim
that Gateway, x402, Nanopayments, or EIP-3009 settlement is live. Official
testnet evidence is required before that claim is made.

## Slide 7 — 25 seconds

The continuation plan is to add a reviewer-friendly activity log, validate an
official payment adapter, and keep shipping public, testable increments. The
standard stays the same: real user value, explicit approval, and verifiable
receipts rather than transaction volume. The live demo and source are linked
on this final slide.

## Live demo order

1. Open https://agent-treasury-lite.vercel.app.
2. Show the payment request and policy result.
3. Show the execution boundary; do not sign a transaction unless a reviewer
   explicitly requests a fresh testnet demonstration.
4. Open the public GitHub README and the verified ArcScan receipt.

