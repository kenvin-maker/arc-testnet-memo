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
