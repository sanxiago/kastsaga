## ADDED Requirements

### Requirement: Descriptive observation entries
The system SHALL include concise, authoritative textual descriptions for visible tiles, objects, and entities within an observation. Descriptions SHALL be derived from world state and require no additional queries by the consumer.

#### Scenario: Observation contains descriptions
- **GIVEN** a viewer observes a chest object and an NPC
- **WHEN** the observation is produced
- **THEN** the observation includes a description for the chest (e.g., "A worn wooden chest")
- **AND** a description for the NPC (e.g., "A guard in simple armor")

### Requirement: Inspect/describe action
The system SHALL provide an inspect/describe action that, when invoked on a tile/object/entity that is within the viewer's observation and immediate vicinity (same or adjacent cell), returns its authoritative description without mutating world state.

#### Scenario: Inspect adjacent object returns description
- **GIVEN** a player is adjacent to a chest they can observe
- **WHEN** the player issues an inspect action targeting the chest
- **THEN** the action is validated against observation and proximity
- **AND** the engine returns the chest's description
- **AND** no world state is mutated
