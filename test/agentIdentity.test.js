import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { encodeEventTopics } from "viem";
import {
  AGENT_METADATA_URI,
  ARC_CHAIN_ID,
  EXPECTED_ACCOUNT,
  IDENTITY_REGISTRY,
} from "../src/browser/arcConfig.js";
import {
  ZERO_ADDRESS,
  buildIdentityEvidence,
  buildRegistrationRequest,
  classifyIdentityError,
  createIdentityExecutionGuard,
  identityRegistryAbi,
  parseRegisteredAgentId,
  validateAgentMetadataUri,
} from "../src/browser/agentIdentity.js";

test("Arc config locks the official identity registry and expected wallet", () => {
  assert.equal(ARC_CHAIN_ID, 5_042_002);
  assert.equal(IDENTITY_REGISTRY, "0x8004A818BFB912233c491871b3d84c89A494BD9e");
  assert.equal(EXPECTED_ACCOUNT, "0x8b615e587c9636db67dd93f4982116ce053eabdd");
});

test("public agent metadata is valid and identifies AgentTreasury Lite", async () => {
  const metadata = JSON.parse(await readFile(new URL("../agent-metadata.json", import.meta.url)));
  assert.equal(metadata.name, "AgentTreasury Lite");
  assert.equal(metadata.chain_id, 5_042_002);
  assert.equal(metadata.operator.toLowerCase(), EXPECTED_ACCOUNT);
  assert.ok(metadata.capabilities.includes("policy_gated_payments"));
});

test("metadata URI validation accepts HTTPS and rejects unsafe inputs", () => {
  assert.equal(validateAgentMetadataUri(AGENT_METADATA_URI), AGENT_METADATA_URI);
  assert.throws(() => validateAgentMetadataUri(""), /valid HTTPS/);
  assert.throws(() => validateAgentMetadataUri("ipfs://example"), /must use HTTPS/);
  assert.throws(() => validateAgentMetadataUri("http://example.com/agent.json"), /must use HTTPS/);
});

test("registration request targets register(string) on the official registry", () => {
  assert.deepEqual(buildRegistrationRequest(EXPECTED_ACCOUNT), {
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "register",
    args: [AGENT_METADATA_URI],
    account: EXPECTED_ACCOUNT,
  });
});

function transferLog({ address = IDENTITY_REGISTRY, to = EXPECTED_ACCOUNT, tokenId = 42n } = {}) {
  return {
    address,
    data: "0x",
    topics: encodeEventTopics({
      abi: identityRegistryAbi,
      eventName: "Transfer",
      args: { from: ZERO_ADDRESS, to, tokenId },
    }),
  };
}

test("receipt parser returns the registry-minted agent ID", () => {
  assert.equal(
    parseRegisteredAgentId({ logs: [transferLog({ tokenId: 42n })] }, EXPECTED_ACCOUNT),
    42n,
  );
});

test("receipt parser ignores unrelated contracts and recipients", () => {
  assert.throws(
    () =>
      parseRegisteredAgentId(
        {
          logs: [
            transferLog({ address: "0x1111111111111111111111111111111111111111" }),
            transferLog({ to: "0x2222222222222222222222222222222222222222" }),
          ],
        },
        EXPECTED_ACCOUNT,
      ),
    /expected agent identity mint/,
  );
});

test("identity evidence contains independently verifiable values", () => {
  const evidence = buildIdentityEvidence({
    account: EXPECTED_ACCOUNT,
    agentId: 42n,
    transactionHash: "0xabc",
    confirmedAt: "2026-07-20T00:00:00.000Z",
  });

  assert.equal(evidence.standard, "ERC-8004");
  assert.equal(evidence.registry, IDENTITY_REGISTRY);
  assert.equal(evidence.agentId, "42");
  assert.equal(evidence.explorerUrl, "https://testnet.arcscan.app/tx/0xabc");
});

test("identity error classification and guard handle safe retries", () => {
  assert.equal(classifyIdentityError({ code: 4001 }).kind, "user-rejected");
  assert.equal(classifyIdentityError(new Error("insufficient funds")).kind, "insufficient-balance");
  assert.equal(classifyIdentityError(new Error("execution reverted")).kind, "transaction-failed");

  const guard = createIdentityExecutionGuard();
  assert.equal(guard.begin(), true);
  assert.equal(guard.begin(), false);
  guard.end();
  assert.equal(guard.begin(), true);
});
