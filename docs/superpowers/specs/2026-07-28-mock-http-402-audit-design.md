# Mock HTTP 402 and Audit Record Design

## Goal

Add a runnable, reviewer-friendly simulation of the first stage of the planned
Circle Nanopayments flow. The feature must show how AgentTreasury Lite receives
payment instructions, applies its existing treasury policy, and preserves an
audit record before a real authorization or settlement integration exists.

## Scope

- Provide a local mock HTTP 402 payment-instructions object.
- Evaluate recipient, amount, invoice reference, and reserve requirements with
  the existing policy engine.
- Produce an approval preview or a clear rejection result.
- Produce a copyable audit record containing the request, decision, a
  deterministic proposed authorization reference, and a settlement status.
- Add automated tests for approval, rejection, and deterministic audit output.

## Explicit non-goals

- No wallet connection, signature, private-key access, or chain transaction.
- No real EIP-3009 authorization, x402 request, Circle Gateway call, or claim
  of live Nanopayments support.
- No use of mainnet funds or testnet transfers for this milestone.

## Components and flow

1. A mock provider returns payment instructions with HTTP status `402`, a
   recipient, USDC amount, resource label, and invoice ID.
2. The policy engine evaluates the request against the existing allowlist,
   payment limit, and reserve settings.
3. For an approved result, the adapter derives a deterministic, non-signing
   authorization-preview reference. For a rejected result, it records the
   rejection reasons and emits no preview.
4. An audit-record builder emits a JSON-safe record with the request, policy
   decision, authorization-preview field, and `PLANNED` settlement status.
5. The browser demo displays the output and lets the user copy it. The CLI and
   tests use the same pure helpers where practical.

## Safety and language

All UI and documentation use the labels `MOCK`, `PLANNED`, and `NON-SIGNING`.
The audit record is evidence of a policy decision, not payment evidence. The
existing ArcScan transactions remain the only settlement evidence in the
repository.

## Validation

- Run the existing test suite plus new unit tests.
- Run a production build.
- Confirm that the displayed record contains no private data and that rejected
  requests have no authorization preview.
- Update README with a concise feature description and the non-live disclaimer.
