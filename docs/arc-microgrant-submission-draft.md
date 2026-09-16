# Arc Microgrants submission draft

Status: draft prepared for user review; not an official submission.

## Project title

AgentTreasury Lite — policy-gated USDC settlement for agent wallets on Arc

## Short description

AgentTreasury Lite is a working treasury and payment flow for agent wallets on Arc. It turns a payment request into a policy decision before Circle App Kit requests human authorization. The live Arc Mainnet demo connects to MetaMask, reads USDC and gas balances, checks an allowlisted recipient, amount limit, minimum reserve, and invoice ID, then settles an approved USDC payment. The public repository includes the policy engine, dual-network configuration, Testnet evidence, and Mainnet proof. A real 0.01 USDC Mainnet payment was confirmed on September 17, 2026.

## How the project uses Arc

Arc is the settlement network for the demo's USDC payment flow. The application uses Arc Mainnet's USDC-denominated gas model and Circle App Kit Send, while preserving explicit human authorization in MetaMask. The policy layer is designed for agent treasury operations: a request is evaluated first, and only an approved request can reach the wallet authorization boundary.

## Links

- Live Mainnet demo: https://agent-treasury-lite.vercel.app
- Public repository: https://github.com/kenvin-maker/arc-testnet-memo
- Mainnet transaction proof: https://explorer.arc.io/tx/0x4ddc73ae2564a0c1c3d687bb2509a5b36783c790a424d2e973705a63ed0fcacf
- Public builder profile: https://github.com/kenvin-maker
- Arc House profile: https://community.arc.io/

## Payout wallet, if requested

`0x8b615E587C9636db67Dd93f4982116ce053EabDD`

## Accuracy notes

- The project is a hackathon continuation and is now deployed on Arc Mainnet.
- The Mainnet payment above is real and independently verifiable.
- ERC-8004 identity evidence in the repository is explicitly Arc Testnet history; Mainnet identity registration is disabled until an official Mainnet registry is verified.
- Gateway/Nanopayments remains a roadmap item in this project and is not presented as a live integration.
- This draft makes no claim of grant selection or guaranteed reward.
