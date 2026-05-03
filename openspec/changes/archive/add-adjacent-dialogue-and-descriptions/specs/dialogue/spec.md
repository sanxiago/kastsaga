## ADDED Requirements

### Requirement: Dialogue initiation requires adjacency
Dialogue initiation SHALL require the speaker and audience to be co-located or in adjacent cells (cardinal adjacency) according to authoritative world state. Dialogue requests that fail this proximity check SHALL be rejected with a structured reason.

#### Scenario: Dialogue rejected when not adjacent
- **GIVEN** a player attempts to start dialogue with an NPC two cells away
- **WHEN** the engine validates the dialogue action
- **THEN** the action is rejected for failing adjacency
- **AND** the rejection reason is logged

### Requirement: Dialogue initiation when adjacent
If a speaker and audience are adjacent or co-located and otherwise eligible, the dialogue initiation action SHALL succeed and proceed through the dialogue pipeline.

#### Scenario: Dialogue succeeds when adjacent
- **GIVEN** a player and NPC are in adjacent cells
- **WHEN** the player initiates dialogue
- **THEN** the adjacency check passes
- **AND** the dialogue action proceeds to utterance generation/guardrails per the dialogue capability
