# Character Stats Requirements

## ADDED Requirements

### Requirement: All characters have HP, Hunger, Energy, and Self Preservation stats

Every character entity (player and NPC) SHALL have four core stats tracked: Health Points (HP), Hunger, Energy, and Self Preservation.

**Acceptance Criteria**:
- HP is a number between 0 and `max_HP`, representing life value and combat survivability
- Hunger is a percentage between 0 and 100, representing starvation level (0 = starving, 100 = overfull)
- Energy is a percentage between 0 and 100, representing stamina (0 = exhausted, 100 = fully rested)
- Self Preservation is an integer between 0 and 100, representing damage avoidance instinct (0 = reckless, 100 = survivalist)
- All stats are saved with the character entity for persistence
- All stats are accessible via getter methods for UI and AI consumption

#### Scenario: Player created with default stats
- **GIVEN** a new player character is created
- **WHEN** stats are initialized
- **THEN** HP = max_HP = 100
- **AND** hunger = initial_hunger = 50
- **AND** energy = 100
- **AND** self_preservation = default_value = 50

#### Scenario: NPC created with archetype-based stats
- **GIVEN** an NPC with guard archetype is created
- **WHEN** stats are initialized
- **THEN** self_preservation = guard_archetype_value > merchant_archetype_value
- **AND** max_HP = guard_archetype_value > traveler_archetype_value
- **AND** hunger_decay_rate = guard_archetype_value

### Requirement: HP can be damaged and healed

HP represents character life value and combat survivability.

**Acceptance Criteria**:
- HP decreases when character takes damage from attacks, environmental hazards, or starvation/exhaustion
- HP can increase through healing actions (items, spells, rest)
- HP = 0 means character is defeated/knocked out
- HP display shows current and maximum values
- HP clamps at 0 and maxHP (no negative HP, no exceeding maximum)

#### Scenario: Damage reduces HP below max
- **GIVEN** a player with HP = 60 and max_HP = 100
- **WHEN** player takes 25 damage from combat
- **THEN** player HP = 35
- **AND** HP display shows current/max values

#### Scenario: Healing restores HP
- **GIVEN** an NPC with HP = 30 and max_HP = 50
- **WHEN** NPC consumes a healing potion
- **THEN** NPC HP = 50 (max_HP)
- **AND** player sees notification "Healed: HP restored to 50"

#### Scenario: Defeat scenario
- **GIVEN** a player with HP = 1 and max_HP = 100
- **WHEN** player takes 1 damage
- **THEN** player HP = 0
- **AND** player enters defeated state
- **AND** respawn mechanism triggers

### Requirement: HP critical thresholds trigger warnings and behavior changes

Characters react when HP drops below critical thresholds.

**Acceptance Criteria**:
- HP ≤ 25%: Critical warning displayed, self preservation increases
- HP ≤ 10%: Severe warning, self preservation at maximum priority
- HP = 0: Character defeated, respawn required
- Critical warnings are logged with correlation IDs
- Warnings displayed in UI with appropriate color coding

#### Scenario: Critical HP warning
- **GIVEN** a player with HP = 22 and max_HP = 100
- **WHEN** HP display is rendered
- **THEN** HP bar displays yellow/orange color
- **AND** notification shows "CRITICAL HP: 22/100"

#### Scenario: HP drop to zero defeats character
- **GIVEN** an NPC with HP = 10 and max_HP = 100
- **WHEN** NPC takes 10 damage
- **THEN** NPC HP = 0
- **AND** NPC enters defeated state
- **AND** respawn timer begins

### Requirement: Hunger decays over time and can be replenished

Hunger tracks character energy level and increases over time unless replenished with food.

**Acceptance Criteria**:
- Hunger starts at initial_hunger value (typically 50%)
- Hunger decreases by hunger_decay_rate each game tick
- Hunger clamp at 0 (starving) and 100 (overfull) when replenished
- Hunger below 30% triggers food-seeking AI behavior
- Hunger above 70% disables food-seeking behavior

#### Scenario: Hunger decays over time
- **GIVEN** an NPC with hunger = 50 and hunger_decay_rate = -0.5% per tick
- **WHEN** 20 game ticks pass
- **THEN** NPC hunger = 40 (100 ticks total: 50 - 20*0.5)
- **AND** hunger log entry includes new value and previous value

#### Scenario: Food replenishes hunger
- **GIVEN** a player with hunger = 20
- **WHEN** player consumes an apple with hunger_restore = 40
- **THEN** player hunger = 60 (clamped at 100)
- **AND** player sees "Ate apple. Hunger: 60"

#### Scenario: Starvation triggers food-seeking
- **GIVEN** an NPC with hunger = 25 and hungerSatietyThreshold = 30
- **WHEN** NPC AI evaluates next action
- **THEN** NPC prioritizes finding food over patrol
- **AND** NPC sets current_activity to 'seeking_food'
- **AND** NPC abandons non-essential missions

### Requirement: Character damage from starvation when hunger is zero

Starvation damages HP when hunger reaches zero and persists without food.

**Acceptance Criteria**:
- HP damage applies when hunger = 0 and hunger ≤ 0 for consecutive ticks
- Starvation damage is applied per tick (e.g., 1-2 HP per tick)
- Starvation damage stops when hunger increases above zero
- Starvation damage events are logged with tick counter
- Starvation HP damage creates urgency for food-seeking

#### Scenario: Starvation damages HP
- **GIVEN** an NPC with hunger = 0, HP = 50, starvation_damage_per_tick = 2
- **WHEN** 10 game ticks pass
- **THEN** NPC HP = 30
- **AND** log entry includes "Starvation damage: 20 HP lost"

#### Scenario: Food stops starvation damage
- **GIVEN** an NPC with HP = 30, starving for 5 ticks
- **WHEN** NPC consumes bread with hunger_restore = 50
- **THEN** NPC hunger = 50
- **AND** starvation damage stops for current tick
- **AND** HP remains at 30

### Requirement: Energy decays with activity and can be restored through rest

Energy tracks character stamina for performing physical and mental actions.

**Acceptance Criteria**:
- Energy starts at 100% (fully rested)
- Energy decays at energy_decay_rate per tick (base rate)
- Energy decays faster during vigorous activities (multiplier > 1)
- Energy = 0 means character is exhausted
- Energy can only be restored through rest (sleeping, sitting, meditation)
- Energy clamps at 0 and 100

#### Scenario: Vigorous activity drains energy
- **GIVEN** a player with energy = 100 and activity_intensity_multiplier = 1.5
- **WHEN** player engages in combat (30 seconds)
- **THEN** player energy = 100 - (30 * 1.5 * 0.2) = 55 (assuming 1% base decay per second when active)

#### Scenario: Rest restores energy
- **GIVEN** a player with energy = 40 and energy_rest_rate = 20% per tick
- **WHEN** player rests for 3 ticks
- **THEN** player energy = 100 (40 + 20*3, clamped at 100)
- **AND** player current_activity = null

#### Scenario: Energy exhaustion
- **GIVEN** a player with energyExhaustThreshold = 30 and energyExhaustHPCost = 15
- **WHEN** player attempts to sprint with energy_cost = 35
- **THEN** energy = 100 (reset to 100, exhaustion costs energy)
- **AND** player HP = 85 (30 - 15)
- **AND** player enters exhausted state
- **AND** log entry includes "Exhaustion: 15 HP lost for sprinting"

### Requirement: Energy exhaustion prevents vigorous actions

Characters cannot perform energy-intensive actions when exhausted.

**Acceptance Criteria**:
- Character cannot sprint or run when energy ≤ energyExhaustThreshold
- Character may attempt action but fails with exhaustion message
- Attempted action is replaced by rest
- Log entry documents exhaustion attempt and action replacement

#### Scenario: Can't sprint when exhausted
- **GIVEN** a player with energy = 20 and exhausted_state = false
- **WHEN** player attempts to sprint (requires at least 30 energy)
- **THEN** player sees "Too exhausted to sprint! You need to rest first."
- **AND** current_activity = 'resting'
- **AND** player energy slowly regenerates

#### Scenario: Combat allowed even when somewhat exhausted
- **GIVEN** a player with energy = 25 and energyExhaustThreshold = 30
- **WHEN** player engages in combat (moderate energy cost)
- **THEN** combat proceeds normally
- **AND** player energy slowly decreases (not reset)

### Requirement: Self Preservation calculates priority based on HP

Self Preservation score dynamically increases as HP decreases, making survival the highest priority.

**Acceptance Criteria**:
- Self Preservation priority = base_self_preservation + panic_factor (HP loss impact)
- Panic factor = (max_HP - current_HP) / max_HP * selfPreservationHPFactor
- Self Preservation clamps at selfPreservationMax
- Self Preservation prioritizes over other mission objectives

#### Scenario: Self Preservation increases with HP loss
- **GIVEN** an NPC with self_preservation = 60, max_HP = 100, selfPreservationHPFactor = 0.4
- **WHEN** NPC loses 20 HP (HP = 80)
- **THEN** panicFactor = (100-80)/100 * 0.4 = 0.08
- **AND** selfPreservation priority = 68 (60 + 8)

#### Scenario: High HP reduces panic
- **GIVEN** the same NPC
- **WHEN** NPC HP = 95 (only 5 HP loss)
- **THEN** panicFactor = (100-95)/100 * 0.4 = 0.02
- **AND** selfPreservation priority = 62 (60 + 2)

### Requirement: Self Preservation overrides NPC actions when critically damaged

When self Preservation exceeds threshold, NPCs abandon non-essential activities to prioritize survival.

**Acceptance Criteria**:
- Override triggers when selfPreservation > selfPreservationOverrideThreshold (typically 50)
- Override conditions:
  - HP ≤ 25% and current mission non-essential
  - Energy ≤ energyExhaustThreshold and current activity non-essential
  - Hunger ≤ hungerSatietyThreshold and food-seeking not in progress
- Override action: abandon mission, seek safety/rest, or flee danger
- Log entry includes override reason (e.g., "Self preservation override: abandoning mission for survival")

#### Scenario: NPC abandons mission when critically damaged
- **GIVEN** an NPC with selfPreservation = 70, HP = 35, max_HP = 100, current_mission = "guard chest"
- **WHEN** NPC evaluations stats and selfPreservation
- **THEN** selfPreservation priority = 78 (70 + panic from HP loss)
- **AND** selfPreservation > override_threshold (50)
- **AND** NPC abandons chest guard mission
- **AND** NPC evaluates retreat route and flees to safety

#### Scenario: NPC continues mission with low self preservation
- **GIVEN** an NPC with selfPreservation = 30, HP = 35, max_HP = 100, current_mission = "guard chest"
- **WHEN** NPC evaluations stats and selfPreservation
- **THEN** selfPreservation priority = 43 (30 + panic from HP loss)
- **AND** selfPreservation <= override_threshold (50)
- **AND** NPC continues guarding chest despite HP damage

### Requirement: NPCs retreat from danger based on Self Preservation vs threat level

NPCs assess danger and decide whether to engage or retreat based on their self preservation and the threat level.

**Acceptance Criteria**:
- If selfPreservation > 50 and threatLevel > 60, calculate retreat probability
- Retreat probability = (selfPreservation - 50) / 50 * 80 (0-80% based on selfPreservation)
- Low selfPreservation = never retreat
- High selfPreservation = may retreat from danger

#### Scenario: High Self Preservation retreats
- **GIVEN** an NPC with selfPreservation = 80 and threatLevel = 80
- **WHEN** NPC evaluates danger
- **THEN** retreatProbability = (80 - 50) / 50 * 80 = 48% (clamped at 80%)
- **AND** roll < 48, so NPC retreats
- **AND** NPC finds nearest safe zone

#### Scenario: Low Self Preservation engages
- **GIVEN** an NPC with selfPreservation = 20 and threatLevel = 80
- **WHEN** NPC evaluates danger
- **THEN** retreatProbability = 0 (selfPreservation <= 50)
- **AND** NPC engages in combat

### Requirement: Stats are logged with tick counter for correlation

All stat changes are logged with a unique tick counter for debugging, tracing, and analytics.

**Acceptance Criteria**:
- Every stat change includes a `tick` field
- tick counter increments for each decision cycle
- Log entries include correlation_id linking related events
- Stats log entries include timestamp and previous value

#### Scenario: Stat change logged with tick
- **GIVEN** a tick counter that has value 42
- **WHEN** player has 25 HP and takes 10 damage
- **THEN** log entry includes: `{ tick: 42, hp_old: 25, hp_new: 15, source: 'combat' }`

#### Scenario: Correlation between related events
- **GIVEN** NPC with selfPreservation = 50, HP = 100, mission = "patrol"
- **WHEN** NPC takes damage (HP = 80)
- **WHEN** NPC selfPreservation priority = 52 (50 + panic 2)
- **THEN** log entry includes correlation_id = `npc-${npcId}-tick${tick}`
- **AND** mission abandonment log entry uses same correlation_id

### Requirement: UI displays stats with color-coded feedback

UI components render character stats with visual indicators and text feedback appropriate to current stat values.

**Acceptance Criteria**:
- HP bar: green (100%), yellow (50%), orange (25%), red (<25%)
- Hunger meter: blue (100%), yellow (50%), red (30%, starving), dark (0%)
- Energy meter: green (100%), yellow (50%), red (30%, exhausted)
- Status text notifications for critical states
- Stats display in clear, accessible location (e.g., top-left corner of HUD)

#### Scenario: HP bar color changes with health
- **GIVEN** player HP = 45 and max_HP = 100
- **WHEN** player HP display is rendered
- **THEN** HP bar shows yellow color
- **AND** bar length = 45% of total width

#### Scenario: Energy bar shows exhaustion warning
- **GIVEN** player energy = 20 and energyExhaustThreshold = 30
- **WHEN** energy display is rendered
- **THEN** energy bar shows red color
- **AND** text shows "EXHAUSTED: Cannot sprint or run"

#### Scenario: Status notifications for multiple critical states
- **GIVEN** player with HP = 15, hunger = 25, energy = 25
- **WHEN** game loop processes status display
- **THEN** UI shows: "CRITICAL HP: 15/100"
- **AND** UI shows: "HUNGRY: Starvation damage incoming"
- **AND** UI shows: "EXHAUSTED: Cannot perform vigorous actions"