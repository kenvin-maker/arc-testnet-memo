# ERC-8004 Agent Identity Implementation Plan

Date: 2026-07-20
Design: `docs/superpowers/specs/2026-07-20-erc-8004-agent-identity-design.md`

## Objective

Extend the existing AgentTreasury Lite browser demo so the expected MetaMask wallet
can register one identity through Arc Testnet's official ERC-8004 Identity Registry,
then present the agent ID and transaction as reviewer-friendly evidence.

## Official Interface

- Chain ID: `5042002`
- Identity Registry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- Write: `register(string metadataURI)`
- Identity event:
  `Transfer(address indexed from, address indexed to, uint256 indexed tokenId)`
- Verification reads: `ownerOf(uint256)` and `tokenURI(uint256)`

## Task 1: Public metadata

Files:

- Create `agent-metadata.json`

Steps:

1. Add valid JSON containing the project name, description, agent type,
   capabilities, version, repository, demo, network, and public operator wallet.
2. Keep every field public and reviewer-readable.
3. Add a test that parses the JSON and checks the required identity fields.

## Task 2: Shared Arc configuration

Files:

- Create `src/browser/arcConfig.js`
- Modify `src/browser/main.ts`

Steps:

1. Move the chain ID, RPC URL, explorer URL, expected wallet, auxiliary wallet,
   USDC address, and new Identity Registry address into the shared module.
2. Preserve existing values and behavior.
3. Add tests that lock the official registry, main account, and chain values.

## Task 3: Isolated registration module

Files:

- Create `src/browser/agentIdentity.js`
- Create `test/agentIdentity.test.js`

Steps:

1. Define the minimal registry ABI for `register`, `ownerOf`, `tokenURI`, and
   ERC-721 `Transfer`.
2. Validate HTTPS metadata URIs.
3. Build the exact register request.
4. Parse the mint event only when it comes from the official registry, has the zero
   address as `from`, and targets the expected account.
5. Build deterministic evidence JSON and explorer links.
6. Classify wallet rejection, insufficient funds, receipt timeout, and failed
   transaction errors.
7. Add an in-flight guard that blocks duplicate registration.
8. Run the focused test file before integrating the UI.

## Task 4: Browser identity interface

Files:

- Modify `src/browser/main.ts`
- Modify `src/browser/styles.css`

Steps:

1. Add an Agent Identity card containing registry, metadata, state, and action.
2. Reuse the established MetaMask connection and Arc Testnet checks.
3. Create a Viem wallet client from `window.ethereum`.
4. On user action:
   - validate the URI
   - simulate `register(string)`
   - call `writeContract` through MetaMask
   - wait for the receipt
   - parse the minted agent ID
   - verify `ownerOf` and `tokenURI`
5. Render agent ID, transaction hash, ArcScan link, and copyable evidence JSON.
6. Keep the action disabled while disconnected, on the wrong account/network, or
   while a transaction is pending.
7. Never trigger a write on page load, wallet connection, or retry.

## Task 5: Verification

Files:

- All tests and browser files

Steps:

1. Run `npm test`.
2. Run `npm run build`.
3. Start the Vite application and inspect the local page.
4. Confirm the existing payment workflow still renders.
5. Confirm the new identity card shows the exact official registry and GitHub Raw
   URI.
6. Confirm no wallet transaction is invoked during smoke testing.

## Task 6: Commit and publish pre-registration code

1. Review the diff for secrets and unrelated changes.
2. Commit metadata, tests, module, and UI as one implementation commit.
3. Push the design, plan, and implementation commits to `origin/main`.
4. Verify the GitHub Raw metadata URL returns valid JSON before any registration.

## Task 7: One user-confirmed registration

1. Open the local app in the user's signed-in Chrome/MetaMask environment.
2. Connect the expected main wallet on Arc Testnet.
3. Present the final registry and metadata URI to the user.
4. Require action-time confirmation before clicking the registration action.
5. Hand the MetaMask confirmation to the user.
6. Capture the confirmed hash and agent ID.
7. Verify the receipt, owner, token URI, and explorer page.

## Task 8: Evidence update

Files:

- Modify `README.md`
- Configure confirmed identity constants only if needed to prevent repeat
  registration in future demos.

Steps:

1. Add the agent ID, official registry, metadata URI, and ArcScan transaction link.
2. State that this is identity-only; do not claim reputation or validation.
3. Run tests and build again.
4. Commit and push the evidence update.

## Completion Gate

The task is complete only after:

- public metadata retrieval succeeds
- all tests and the production build pass
- the user confirms exactly one registration
- the Identity Registry mints an agent ID to the expected wallet
- onchain values and UI evidence match
- README evidence is pushed without overstating airdrop eligibility
