# Arc Testnet Memo

Simple Arc Network Testnet smart contract deployment and interaction log.

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
