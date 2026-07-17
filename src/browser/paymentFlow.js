export const ARC_EXPLORER_TX = "https://testnet.arcscan.app/tx/";

export function buildSendParams(adapter, policyResult) {
  if (!adapter) {
    throw new TypeError("A connected App Kit adapter is required.");
  }
  if (policyResult?.decision !== "APPROVED") {
    throw new Error("Only approved payment requests can be executed.");
  }

  return {
    from: { adapter, chain: "Arc_Testnet" },
    to: policyResult.request.recipient,
    amount: String(policyResult.request.amountUSDC),
    token: "USDC",
  };
}

export function normalizeSendResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("App Kit returned an empty transaction result.");
  }
  if (result.state === "error") {
    throw new Error(result.errorMessage || "App Kit reported a failed transaction.");
  }
  if (result.state !== "success" || !result.txHash) {
    throw new Error("App Kit did not return a confirmed transaction hash.");
  }

  return {
    txHash: result.txHash,
    explorerUrl: result.explorerUrl || `${ARC_EXPLORER_TX}${result.txHash}`,
  };
}

export async function createBrowserMemoId(invoiceId) {
  if (typeof invoiceId !== "string" || invoiceId.trim() === "") {
    throw new TypeError("invoiceId must be a non-empty string.");
  }
  const bytes = new TextEncoder().encode(invoiceId.trim());
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return `0x${Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

export async function buildAuditRecord({ account, policyResult, sendResult }) {
  if (!account) {
    throw new TypeError("A sender account is required.");
  }
  const normalized = normalizeSendResult(sendResult);

  return {
    project: "AgentTreasury Lite",
    network: "Arc Testnet",
    chainId: 5042002,
    invoiceId: policyResult.request.invoiceId,
    memoId: await createBrowserMemoId(policyResult.request.invoiceId),
    memoScope: "Offchain reconciliation identifier; not attached through Arc Memo.",
    sender: account.toLowerCase(),
    recipient: policyResult.request.recipient,
    amountUSDC: policyResult.request.amountUSDC,
    decision: policyResult.decision,
    txHash: normalized.txHash,
    explorerUrl: normalized.explorerUrl,
  };
}

export function classifyPaymentError(error) {
  const code = error && typeof error === "object" ? error.code : undefined;
  const message = error instanceof Error ? error.message : String(error || "");
  const normalized = message.toLowerCase();

  if (
    code === 4001 ||
    normalized.includes("user rejected") ||
    normalized.includes("user denied")
  ) {
    return {
      kind: "user-rejected",
      message: "The MetaMask request was rejected. No transaction was sent.",
    };
  }
  if (normalized.includes("insufficient funds") || normalized.includes("insufficient balance")) {
    return {
      kind: "insufficient-balance",
      message: "The wallet does not have enough Arc Testnet USDC for this payment and gas.",
    };
  }
  if (normalized.includes("estimate") || normalized.includes("simulation")) {
    return {
      kind: "estimation-failed",
      message: "App Kit could not estimate the transaction. Check the network and balances.",
    };
  }
  return {
    kind: "transaction-failed",
    message: message || "The transaction failed before confirmation.",
  };
}

export function createExecutionGuard() {
  let inFlight = false;

  return {
    begin() {
      if (inFlight) return false;
      inFlight = true;
      return true;
    },
    end() {
      inFlight = false;
    },
    isInFlight() {
      return inFlight;
    },
  };
}
