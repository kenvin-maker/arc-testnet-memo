export const EXPECTED_ACCOUNT = "0x8b615e587c9636db67dd93f4982116ce053eabdd";
export const AUXILIARY_WALLET = "0x9240e82aE80D70875BA854F480ba412b410cd54a";

const TESTNET_NETWORK = Object.freeze({
  key: "testnet",
  name: "Arc Testnet",
  chainId: 5_042_002,
  chainHex: "0x4ce032",
  rpc: "https://rpc.testnet.arc.network",
  explorer: "https://testnet.arcscan.app",
  explorerTx: "https://testnet.arcscan.app/tx/",
  appKitChain: "Arc_Testnet",
  usdcAddress: "0x3600000000000000000000000000000000000000",
  identity: Object.freeze({
    enabled: true,
    registry: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
  }),
});

const MAINNET_NETWORK = Object.freeze({
  key: "mainnet",
  name: "Arc Mainnet",
  chainId: 5_042,
  chainHex: "0x13b2",
  rpc: "https://rpc.mainnet.arc.io/",
  explorer: "https://explorer.arc.io",
  explorerTx: "https://explorer.arc.io/tx/",
  appKitChain: "Arc",
  usdcAddress: "0x3600000000000000000000000000000000000000",
  identity: Object.freeze({
    enabled: false,
    registry: null,
  }),
});

export const ARC_NETWORKS = Object.freeze({
  testnet: TESTNET_NETWORK,
  mainnet: MAINNET_NETWORK,
});

export function resolveArcNetwork(value = import.meta.env?.VITE_ARC_NETWORK ?? "testnet") {
  const key = String(value).trim().toLowerCase();
  const network = ARC_NETWORKS[key];
  if (!network) {
    throw new Error(`Unsupported Arc network "${value}". Use "testnet" or "mainnet".`);
  }
  return network;
}

export const ACTIVE_ARC_NETWORK = resolveArcNetwork();
export const TESTNET_ARC_NETWORK = TESTNET_NETWORK;

// Backward-compatible Testnet evidence constants. These are intentionally not active-network aliases.
export const ARC_CHAIN_ID = TESTNET_NETWORK.chainId;
export const ARC_CHAIN_HEX = TESTNET_NETWORK.chainHex;
export const ARC_RPC = TESTNET_NETWORK.rpc;
export const ARC_EXPLORER = TESTNET_NETWORK.explorer;
export const ARC_EXPLORER_TX = TESTNET_NETWORK.explorerTx;
export const USDC_ADDRESS = TESTNET_NETWORK.usdcAddress;
export const IDENTITY_REGISTRY = TESTNET_NETWORK.identity.registry;
export const AGENT_METADATA_URI =
  "https://raw.githubusercontent.com/kenvin-maker/arc-testnet-memo/main/agent-metadata.json";
export const CONFIRMED_AGENT_ID = "851421";
export const CONFIRMED_IDENTITY_TX =
  "0xe8b29a7fe6150281e0917caea39c9cfc6d943d5904580a3cd74332209e93e490";
export const CONFIRMED_IDENTITY_AT = "2026-07-19T19:07:12.000Z";
