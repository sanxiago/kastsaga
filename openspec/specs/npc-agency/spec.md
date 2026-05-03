# NPC Agency

## Purpose

Defines how non-player characters perceive the world, choose actions, and execute them. NPCs are autonomous agents — they decide based on goals, observation, and memory, not from pre-authored dialogue trees or finite-state scripts. This is the engine's defining capability.

## Scope

This capability covers the perceive–decide–act loop and the runtime that drives it. It does **not** cover:

- The world model NPCs observe — see `world-state`.
- How players interact with NPCs — see `player-interaction`.
- Natural-language conversation — see `dialogue`.
- How NPCs remember things — see `npc-memory`.

## Requirements

### Requirement: NPC decision loop

The system SHALL run a perceive–decide–act loop for every active NPC. Each cycle consists of three steps:

1. **Perceive** — the NPC receives an observation, derived from the world state, filtered by what the NPC can sense.
2. **Decide** — the NPC produces an action consistent with its goals, constraints, and memory.
3. **Act** — the engine validates the proposed action against world state and either applies it or rejects it.

#### Scenario: NPC chooses an action with no player nearby

- **GIVEN** an NPC is active and no player is in its observation range
- **WHEN** the decision tick fires
- **THEN** the NPC produces an action consistent with its current goals
- **AND** the action is applied to world state if valid

#### Scenario: NPC's proposed action is invalid

- **GIVEN** an NPC has produced a proposed action that references something not in world state
- **WHEN** the engine attempts to apply it
- **THEN** the action is rejected
- **AND** the NPC is notified with sufficient information to choose differently
- **AND** the rejection is logged

### Requirement: Pluggable decision backend

The system SHALL allow the decide step to be implemented by different backends — for example, an LLM, a rule-based system, or a hybrid — without changing the perceive or act steps. Each NPC SHALL have a designated backend, configurable per-NPC and changeable at runtime.

### Requirement: Latency budget enforcement

The system SHALL enforce a per-NPC, per-decision latency budget. If a backend exceeds budget, the engine SHALL substitute a fallback action and log the timeout as an inspectable event.

> The exact budget value is open — see `DISCUSSION.md` Q2.4.

#### Scenario: Backend exceeds latency budget

- **GIVEN** an NPC backend is computing a decision
- **WHEN** the budget elapses before a decision is produced
- **THEN** the engine cancels or ignores the late result
- **AND** the engine selects a fallback action for the NPC
- **AND** a timeout event is logged with NPC ID, budget, elapsed time, and backend identifier

### Requirement: NPC goals

Each NPC SHALL have one or more goals expressed in a form the decision backend can consume. Goals MAY:

- Be seeded at NPC creation (designer-authored).
- Change at runtime in response to events, memory, or other NPCs' actions.
- Conflict with each other; the backend is responsible for resolving conflicts.

The system SHALL NOT permit goals that bypass world-state validation (e.g., "ignore physics") or contradict a constitution principle.

### Requirement: Action validation

The system SHALL validate every proposed NPC action against world state before applying it. Actions that reference nonexistent entities, violate physical constraints, or attempt to mutate state the NPC has no authority over SHALL be rejected.

> Constitution P3 (the world is the source of truth) makes this non-negotiable.

### Requirement: Decision audit trail

For each NPC decision, the system SHALL persist an audit record containing:

- NPC identifier.
- Tick or wall-clock timestamp.
- Input observation provided to the backend.
- Backend identifier and version.
- Backend invocation parameters (including seed, when applicable).
- Raw backend output.
- Validated action (if any) and validation result.
- Outcome of action application.

The audit trail SHALL be sufficient to replay any decision deterministically given the same backend, seed, and observation.

> Constitution P5 (sessions are reproducible) and P9 (observability) make this non-negotiable.

#### Scenario: Replaying a past decision

- **GIVEN** a past audit record for an NPC decision
- **WHEN** the same backend is invoked with the same observation, parameters, and seed
- **THEN** the produced action matches the action recorded in the audit trail

> This requirement implies the backend itself is deterministic given a fixed seed. For non-deterministic backends, "matches" means "is among the recorded sample distribution"; the exact tolerance is open.

### Requirement: Off-screen simulation

The system SHALL continue to drive the perceive–decide–act loop for NPCs that no player is currently observing, subject to a configurable simulation tier policy.

> Constitution P2 (the world simulates without observers) makes this non-negotiable. The exact tiering — full fidelity vs reduced cadence vs summarized — is an optimization, not a deviation.

### Requirement: Authorial guardrails

The system SHALL provide a named, inspectable mechanism for constraining NPC actions and outputs. Guardrails MAY:

- Filter or block specific action types.
- Filter or block dialogue content.
- Override goals in defined situations.

Guardrails SHALL be defined in code or configuration that lives outside any single NPC's prompt or rule set, and MUST be reviewable by the project team.

> Constitution P6 makes this non-negotiable.

## Out of scope

- **Dialogue content generation** — handled by `dialogue`.
- **Memory representation** — handled by `npc-memory`.
- **World physics, tiles, or collision** — handled by `world-state`.
- **Multiplayer synchronization of NPC decisions** — see `DISCUSSION.md` Q5.2; deferred until session model is decided.
