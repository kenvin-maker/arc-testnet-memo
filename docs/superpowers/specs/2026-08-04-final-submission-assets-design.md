# AgentTreasury Lite Final Submission Assets — Design

## Goal

Prepare concise final-submission material that presents AgentTreasury Lite as a
continuing Arc builder project: a policy and evidence layer for agent-directed
USDC payments on Arc Testnet.

## Audience and success criteria

Primary audience: Encode, Arc, and Circle reviewers evaluating the final
submission and future follow-on opportunities. A reviewer should be able to
verify the public demo, repository, and real testnet evidence within three
minutes, while clearly distinguishing verified capabilities from planned
integrations.

## Deliverables

1. `docs/presentation/AgentTreasury-Lite-Final-Submission.pptx` — seven-slide
   Arc-inspired dark deck.
2. `docs/presentation/AgentTreasury-Lite-Final-Submission.pdf` — the same
   deck in a reviewer-friendly format.
3. `docs/presentation/AgentTreasury-Lite-3-Minute-Demo-Script.md` — a timed
   talk track and live-demo runbook.
4. README links to the final deck, PDF, script, live demo, code, and existing
   video demo.

## Slide structure

1. Title and one-line value proposition.
2. The autonomous-payment control problem.
3. Product flow: policy decision, explicit wallet authorization, settlement
   evidence, and audit record.
4. Evidence already live on Arc Testnet: USDC payment, structured memo,
   batch settlement, ERC-8004 identity, and ArcScan references.
5. Public implementation: Vercel demo and open GitHub repository.
6. Gateway / Nanopayments roadmap: mock HTTP 402 and deterministic EIP-3009
   authorization preview, explicitly labelled planned / non-signing.
7. Continuation plan and reviewer call to action.

## Evidence and claim boundaries

- The deck may claim verified Arc Testnet settlement evidence, public source,
  public demo, policy-gated payment decisions, and ERC-8004 registration.
- It must not claim that Circle Gateway, x402, Nanopayments, or EIP-3009
  payments are live or integrated. They are a safe mock and roadmap.
- No private keys, seed phrases, credentials, wallet balances, or sensitive
  user data may appear in any asset.
- Wallet signatures remain an explicit human confirmation step.

## Visual design

Use a dark Arc-inspired presentation: navy/black surfaces, Arc cyan accents,
high-contrast white copy, a restrained grid, and compact evidence cards. Avoid
unofficial partner logos or unverified metrics.

## Validation

- Render and visually inspect the generated deck.
- Verify all URLs and text claims against the repository and known public
  assets.
- Confirm the 3-minute script totals approximately 150–180 seconds.
- Run a placeholder and claim-boundary scan before committing.
