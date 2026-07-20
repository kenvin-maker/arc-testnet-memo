# AgentTreasury Lite Checkpoint 2 Deck Implementation Plan

## Goal

Produce and publish a verified six-slide English presentation for the Encode
Checkpoint 2 submission.

## Inputs

- Approved design:
  `docs/superpowers/specs/2026-07-21-checkpoint-2-deck-design.md`
- Project README, source, tests, and public transaction evidence
- Arc-native dark visual direction selected by the user

## Tasks

1. Read the presentation content, layout, and artifact-tool requirements.
2. Create an external scratch workspace and initialize `@oai/artifact-tool`.
3. Build a six-slide 16:9 PPTX using the approved narrative and evidence.
4. Render all slides, inspect each at full size, and correct clipping,
   unintended overlap, weak hierarchy, or unreadable text.
5. Run automated slide bounds validation.
6. Export a PDF and verify that all six pages render correctly.
7. Copy the final PPTX and PDF to `docs/presentation/`.
8. Run the repository test suite and production build.
9. Commit and push the presentation deliverables.
10. Fill the Encode Checkpoint 2 code URL, presentation URL, and Agentic
    Economy track fields.
11. Ask for action-time confirmation immediately before clicking
    **Submit Checkpoint**.

## Acceptance Criteria

- Six coherent English slides matching the approved design
- PPTX and PDF open and render without errors
- No unintended overlap, clipping, unresolved placeholders, or body text below
  the presentation skill's minimum size
- Every factual progress claim is supported by the repository or linked ArcScan
  evidence
- Project tests and build pass
- GitHub-hosted presentation URL is available to Encode
