## ADDED Requirements

### Requirement: NPC context is updated every tick with position, status, traits, and awareness
The system SHALL refresh the in-memory context window of each NPC every game tick to reflect current state.

**Acceptance Criteria**:
- `updateContext(npc)` function runs every tick
- Returns context object with: `position`, `status`, `traits`, `awareness`, `roleContext`
- Position updates to latest position
- Status reflects health, energy, emotional state, mission progress
- Traits include mutable trait values (decay applied)
- Awareness includes NPCs, objects, events seen in last N ticks
- RoleContext uses templates based on role archetype

#### Scenario: Context refreshes position
- **GIVEN** an NPC "Alaric" at position (4, 2)
- **WHEN** the context update functions
- **THEN** context.position equals (4, 2)

#### Scenario: Status reflects state
- **GIVEN** an NPC with health = 80, energy = 50
- **WHEN** context.updateContext() is called
- **THEN** context.status reflects "healthy" and "active"

#### Scenario: Traits decay every tick
- **GIVEN** an NPC with trait "trust" currentValue = 90, decayRate = 0.5
- **WHEN** context.updateContext() is called
- **THEN** trust.currentValue = 89.5 (after decay)

### Requirement: NPCs have role-specific context templates guiding behavior
The system SHALL provide role-specific templates for NPCs that define baseline behavior expectations and interaction styles.

**Acceptance Criteria**:
- Each role archetype has a `contextTemplate` object
- Template includes: `behaviorGuidelines`, `interactionStyle`, `expectedInteractions`
- Templates based on: guard, merchant, scholar, farmer, rogue, etc.
- Context templates can be customized per NPC
- Role-specific context influences AI reasoning output style

#### Scenario: Guard role default behavior
- **GIVEN** an NPC with role = "guard"
- **WHEN** role-specific context is built
- **THEN** behaviorGuidelines includes: "prioritize safety of area", "warn intruders"
- **AND** interactionStyle includes: "formal", "protective"

### Requirement: Mutable trait values are included in LLM decision prompts
The system SHALL include current mutable trait values in AI decision prompts to enable context-aware character behavior.

**Acceptance Criteria**:
- LLM prompt includes `traits` section with current mutable trait values
- Personality traits influence tone and behavior recommendations
- Beliefs influence worldview and reaction choices
- Emotional states modulate urgency and decision priority
- Evolution rules describe direction of change for planning

#### Scenario: High trust trait produces cooperation
- **GIVEN** an NPC with trait.trust.currentValue = 90
- **WHEN** LLM decides on interaction with player
- **THEN** recommended responses include cooperation options
- **AND** distrust options are down-weighted in reasoning