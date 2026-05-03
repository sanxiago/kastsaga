# Player Interaction

## Purpose

Defines how human players observe and act in the world. Players use the same observation function and action pipeline as NPCs (Constitution P3, P1) — the engine does not give players a privileged channel into world state.

## Scope

This capability covers:

- Player input translation into actions.
- Player observation rendering.
- Player–NPC interaction primitives at the action level.

It does **not** cover:

- The actual rendering UI / graphics — engine-dependent, decided per `decide-engine`.
- Conversational interaction — see `dialogue`.
- Multiplayer coordination — open, see `DISCUSSION.md` Q5.

## Requirements

### Requirement: Player as world entity

The system SHALL represent each player as an entity in world state, on the same footing as NPCs and other entities. Players SHALL be observable by NPCs and by other players via the standard observation function.

### Requirement: Player input translates to actions

The system SHALL translate player input into actions that flow through the same action pipeline as NPC actions. Player actions SHALL be subject to the same validation rules as NPC actions.

#### Scenario: Player attempts an action they cannot perform

- **GIVEN** a player proposes an action they have no authority for, or that violates world-state constraints
- **WHEN** the engine validates the action
- **THEN** the action is rejected with a structured reason
- **AND** the player's interface displays the rejection in human-readable form

### Requirement: Player observation rendering

The system SHALL render the player's observation in a form usable by a human. The rendering SHALL accurately reflect the observation produced by the world's observation function — players SHALL NOT be shown information their entity cannot perceive.

> "Accurately reflect" does not mean "byte-for-byte identical" — UI may aggregate, summarize, or visualize observation data. It means: do not leak information from outside the observation.

### Requirement: Latency budget for player input

The system SHALL respond to player input within a published latency budget. Player input SHALL NOT block on NPC inference.

> Constitution P4. Specific budget is open until Q2.4 is resolved.

#### Scenario: NPC inference is slow when player attempts an action

- **GIVEN** an NPC's decision backend is currently running a long inference
- **WHEN** the player issues an input
- **THEN** the engine processes the player's input within budget regardless of the NPC's state
- **AND** the NPC's slow inference does not block the player's action pipeline

### Requirement: Player–NPC interaction primitives

The system SHALL expose at minimum the following primitives for player-to-NPC interaction at the action level:

- Approach / leave.
- Initiate dialogue (handed off to `dialogue` capability).
- Trade / give / take (subject to world-state validation).
- Observe more closely (refining the observation).

> Combat, persuasion, and other complex interactions are out of scope for this capability and live in their own capabilities once defined.

### Requirement: Multiplayer parity

When multiple players are present, the system SHALL provide each player with their own observation, computed independently from the same authoritative world state. No player SHALL receive an observation that includes information unavailable to their entity.

> The multiplayer transport, authority, and synchronization model is open — see Q5.

## Out of scope

- UI / graphics implementation — engine-dependent.
- Input bindings, accessibility — to be defined per game.
- Player progression, inventory, character stats — defer to specific game implementations on top of the engine.
- Spectator / GM modes — out of scope for v1.
