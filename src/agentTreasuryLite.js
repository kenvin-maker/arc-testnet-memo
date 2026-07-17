import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  evaluatePolicy,
  normalizePolicy,
  normalizeRequest,
} from "./policy.js";

export { normalizePolicy, normalizeRequest };

export function createMemoId(invoiceId) {
  return `0x${createHash("sha256").update(invoiceId, "utf8").digest("hex")}`;
}

export function evaluatePayment(request, policy) {
  const policyResult = evaluatePolicy(request, policy);
  const approved = policyResult.decision === "APPROVED";

  return {
    ...policyResult,
    suggestedMemoId: createMemoId(policyResult.request.invoiceId),
    memoDataPreview: {
      invoiceId: policyResult.request.invoiceId,
      recipient: policyResult.request.recipient,
      amountUSDC: policyResult.request.amountUSDC,
      decision: policyResult.decision,
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
