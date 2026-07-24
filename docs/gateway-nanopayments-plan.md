# Gateway / Nanopayments Integration Plan

## Purpose

AgentTreasury Lite documents Arc Testnet USDC transfers, transaction memos, Multicall3From batch settlement, ERC-8004 agent identity, and policy-gated payment decisions.

This is a roadmap. It does **not** claim that Circle Gateway, x402, or EIP-3009 payments are already live in the prototype.

## Target Flow

1. An agent requests a paid API or resource.
2. The provider returns HTTP 402 payment instructions.
3. AgentTreasury Lite checks recipient, amount, budget, invoice reference, and reserve policy.
4. When approved, a payment adapter prepares an EIP-3009 authorization.
5. The provider verifies the authorization and serves the resource.
6. Circle Gateway batches settlement on Arc.
7. AgentTreasury Lite records the policy decision, authorization reference, settlement reference, and reconciliation result.

## Current Evidence

- Arc Testnet USDC transfers with USDC-denominated gas.
- Structured references through Arc's Memo contract.
- Sender-preserving batch payments through Multicall3From.
- Public ArcScan transaction evidence.
- ERC-8004 agent identity registration.
- A dry-run policy-gated payment decision flow that never handles private keys.

## Planned Milestones

1. Mock HTTP 402 adapter with a non-signing authorization preview.
2. Audit records for policy, authorization, settlement, and reconciliation.
3. Official Circle Gateway/Nanopayments testnet adapter.
4. User-confirmed wallet execution only after review.

## Safety

- No private key, seed phrase, API key, or payment authorization is stored in this repository.
- No wallet connection, signature, or transfer is triggered by current project code.
- Gateway/Nanopayments is labeled **planned** until official testnet evidence is available.

## Reviewer Takeaway

AgentTreasury Lite provides the control and evidence layer for autonomous payments: agent identity, spending policy, structured payment context, batch-settlement awareness, and public reconciliation. Gateway/Nanopayments is the planned official Arc payment rail.
