# AgentTreasury Lite ERC-8004 Agent Identity Design

Date: 2026-07-20

## Goal

Add a focused Arc Testnet identity-registration milestone to AgentTreasury Lite. The
existing main MetaMask wallet will register the project as an ERC-8004 agent through
Arc's official Identity Registry, producing a public agent ID and independently
verifiable transaction evidence.

This phase registers identity only. Reputation and validation interactions remain
out of scope until the identity registration is confirmed and documented.

## Success Criteria

- Use the existing main wallet:
  `0x8b615E587C9636db67Dd93f4982116ce053EabDD`.
- Operate only on Arc Testnet, chain ID `5042002`.
- Register through the official Arc Testnet ERC-8004 Identity Registry:
  `0x8004A818BFB912233c491871b3d84c89A494BD9e`.
- Publish reviewer-readable agent metadata in the public GitHub repository.
- Use the public GitHub Raw URL as the registration URI.
- Require an explicit MetaMask confirmation for the registration transaction.
- Display the confirmed transaction hash, ArcScan link, agent ID, registry address,
  and metadata URI.
- Add automated tests for registration input, state handling, and receipt parsing.
- Preserve the existing policy-gated App Kit Send and CLI workflows.
- Record the confirmed identity and transaction evidence in `README.md`.

## Chosen Approach

Extend the existing Vite browser application with a separate **Agent Identity**
section. A small ERC-8004 module will use Viem and the already connected injected
MetaMask provider to call:

```solidity
register(string agentURI)
```

The default URI will be:

`https://raw.githubusercontent.com/kenvin-maker/arc-testnet-memo/main/agent-metadata.json`

The user can inspect this URI before execution but will not need to type it during
the normal demo. The browser will submit one contract write only after the user
presses the registration button and confirms it in MetaMask.

### Rejected Alternatives

1. A standalone registration page would isolate the feature, but it would fragment
   the AgentTreasury Lite demonstration and duplicate wallet/network handling.
2. A command-line private-key script would be smaller, but it would violate the
   project's human-controlled signing boundary.
3. Circle Developer-Controlled Wallets would follow the full official quickstart,
   but require an API key, Entity Secret, and additional wallet setup that do not
   improve this identity-only milestone.

## Architecture

### Public Agent Metadata

Add `agent-metadata.json` at the repository root. It will identify:

- agent name: `AgentTreasury Lite`
- project description
- the public GitHub repository
- the public demo video
- the Arc network and treasury/payment purpose
- the main wallet as the operator-controlled registration account

The file must contain only public project information. It must not contain private
keys, seed phrases, access tokens, personal contact details, or claims that have not
been demonstrated.

The main-branch Raw URL is intentionally used instead of IPFS for this milestone:
it is free, immediately accessible to reviewers, and requires no new account or
pinning service. The interface will display the exact URI before registration so
the mutable hosting choice is transparent.

### ERC-8004 Registration Module

Create a focused browser-safe module that owns:

- the Identity Registry address
- the minimal `register(string)` ABI
- the ERC-721 `Transfer` event ABI needed to identify the minted agent token
- registration argument construction
- receipt-log parsing for the new agent ID
- deterministic ArcScan links
- user-facing classification of registration errors

The module will not own DOM rendering or wallet connection. It will accept typed
inputs and return typed registration evidence so it can be tested independently.

### Browser Interface

Add an Agent Identity card after the existing payment evidence area. It contains:

- registry and network labels
- metadata URI with an external review link
- current state and explanatory message
- a `Register Agent Identity` action
- confirmed agent ID, transaction hash, ArcScan link, and copyable evidence JSON

The action remains disabled unless:

- the expected main wallet is connected
- the wallet is on Arc Testnet
- a non-empty HTTPS metadata URI is configured
- no registration transaction is already in flight

Refreshing the page does not automatically send or repeat a registration.

### Wallet Adapter

Reuse `window.ethereum` and the existing expected-account and Arc-network checks.
Create a Viem wallet client from the injected provider for the registry write. The
application reads public registry state and transaction receipts without a wallet
confirmation, but it must never sign automatically or handle an exported private
key.

Create a small browser configuration module for the existing Arc chain, RPC,
explorer, expected account, and the new Identity Registry constants. Both payment
and identity sections consume these constants so the values cannot drift. No
unrelated refactoring is included.

## Data Flow

1. The user connects the expected MetaMask account.
2. The existing connection flow verifies Arc Testnet.
3. The identity card presents the registry address and GitHub Raw metadata URI.
4. The user reviews the public metadata link.
5. The user presses `Register Agent Identity`.
6. The module validates the metadata URI and prevents duplicate in-flight execution.
7. The public client simulates `register(string)` and passes the resulting request
   to the wallet client.
8. MetaMask presents the contract interaction for explicit confirmation.
9. The user confirms or rejects the request.
10. On confirmation, the browser waits for the Arc Testnet transaction receipt.
11. The module verifies a successful receipt and parses the Identity Registry's
    ERC-721 mint `Transfer` log to obtain the agent ID.
12. The page displays the agent ID, transaction hash, registry, URI, wallet, chain
    ID, timestamp, and ArcScan link as evidence.
13. After independent explorer verification, the confirmed values are added to the
    README in a separate commit.

## State and Error Handling

The identity feature uses these visible states:

- disconnected
- wrong account
- wrong network
- ready
- simulating
- awaiting wallet
- pending
- confirmed
- rejected
- failed

Errors must distinguish:

- MetaMask unavailable
- unexpected connected account
- wrong network
- invalid or empty metadata URI
- contract simulation or estimation failure
- insufficient Arc Testnet gas balance
- user-rejected signature
- reverted or failed transaction
- receipt timeout
- successful receipt without a parsable registry mint event

No failure triggers an automatic retry. If the receipt succeeds but its mint event
cannot be parsed, the transaction hash is still displayed, but the feature is not
reported as fully confirmed until the agent ID is independently recovered.

## Duplicate-Registration Safety

The application disables the registration action while a transaction is in flight.
After a successful registration in the current session, the action stays disabled
and the confirmed evidence remains visible.

Because local browser state is not authoritative, the interface will also allow a
known confirmed transaction and agent ID to be documented in project configuration
after the first registration. Once configured, the normal demo displays the
existing identity as confirmed instead of encouraging a second registration.
There is no automatic repeat registration on connection, refresh, or timeout.

## Evidence Record

The copyable evidence JSON contains:

- `project`
- `standard`
- `chainId`
- `network`
- `registry`
- `registrant`
- `agentId`
- `agentURI`
- `transactionHash`
- `explorerUrl`
- `confirmedAt`

The record is an offchain presentation of independently verifiable chain data. It
must not claim reputation scores, validation status, or autonomous signing.

## Testing

Automated tests cover:

- the exact official Arc Testnet registry address
- accepted HTTPS GitHub Raw metadata URI
- rejection of empty, malformed, or non-HTTPS metadata URIs
- correct `register` call arguments
- registration disabled without the expected account or correct chain
- duplicate in-flight execution prevention
- user-rejected transaction classification
- reverted transaction classification
- successful ERC-721 mint-log parsing
- rejection of logs emitted by an unrelated contract
- confirmed evidence-record construction

Verification also includes:

- all existing Node tests
- Vite TypeScript production build
- metadata JSON parsing
- local browser smoke test without signing
- one user-confirmed Arc Testnet registration
- ArcScan verification of status, wallet, registry, and transaction
- public retrieval of the GitHub Raw metadata URL

## Security and Claims

The implementation must never:

- request or store a seed phrase or private key
- send a contract write without a visible user action
- bypass MetaMask confirmation
- switch to mainnet
- retry a rejected or failed registration automatically
- claim an Arc airdrop allocation or guaranteed reward
- claim use of Reputation or Validation Registry before those phases exist

The milestone will be described as an official-standard-compatible Arc Testnet
agent identity registration, not as proof of future token eligibility.

## Out of Scope

- ERC-8004 Reputation Registry interactions
- ERC-8004 Validation Registry interactions
- Circle Developer-Controlled Wallets
- IPFS or dedicated metadata hosting
- mainnet deployment or transactions
- unattended or session-key signing
- multiple agent identities
- backend storage or indexers
- unrelated UI redesign

## Acceptance

The milestone is complete when:

1. The metadata file is public and its GitHub Raw URL returns valid JSON.
2. All existing and new tests pass.
3. The production build succeeds.
4. The browser connects only the expected wallet on Arc Testnet.
5. The user explicitly confirms one Identity Registry transaction in MetaMask.
6. The receipt succeeds and yields a registry-issued agent ID.
7. ArcScan and the browser evidence agree on the transaction, wallet, and registry.
8. The README accurately records the agent ID, metadata URI, and transaction link.
9. Subsequent demos show the confirmed identity without prompting an unnecessary
   second registration.
