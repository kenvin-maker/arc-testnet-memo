import { decodeEventLog } from "viem";
import {
  AGENT_METADATA_URI,
  ARC_CHAIN_ID,
  ARC_EXPLORER,
  IDENTITY_REGISTRY,
} from "./arcConfig.js";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const identityRegistryAbi = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "metadataURI", type: "string" }],
    outputs: [],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "Transfer",
    type: "event",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
];

export function validateAgentMetadataUri(uri) {
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error("Agent metadata URI must be a valid HTTPS URL.");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Agent metadata URI must use HTTPS.");
  }
  return parsed.toString();
}

export function buildRegistrationRequest(account, metadataUri = AGENT_METADATA_URI) {
  return {
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "register",
    args: [validateAgentMetadataUri(metadataUri)],
    account,
  };
}

export function parseRegisteredAgentId(receipt, expectedAccount) {
  const expected = expectedAccount.toLowerCase();

  for (const log of receipt.logs ?? []) {
    if (log.address?.toLowerCase() !== IDENTITY_REGISTRY.toLowerCase()) continue;

    try {
      const decoded = decodeEventLog({
        abi: identityRegistryAbi,
        eventName: "Transfer",
        data: log.data,
        topics: log.topics,
        strict: true,
      });
      const { from, to, tokenId } = decoded.args;
      if (
        from.toLowerCase() === ZERO_ADDRESS &&
        to.toLowerCase() === expected &&
        typeof tokenId === "bigint"
      ) {
        return tokenId;
      }
    } catch {
      // Ignore unrelated or malformed registry logs.
    }
  }

  throw new Error("The confirmed receipt did not contain the expected agent identity mint.");
}

export function buildIdentityEvidence({
  account,
  agentId,
  metadataUri = AGENT_METADATA_URI,
  transactionHash,
  confirmedAt = new Date().toISOString(),
}) {
  return {
    project: "AgentTreasury Lite",
    standard: "ERC-8004",
    chainId: ARC_CHAIN_ID,
    network: "Arc Testnet",
    registry: IDENTITY_REGISTRY,
    registrant: account.toLowerCase(),
    agentId: agentId.toString(),
    agentURI: validateAgentMetadataUri(metadataUri),
    transactionHash,
    explorerUrl: `${ARC_EXPLORER}/tx/${transactionHash}`,
    confirmedAt,
  };
}

export function classifyIdentityError(error) {
  const code =
    error && typeof error === "object" && "code" in error ? Number(error.code) : undefined;
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();

  if (code === 4001 || lower.includes("user rejected") || lower.includes("user denied")) {
    return { kind: "user-rejected", message: "MetaMask registration was rejected. Nothing was registered." };
  }
  if (lower.includes("insufficient funds")) {
    return { kind: "insufficient-balance", message: "The wallet has insufficient Arc Testnet gas balance." };
  }
  if (lower.includes("timed out") || lower.includes("timeout")) {
    return { kind: "timeout", message: "Receipt confirmation timed out. Check ArcScan before retrying." };
  }
  if (lower.includes("revert") || lower.includes("failed")) {
    return { kind: "transaction-failed", message: "The ERC-8004 registration failed or reverted." };
  }
  return { kind: "unknown", message: message || "ERC-8004 registration failed." };
}

export function createIdentityExecutionGuard() {
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
