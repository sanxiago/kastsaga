# Proposal: Add Logging / Audit Trail Capability

## Summary
Define a minimal, constitution-compliant logging spec for the engine: structured, replay-friendly logs that cover player/NPC actions, validations, dialogue guardrails, timeouts, and errors, with no-leakage of hidden data. This aligns with P4/P5/P9 and centralizes logging expectations across capabilities.

## Motivation
- Constitution requires inspectability and replay (P4, P5, P9). We need a source-of-truth capability for logs, not scattered notes in other specs.
- Current specs mention audit trails per capability (e.g., npc-agency), but there is no unified logging format/requirements.
- Early clarity keeps demos and future engine code aligned and testable.

## Scope
- New capability `logging` covering: what events must be logged, required fields, determinism, redaction/PII hygiene, and access to logs for replay/debugging.
- Scenarios for action validation results, timeouts, dialogue guardrail rejection, and correlation across events.
- Engine-agnostic; no storage format mandated beyond structured, append-only semantics.

## Non-goals
- Choosing a specific storage backend or retention policy details.
- Implementing logging in code here — this is a spec addition only.

## Success criteria
- A validated `logging` spec with requirements and scenarios for key events (actions, dialogue guardrails, timeouts, errors) and structure (timestamps, IDs, correlation, redaction rules).
- Compatible with replay and audit trail expectations in existing capabilities.
