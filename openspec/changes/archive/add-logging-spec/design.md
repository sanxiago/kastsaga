# Design — Logging / Audit Trail Capability

- **Structured, append-only events:** No free-text blobs only. Each log entry carries typed fields so downstream replay/analysis is possible.
- **Correlation:** Actions, validation results, and outcomes share correlation IDs (per tick / per action) for traceability.
- **Mandatory events:** action proposal/validation/outcome, timeouts, dialogue guardrail decisions, errors. Optional but encouraged: inspect actions, renderer outputs for debugging.
- **Determinism:** Logs must capture enough info to replay (timestamps/tick, actor, inputs, backend identifier, seed when applicable, result). No hidden prompts.
- **Safety:** Redact/omit sensitive data; never log secrets. No leakage of out-of-observation data in player-visible logs; developer logs can include full state but must be marked non-player-facing.
- **Backend-agnostic:** Does not pick storage; requires structured format (JSON/NDJSON/etc.) and append-only semantics.
