# World State (delta: session persistence)

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
