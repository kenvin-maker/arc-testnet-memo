import assert from "node:assert/strict";
import test from "node:test";

import { createMemoId, evaluatePayment } from "../src/agentTreasuryLite.js";

const RECIPIENT = "0x1111111111111111111111111111111111111111";
const OTHER_RECIPIENT = "0x2222222222222222222222222222222222222222";

function request(overrides = {}) {
  return {
    recipient: RECIPIENT,
    amountUSDC: 0.05,
    invoiceId: "INV-2026-001",
    walletBalanceUSDC: 1,
    ...overrides,
  };
}

function policy(overrides = {}) {
  return {
    maxPaymentUSDC: 0.1,
    minimumRemainingBalanceUSDC: 0.5,
    allowlistedRecipients: [RECIPIENT],
    ...overrides,
  };
}

test("approves an allowlisted payment within budget and reserve rules", () => {
  const result = evaluatePayment(request(), policy());

  assert.equal(result.decision, "APPROVED");
  assert.equal(result.remainingBalanceUSDC, 0.95);
  assert.equal(result.dryRun, true);
  assert.match(result.execution, /no transaction was broadcast/i);
});

test("rejects a recipient that is not allowlisted", () => {
  const result = evaluatePayment(request({ recipient: OTHER_RECIPIENT }), policy());

  assert.equal(result.decision, "REJECTED");
  assert.ok(result.reasons.includes("Recipient is not on the treasury allowlist."));
});

test("rejects a payment above the maximum", () => {
  const result = evaluatePayment(request({ amountUSDC: 0.11 }), policy());

  assert.equal(result.decision, "REJECTED");
  assert.ok(result.reasons.includes("Payment exceeds the maximum single-payment limit."));
});

test("rejects a payment that breaks the minimum reserve", () => {
  const result = evaluatePayment(request({ amountUSDC: 0.6 }), policy({ maxPaymentUSDC: 1 }));

  assert.equal(result.decision, "REJECTED");
  assert.ok(
    result.reasons.includes("Payment would leave less than the required minimum balance."),
  );
});

test("reports every applicable policy failure", () => {
  const result = evaluatePayment(
    request({ recipient: OTHER_RECIPIENT, amountUSDC: 2 }),
    policy(),
  );

  assert.equal(result.decision, "REJECTED");
  assert.ok(result.reasons.length >= 4);
  assert.ok(result.reasons.includes("Payment exceeds the available wallet balance."));
});

test("matches allowlisted addresses case-insensitively", () => {
  const result = evaluatePayment(
    request({ recipient: "0xAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAaAa" }),
    policy({ allowlistedRecipients: ["0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"] }),
  );

  assert.equal(result.decision, "APPROVED");
});

test("creates a deterministic bytes32-style memo ID", () => {
  const first = createMemoId("INV-2026-001");
  const second = createMemoId("INV-2026-001");

  assert.equal(first, second);
  assert.match(first, /^0x[0-9a-f]{64}$/);
});

test("rejects structurally invalid requests and policies", () => {
  assert.throws(() => evaluatePayment(request({ recipient: "bad" }), policy()), /EVM address/);
  assert.throws(() => evaluatePayment(request({ amountUSDC: 0 }), policy()), /greater than zero/);
  assert.throws(() => evaluatePayment(request({ amountUSDC: 0.0000001 }), policy()), /decimal places/);
  assert.throws(() => evaluatePayment(request({ walletBalanceUSDC: -1 }), policy()), /non-negative/);
  assert.throws(() => evaluatePayment(request({ invoiceId: " " }), policy()), /non-empty/);
  assert.throws(
    () => evaluatePayment(request(), policy({ allowlistedRecipients: [] })),
    /non-empty array/,
  );
});
