import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const USDC_DECIMALS = 6;
const USDC_SCALE = 10 ** USDC_DECIMALS;

function requireObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be a JSON object.`);
  }
}

function requireAddress(value, label) {
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

function microsToUsdc(micros) {
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

export function createMemoId(invoiceId) {
  return `0x${createHash("sha256").update(invoiceId, "utf8").digest("hex")}`;
}

export function evaluatePayment(request, policy) {
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

  const requestSummary = {
    recipient: normalizedRequest.recipient,
    amountUSDC: microsToUsdc(normalizedRequest.amountMicros),
    invoiceId: normalizedRequest.invoiceId,
    walletBalanceUSDC: microsToUsdc(normalizedRequest.walletBalanceMicros),
  };

  return {
    decision: approved ? "APPROVED" : "REJECTED",
    reasons,
    request: requestSummary,
    remainingBalanceUSDC: microsToUsdc(remainingBalanceMicros),
    suggestedMemoId: createMemoId(normalizedRequest.invoiceId),
    memoDataPreview: {
      invoiceId: normalizedRequest.invoiceId,
      recipient: normalizedRequest.recipient,
      amountUSDC: requestSummary.amountUSDC,
      decision: approved ? "APPROVED" : "REJECTED",
    },
    dryRun: true,
    execution: approved
      ? "Eligible for separate manual wallet review; no transaction was broadcast."
      : "Do not execute this payment; no transaction was broadcast.",
  };
}

async function readJson(filePath, label) {
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Could not read ${label} at ${filePath}: ${error.message}`);
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

export async function runCli(argv = process.argv.slice(2)) {
  const [requestPath, policyPath] = argv;
  if (!requestPath || !policyPath) {
    throw new Error(
      "Usage: npm start -- <payment-request.json> <policy.json>",
    );
  }

  const request = await readJson(path.resolve(requestPath), "payment request");
  const policy = await readJson(path.resolve(policyPath), "treasury policy");
  return evaluatePayment(request, policy);
}

const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  runCli()
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`AgentTreasury Lite error: ${error.message}\n`);
      process.exitCode = 1;
    });
}
