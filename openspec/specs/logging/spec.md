# Logging

## Purpose
Provide a unified, structured logging (audit trail) capability that satisfies Constitution principles on observability, reproducibility, and guardrails (P3, P4, P5, P6, P9). Logs make player/NPC decisions, validations, dialogue guardrails, and timeouts inspectable and replayable.

## Scope
- Structured, append-only logging of key events: action proposals, validation results, applied actions, timeouts, dialogue guardrail decisions, and errors.
- Correlation across related events (per action / per tick).
- Redaction/no-leakage rules to prevent exposing secrets or out-of-observation data to players.
- Engine/storage agnostic: format must be structured and queryable, backend unspecified.

Out of scope: storage engine choice, retention policy specifics, log shipping/aggregation stack.

## Requirements

### Requirement: Structured log entries
The system SHALL emit log entries as structured records (e.g., JSON) with stable field names. Free-form strings MAY exist but SHALL NOT be the only carrier of meaning needed for replay.

#### Scenario: Action validation logged structurally
- **GIVEN** a player proposes a move action into a wall
- **WHEN** the action is validated and rejected
- **THEN** a log entry is emitted with fields including: action type `move`, actor ID, tick/timestamp, correlation ID, validation result `rejected`, and reason `non-traversable`

### Requirement: Required fields
Each log entry SHALL include at minimum:
- Timestamp or tick.
- Event type (e.g., `action.proposed`, `action.validated`, `action.applied`, `dialogue.guardrail`, `timeout`, `error`).
- Actor/entity ID when applicable.
- Correlation ID linking related entries for the same action/decision.
- Backend identifier/version when an AI backend is involved.
- Outcome/status and structured reason on rejection.

#### Scenario: Timeout recorded with backend info
- **GIVEN** an NPC backend exceeds its latency budget
- **WHEN** the engine substitutes a fallback action
- **THEN** a `timeout` log entry is emitted containing: NPC ID, tick, backend ID/version, budget, elapsed time, fallback action chosen, correlation ID

### Requirement: Dialogue guardrail logging
Dialogue guardrail decisions (accept/reject/substitute) SHALL be logged with the original utterance, the guardrail rule identifier, and the outcome.

#### Scenario: Utterance rejected by guardrail
- **GIVEN** an NPC generates an utterance that violates a guardrail
- **WHEN** the guardrail rejects the utterance
- **THEN** a log entry records: NPC ID, correlation ID, the rejected content, guardrail rule ID, and the substitution or omission outcome

### Requirement: No leakage of hidden information
Logs intended for player-visible channels SHALL NOT include information outside the player's observation or secrets (API keys, internal prompts). Developer/audit logs MAY include full context but MUST be marked non-player-facing and still exclude secrets/keys.

#### Scenario: Player log omits unseen entity
- **GIVEN** a hidden entity not in the player's observation
- **WHEN** a player-facing log view is generated
- **THEN** entries do not reveal the hidden entity's ID or description

### Requirement: Append-only and queryable
Log storage SHALL be append-only and structured so entries can be queried/filter by time, actor, correlation ID, or event type. In-place mutation of historical entries is prohibited except for explicit redaction of sensitive data with a marker.

#### Scenario: Redaction marks an entry
- **GIVEN** a sensitive value was logged inadvertently
- **WHEN** it is redacted
- **THEN** the log retains a redaction marker referencing the original entry ID and reason, without deleting the entry silently

### Requirement: Replay support
Logs SHALL contain sufficient detail to support deterministic or tolerance-bounded replay: inputs provided to backends (e.g., prompts), seeds when applicable, chosen actions, and validation outcomes.

#### Scenario: Decision replayed from logs
- **GIVEN** a logged NPC decision with observation, backend ID, and seed
- **WHEN** the backend is rerun with the same inputs
- **THEN** the produced action matches the logged action (or lies within the expected distribution for nondeterministic backends)

## Out of scope
- Log shipping/aggregation services.
- Retention durations and archival media.
- Access control design (may be added later as a separate capability).
