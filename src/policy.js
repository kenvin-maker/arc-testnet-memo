const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const USDC_DECIMALS = 6;
const USDC_SCALE = 10 ** USDC_DECIMALS;

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be a JSON object.`);
  }
}

export function requireAddress(value, label) {
  if (typeof value !== "string" || !ADDRESS_PATTERN.test(value)) {
    throw new TypeError(`${label} must be a valid 0x-prefixed EVM address.`);
  }
  return value.toLowerCase();
}

function requireUsdcNumber(value, label, { positive = false } = {}) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be a finite number.`);
  }
  if (positive ? value <= 0 : value < 0) {
    throw new RangeError(`${label} must be ${positive ? "greater than zero" : "non-negative"}.`);
  }

  const micros = Math.round(value * USDC_SCALE);
  if (Math.abs(value * USDC_SCALE - micros) > 1e-7) {
    throw new RangeError(`${label} supports at most ${USDC_DECIMALS} decimal places.`);
  }
  return micros;
}

export function microsToUsdc(micros) {
  return Number((micros / USDC_SCALE).toFixed(USDC_DECIMALS));
}

export function normalizeRequest(request) {
  requireObject(request, "Payment request");

  if (typeof request.invoiceId !== "string" || request.invoiceId.trim() === "") {
    throw new TypeError("invoiceId must be a non-empty string.");
  }

  return {
    recipient: requireAddress(request.recipient, "recipient"),
    amountMicros: requireUsdcNumber(request.amountUSDC, "amountUSDC", { positive: true }),
    invoiceId: request.invoiceId.trim(),
    walletBalanceMicros: requireUsdcNumber(request.walletBalanceUSDC, "walletBalanceUSDC"),
  };
}

export function normalizePolicy(policy) {
  requireObject(policy, "Treasury policy");

  if (!Array.isArray(policy.allowlistedRecipients) || policy.allowlistedRecipients.length === 0) {
    throw new TypeError("allowlistedRecipients must be a non-empty array.");
  }

  return {
    maxPaymentMicros: requireUsdcNumber(policy.maxPaymentUSDC, "maxPaymentUSDC", { positive: true }),
    minimumRemainingBalanceMicros: requireUsdcNumber(
      policy.minimumRemainingBalanceUSDC,
      "minimumRemainingBalanceUSDC",
    ),
    allowlistedRecipients: new Set(
      policy.allowlistedRecipients.map((address, index) =>
        requireAddress(address, `allowlistedRecipients[${index}]`),
      ),
    ),
  };
}

export function evaluatePolicy(request, policy) {
  const normalizedRequest = normalizeRequest(request);
  const normalizedPolicy = normalizePolicy(policy);
  const remainingBalanceMicros =
    normalizedRequest.walletBalanceMicros - normalizedRequest.amountMicros;
  const reasons = [];

  if (!normalizedPolicy.allowlistedRecipients.has(normalizedRequest.recipient)) {
    reasons.push("Recipient is not on the treasury allowlist.");
  }
  if (normalizedRequest.amountMicros > normalizedPolicy.maxPaymentMicros) {
    reasons.push("Payment exceeds the maximum single-payment limit.");
  }
  if (normalizedRequest.amountMicros > normalizedRequest.walletBalanceMicros) {
    reasons.push("Payment exceeds the available wallet balance.");
  }
  if (remainingBalanceMicros < normalizedPolicy.minimumRemainingBalanceMicros) {
    reasons.push("Payment would leave less than the required minimum balance.");
  }

  const approved = reasons.length === 0;
  if (approved) {
    reasons.push("Payment satisfies all treasury policy rules.");
  }

  return {
    decision: approved ? "APPROVED" : "REJECTED",
    reasons,
    request: {
      recipient: normalizedRequest.recipient,
      amountUSDC: microsToUsdc(normalizedRequest.amountMicros),
      invoiceId: normalizedRequest.invoiceId,
      walletBalanceUSDC: microsToUsdc(normalizedRequest.walletBalanceMicros),
    },
    remainingBalanceUSDC: microsToUsdc(remainingBalanceMicros),
  };
}

export const BROWSER_DEMO_POLICY = Object.freeze({
  maxPaymentUSDC: 0.05,
  minimumRemainingBalanceUSDC: 0.05,
  allowlistedRecipients: Object.freeze([
    "0x9240e82aE80D70875BA854F480ba412b410cd54a",
  ]),
});
