# Logging (delta: session persistence)

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
