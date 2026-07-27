import { evaluatePolicy } from "./policy.js";

export const MOCK_HTTP_STATUS = 402;
export const MOCK_MODE = "MOCK";
export const PLANNED_SETTLEMENT_STATUS = "PLANNED";

function requireText(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createMockPaymentInstructions({ recipient, amountUSDC, invoiceId, resource }) {
  return {
    mode: MOCK_MODE,
    httpStatus: MOCK_HTTP_STATUS,
    resource: requireText(resource, "resource"),
    payment: {
      network: "Arc Testnet",
      token: "USDC",
      recipient,
      amountUSDC,
      invoiceId: requireText(invoiceId, "invoiceId"),
    },
    notice: "Mock x402 payment instructions only. No payment authorization or settlement is created.",
  };
}

export async function createNonSigningAuthorizationPreview(instructions, policyResult) {
  if (policyResult?.decision !== "APPROVED") return null;

  const payment = instructions?.payment;
  if (!payment) throw new TypeError("Mock payment instructions are required.");

  const material = [
    instructions.mode,
    instructions.httpStatus,
    payment.recipient.toLowerCase(),
    payment.amountUSDC,
    payment.invoiceId,
    instructions.resource,
  ].join("|");

  return {
    mode: "NON-SIGNING",
    scheme: "EIP-3009 PREVIEW",
    reference: `mock-auth-${await sha256Hex(material)}`,
    notice: "Preview only. This is not an EIP-3009 signature or payment authorization.",
  };
}

export async function buildMock402AuditRecord({ instructions, policy, walletBalanceUSDC }) {
  const payment = instructions?.payment;
  if (!payment) throw new TypeError("Mock payment instructions are required.");

  const policyResult = evaluatePolicy(
    {
      recipient: payment.recipient,
      amountUSDC: payment.amountUSDC,
      invoiceId: payment.invoiceId,
      walletBalanceUSDC,
    },
    policy,
  );
  const authorizationPreview = await createNonSigningAuthorizationPreview(instructions, policyResult);

  return {
    project: "AgentTreasury Lite",
    mode: MOCK_MODE,
    request: instructions,
    policyDecision: {
      decision: policyResult.decision,
      reasons: policyResult.reasons,
      remainingBalanceUSDC: policyResult.remainingBalanceUSDC,
    },
    authorizationPreview,
    settlement: {
      status: PLANNED_SETTLEMENT_STATUS,
      rail: "Circle Gateway / Nanopayments",
      notice: "No Gateway request, wallet signature, or onchain transaction was made.",
    },
  };
}
