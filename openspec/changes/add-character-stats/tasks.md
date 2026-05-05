# Tasks: Character Stats System

## Overview
Implementation tasks organized by phase. Each task is specific, testable, and contributes to the overall character stats system.

## Phase 1: Core Data Structures (1-2 days)

### Character Stats Interfaces

- [ ] **T_CS.1.1**: Define CharacterStats TypeScript interface
  - Include HP fields (hp, maxHP, maxHPModifier)
  - Include hunger fields (hunger, initialHunger, hungerDecayRate, hungerSatietyThreshold)
  - Include energy fields (energy, energyDecayRate, energyVigorousMultiplier, energyRestRate, energyExhaustThreshold, energyExhaustHPCost)
  - Include self preservation fields (selfPreservation, selfPreservationMax, selfPreservationHPFactor, selfPreservationOverrideThreshold)
  - Location: `specs/npc-memory/spec-ts/interfaces.ts`

- [ ] **T_CS.1.2**: Create NPCStatsBehavior interface with utility methods
  - `getSurvivalPriority(stats: CharacterStats): number`
  - `shouldAbandonMission(stats, currentState): boolean`
  - `shouldSeekFood(stats): boolean`
  - `isExhausted(stats): boolean`
  - `isCriticalHP(stats): boolean`
  - `shouldRetreat(stats, threatLevel): boolean`
  - Location: `engine/stats/stat-behavior.ts`

- [ ] **T_CS.1.3**: Create Activity Intensity definitions
  - Define activity types and multipliers (IDLE, WALKING, RUNNING, COMBAT, DECISION_MAKING, SPRINTING)
  - Store in constants file
  - Location: `engine/stats/activity-intensities.ts`

- [ ] **T_CS.1.4**: Implement stat validation utilities
  - `validateHP(value, maxHP)`: Ensure 0 ≤ value ≤ maxHP
  - `clampStat(value, min, max)`: Keep stat in bounds
  - `calculateEffectiveMaxHP(stats)`: Apply modifiers
  - Location: `engine/stats/validation.ts`

## Phase 2: HP System (2 days)

- [ ] **T_CS.2.1**: Implement HP damage handling
  - `takeDamage(character, amount, source)`: Apply damage with clamping
  - Log HP changes with tick counter
  - Handle HP = 0 defeat scenario
  - Location: `engine/stats/hp-system.ts`

- [ ] **T_CS.2.2**: Implement HP restoration
  - `healCharacter(character, amount)`: Heal with clamping at maxHP
  - Log healing events
  - Support partial heal (heal as much as possible)
  - Location: `engine/stats/hp-system.ts`

- [ ] **T_CS.2.3**: Implement HP critical thresholds
  - Define critical thresholds (25%, 10%, 0%)
  - Trigger warnings and self preservation updates
  - Location: `engine/stats/hp-critical.ts`

## Phase 3: Hunger System (1.5 days)

- [ ] **T_CS.3.1**: Implement hunger decay
  - `updateHunger(character)`: Apply hungerDecayRate each tick
  - Clamp hunger between 0 and 100
  - Handle starvation damage when hunger ≤ 0
  - Location: `engine/stats/hunger-system.ts`

- [ ] **T_CS.3.2**: Implement starvation damage
  - `applyStarvationDamage(character)`: Damage HP when starving
  - Configurable damage per tick
  - Location: `engine/stats/hunger-system.ts`

- [ ] **T_CS.3.3**: Implement food seeking behavior
  - `shouldSeekFood(stats)`: Check hungerSatietyThreshold
  - Set AI behavior state to 'seeking_food'
  - Location: `engine/stats/hunger-system.ts`

- [ ] **T_CS.3.4**: Update logger.js for hunger
  - Log hunger changes
  - Log starvation damage events
  - Log food consumption events
  - Location: `examples/ascii-world/logger.js`

## Phase 4: Energy System (2 days)

- [ ] **T_CS.4.1**: Implement energy decay
  - `updateEnergy(character, activityType)`: Apply decay with intensity multiplier
  - Handle different activity types
  - Location: `engine/stats/energy-system.ts`

- [ ] **T_CS.4.2**: Implement exhaustion detection
  - `isExhausted(stats)`: Check energyExhaustThreshold
  - Return true when energy below threshold
  - Location: `engine/stats/energy-system.ts`

- [ ] **T_CS.4.3**: Implement exhaustion damage
  - `handleExhaustion(character, attemptedActivity)`: HP damage when energy exhausted
  - Reset energy to 100 (exhaustion costs energy)
  - Replace activity with 'exhausted_rest'
  - Log exhaustion events
  - Location: `engine/stats/energy-system.ts`

- [ ] **T_CS.4.4**: Implement energy restoration
  - `restCharacter(character, restDuration)`: Apply energyRestRate
  - Track rest progress
  - Set currentActivity to null when energy reaches 100
  - Location: `engine/stats/rest-system.ts`

- [ ] **T_CS.4.5**: Update logger.js for energy
  - Log energy changes
  - Log exhaustion events
  - Log rest actions
  - Location: `examples/ascii-world/logger.js`

## Phase 5: Self Preservation System (2 days)

- [ ] **T_CS.5.1**: Implement self preservation calculation
  - `calculateSelfPreservationPriority(stats)`: Base self preservation + panic factor
  - Apply selfPreservationHPFactor based on HP loss
  - Clamp at selfPreservationMax
  - Location: `engine/stats/survival-system.ts`

- [ ] **T_CS.5.2**: Implement override decision logic
  - `shouldOverrideCurrentActivity(character)`: Evaluate override conditions
  - Check critical HP > override_threshold
  - Check hungerSatietyThreshold for food seeking
  - Check exhaustion for resting
  - Return boolean and determine override action
  - Location: `engine/stats/survival-system.ts`

- [ ] **T_CS.5.3**: Implement NPC retreat decision
  - `shouldRetreat(stats, threatLevel)`: High self_preservation + high threat
  - Calculate retreat probability based on self preservation
  - Return boolean
  - Location: `engine/stats/survival-system.ts`

- [ ] **T_CS.5.4**: Update logger.js for self preservation
  - Log self preservation changes
  - Log override decisions
  - Log retreat declarations
  - Location: `examples/ascii-world/logger.js`

## Phase 6: AI Integration (2 days)

- [ ] **T_CS.6.1**: Update NPC entity class
  - Add stats field to Character interface
  - Add stats properties to NPC constructor
  - Include stats from character data schema
  - Location: `engine/entities/NPC.ts`

- [ ] **T_CS.6.2**: Modify NPC decision tree
  - Add stats node to decision evaluation
  - Check override conditions before normal decisions
  - Return override actions if triggered
  - Location: `engine/npc-decision.ts`

- [ ] **T_CS.6.3**: Update stepNPC function
  - Pass stats to decision-making functions
  - Pass stats to action execution
  - Log stats at decision boundaries
  - Location: `examples/ascii-world/move.js`

- [ ] **T_CS.6.4**: Add food source detection
  - Implement `findFoodSource(observation)` function
  - Identify food items in observation (e.g., apple, bread, meal)
  - Return location of nearest food
  - Location: `engine/npc-decision.ts`

## Phase 7: UI & Visualization (2 days)

- [ ] **T_CS.7.1**: Create HP bar component
  - Display current and max HP
  - Color gradient (green → yellow → orange → red)
  - Unicode bar rendering
  - Location: `ui/character-hud.tsx`

- [ ] **T_CS.7.2**: Create hunger and energy meters
  - Display as percentage bars with labels
  - Show current and maximum values
  - Color coding for thresholds
  - Location: `ui/character-hud.tsx`

- [ ] **T_CS.7.3**: Implement status notifications
  - "CRITICAL HP: X/Y" when HP ≤ 25%
  - "HUNGRY: Starvation damage incoming" when hunger ≤ 50%
  - "EXHAUSTED: Cannot perform vigorous actions" when energy ≤ 30%
  - Location: `ui/notifications.tsx`

- [ ] **T_CS.7.4**: Add stat display to main game loop
  - Render stats in player HUD
  - Update stats display when they change
  - Consider position (top-left corner)
  - Location: `ui/character-hud.tsx`

## Phase 8: Logging & Correlation (1 day)

- [ ] **T_CS.8.1**: Add tick tracking to stat changes
  - Track last tick for each stat event
  - Pass tick counter to all log methods
  - Ensure correlation between stat change and action
  - Location: `engine/stats/log-helper.ts`

- [ ] **T_CS.8.2**: Update logger.js with new log types
  - `logHPChange(character, damage, source)`
  - `logHungerChange(character, hungerValue)`
  - `logStarvationDamage(character, damage)`
  - `logFoodConsumed(character, foodItem)`
  - `logEnergyChange(character, energyValue)`
  - `logExhaustion(character, activity)`
  - `logRest(character, duration)`
  - `logSelfPreservationChange(character, oldVal, newVal)`
  - `logOverrideDecision(character, overrideType)`
  - Location: `examples/ascii-world/logger.js`

## Phase 9: Testing & Validation (2 days)

- [ ] **T_CS.9.1**: Write unit tests for core functions
  - `takeDamage()` HP clamping and zero handling
  - `calculateSelfPreservationPriority()` panic factor calculation
  - `applyStarvationDamage()` damage application
  - `handleExhaustion()` HP cost and activity replacement
  - Location: `tests/unit/stats-tests.ts`

- [ ] **T_CS.9.2**: Write unit tests for NPC behavior
  - `shouldOverrideCurrentActivity()` override condition evaluation
  - `shouldRetreat()` threat vs self preservation calculation
  - `shouldSeekFood()` hunger threshold checking
  - Location: `tests/unit/stats-tests.ts`

- [ ] **T_CS.9.3**: Write integration tests
  - NPC AI with low HP retires from mission
  - Player exhaustion prevents sprint
  - Starvation damage over time
  - Self preservation increases with HP loss
  - Food consumption restores hunger
  - Location: `tests/integration/stats-integration-tests.ts`

- [ ] **T_CS.9.4**: Validate logging output
  - Verify all stat changes logged with tick
  - Check correlation IDs unique per event
  - Ensure logs parse correctly
  - Location: `tests/validation/log-validation-tests.ts`

## Phase 10: Documentation & Balancing (1 day)

- [ ] **T_CS.10.1**: Update API documentation
  - Document CharacterStats interface properties
  - Document NPCStatsBehavior methods
  - Document stats usage patterns
  - Document player actions affecting stats
  - Document NPC stat behaviors
  - Location: `docs/character-stats-api.md`

- [ ] **T_CS.10.2**: Create role archetype definitions
  - Define stats for each archetype (guard, merchant, scholar, traveler)
  - Include default stats and stat ranges
  - Location: `data/archetypes/npc-archetypes.ts`

- [ ] **T_CS.10.3**: Balance stats and values
  - Tune hungerDecayRate (test 0.1% to 1% per tick)
  - Tune selfPreservationHPFactor (0.3 to 0.5)
  - Tune energyExhaustHPCost (10 to 30 HP)
  - Tune activity multipliers
  - Evaluate player experience
  - Location: `docs/character-stats-balance.md`

## Summary
- **Total Estimated Time**: 12-14 days
- **Priority Order**:
  1. Core Data Structures (T_CS.1.1-1.4) - Foundation (1-2 days)
  2. HP System (T_CS.2.1-2.3) - Base survival (2 days)
  3. Hunger System (T_CS.3.1-3.4) - Resource management (1.5 days)
  4. Energy System (T_CS.4.1-4.5) - Stamina (2 days)
  5. Self Preservation (T_CS.5.1-5.4) - AI override (2 days)
  6. AI Integration (T_CS.6.1-6.4) - In-game behavior (2 days)
  7. UI & Visualization (T_CS.7.1-7.4) - Player experience (2 days)
  8. Logging & Correlation (T_CS.8.1-8.2) - Debugging (1 day)
  9. Testing (T_CS.9.1-9.4) - Quality assurance (2 days)
  10. Documentation & Balancing (T_CS.10.1-10.3) - Final polish (1 day)