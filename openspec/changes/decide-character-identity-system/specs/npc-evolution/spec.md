## ADDED Requirements

### Requirement: Trait evolution is controlled by designer-defined rules with rate limits
The system SHALL enforce rate limits and constraints on trait mutation to prevent unstable behavior while preserving emergent gameplay.

**Acceptance Criteria**:
- Each trait has: `mutable` flag, `maxChangeRate`, `min`, `max`
- Daily mutation limit applies: traits cannot change more than X per 24h
- Per-event mutation limit: single event cannot change a trait by more than Y
- Evolution rules stored in `traitEvolutionRules` config
- Mutation triggers: events that cause trait changes (e.g., `saw_stealing`, `helped_civilian`)
- Changes are validated before application

#### Scenario: Daily rate limit prevents trait explosion
- **GIVEN** a NPC with trait.trust.maxChangeRate = 10
- **WHEN** the NPC gains trust from 3 helping events (30 points total)
- **THEN** only 10 points are added (rate limit)
- **AND** remaining 20 points are carried over (partial)

#### Scenario: Per-event limit respected
- **GIVEN** a NPC with trait.trust.maxChangeRate = 15
- **WHEN** the NPC experiences events giving +20, +25, +30 trust
- **THEN** per-event caps at 15 each (total +45)
- **AND** trait change is logged as 3 entries: +15, +15, +15

### Requirement: All trait mutations are logged with timestamps and context
The system SHALL log every trait mutation to facilitate debugging, analytics, and emergent story understanding.

**Acceptance Criteria**:
- Every trait mutation logs: `eventId`, `npcId`, `traitName`, `previousValue`, `newValue`, `changeReason`, `timestamp`
- Only significant changes logged (threshold > 5)
- Log entries stored in long-term memory if change is significant
- Log entries can be queried for analytics: trait evolution patterns, average values

#### Scenario: Significant change logged with details
- **GIVEN** a NPC with trait.trust.currentValue = 75
- **WHEN** the NPC's trust decreases to 50 due to witnessing theft
- **THEN** log.entry includes: { eventId: "event:45d:trust-decrease", npcId: "npc:alaric", traitName: "trust", previousValue: 75, newValue: 50, changeReason: "witnessed_stealing", timestamp: today }