import test from "node:test";
import assert from "node:assert/strict";
import {
  MOCK_HTTP_STATUS,
  buildMock402AuditRecord,
  createMockPaymentInstructions,
} from "../src/nanopaymentsMock.js";
import { BROWSER_DEMO_POLICY } from "../src/policy.js";

const allowedRecipient = "0x9240e82aE80D70875BA854F480ba412b410cd54a";

function instructions(overrides = {}) {
  return createMockPaymentInstructions({
    recipient: allowedRecipient,
    amountUSDC: 0.01,
    invoiceId: "ARC-MOCK-402-001",
    resource: "Agent settlement quote",
    ...overrides,
  });
}

test("mock instructions use HTTP 402 and contain no authorization", () => {
  const result = instructions();

  assert.equal(result.httpStatus, MOCK_HTTP_STATUS);
  assert.equal(result.mode, "MOCK");
  assert.equal(result.payment.token, "USDC");
  assert.match(result.notice, /No payment authorization/);
});

test("approved mock request emits a deterministic non-signing authorization preview", async () => {
  const first = await buildMock402AuditRecord({
    instructions: instructions(),
    policy: BROWSER_DEMO_POLICY,
    walletBalanceUSDC: 1,
  });
  const second = await buildMock402AuditRecord({
    instructions: instructions(),
    policy: BROWSER_DEMO_POLICY,
    walletBalanceUSDC: 1,
  });

  assert.equal(first.policyDecision.decision, "APPROVED");
  assert.equal(first.authorizationPreview.mode, "NON-SIGNING");
  assert.equal(first.authorizationPreview.reference, second.authorizationPreview.reference);
  assert.equal(first.settlement.status, "PLANNED");
});

test("rejected mock request does not emit an authorization preview", async () => {
  const record = await buildMock402AuditRecord({
    instructions: instructions({ amountUSDC: 0.06 }),
    policy: BROWSER_DEMO_POLICY,
    walletBalanceUSDC: 1,
  });

  assert.equal(record.policyDecision.decision, "REJECTED");
  assert.equal(record.authorizationPreview, null);
  assert.match(record.settlement.notice, /No Gateway request/);
});
