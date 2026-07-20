# AgentTreasury Lite Checkpoint 2 Deck Design

## Objective

Create a concise English presentation for the Encode Programmable Money
Hackathon Checkpoint 2 submission. The deck must make the current working
progress easy to verify and provide a public presentation link through the
project's GitHub repository.

## Audience and Success Criteria

The primary audience is the Encode and Arc hackathon review team. A successful
deck lets a reviewer understand the problem, working product, Arc/Circle
integration, verified evidence, and next milestone in under three minutes.

The deck will:

- use a 16:9 layout and Arc-native dark visual direction;
- contain six low-density slides in English;
- distinguish completed work from planned work;
- link or cite verifiable ArcScan and GitHub evidence;
- avoid airdrop, production-readiness, or unsupported autonomy claims;
- be delivered as both PPTX and PDF in the repository.

## Narrative

The narrative is a Checkpoint 2 progress update rather than a final investor
pitch. It moves from the agent-wallet control problem to the implemented
policy-gated workflow, then proves execution with public artifacts and closes
with the remaining work.

## Slide Structure

1. **Title** — AgentTreasury Lite; policy-gated USDC settlement for autonomous
   agents; Checkpoint 2 status on Arc Testnet.
2. **Problem and solution** — Agents need bounded payment authority and an
   auditable human-signature boundary; AgentTreasury Lite evaluates a payment
   request before it reaches wallet authorization.
3. **Working flow** — Payment request, policy decision, human authorization,
   Circle App Kit Send, and ArcScan evidence. Show the controls: allowlist,
   maximum payment, minimum reserve, and invoice ID.
4. **Arc and Circle integration** — Arc Testnet, USDC, Circle App Kit Send,
   official Memo contract, Multicall3From, and ERC-8004 Identity Registry.
   Clearly label which integrations are part of the browser MVP and which are
   separate verified settlement experiments.
5. **Verified progress** — App Kit Send transaction
   `0x6a46...1d572`, ERC-8004 Agent ID `851421` and registration transaction
   `0xe8b2...e490`, public repository, 27 passing tests, and production build.
6. **Checkpoint status and next steps** — Completed MVP and evidence; next work
   is reviewer-focused demo polish, a compact activity log, and final submission
   packaging. Include repository and demo URLs.

## Visual Direction

Use a deep navy background with Arc-inspired cyan highlights, white primary
type, restrained gradients, and spacious composition. The deck should feel
technical and official rather than speculative or neon-heavy. Each slide uses
one dominant message, one evidence element, and minimal decorative treatment.

## Evidence Sources

- Repository: https://github.com/kenvin-maker/arc-testnet-memo
- Demo: https://www.youtube.com/watch?v=3jFuRj20a8g
- App Kit Send: https://testnet.arcscan.app/tx/0x6a46e44a1346772966d1690c6e03a4baf35ff699a7003a58d99c3fe9cd41d572
- ERC-8004 registration: https://testnet.arcscan.app/tx/0xe8b29a7fe6150281e0917caea39c9cfc6d943d5904580a3cd74332209e93e490
- Agent metadata: https://raw.githubusercontent.com/kenvin-maker/arc-testnet-memo/main/agent-metadata.json
- Project README and test suite in this repository.

## Deliverables and Validation

Final files will be written to `docs/presentation/` as PPTX and PDF. Every slide
will be rendered and visually inspected. Automated validation will check for
content outside the slide canvas, and the deck will be revised until there are
no unintended overlaps, clipping, unresolved placeholders, or unreadable text.
The PDF's public GitHub URL will be used for the required Checkpoint 2
presentation field.

## Submission Boundary

Creating, validating, committing, and pushing the files is authorized project
work. Filling the Encode form is also in scope. The final **Submit Checkpoint**
action will only be clicked after an action-time confirmation from the user.
