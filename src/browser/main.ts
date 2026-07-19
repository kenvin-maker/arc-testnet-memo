import "./polyfills";
import { AppKit } from "@circle-fin/app-kit";
import { ArcTestnet } from "@circle-fin/app-kit/chains";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatUnits,
  http,
  type Abi,
  type EIP1193Provider,
} from "viem";
import { BROWSER_DEMO_POLICY, evaluatePolicy } from "../policy.js";
import {
  buildAuditRecord,
  buildSendParams,
  classifyPaymentError,
  createExecutionGuard,
  normalizeSendResult,
} from "./paymentFlow.js";
import {
  AGENT_METADATA_URI,
  ARC_CHAIN_HEX,
  ARC_CHAIN_ID,
  ARC_EXPLORER,
  ARC_RPC,
  AUXILIARY_WALLET,
  EXPECTED_ACCOUNT,
  IDENTITY_REGISTRY,
  USDC_ADDRESS,
} from "./arcConfig.js";
import {
  buildIdentityEvidence,
  buildRegistrationRequest,
  classifyIdentityError,
  createIdentityExecutionGuard,
  identityRegistryAbi,
  parseRegisteredAgentId,
  validateAgentMetadataUri,
} from "./agentIdentity.js";
import "./styles.css";

const arcViemChain = defineChain({
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC] } },
  blockExplorers: {
    default: { name: "ArcScan", url: ARC_EXPLORER },
  },
  testnet: true,
});

const erc20BalanceAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
] as const;

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

type PolicyResult = ReturnType<typeof evaluatePolicy>;
type WalletState = {
  account: `0x${string}`;
  spendableUSDC: number;
  nativeGasUSDC: number;
  adapter: unknown;
};

const kit = new AppKit();
const guard = createExecutionGuard();
const identityGuard = createIdentityExecutionGuard();
const publicClient = createPublicClient({ chain: arcViemChain, transport: http(ARC_RPC) });
let walletState: WalletState | null = null;
let currentDecision: PolicyResult | null = null;
let currentAuditRecord: Record<string, unknown> | null = null;
let currentIdentityEvidence: Record<string, unknown> | null = null;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Application root was not found.");

app.innerHTML = `
  <main class="shell">
    <header class="hero">
      <div class="brand-lockup">
        <div class="mark" aria-hidden="true">A</div>
        <div>
          <p class="eyebrow">ARC TESTNET · CIRCLE APP KIT</p>
          <h1>AgentTreasury <span>Lite</span></h1>
        </div>
      </div>
      <p class="hero-copy">
        Policy-gated USDC settlement for agent wallets. Every payment is evaluated
        before MetaMask can authorize execution.
      </p>
      <div class="flow-strip" aria-label="Agent payment flow">
        <span>Request</span><i>→</i><span>Decide</span><i>→</i><span>Authorize</span><i>→</i><span>Settle</span>
      </div>
    </header>

    <section class="status-card" aria-labelledby="wallet-title">
      <div>
        <p class="section-kicker">01 · WALLET</p>
        <h2 id="wallet-title">Execution boundary</h2>
      </div>
      <button id="connect-wallet" class="button primary" type="button">Connect MetaMask</button>
      <div class="status-grid">
        <div><span>Status</span><strong id="wallet-status">Disconnected</strong></div>
        <div><span>Network</span><strong id="network-status">Arc Testnet required</strong></div>
        <div><span>Account</span><strong id="account-status">—</strong></div>
        <div><span>Spendable USDC</span><strong id="usdc-balance">—</strong></div>
        <div><span>Native gas balance</span><strong id="gas-balance">—</strong></div>
      </div>
      <p id="wallet-message" class="message neutral">
        Private keys never leave MetaMask. You approve the final transaction.
      </p>
    </section>

    <div class="workspace">
      <section class="panel request-panel" aria-labelledby="request-title">
        <p class="section-kicker">02 · REQUEST</p>
        <h2 id="request-title">Payment request</h2>
        <form id="payment-form">
          <label>
            Recipient
            <input id="recipient" name="recipient" value="${AUXILIARY_WALLET}" autocomplete="off" spellcheck="false" />
          </label>
          <div class="field-row">
            <label>
              Amount
              <div class="input-unit">
                <input id="amount" name="amount" type="number" value="0.01" min="0.000001" step="0.000001" />
                <span>USDC</span>
              </div>
            </label>
            <label>
              Invoice ID
              <input id="invoice" name="invoice" value="ARC-APPKIT-2026-0718-001" autocomplete="off" />
            </label>
          </div>
        </form>
        <div class="policy-box">
          <span>POLICY</span>
          <ul>
            <li>Allowlisted recipient only</li>
            <li>Maximum 0.05 USDC</li>
            <li>Keep at least 0.05 USDC</li>
            <li>Invoice ID required</li>
          </ul>
        </div>
      </section>

      <section class="panel decision-panel" aria-labelledby="decision-title">
        <p class="section-kicker">03 · DECISION</p>
        <div class="decision-heading">
          <h2 id="decision-title">Agent evaluation</h2>
          <span id="decision-badge" class="badge waiting">WAITING</span>
        </div>
        <p id="decision-summary" class="decision-summary">
          Connect the expected wallet to evaluate this payment against live balances.
        </p>
        <ul id="decision-reasons" class="reason-list"></ul>
        <dl class="preview">
          <div><dt>Recipient</dt><dd id="preview-recipient">—</dd></div>
          <div><dt>Amount</dt><dd id="preview-amount">—</dd></div>
          <div><dt>Balance after</dt><dd id="preview-remaining">—</dd></div>
        </dl>
      </section>
    </div>

    <section class="status-card execution-card" aria-labelledby="execution-title">
      <div>
        <p class="section-kicker">04 · EXECUTION</p>
        <h2 id="execution-title">App Kit Send</h2>
      </div>
      <button id="execute-payment" class="button execute" type="button" disabled>
        Execute with MetaMask
      </button>
      <div class="execution-meta">
        <div><span>SDK</span><strong>Circle App Kit Send</strong></div>
        <div><span>Token</span><strong>USDC</strong></div>
        <div><span>Estimated fee</span><strong id="estimated-fee">Not estimated</strong></div>
      </div>
      <p id="execution-message" class="message neutral">
        Execution unlocks only after an approved agent decision.
      </p>
    </section>

    <section id="evidence-card" class="evidence-card hidden" aria-labelledby="evidence-title">
      <div>
        <p class="section-kicker">05 · EVIDENCE</p>
        <h2 id="evidence-title">Settlement confirmed</h2>
      </div>
      <a id="explorer-link" class="button outline" target="_blank" rel="noreferrer">View on ArcScan</a>
      <pre id="audit-record"></pre>
      <button id="copy-audit" class="text-button" type="button">Copy audit JSON</button>
    </section>

    <section class="status-card identity-card" aria-labelledby="identity-title">
      <div>
        <p class="section-kicker">06 · AGENT IDENTITY</p>
        <h2 id="identity-title">ERC-8004 onchain identity</h2>
      </div>
      <button id="register-identity" class="button execute" type="button" disabled>
        Register Agent Identity
      </button>
      <div class="identity-meta">
        <div><span>Standard</span><strong>ERC-8004</strong></div>
        <div><span>Network</span><strong>Arc Testnet</strong></div>
        <div><span>Identity Registry</span><strong>${IDENTITY_REGISTRY}</strong></div>
      </div>
      <p class="identity-uri">
        Public metadata:
        <a id="metadata-link" href="${AGENT_METADATA_URI}" target="_blank" rel="noreferrer">
          ${AGENT_METADATA_URI}
        </a>
      </p>
      <p id="identity-message" class="message neutral">
        Connect the expected wallet to prepare one human-authorized identity registration.
      </p>
      <div id="identity-evidence" class="identity-evidence hidden">
        <div class="identity-result">
          <span>Agent ID</span>
          <strong id="identity-agent-id">—</strong>
        </div>
        <a id="identity-explorer-link" class="button outline" target="_blank" rel="noreferrer">
          View registration on ArcScan
        </a>
        <pre id="identity-record"></pre>
        <button id="copy-identity" class="text-button" type="button">Copy identity JSON</button>
      </div>
    </section>

    <footer>
      <span>AgentTreasury Lite</span>
      <span>Human-authorized · Policy-controlled · Arc-settled</span>
    </footer>
  </main>
`;

const byId = <T extends HTMLElement>(id: string) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing interface element: ${id}`);
  return element as T;
};

const connectButton = byId<HTMLButtonElement>("connect-wallet");
const executeButton = byId<HTMLButtonElement>("execute-payment");
const recipientInput = byId<HTMLInputElement>("recipient");
const amountInput = byId<HTMLInputElement>("amount");
const invoiceInput = byId<HTMLInputElement>("invoice");
const walletMessage = byId<HTMLParagraphElement>("wallet-message");
const executionMessage = byId<HTMLParagraphElement>("execution-message");
const evidenceCard = byId<HTMLElement>("evidence-card");
const registerIdentityButton = byId<HTMLButtonElement>("register-identity");
const identityMessage = byId<HTMLParagraphElement>("identity-message");
const identityEvidence = byId<HTMLElement>("identity-evidence");

function setMessage(element: HTMLElement, text: string, tone: "neutral" | "good" | "bad" | "busy") {
  element.textContent = text;
  element.className = `message ${tone}`;
}

function shortenAddress(address: string) {
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function setExecutionEnabled(enabled: boolean) {
  executeButton.disabled = !enabled || guard.isInFlight();
}

function renderIdentityReadiness() {
  const ready =
    Boolean(walletState) &&
    (walletState?.nativeGasUSDC ?? 0) > 0 &&
    !identityGuard.isInFlight() &&
    !currentIdentityEvidence;
  registerIdentityButton.disabled = !ready;

  if (currentIdentityEvidence) return;
  if (!walletState) {
    setMessage(
      identityMessage,
      "Connect the expected wallet to prepare one human-authorized identity registration.",
      "neutral",
    );
  } else if (walletState.nativeGasUSDC <= 0) {
    setMessage(
      identityMessage,
      "The connected wallet needs Arc Testnet gas balance before registration.",
      "bad",
    );
  } else {
    setMessage(
      identityMessage,
      "Ready. Review the registry and metadata URI, then register once with MetaMask.",
      "good",
    );
  }
}

function renderDecision() {
  const badge = byId<HTMLSpanElement>("decision-badge");
  const summary = byId<HTMLParagraphElement>("decision-summary");
  const reasons = byId<HTMLUListElement>("decision-reasons");
  reasons.replaceChildren();

  if (!walletState) {
    currentDecision = null;
    badge.textContent = "WAITING";
    badge.className = "badge waiting";
    summary.textContent = "Connect the expected wallet to evaluate this payment against live balances.";
    setExecutionEnabled(false);
    renderIdentityReadiness();
    return;
  }

  try {
    currentDecision = evaluatePolicy(
      {
        recipient: recipientInput.value.trim(),
        amountUSDC: Number(amountInput.value),
        invoiceId: invoiceInput.value,
        walletBalanceUSDC: walletState.spendableUSDC,
      },
      BROWSER_DEMO_POLICY,
    );

    const approved = currentDecision.decision === "APPROVED";
    badge.textContent = currentDecision.decision;
    badge.className = `badge ${approved ? "approved" : "rejected"}`;
    summary.textContent = approved
      ? "The agent approves this request. Review the settlement preview before execution."
      : "The agent rejected this request. Execution remains locked.";

    for (const reason of currentDecision.reasons) {
      const item = document.createElement("li");
      item.textContent = reason;
      reasons.append(item);
    }

    byId("preview-recipient").textContent = shortenAddress(currentDecision.request.recipient);
    byId("preview-amount").textContent = `${currentDecision.request.amountUSDC.toFixed(6)} USDC`;
    byId("preview-remaining").textContent =
      `${currentDecision.remainingBalanceUSDC.toFixed(6)} USDC`;
    setExecutionEnabled(approved && walletState.nativeGasUSDC > 0);
    renderIdentityReadiness();
  } catch (error) {
    currentDecision = null;
    badge.textContent = "INVALID";
    badge.className = "badge rejected";
    summary.textContent = error instanceof Error ? error.message : "The request is invalid.";
    setExecutionEnabled(false);
    renderIdentityReadiness();
  }
}

async function ensureArcNetwork(provider: EIP1193Provider) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (String(chainId).toLowerCase() === ARC_CHAIN_HEX.toLowerCase()) return;

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_CHAIN_HEX }],
    });
  } catch (error) {
    const code = error && typeof error === "object" ? (error as { code?: number }).code : undefined;
    if (code !== 4902) throw error;

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: ARC_CHAIN_HEX,
          chainName: "Arc Testnet",
          nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
          rpcUrls: [ARC_RPC],
          blockExplorerUrls: ["https://testnet.arcscan.app"],
        },
      ],
    });
  }
}

async function readWalletBalances(account: `0x${string}`) {
  const [nativeBalance, tokenBalance] = await Promise.all([
    publicClient.getBalance({ address: account }),
    publicClient.readContract({
      address: USDC_ADDRESS,
      abi: erc20BalanceAbi,
      functionName: "balanceOf",
      args: [account],
    }),
  ]);

  return {
    nativeGasUSDC: Number(formatUnits(nativeBalance, 18)),
    spendableUSDC: Number(formatUnits(tokenBalance, 6)),
  };
}

async function connectWallet() {
  const provider = window.ethereum;
  if (!provider) {
    setMessage(walletMessage, "MetaMask was not detected in this browser.", "bad");
    return;
  }

  connectButton.disabled = true;
  setMessage(walletMessage, "Connecting to MetaMask and checking Arc Testnet…", "busy");

  try {
    const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
    const account = accounts[0]?.toLowerCase() as `0x${string}` | undefined;
    if (!account) throw new Error("MetaMask did not return an account.");
    if (account !== EXPECTED_ACCOUNT) {
      throw new Error(
        `Wrong account connected. Select ${shortenAddress(EXPECTED_ACCOUNT)} in MetaMask.`,
      );
    }

    await ensureArcNetwork(provider);
    const chainId = await provider.request({ method: "eth_chainId" });
    if (String(chainId).toLowerCase() !== ARC_CHAIN_HEX.toLowerCase()) {
      throw new Error("MetaMask is not connected to Arc Testnet.");
    }

    const balances = await readWalletBalances(account);
    const adapter = await createViemAdapterFromProvider({
      provider,
      capabilities: {
        addressContext: "user-controlled",
        supportedChains: [ArcTestnet],
      },
    });

    walletState = { account, adapter, ...balances };
    byId("wallet-status").textContent = "Connected";
    byId("network-status").textContent = "Arc Testnet · 5042002";
    byId("account-status").textContent = shortenAddress(account);
    byId("usdc-balance").textContent = `${balances.spendableUSDC.toFixed(6)} USDC`;
    byId("gas-balance").textContent = `${balances.nativeGasUSDC.toFixed(6)} USDC`;
    connectButton.textContent = "Refresh wallet";
    setMessage(
      walletMessage,
      balances.spendableUSDC >= 0.06
        ? "Expected wallet verified. Live balances loaded from Arc Testnet."
        : "Wallet connected, but the policy requires at least 0.06 spendable USDC.",
      balances.spendableUSDC >= 0.06 ? "good" : "bad",
    );
    renderDecision();
  } catch (error) {
    walletState = null;
    renderDecision();
    const classified = classifyPaymentError(error);
    setMessage(
      walletMessage,
      error instanceof Error && !["user-rejected", "transaction-failed"].includes(classified.kind)
        ? error.message
        : classified.message,
      "bad",
    );
  } finally {
    connectButton.disabled = false;
  }
}

async function executePayment() {
  if (!walletState || !currentDecision || currentDecision.decision !== "APPROVED") return;
  if (!guard.begin()) return;

  setExecutionEnabled(false);
  currentAuditRecord = null;
  evidenceCard.classList.add("hidden");

  try {
    const params = buildSendParams(
      walletState.adapter,
      currentDecision,
    ) as Parameters<AppKit["send"]>[0];
    setMessage(executionMessage, "Estimating the App Kit Send transaction…", "busy");
    const estimate = await kit.estimateSend(params);
    byId("estimated-fee").textContent = `${Number(formatUnits(BigInt(estimate.fee), 18)).toFixed(6)} USDC`;

    setMessage(
      executionMessage,
      "Review and confirm the 0.01 USDC payment in MetaMask. Nothing is signed automatically.",
      "busy",
    );
    const result = await kit.send(params);
    const normalized = normalizeSendResult(result);
    currentAuditRecord = await buildAuditRecord({
      account: walletState.account,
      policyResult: currentDecision,
      sendResult: result,
    });

    byId<HTMLAnchorElement>("explorer-link").href = normalized.explorerUrl;
    byId("audit-record").textContent = JSON.stringify(currentAuditRecord, null, 2);
    evidenceCard.classList.remove("hidden");
    setMessage(executionMessage, "App Kit Send confirmed on Arc Testnet.", "good");
  } catch (error) {
    const classified = classifyPaymentError(error);
    setMessage(executionMessage, classified.message, "bad");
  } finally {
    guard.end();
    renderDecision();
  }
}

async function registerAgentIdentity() {
  const provider = window.ethereum;
  if (!provider || !walletState || !identityGuard.begin()) return;

  currentIdentityEvidence = null;
  identityEvidence.classList.add("hidden");
  renderIdentityReadiness();

  try {
    const metadataUri = validateAgentMetadataUri(AGENT_METADATA_URI);
    const walletClient = createWalletClient({
      account: walletState.account,
      chain: arcViemChain,
      transport: custom(provider),
    });
    const registration = buildRegistrationRequest(walletState.account, metadataUri);

    setMessage(identityMessage, "Simulating the official ERC-8004 registration…", "busy");
    const { request } = await publicClient.simulateContract({
      ...registration,
      address: registration.address as `0x${string}`,
      abi: registration.abi as Abi,
    });

    setMessage(
      identityMessage,
      "Review and confirm the Identity Registry interaction in MetaMask.",
      "busy",
    );
    const transactionHash = await walletClient.writeContract(request);

    setMessage(identityMessage, "Registration submitted. Waiting for Arc confirmation…", "busy");
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: transactionHash,
      confirmations: 1,
      timeout: 120_000,
    });
    if (receipt.status !== "success") {
      throw new Error("ERC-8004 registration transaction failed.");
    }

    const agentId = parseRegisteredAgentId(receipt, walletState.account);
    const [owner, tokenUri] = await Promise.all([
      publicClient.readContract({
        address: IDENTITY_REGISTRY,
        abi: identityRegistryAbi,
        functionName: "ownerOf",
        args: [agentId],
      }),
      publicClient.readContract({
        address: IDENTITY_REGISTRY,
        abi: identityRegistryAbi,
        functionName: "tokenURI",
        args: [agentId],
      }),
    ]);
    if (String(owner).toLowerCase() !== walletState.account.toLowerCase()) {
      throw new Error("The minted agent identity owner does not match the connected wallet.");
    }
    if (String(tokenUri) !== metadataUri) {
      throw new Error("The registered agent metadata URI does not match the reviewed URI.");
    }

    currentIdentityEvidence = buildIdentityEvidence({
      account: walletState.account,
      agentId,
      metadataUri,
      transactionHash,
    });
    byId("identity-agent-id").textContent = agentId.toString();
    byId<HTMLAnchorElement>("identity-explorer-link").href =
      `${ARC_EXPLORER}/tx/${transactionHash}`;
    byId("identity-record").textContent = JSON.stringify(currentIdentityEvidence, null, 2);
    identityEvidence.classList.remove("hidden");
    setMessage(
      identityMessage,
      `Agent identity #${agentId.toString()} confirmed on Arc Testnet.`,
      "good",
    );
  } catch (error) {
    const classified = classifyIdentityError(error);
    setMessage(identityMessage, classified.message, "bad");
  } finally {
    identityGuard.end();
    renderIdentityReadiness();
  }
}

connectButton.addEventListener("click", connectWallet);
executeButton.addEventListener("click", executePayment);
registerIdentityButton.addEventListener("click", registerAgentIdentity);
for (const input of [recipientInput, amountInput, invoiceInput]) {
  input.addEventListener("input", renderDecision);
}

byId("copy-audit").addEventListener("click", async () => {
  if (!currentAuditRecord) return;
  await navigator.clipboard.writeText(JSON.stringify(currentAuditRecord, null, 2));
  byId("copy-audit").textContent = "Copied";
});

byId("copy-identity").addEventListener("click", async () => {
  if (!currentIdentityEvidence) return;
  await navigator.clipboard.writeText(JSON.stringify(currentIdentityEvidence, null, 2));
  byId("copy-identity").textContent = "Copied";
});

window.ethereum?.on?.("accountsChanged", () => {
  walletState = null;
  currentDecision = null;
  setMessage(walletMessage, "Wallet account changed. Reconnect to verify the expected account.", "neutral");
  renderDecision();
});

window.ethereum?.on?.("chainChanged", () => {
  walletState = null;
  currentDecision = null;
  setMessage(walletMessage, "Wallet network changed. Reconnect to verify Arc Testnet.", "neutral");
  renderDecision();
});
