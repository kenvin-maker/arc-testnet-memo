# AgentTreasury Lite MVP Implementation Plan

Date: 2026-07-14

## Objective

Implement the approved zero-dependency Node.js dry-run payment-decision agent and make the repository ready for Encode Checkpoint 2.

## Tasks

1. Add `package.json` with `start` and `test` scripts.
2. Implement request validation, policy validation, exact six-decimal USDC arithmetic, decision rules, deterministic memo IDs, and a JSON CLI in `src/agentTreasuryLite.js`.
3. Add reviewer-friendly example request and policy JSON files.
4. Add Node built-in tests covering approval, each rejection rule, combined failures, validation, address casing, and memo determinism.
5. Add a prominent runnable-MVP section to the existing README while preserving all historical Arc evidence.
6. Run `npm test` and the example CLI command.
7. Inspect the diff, commit the implementation locally, and prepare a concise Checkpoint 2 progress update.

## Verification Commands

```bash
npm test
npm start -- examples/payment-request.json config/policy.json
git diff --check
git status --short
```

## Safety Constraints

- No private-key, seed-phrase, wallet, or signer input.
- No RPC request or transaction broadcast.
- No external runtime dependencies.
- Future onchain evidence remains a separate user-confirmed wallet action.
