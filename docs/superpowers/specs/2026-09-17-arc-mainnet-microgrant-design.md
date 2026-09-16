# Arc Mainnet Microgrant Preparation Design

Date: 2026-09-17

## Goal

Prepare AgentTreasury Lite for a real Arc Mainnet deployment that can later be submitted to Arc Microgrants, while preserving the existing Arc Testnet evidence, demo behavior, and historical transaction links.

This phase covers code and documentation readiness only. It does not deploy contracts, publish a new deployment, send USDC, or request a wallet signature.

## Verified external constraints

- Arc Microgrants offers 20 non-dilutive grants of 500 USDC and requires a project to be deployed and working on Arc Mainnet when submitted.
- The project must provide a live deployment, public repository, short project description, and public builder profile.
- The existing repository is Testnet-only and currently uses Arc Testnet chain ID `5042002`, testnet RPC/explorer addresses, `ArcTestnet`, and testnet identity evidence.
- Official Arc App Kit documentation lists Arc as supported, but the currently installed local App Kit version exposes only Arc Testnet. Mainnet values must therefore be confirmed from the upgraded official SDK or official Arc/Circle documentation before they are used.

Sources:

- https://community.arc.io/public/events/arc-microgrants-f8tijfjhyq
- https://community.arc.io/public/blogs/arc-mainnet-is-live-the-economic-os-for-the-internet-2026-09-16
- https://docs.arc.io/app-kit/references/supported-blockchains

## Recommended architecture

Use one codebase with a network configuration selected at build/runtime.

### Network configuration

Create a typed network configuration boundary that exposes, for the active network:

- display name and testnet/mainnet flag;
- App Kit chain definition and chain identifier;
- chain ID;
- RPC URL;
- block explorer base URL and transaction URL builder;
- USDC address/alias;
- optional contract addresses and feature flags.

Keep the current Testnet values unchanged. Add Mainnet only after official values are verified. Do not invent or infer a Mainnet chain ID, RPC URL, explorer URL, USDC address, memo contract, or identity registry address.

Select the network with `VITE_ARC_NETWORK=testnet|mainnet`. Default to `testnet` so the existing public demo remains safe and historically accurate. A future Mainnet deployment can set `VITE_ARC_NETWORK=mainnet` without maintaining a second application.

### Payment flow

Refactor wallet connection, network switching, balance checks, App Kit Send, transaction links, and audit records to consume the active network configuration instead of hard-coded Testnet constants.

The UI must always show the active network. Error messages must name that network, especially insufficient USDC/gas and wrong-network errors.

### Identity and contract evidence

Keep the existing ERC-8004 registration and transaction evidence explicitly labeled as Testnet history. Do not attempt Mainnet identity registration until an official Mainnet registry address and supported flow are verified.

Treat existing Testnet memo, Multicall3From, and transfer evidence as historical proof. Mainnet contract addresses must be separate configuration entries and must not reuse Testnet addresses unless official deployment documentation confirms equivalence.

### Documentation and submission readiness

Update README and page metadata so that:

- Testnet history and verified evidence remain clearly labeled;
- Mainnet support is described only after it is actually implemented and locally verified;
- the Microgrant submission checklist points to a future Mainnet deployment, public repo, live demo, and builder profile;
- Gateway/Nanopayments remains marked as roadmap unless independently verified as live in this project.

## Dependency and compatibility work

Before implementation, inspect the latest official Circle App Kit and Viem adapter versions. Upgrade only as needed to obtain the official Arc Mainnet chain definition and supported send flow. Preserve the lockfile and verify the resulting exports locally.

If the official SDK still does not expose a stable Mainnet definition, stop at the configuration/compatibility audit and report the blocker rather than hard-coding network constants.

## Error handling and safety

- Never silently fall back from Mainnet to Testnet or vice versa.
- Reject a wallet connection when the selected network does not match.
- Keep Testnet evidence links unchanged.
- Do not perform any on-chain operation during local verification.
- Any later Mainnet deployment, contract transaction, or USDC transfer requires a separate user confirmation with exact network, amount, recipient, and purpose.

## Verification plan

1. Confirm the official SDK exports the required Arc Mainnet chain definition and supported identifiers.
2. Run existing unit tests.
3. Run the production build/type check.
4. Exercise configuration parsing and both network branches without connecting a wallet.
5. Search the built/source tree for accidental hard-coded Testnet values in Mainnet paths.
6. Review README and UI wording for accurate separation of historical Testnet evidence and Mainnet readiness.
7. Only after this phase, consider a separate deployment plan and user-approved wallet/on-chain validation.

## Out of scope

- Mainnet deployment or Vercel production changes.
- Smart-contract deployment.
- USDC acquisition, bridging, transfers, or other wallet signatures.
- ERC-8004 Mainnet registration.
- Microgrant submission.
- Airdrop or token-eligibility claims.
