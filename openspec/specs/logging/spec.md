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

## ADDED Requirements

### Requirement: Persist interactions affecting shared world state
The system SHALL log every interaction between characters (players or player-linked avatars), NPCs, and world-state entities ("world-NPCs") that mutates persistent world state or influences NPC sentiment. Logs SHALL include the actor IDs (player/NPC/world-NPC), affected entities or environment features, the action/outcome (e.g., "player broke tree", "NPC dislikes player", "world-NPC removed bridge"), and any derived plot alignment data needed to replay the interaction. Each entry SHALL carry the same correlation ID used for the decision/action so the audit trail reconstructs the full chain of cause and effect.

#### Scenario: Persisting the player-built bridge
- **GIVEN** a player interacts with the environment and breaks a tree to build a bridge
- **WHEN** the action is validated and applied
- **THEN** a log entry records: the player ID, world-NPC/plot-location ID that owns the room, the bridge-construction outcome (success/failure), the tick, and the correlation ID linking the action to the decision that produced it
- **AND** later sessions replaying from logs can reconstruct that the bridge existed because the log persistently recorded the successful outcome

### Requirement: Log NPC sentiment history
Interactions that change an NPC's disposition toward a character SHALL be logged as structured sentiment events with: source NPC ID, target character ID, tick, descriptive tag (e.g., "dislikes", "favors"), and persistence metadata (was the interaction remembered, is it influenceable by age). These entries ensure that memory-based feelings can be replayed and inspected without re-running the model prompt.

#### Scenario: NPC dislike persists
- **GIVEN** an NPC witnesses a character destroying an object
- **WHEN** the NPC's sentiment toward that character changes to "dislikes"
- **THEN** a log entry notes the NPC ID, character ID, tick, sentiment tag, and whether the change is persistent (per the NPC's age/retention policy)
- **AND** future replays or debug views show the sentiment change without invoking the NPC backend

### Requirement: Log world-NPC environmental actions
When a world-NPC (room/plot owner) applies or reverses an environment change, the log SHALL record the owning world-NPC ID, the affected feature (e.g., bridge, tree, door), the action taken, and the resulting state. This ensures environmental persistence (build, remove, block) is traceable and replayable even when no character directly observes the event.

#### Scenario: World-NPC removes a bridge
- **GIVEN** a character-built bridge exists and a plot-aligned world-NPC decides to remove it
- **WHEN** the removal action is validated and applied
- **THEN** a log entry records the world-NPC ID, feature ID (bridge), action result (removed), the tick, and the correlation ID
- **AND** the removal is visible in future replays because the entry persists even if no player was present

## Out of scope
- Log shipping/aggregation services.
- Retention durations and archival media.
- Access control design (may be added later as a separate capability).
