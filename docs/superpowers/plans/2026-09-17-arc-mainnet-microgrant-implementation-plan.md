# Arc Mainnet Microgrant Preparation Implementation Plan

Design reference: `docs/superpowers/specs/2026-09-17-arc-mainnet-microgrant-design.md`

## Scope and guardrails

Implement dual-network readiness locally. Preserve the current Testnet default and all Testnet evidence. Do not deploy, change Vercel production, send USDC, register an identity, or request a wallet signature.

Stop and report if official Circle/Arc packages do not provide a stable Arc Mainnet definition or if required Mainnet contract addresses cannot be verified.

## Step 1 — Verify the SDK surface before editing

Files/tools:

- `package.json`
- `package-lock.json`
- `node_modules/@circle-fin/app-kit`
- official App Kit supported-chain documentation

Actions:

1. Inspect the latest compatible `@circle-fin/app-kit` and `@circle-fin/adapter-viem-v2` versions.
2. Confirm the package exports Arc Mainnet and identify its exact chain identifier, chain definition, explorer metadata, and supported Send identifier.
3. Confirm the adapter version remains compatible with the App Kit version and current Viem version.
4. If the package surface is incomplete or contradictory, stop before changing dependencies.

Expected result: a verified set of SDK-provided Mainnet values, with no hand-invented network constants.

## Step 2 — Introduce a network configuration boundary

Primary file: `src/browser/arcConfig.js`

Actions:

1. Preserve the current Testnet constants exactly under a Testnet configuration.
2. Add a Mainnet configuration using only verified SDK/official values.
3. Add a small parser for `import.meta.env.VITE_ARC_NETWORK`, accepting `testnet` and `mainnet`, defaulting to `testnet`.
4. Export the active network configuration and helpers for explorer transaction URLs, display labels, App Kit chain identifiers, and feature flags.
5. Keep Testnet-only identity evidence and contract addresses scoped to Testnet; expose Mainnet identity/contract features as unavailable until verified.

Acceptance checks:

- invalid network values fail clearly rather than falling back silently;
- Testnet configuration produces the current chain ID, RPC, explorer, USDC, and `Arc_Testnet` values;
- Mainnet configuration contains no Testnet URL or Testnet-only address.

## Step 3 — Refactor browser payment and identity consumers

Files:

- `src/browser/paymentFlow.js`
- `src/browser/agentIdentity.js`
- `src/browser/main.ts`

Actions:

1. Replace hard-coded Testnet payment values with active configuration reads.
2. Build App Kit Send parameters using the active App Kit chain identifier.
3. Build explorer links through the active network helper.
4. Make audit records include active network name and chain ID.
5. Make error messages name the active network.
6. Make Viem client, chain definition, wallet network switching, and App Kit supported-chain configuration use the selected network.
7. Keep identity registration enabled only for Testnet until a verified Mainnet registry address and flow exist.
8. Keep the existing confirmed Agent ID evidence labeled as Testnet and prevent it from being presented as Mainnet proof.

## Step 4 — Add local configuration tests

Files:

- `test/paymentFlow.test.js`
- `test/agentIdentity.test.js`
- new focused configuration test if needed

Actions:

1. Test Testnet as the default configuration.
2. Test explicit `testnet` and `mainnet` selection.
3. Test invalid network handling.
4. Test active-network Send parameters and audit records.
5. Test that Testnet identity evidence remains Testnet-only.
6. Test wrong-network and insufficient-balance error wording without invoking a wallet.

Tests must be deterministic and must not make RPC calls or sign transactions.

## Step 5 — Update metadata and documentation

Files:

- `README.md`
- `index.html`
- any UI strings in `src/browser/main.ts`

Actions:

1. Explain the dual-network build behavior and the `VITE_ARC_NETWORK` setting.
2. Keep historical Testnet evidence and links unchanged and clearly labeled.
3. Describe Mainnet as local/deployment readiness only until a real Mainnet deployment exists.
4. Add a Microgrant readiness checklist without claiming eligibility, selection, or an airdrop.
5. Keep Gateway/Nanopayments explicitly marked as roadmap unless verified in this application.

## Step 6 — Dependency update, only if Step 1 passes

Actions:

1. Update App Kit and adapter versions to the minimum verified compatible versions.
2. Regenerate the lockfile with the repository’s package manager.
3. Re-run package export checks to confirm the Mainnet chain definition remains available from the locked versions.
4. Do not update unrelated dependencies.

## Step 7 — Local verification

Run from `C:\CODEX\agenttreasury-git`:

```powershell
npm test
npm run build
git diff --check
```

Then perform read-only searches for accidental Testnet leakage in Mainnet paths and inspect the generated diff. Do not run the app against a connected wallet and do not deploy.

## Step 8 — Handoff for separate deployment decision

Report:

- exact files changed;
- dependency versions and verified SDK exports;
- test/build results;
- remaining Mainnet contract or identity limitations;
- exact deployment and wallet actions that would be required next.

Only after the user separately approves deployment should a new deployment plan be created. The later plan must state network, deployment URL, contract changes, expected gas/USDC amount, and rollback/stop conditions before any signature.
