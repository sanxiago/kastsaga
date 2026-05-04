## ADDED Requirements

### Requirement: NPCs have traits categorized as immutable or mutable
The system SHALL enable designer control over which aspects of an NPC are stable (immutable) versus which can evolve (mutable).

#### Scenario: Immutable traits never change
- **GIVEN** a mutable NPC with immutable_traits: { species: "human", name: "Alaric" } and mutable_traits: { trait: "trust", mutable: true, currentValue: 50 }
- **WHEN** Alaric experiences a betrayal
- **THEN** Alaric.trust.decrease_by(20) and Alaric.species and Alaric.name remain "human" and "Alaric"

#### Scenario: Mutable traits can evolve
- **GIVEN** a mutable NPC with mutable_traits: { trait: "trust", mutable: true, currentValue: 70, maxChangeRate: 15 }
- **WHEN** Alaric helps a player who protects the village
- **THEN** Alaric.trust.increase_by(25) and trust.currentValue is capped at 95 (maxChangeRate 15, max value 100)

### Requirement: NPC memory retention is tied to character age
The system SHALL enable age-based memory retention policies where younger characters remember more than older characters.

**Acceptance Criteria**:
- NPCs have `age` field (number, representing years)
- Retention period is calculated as: `getRetentionPeriod(npc.age)` returns days
- Retention map: 0-10: 365d, 11-30: 365d, 31-60: 180d, 61-80: 90d, 81+: 30d
- Memory entries older than retention period are marked.decayed
- Decay events are logged and archived but may be summarizable

#### Scenario: Child NPC retains memories for a year
- **GIVEN** a child NPC with age = 7
- **WHEN** that NPC's memory entry from 10 months ago is queried
- **THEN** the entry is included in long-term memory (within 365d retention)

#### Scenario: Elder NPC forgets quickly
- **GIVEN** an elder NPC with age = 85
- **WHEN** that NPC's memory entry from 45 days ago is queried
- **THEN** the entry is excluded from context (older than 30d retention)

#### Scenario: Memory decay is logged
- **GIVEN** an elder NPC with age = 85
- **WHEN** long-term memory is saved to persistence
- **THEN** the save includes a summary of decaying memories that were removed

### Requirement: NPCs store historical events in long-term memory with timestamps and age
The system SHALL store significant NPC events in long-term memory with timestamps and entity age for decay purposes.

**Acceptance Criteria**:
- Every significant event has: `id`, `npcId`, `type`, `timestamp`, `entityAge`
- Event types: `interacted`, `discovered`, `learned`, `failed`, `succeeded`
- Events are stored in `longTermMemory` array ordered by timestamp
- Events include `decayKey` for age-based removal
- Summary of removed events is preserved in `memoryArchive` for analytics

#### Scenario: Event includes all required fields
- **GIVEN** the game has been running for 100 days
- **WHEN** an NPC "Alaric" succeeds in protecting the village
- **THEN** longTermMemory includes entry: { id: "event:85d:protection", npcId: "npc:alaric", type: "succeeded", timestamp: today, entityAge: 100 }

#### Scenario: Memory queries respect age-based retention
- **GIVEN** an NPC with age = 50 (180d retention)
- **WHEN** querying long-term memory for the last 180 days
- **THEN** only entries within retention period are returned
- **AND** All outside entries are marked.decayed