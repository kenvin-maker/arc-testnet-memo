# AgentTreasury Lite App Kit Send Implementation Plan

Date: 2026-07-18

## Objective

Implement the approved browser demo in
`docs/superpowers/specs/2026-07-18-app-kit-send-design.md`, preserve the CLI,
and prepare one user-confirmed Arc Testnet App Kit Send transaction.

## Task 1: Establish the browser toolchain

Files:

- Modify `package.json`
- Add `tsconfig.json`
- Add `vite.config.ts`
- Add `index.html`

Steps:

1. Confirm Node.js and npm versions.
2. Install Vite, TypeScript, App Kit, the Viem v2 adapter, and Viem.
3. Inspect installed type declarations to confirm the current
   `createViemAdapterFromProvider`, Arc Testnet chain export, `estimateSend`,
   and `send` signatures.
4. Add `dev`, `build`, and `preview` scripts without breaking the CLI scripts.
5. Run the existing tests.

## Task 2: Extract a shared policy core

Files:

- Add `src/policy.js`
- Modify `src/agentTreasuryLite.js`
- Modify `test/agentTreasuryLite.test.js` only if imports need to move
- Add `test/browserPolicy.test.js`

Steps:

1. Move browser-safe validation and exact USDC arithmetic into `src/policy.js`.
2. Keep Node file I/O, CLI handling, and memo hashing in
   `src/agentTreasuryLite.js`.
3. Add the approved browser demo policy defaults.
4. Test the auxiliary allowlist, 0.01 USDC approval, maximum payment,
   minimum reserve, and invalid input.
5. Run all Node tests.

## Task 3: Implement transaction-state helpers

Files:

- Add `src/browser/paymentFlow.ts`
- Add `test/paymentFlow.test.js` or an equivalent TypeScript-capable test

Steps:

1. Build App Kit Send parameters from an approved policy decision.
2. Normalize App Kit results into transaction hash and explorer URL fields.
3. Construct the audit record.
4. Map wallet rejection, balance errors, estimation failures, and transaction
   failures into stable user-facing states.
5. Guard against duplicate execution while a send is in flight.
6. Test helpers without invoking a real wallet.

## Task 4: Build the single-page browser demo

Files:

- Add `src/browser/main.ts`
- Add `src/browser/styles.css`

Steps:

1. Render wallet, network, request, decision, execution, and evidence panels.
2. Connect only through the injected EIP-1193 provider.
3. Verify the expected main wallet and Arc Testnet chain ID.
4. Read live balances.
5. Evaluate the request before showing the execute action.
6. Create the App Kit adapter from the browser provider.
7. Estimate and execute one Send operation after the user clicks.
8. Keep the execute button disabled during estimation, wallet confirmation,
   and settlement.
9. Display the confirmed transaction and copyable audit JSON.

## Task 5: Verify the local application

Steps:

1. Run unit tests.
2. Run the production build.
3. Start the local Vite server.
4. Open the demo in Chrome.
5. Verify the disconnected, connected, rejected, approved, and wrong-network
   states without signing.
6. Fix any console or runtime errors.

## Task 6: Complete the Arc Testnet evidence transaction

Steps:

1. Check the main wallet's testnet balances.
2. If insufficient, use only the official Arc/Circle testnet faucet.
3. Prepare the approved 0.01 USDC payment to
   `0x9240e82aE80D70875BA854F480ba412b410cd54a`.
4. Stop at the MetaMask confirmation and hand control to the user.
5. After user confirmation, verify status, sender, recipient, and amount on
   ArcScan.

## Task 7: Document and publish the milestone

Files:

- Modify `README.md`
- Optionally add a checked-in example audit record with public transaction data

Steps:

1. Document installation, local run, policy, MetaMask safety, and App Kit Send.
2. State clearly that the invoice memo ID is an offchain reconciliation key,
   not an onchain memo in the App Kit Send transaction.
3. Add the verified ArcScan evidence after the transaction succeeds.
4. Run tests and the production build again.
5. Review the diff for secrets and private data.
6. Commit the implementation.
7. Push to the existing GitHub repository.
