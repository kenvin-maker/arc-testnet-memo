import test from "node:test";
import assert from "node:assert/strict";
import { BROWSER_DEMO_POLICY, evaluatePolicy } from "../src/policy.js";

const AUXILIARY_WALLET = "0x9240e82aE80D70875BA854F480ba412b410cd54a";

function request(overrides = {}) {
  return {
    recipient: AUXILIARY_WALLET,
    amountUSDC: 0.01,
    invoiceId: "ARC-APPKIT-2026-001",
    walletBalanceUSDC: 1,
    ...overrides,
  };
}

test("browser demo policy approves the intended auxiliary-wallet payment", () => {
  const result = evaluatePolicy(request(), BROWSER_DEMO_POLICY);

  assert.equal(result.decision, "APPROVED");
  assert.equal(result.remainingBalanceUSDC, 0.99);
});

test("browser demo policy rejects an unapproved recipient", () => {
  const result = evaluatePolicy(
    request({ recipient: "0x1111111111111111111111111111111111111111" }),
    BROWSER_DEMO_POLICY,
  );

  assert.equal(result.decision, "REJECTED");
  assert.ok(result.reasons.includes("Recipient is not on the treasury allowlist."));
});

test("browser demo policy rejects a payment above 0.05 USDC", () => {
  const result = evaluatePolicy(request({ amountUSDC: 0.050001 }), BROWSER_DEMO_POLICY);

  assert.equal(result.decision, "REJECTED");
  assert.ok(result.reasons.includes("Payment exceeds the maximum single-payment limit."));
});

test("browser demo policy preserves the 0.05 USDC minimum reserve", () => {
  const result = evaluatePolicy(
    request({ walletBalanceUSDC: 0.05, amountUSDC: 0.01 }),
    BROWSER_DEMO_POLICY,
  );

  assert.equal(result.decision, "REJECTED");
  assert.ok(result.reasons.includes("Payment would leave less than the required minimum balance."));
});
