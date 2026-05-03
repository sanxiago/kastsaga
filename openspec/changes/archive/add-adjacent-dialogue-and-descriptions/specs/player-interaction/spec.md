## ADDED Requirements

### Requirement: Player movement shares validation rules
The system SHALL apply the same movement validation rules to players as to NPCs, using the authoritative world state for traversability and occupancy checks.

#### Scenario: Player blocked by wall like NPC
- **GIVEN** a wall tile that is non-traversable
- **WHEN** a player attempts to move into that tile
- **THEN** the move is rejected with a structured reason
- **AND** the same tile would also block an NPC move

### Requirement: Player inspect/describe action
The system SHALL allow players to invoke the inspect/describe action on tiles/objects/entities that are within their observation and immediate vicinity (same or adjacent cell).

#### Scenario: Player inspects adjacent object
- **GIVEN** a player adjacent to an object they can observe
- **WHEN** the player issues an inspect action targeting that object
- **THEN** the action is validated and returns the object's description
- **AND** no mutation of world state occurs

### Requirement: Player–NPC interaction scenario (movement + dialogue adjacency)
The system SHALL support sessions where a player and a single NPC move under the same movement rules and can initiate dialogue only when adjacent or co-located.

#### Scenario: Player and NPC move and talk when adjacent
- **GIVEN** a grid world with one player and one NPC
- **AND** both use the same movement validation (walls block both)
- **WHEN** they move into adjacent cells
- **THEN** a dialogue initiation from either party is accepted
- **AND** if they are not adjacent, dialogue initiation is rejected for failing adjacency
