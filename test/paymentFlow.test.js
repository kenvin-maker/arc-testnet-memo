import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  buildAuditRecord,
  buildSendParams,
  classifyPaymentError,
  createBrowserMemoId,
  createExecutionGuard,
  normalizeSendResult,
} from "../src/browser/paymentFlow.js";
import { resolveArcNetwork } from "../src/browser/arcConfig.js";

const policyResult = {
  decision: "APPROVED",
  request: {
    recipient: "0x9240e82ae80d70875ba854f480ba412b410cd54a",
    amountUSDC: 0.01,
    invoiceId: "ARC-APPKIT-2026-001",
    walletBalanceUSDC: 1,
  },
  remainingBalanceUSDC: 0.99,
};

test("buildSendParams uses Arc Testnet, USDC, and the approved request", () => {
  const adapter = {};
  const params = buildSendParams(adapter, policyResult);

  assert.deepEqual(params, {
    from: { adapter, chain: "Arc_Testnet" },
    to: policyResult.request.recipient,
    amount: "0.01",
    token: "USDC",
  });
});

test("network configuration supports Arc Mainnet without changing the Testnet default", async () => {
  const mainnet = resolveArcNetwork("mainnet");
  assert.equal(mainnet.chainId, 5042);
  assert.equal(mainnet.appKitChain, "Arc");
  assert.equal(buildSendParams({}, policyResult, mainnet).from.chain, "Arc");
  assert.equal(
    normalizeSendResult({ state: "success", txHash: "0xmainnet" }, mainnet).explorerUrl,
    "https://explorer.arc.io/tx/0xmainnet",
  );

  const record = await buildAuditRecord({
    account: "0x8b615E587C9636db67Dd93f4982116ce053EabDD",
    policyResult,
    sendResult: { state: "success", txHash: "0xmainnet" },
    network: mainnet,
  });
  assert.equal(record.network, "Arc Mainnet");
  assert.equal(record.chainId, 5042);
  assert.equal(record.explorerUrl, "https://explorer.arc.io/tx/0xmainnet");
  assert.match(
    classifyPaymentError(new Error("insufficient funds"), mainnet).message,
    /Arc Mainnet/,
  );
});

test("network configuration rejects unknown values", () => {
  assert.throws(() => resolveArcNetwork("preview"), /Use "testnet" or "mainnet"/);
});

test("buildSendParams refuses rejected decisions", () => {
  assert.throws(
    () => buildSendParams({}, { ...policyResult, decision: "REJECTED" }),
    /Only approved/,
  );
});

test("normalizeSendResult requires a successful transaction hash", () => {
  assert.deepEqual(
    normalizeSendResult({ state: "success", txHash: "0xabc" }),
    {
      txHash: "0xabc",
      explorerUrl: "https://testnet.arcscan.app/tx/0xabc",
    },
  );
  assert.throws(() => normalizeSendResult({ state: "error", errorMessage: "boom" }), /boom/);
});

test("browser memo ID matches the CLI SHA-256 memo format", async () => {
  const invoiceId = "ARC-APPKIT-2026-001";
  const expected = `0x${createHash("sha256").update(invoiceId).digest("hex")}`;

  assert.equal(await createBrowserMemoId(invoiceId), expected);
});

test("buildAuditRecord links the approved decision to the transaction", async () => {
  const record = await buildAuditRecord({
    account: "0x8b615E587C9636db67Dd93f4982116ce053EabDD",
    policyResult,
    sendResult: {
      state: "success",
      txHash: "0xabc",
      explorerUrl: "https://testnet.arcscan.app/tx/0xabc",
    },
  });

  assert.equal(record.sender, "0x8b615e587c9636db67dd93f4982116ce053eabdd");
  assert.equal(record.recipient, policyResult.request.recipient);
  assert.equal(record.amountUSDC, 0.01);
  assert.equal(record.memoScope, "Offchain reconciliation identifier; not attached through Arc Memo.");
});

test("classifyPaymentError distinguishes wallet rejection and balance failure", () => {
  assert.equal(classifyPaymentError({ code: 4001 }).kind, "user-rejected");
  assert.equal(classifyPaymentError(new Error("insufficient funds")).kind, "insufficient-balance");
});

test("execution guard blocks duplicate sends until released", () => {
  const guard = createExecutionGuard();

  assert.equal(guard.begin(), true);
  assert.equal(guard.begin(), false);
  assert.equal(guard.isInFlight(), true);
  guard.end();
  assert.equal(guard.begin(), true);
});
