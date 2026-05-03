## ADDED Requirements

### Requirement: NPC movement parity with players
NPC move actions SHALL use the same action type and validation rules as player movement, relying on authoritative world state for traversability and occupancy.

#### Scenario: NPC blocked by wall like player
- **GIVEN** a wall tile that is non-traversable
- **WHEN** an NPC attempts to move into that tile
- **THEN** the move is rejected with a structured reason
- **AND** the same rule applies to player movement

### Requirement: Adjacent dialogue eligibility for NPCs
NPCs SHALL only initiate or accept dialogue when adjacency/co-location rules are satisfied (as defined in `dialogue`).

#### Scenario: NPC cannot initiate dialogue when far
- **GIVEN** an NPC attempts to start dialogue with a player two cells away
- **WHEN** the dialogue action is validated
- **THEN** it is rejected for failing adjacency
- **AND** the rejection is logged
