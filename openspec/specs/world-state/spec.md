# World State

## Purpose

Defines the shared, authoritative model of the game world. Both NPCs and players observe the world through this state and act on it through validated actions. This capability is the substrate on which `npc-agency` and `player-interaction` operate.

Constitution P3 (the world is the source of truth) makes this capability the arbiter of what is real in the game.

## Scope

This capability covers:

- Representation of entities, locations, and their properties.
- Observation derivation — how a viewer gets a slice of the world.
- Action validation and application — how state changes.
- The simulation clock.

It does **not** cover:

- How NPCs decide what action to propose — see `npc-agency`.
- How players input actions — see `player-interaction`.
- Long-term persistence of the world across sessions — deferred until Q2.1 is resolved.

## Requirements

### Requirement: Authoritative world state

The system SHALL maintain a single authoritative world state. All entities, NPCs, and players read from and propose changes to this state. Direct mutation outside the action pipeline SHALL be prohibited.

#### Scenario: NPC and player propose conflicting actions in the same tick

- **GIVEN** an NPC and a player both propose actions affecting the same world entity within the same tick
- **WHEN** the engine processes actions
- **THEN** actions are ordered deterministically (by a documented rule)
- **AND** each action is validated against the state produced by prior actions in the same tick
- **AND** later actions that conflict with earlier validated actions are rejected

### Requirement: Entity model

The system SHALL represent the world as a collection of entities with properties. Entities MAY include:

- Locations (rooms, regions).
- Inanimate objects.
- NPCs.
- Players.
- Abstract entities (factions, time-of-day, weather).

Each entity SHALL have a stable identifier, a type, and a set of properties.

> The exact entity component / data model is a design decision deferred to the engine commitment (Q4.1). This requirement is structural, not implementational.

### Requirement: Observation derivation

The system SHALL provide a function that, given a viewer entity, returns an observation: the slice of world state the viewer can perceive. The observation SHALL respect:

- Spatial proximity (the viewer's location).
- Sensory capability (sight, hearing, etc., as applicable).
- Concealment / occlusion rules where defined.

NPCs and players use the same observation function. Observations for NPCs MAY be additionally formatted for the decision backend (e.g., serialized to text for an LLM).

#### Scenario: NPC and player in the same room observe the same entities

- **GIVEN** an NPC and a player are co-located in the same room
- **AND** there are no concealment effects active
- **WHEN** observations are computed for both
- **THEN** they observe the same set of entities present in the room

### Requirement: Descriptive observation entries

The system SHALL include concise, authoritative textual descriptions for visible tiles, objects, and entities within an observation. Descriptions SHALL be derived from world state and require no additional queries by the consumer.

#### Scenario: Observation contains descriptions
- **GIVEN** a viewer observes a chest object and an NPC
- **WHEN** the observation is produced
- **THEN** the observation includes a description for the chest (e.g., "A worn wooden chest")
- **AND** a description for the NPC (e.g., "A guard in simple armor")

### Requirement: Action pipeline

All mutations of world state SHALL flow through an action pipeline with the following stages:

1. **Propose** — an action is created by an actor (NPC or player).
2. **Validate** — the engine checks the action against current world state and the actor's authority.
3. **Apply** — if valid, the action mutates state.
4. **Notify** — affected observers receive notification of the change.

Invalid actions SHALL be rejected with a structured reason that the proposer can consume.

### Requirement: Inspect/describe action

The system SHALL provide an inspect/describe action that, when invoked on a tile/object/entity within the viewer's observation and immediate vicinity (same or adjacent cell), returns its authoritative description without mutating world state.

#### Scenario: Inspect adjacent object returns description
- **GIVEN** a player is adjacent to a chest they can observe
- **WHEN** the player issues an inspect action targeting the chest
- **THEN** the action is validated against observation and proximity
- **AND** the engine returns the chest's description
- **AND** no world state is mutated

### Requirement: Action types are extensible

The system SHALL allow new action types to be added without modifying the core pipeline. Each action type SHALL declare its preconditions and its effects.

### Requirement: Simulation clock

The system SHALL advance the world via a simulation clock. The clock model — fixed-tick, variable-tick, real-time, turn-based, or hybrid — is open (see Q2.4) but the clock itself MUST be a single source of truth queried by all systems.

> Until Q2.4 is resolved, this requirement is satisfied by any deterministic clock implementation.

### Requirement: State snapshotting

The system SHALL provide a way to produce a snapshot of full world state at a given clock tick. Snapshots SHALL be sufficient to:

- Restore world state to that tick (subject to backend determinism).
- Diff against another snapshot for inspection.

> Persistence format is open (see Q6.3). This requirement is about capability, not format.

### Requirement: Off-screen consistency

When a viewer is not currently receiving observations of a region, the system SHALL still maintain that region's state truthfully. Optimization tiers (e.g., reduced simulation cadence for distant regions) ARE PERMITTED but MUST NOT cause world state to silently diverge from reality.

> Constitution P2.

### Requirement: Grid world baseline profile

The system SHALL support a bounded rectangular grid world profile for the ASCII slice, consisting of:
- Terrain tiles (one per cell) with traversability metadata.
- Optional object layer per cell (zero or more objects). For the ASCII slice, at most one object is rendered per cell; stacks are represented via a stack marker and listed separately.
- Entity occupancy (at most one entity per cell in this profile). Collisions/stacking are resolved by the action pipeline.
- Explicit boundaries (walls or void) marking non-traversable edges.

#### Scenario: Stacked objects indicated via marker
- **GIVEN** a cell contains two objects in world state
- **WHEN** the world is presented via the ASCII slice
- **THEN** the cell is rendered with a stack marker (e.g., `*`)
- **AND** the legend or side listing names both objects
- **AND** no second object glyph is placed in the grid cell

### Requirement: Deterministic layout for replay

The grid layout for the ASCII slice SHALL be deterministic or seedable such that the same seed and rules produce the same layout (to satisfy P5 replayability).

#### Scenario: Same seed yields same layout
- **GIVEN** a generator seed `S`
- **WHEN** the grid layout is produced twice using seed `S`
- **THEN** the resulting terrain, objects, and boundary placement are identical

### Requirement: Observation includes render metadata

Observations for the grid profile SHALL include per-cell data sufficient for rendering without extra world queries:
- Terrain type identifier and glyph (ASCII or Unicode grapheme).
- Object presence, identifier(s), and glyphs (ASCII or Unicode grapheme).
- Entity presence, identifier(s), glyphs (ASCII or Unicode grapheme), and role (player/NPC).
- Optional emote/status code mapped to a glyph (ASCII or Unicode grapheme).
- Optional display-width hint per glyph/emote to assist Unicode-aware rendering.

#### Scenario: Observation contains emoji glyphs for visible entities
- **GIVEN** a viewer can observe an entity whose glyph is "🧙" and emote is "✨"
- **WHEN** the observation is constructed
- **THEN** the entity entry includes those glyphs and (optionally) display-width hints
- **AND** no additional queries are required by the renderer to display them

### Requirement: Render metadata is non-authoritative

Render metadata (glyphs, emote/status codes) SHALL be derived from authoritative world state but SHALL NOT confer authority; action validation continues to rely on world-state truth, not on rendered representations.

#### Scenario: Invalid action rejected despite glyph
- **GIVEN** a rendered glyph suggests a door, but the underlying world state marks the cell as a wall
- **WHEN** a player proposes to walk through that cell based on the glyph
- **THEN** the action validation rejects the move per world-state rules
- **AND** the rejection reason does not depend on the glyph

## ADDED Requirements

### Requirement: Represent rooms/plots as world-NPCs
The system SHALL model each room, plot, or story beat as a world-state entity with NPC-like properties ("world-NPC"). World-NPCs SHALL own plot data, enforce interactions with the environment, and mediate persistent changes (e.g., whether a bridge is passable). They SHALL receive validated actions from characters and NPCs, decide outcomes consistent with the plot, and emit resulting actions back into the action pipeline just like any NPC. World-NPC decisions are logged so that plot-aligned persistence (e.g., a locked door re-locking each session) is reproducible.

#### Scenario: World-NPC adjudicates the bridge
- **GIVEN** a player builds a bridge across a chasm in Room A
- **WHEN** the bridge mutation is proposed to the world-NPC owning Room A
- **THEN** the world-NPC authoritatively applies the bridge state and records that the bridge exists for future ticks and sessions
- **AND** if the bridge is later removed by any NPC, the world-NPC replays that removal per the plot rules and logs the change

### Requirement: Environment interactions are persistent actions
Environment mutations (building/destroying structures, toggling features) SHALL be treated as first-class actions owned by the world-NPC and recorded in the world-state snapshot. Persistent features such as a player-built bridge SHALL be part of the authoritative state so that restoring a snapshot or replaying the log reproduces the same environment without needing to re-run NPC backends.

#### Scenario: Bridge removal persists across sessions
- **GIVEN** an NPC removes the player-built bridge while no player observes the room
- **WHEN** the removal action is applied
- **THEN** the authoritative world state reflects the new absence of the bridge, and a future session starting from the same snapshot sees the bridge missing without rerunning the NPC decision
- **AND** the log entry points to the same bridge ID, world-NPC owner, and tick so replays reflect the removal

### Requirement: Plot-aligned world state keeps characters/NPCs synchronized
The world-state SHALL keep characters and NPCs aligned with active plot threads by exposing the relevant plot data through the observation function. Plot data includes which world-NPC owns which feature and whether it has been modified (e.g., a bridge exists or not). Characters and NPCs observe the same state and are prevented from acting on plot features that have already been reconciled by the world-NPC, ensuring all entities share a consistent history.

#### Scenario: NPC learns about the bridge status
- **GIVEN** a character and an NPC enter Room A after a bridge has been removed
- **WHEN** they observe the room
- **THEN** both observations indicate the bridge is absent because the world-NPC recorded the removal in authoritative world state
- **AND** any action proposing to cross the missing bridge is rejected during validation

## Out of scope

- Specific physics, tile sizes, or coordinate systems — engine-dependent.
- Persistent multi-session world storage — see Q2.1.
- Networked replication of world state — see Q5.1, Q5.2.
- The list of action types — those grow per-game and per-capability.
