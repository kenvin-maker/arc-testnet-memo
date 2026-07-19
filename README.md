# Arc Testnet Memo

Simple Arc Network Testnet smart contract deployment and interaction log.

## AgentTreasury Lite App Kit Demo

AgentTreasury Lite now includes a browser-based policy agent that evaluates an
Arc Testnet USDC payment before Circle App Kit can request a MetaMask signature.

The demo implements this flow:

```text
payment request -> policy decision -> human authorization -> App Kit Send -> ArcScan evidence
```

### What it demonstrates

- a browser-safe treasury policy engine shared with the CLI
- live MetaMask account, network, and balance checks
- recipient allowlist enforcement
- maximum payment and minimum reserve controls
- Circle App Kit `estimateSend()` and `send()`
- an explicit human signature boundary in MetaMask
- transaction evidence and a copyable audit record
- deterministic invoice memo IDs for offchain reconciliation

The browser application never requests, reads, stores, or exports a private key.
It cannot execute a rejected request, and it prevents duplicate sends while a
transaction is in flight.

### Requirements

- Node.js 22 or newer
- Google Chrome with MetaMask
- Arc Testnet configured with chain ID `5042002`
- testnet USDC only

### Install and run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`, then:

1. Connect MetaMask with the expected Arc Testnet wallet.
2. Review the prefilled recipient, amount, and invoice ID.
3. Confirm that the agent decision is `APPROVED`.
4. Click **Execute with MetaMask**.
5. Review and sign the transaction in MetaMask.
6. Use the returned ArcScan link and audit JSON to verify settlement.

Build the production bundle with:

```bash
npm run build
```

### Demo policy

- Allowed recipient:
  `0x9240e82aE80D70875BA854F480ba412b410cd54a`
- Default payment: `0.01 USDC`
- Maximum payment: `0.05 USDC`
- Minimum remaining balance: `0.05 USDC`
- Invoice ID: required

### Verified App Kit Send

On 2026-07-18, the browser demo approved and executed a real Arc Testnet App
Kit Send from the project wallet to the allowlisted auxiliary wallet.

- Sender:
  `0x8b615E587C9636db67Dd93f4982116ce053EabDD`
- Recipient:
  `0x9240e82aE80D70875BA854F480ba412b410cd54a`
- Amount: `0.01 USDC`
- Invoice ID: `ARC-APPKIT-2026-0718-001`
- Offchain reconciliation memo ID:
  `0xc7b65ad290592fa036ab61e0c7ceb072dc8b6bfe94e81fd24e22f810d7cd0c03`
- Transaction:
  https://testnet.arcscan.app/tx/0x6a46e44a1346772966d1690c6e03a4baf35ff699a7003a58d99c3fe9cd41d572

RPC verification confirms a successful receipt and an ERC-20 `transfer` call
to Arc Testnet USDC with `10000` base units, equal to `0.01 USDC`.

The memo ID above is linked to the transaction in the demo's audit record. It
is not embedded in this App Kit Send transaction through Arc's Memo contract.
The repository's earlier Memo contract transaction remains separate evidence
of the onchain memo workflow.

## Verified ERC-8004 Agent Identity

On 2026-07-20, AgentTreasury Lite registered an onchain agent identity through
Arc Testnet's official ERC-8004 Identity Registry.

- Standard: `ERC-8004`
- Agent ID: `851421`
- Owner:
  `0x8b615E587C9636db67Dd93f4982116ce053EabDD`
- Identity Registry:
  `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Metadata:
  https://raw.githubusercontent.com/kenvin-maker/arc-testnet-memo/main/agent-metadata.json
- Transaction:
  https://testnet.arcscan.app/tx/0xe8b29a7fe6150281e0917caea39c9cfc6d943d5904580a3cd74332209e93e490

RPC verification confirms that the registry minted agent token `851421` to the
project wallet and that `tokenURI(851421)` returns the public metadata URL
above. The browser demo displays this confirmed identity and disables additional
registration to prevent accidental duplicate identities.

This milestone covers ERC-8004 identity only. The project does not claim a
Reputation Registry score, Validation Registry result, or guaranteed airdrop
eligibility.

## AgentTreasury Lite Runnable MVP

The original CLI remains available as a dry-run treasury policy agent for the
Encode Programmable Money Hackathon **Agentic Economy** track. It evaluates an
agent payment request before any wallet action and produces an auditable
`APPROVED` or `REJECTED` decision.

The MVP checks:

- recipient allowlists
- maximum single-payment limits
- minimum remaining wallet balance
- invoice references
- deterministic memo metadata for later Arc settlement

It does **not** connect to a wallet, read a private key, contact an RPC endpoint, sign a transaction, or broadcast a payment.

### Requirements

- Node.js 22 or newer

The CLI itself uses Node.js built-in modules. Run `npm install` when using the
browser App Kit demo.

### Run the example

```bash
npm start -- examples/payment-request.json config/policy.json
```

Example request:

```json
{
  "recipient": "0x1111111111111111111111111111111111111111",
  "amountUSDC": 0.05,
  "invoiceId": "INV-2026-001",
  "walletBalanceUSDC": 1.0
}
```

Example policy:

```json
{
  "maxPaymentUSDC": 0.1,
  "minimumRemainingBalanceUSDC": 0.5,
  "allowlistedRecipients": [
    "0x1111111111111111111111111111111111111111"
  ]
}
```

The example returns `APPROVED`, the projected remaining balance, a deterministic bytes32-style memo ID, and a memo-data preview. Every result includes `dryRun: true` and explicitly confirms that no transaction was broadcast.

Example output:

```json
{
  "decision": "APPROVED",
  "reasons": [
    "Payment satisfies all treasury policy rules."
  ],
  "remainingBalanceUSDC": 0.95,
  "suggestedMemoId": "0xb2458d7cb216405ec38dddbaf5359f5418e58da1bbc9aec3fe98105b26cda6fd",
  "dryRun": true,
  "execution": "Eligible for separate manual wallet review; no transaction was broadcast."
}
```

### Run the tests

```bash
npm test
```

The test suite covers approval, non-allowlisted recipients, payment limits, minimum reserves, combined failures, invalid input, case-insensitive address matching, and deterministic memo IDs.

### How this maps to Arc

The dry-run agent is the decision layer that was missing from the original evidence log:

1. A payment request supplies the recipient, amount, invoice ID, and wallet balance.
2. AgentTreasury Lite applies treasury policy and explains its decision.
3. An approved decision produces a proposed memo ID and memo-data preview.
4. The browser demo can execute a separately reviewed payment through App Kit
   Send, while the existing Memo and Multicall3From transactions demonstrate
   the project's other settlement paths.
5. The resulting ArcScan transaction can be linked back to the agent decision for reconciliation.

The repository already contains real Arc testnet evidence for both the official Memo contract and Multicall3From. The MVP intentionally keeps wallet signing manual and outside the agent.

## Demo

Video demo: https://www.youtube.com/watch?v=3jFuRj20a8g

Submitted for Lepton Agents Hackathon, RFB 05 - Nanopayment Infrastructure & Tooling.
## Overview

This repository records my Arc Network Testnet testing using MetaMask, Circle Faucet, Remix, USDC gas, ArcScan, and a simple smart contract.

## Wallet

0x8b615E587C9636db67Dd93f4982116ce053EabDD

## Contract

ArcMemo contract on Arc Network Testnet:

0x03b0c3eBa63eCFD609382209386d4C765f575805

## Tested Flows

- Requested testnet USDC, EURC, and cirBTC from Circle Faucet
- Sent USDC transfers on Arc Testnet
- Deployed a simple ArcMemo smart contract with Remix
- Called setMemo multiple times
- Checked deployment and interactions on ArcScan
- Shared developer feedback in the Build on Circle Discord

## Deployment

0xf9fb237b588c76d4ffc263ec709d8cd8b7f93e507e1f51c9a443bb06cf9f68b4

ArcScan:

https://testnet.arcscan.app/tx/0xf9fb237b588c76d4ffc263ec709d8cd8b7f93e507e1f51c9a443bb06cf9f68b4

## Contract Interactions

0x2e0ac2f4477e6d335423904eb989b7d4cdd48b95806b548cd74cd405b72728aa

0xccb3e8d8bfdf04d90b6b47da601c56881b83e96e8848a7936f88fff384528b66

0x4f7154bab6ca474180d99c3c44d924a5b920a86ca7c93af8d5a7669a33996d3e

0x928e4b5f467f64715b987a595bf98aa2c32c53e4c5835f0ca98561eb70cda5d2

0x897adeb171164bd85ea09ccebc79f3fd36228aeb55f923cbddcce65b9a874e48

## USDC Transfer

0x69b379ff586b8164c75296179977452e9a1f0388b07abad51afac2a367138251

## Token Contracts on Arc Testnet

USDC: 0x3600000000000000000000000000000000000000

EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a

cirBTC: 0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF

## Notes

Arc Testnet uses testnet USDC as gas. Remix users should connect through Browser Extension / MetaMask before deploying.
## 2026-06-16 Activity

- Read Arc House content about v0.7.2 hardfork, transaction memos, and batch transactions
- Called ArcMemo setMemo before hardfork activation
  - Tx: https://testnet.arcscan.app/tx/0x482bf4e11f9ae76d16be3ba1f739fd9e6384a1583b87b05cfa5b469b5eb0d3a6
- Sent 0.17 testnet USDC to an auxiliary wallet
  - Tx: https://testnet.arcscan.app/tx/0xd2a05815088a914736a54af9445c56adf5d6f37438a4ba222a3a88714d084b9e
## 2026-06-19 Post-Hardfork Verification

After the Arc Testnet v0.7.2 activation, I tested the existing ArcMemo contract and stablecoin transfer flow again.

- Called ArcMemo setMemo after v0.7.2 activation
  - Tx: https://testnet.arcscan.app/tx/0xb196e9deebd08cff4815654167c4bd7ac654b8c1cd3641c4020de2ec9efc7e38
- Sent small post-hardfork USDC transfer
  - Tx: https://testnet.arcscan.app/tx/0xf9908ab73805e49d00b2dbb345064c13291ab714d02302e05d9dd8e83f21e97f
- Sent additional small post-hardfork USDC transfer
  - Tx: https://testnet.arcscan.app/tx/0x0550da403e5c4e492bd6f4be0183411c1e15a958ac5f77915fee175ffee8b5fe

Notes:
- Existing contract interaction worked after the hardfork.
- USDC gas and token transfer visibility worked on ArcScan.
- Next area to explore: transaction memo and batch transaction developer flows.
## Next Exploration

After verifying normal contract calls and USDC transfers after v0.7.2, the next area I plan to explore is Arc's transaction memo and batch transaction flow.

Focus areas:
- USDC transfers with structured payment references
- Invoice IDs and payout references
- Batch payment workflows
- ArcScan visibility for memo-related transactions
## 2026-06-23 Transaction Memo Test

I tested Arc's official Memo contract after the v0.7.2 activation by wrapping a small USDC transfer with structured memo metadata.

- Memo contract:
  - 0x5294E9927C3306DcBaDb03fe70b92e01cCede505
- Target token:
  - USDC: 0x3600000000000000000000000000000000000000
- Flow:
  - Called `memo(target, data, memoId, memoData)` through Remix and MetaMask
  - Sent 0.07 testnet USDC to an auxiliary wallet
  - Attached structured memo data for invoice/payment reference testing
- Tx:
  - https://testnet.arcscan.app/tx/0xb4dec799023d6c2414dec833a7840a0d7571d3ec19c708342c49351782ee4d7d

Notes:
- This test used Arc's post-v0.7.2 transaction memo flow.
- The transaction was confirmed and visible in MetaMask activity.
- This is a stronger developer test than a normal USDC transfer because it exercises memo-enabled payment metadata.
## 2026-06-27 Batch USDC Transfer Test

I tested Arc's official Multicall3From contract after v0.7.2 by batching two USDC transfer calls into one transaction.

- Multicall3From contract:
  - 0x522fAf9A91c41c443c66765030741e4AaCe147D0
- Target token:
  - USDC: 0x3600000000000000000000000000000000000000
- Flow:
  - Called `aggregate(Call[] calls)` through Remix and MetaMask
  - Sent 0.05 testnet USDC to an auxiliary wallet
  - Included a second 0.02 testnet USDC transfer to my own wallet as part of the same batch
- Tx:
  - https://testnet.arcscan.app/tx/0x6a194420c4ef58eb022cef45f2d5f3a0e0b5e7b742ca7c400aebdc695dea08b2

Notes:
- This test used Arc's post-v0.7.2 batch transaction flow.
- The transaction exercises sender-preserving batch calls through the official Multicall3From contract.
## Lepton Hackathon Direction

I am using this repository as the starting point for a small Lepton Agents Hackathon prototype under RFB 05: Nanopayment Infrastructure & Tooling.

### Project Idea: AgentTreasury Lite

AgentTreasury Lite is a lightweight Arc testnet payment tracker for agent wallets. The goal is to document and demonstrate how an AI agent or agent-like workflow can use USDC payments, transaction memos, and batch transfers for small settlement flows.

### Why this fits Arc

Arc is designed for stablecoin-native settlement with fast finality and predictable USDC gas. That makes it suitable for agentic micropayments, invoice references, payout batching, and payment reconciliation.

### Current Prototype Evidence

- Tested Arc Testnet with MetaMask and Remix
- Deployed and interacted with a simple ArcMemo contract
- Tested Arc's official Memo contract for structured payment metadata
- Tested Arc's official Multicall3From contract for batch USDC transfers
- Joined the Lepton Agents Hackathon and selected RFB 05 as the project direction

### Next Steps

- Package the existing transaction history into a cleaner payment log
- Add a simple agent wallet treasury table
- Document memo-enabled payment examples
- Explore a small dashboard or static demo for agent payment activity
## AgentTreasury Lite Payment Log

AgentTreasury Lite is a lightweight Arc Testnet payment-tracking prototype for agent wallets. It records memo-enabled payments, batch settlement flows, and wallet activity that can later become a simple dashboard for agent treasury management.

| Date | Flow | Contract / Wallet | Amount | Tx |
| --- | --- | --- | --- | --- |
| 2026-06-23 | Memo-enabled USDC payment | Memo contract: 0x5294E9927C3306DcBaDb03fe70b92e01cCede505 | 0.07 USDC | https://testnet.arcscan.app/tx/0xb4dec799023d6c2414dec833a7840a0d7571d3ec19c708342c49351782ee4d7d |
| 2026-06-27 | Batch USDC transfer | Multicall3From: 0x522fAf9A91c41c443c66765030741e4AaCe147D0 | 0.07 USDC total | https://testnet.arcscan.app/tx/0x6a194420c4ef58eb022cef45f2d5f3a0e0b5e7b742ca7c400aebdc695dea08b2 |

### Prototype Direction

This payment log is the first step toward an AgentTreasury Lite prototype for RFB 05: Nanopayment Infrastructure & Tooling.

The goal is to help builders inspect:

- agent wallet payment history
- USDC settlement activity
- memo-based payment references
- batch transfer flows
- future dashboard-ready treasury records
## Submission Draft

Project name: AgentTreasury Lite

Track / RFB: RFB 05 - Nanopayment Infrastructure & Tooling

AgentTreasury Lite is a lightweight Arc Testnet payment log and treasury prototype for agent wallets. It organizes real Arc testnet activity into a simple reviewer-friendly record, including memo-enabled USDC payments, batch transfers, wallet roles, and transaction evidence.

### Problem

Agent and AI payment flows can become hard to inspect once wallets, memos, batch transfers, and settlement records are spread across explorers and Discord updates.

### Solution

AgentTreasury Lite turns these payment actions into a clean treasury log that can later become a dashboard for agent-wallet spending, earning, and reconciliation.

### Arc / Circle Features Used

- Arc Testnet
- USDC gas and USDC transfers
- Official Memo contract
- Official Multicall3From contract
- Remix + MetaMask
- ArcScan transaction evidence

### Demo Plan

The demo will show:

1. Existing Arc testnet transactions
2. Memo-enabled USDC payment record
3. Batch USDC transfer record
4. AgentTreasury Lite payment log in GitHub
5. Next step toward a simple dashboard
