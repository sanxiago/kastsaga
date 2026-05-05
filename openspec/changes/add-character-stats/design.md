# Design: Character Stats System

## Overview
The Character Stats System provides a unified architecture for tracking and managing four core attributes governing character survival and behavior: Health Points (HP), Hunger, Energy, and Self Preservation.

## Data Model

### CharacterStats Interface

```typescript
interface CharacterStats {
  // Health Points
  hp: number;           // Current HP (0 to maxHP)
  maxHP: number;        // HP cap (e.g., 100 for PC, variable for NPC)
  maxHPModifier: number; // Multiplier based on character traits (e.g., species, race)

  // Hunger
  hunger: number;       // Percentage (0 = starving, 100 = overfull)
  initialHunger: number;   // Starting hunger value
  hungerDecayRate: number; // % per tick
  hungerSatietyThreshold: number; // Minimum hunger to stop food-seeking

  // Energy
  energy: number;       // Percentage (0 = exhausted, 100 = fully rested)
  energyDecayRate: number;    // Base % per tick
  energyVigorousMultiplier: number; // Multiplier during active behaviors
  energyRestRate: number;      // % per tick when resting
  energyExhaustThreshold: number; // Below this value = exhaustion effects
  energyExhaustHPCost: number;    // HP damage when energy drops to 0

  // Self Preservation
  selfPreservation: number;  // Integer (0 = reckless, 100 = survivalist)
  selfPreservationMax: number; // Upper bound for self preservation (e.g., 100)
  selfPreservationHPFactor: number; // How much self preservation increases per HP loss
  selfPreservationOverrideThreshold: number; // Self preservation level that triggers override
}
```

### NPCStatsBehavior Utility

```typescript
interface NPCStatsBehavior {
  // Evaluate whether character should abandon current mission due to stats
  shouldAbandonMission(stats: CharacterStats, currentState: NPCState): boolean;

  // Calculate effective self preservation priority
  getSurvivalPriority(stats: CharacterStats): number;

  // Determine if character should seek food
  shouldSeekFood(stats: CharacterStats): boolean;

  // Check if character is exhausted
  isExhausted(stats: CharacterStats): boolean;

  // Check if character is critically damaged
  isCriticalHP(stats: CharacterStats): boolean;

  // Determine if character should retreat from danger
  shouldRetreat(stats: CharacterStats, threatLevel: number): boolean;
}
```

## Systems Breakdown

### 1. HP System

#### Health Damage
```typescript
function takeDamage(character: Character, amount: number, source: string): void {
  character.stats.hp = Math.max(0, character.stats.hp - amount);
  logHPChange(character, amount, source);

  if (character.stats.hp === 0) {
    defeatCharacter(character);
  }
}
```

#### HP Restoration
```typescript
function healCharacter(character: Character, amount: number): void {
  character.stats.hp = Math.min(character.stats.maxHP, character.stats.hp + amount);
  logHPChange(character, -amount, 'heal');
}
```

#### HP Critical Threshold
- HP ≤ 25%: Critical warning, self preservation increases
- HP ≤ 10%: Severe damage, self preservation at maximum
- HP = 0: Character defeat

### 2. Hunger System

#### Hunger Decay
```typescript
function updateHunger(character: Character): void {
  const decay = character.stats.hungerDecayRate;
  character.stats.hunger = Math.max(0, character.stats.hunger - decay);

  // Starvation damage (when hunger = 0)
  if (character.stats.hunger <= 0 && character.stats.hp > 0) {
    applyStarvationDamage(character);
  }

  // Food seeking behavior
  if (character.stats.hunger <= character.stats.hungerSatietyThreshold) {
    character.aiBehavior = 'seeking_food';
  }

  logHungerChange(character, character.stats.hunger);
}
```

#### Starvation Damage
```typescript
function applyStarvationDamage(character: Character): void {
  const damage = 2; // Damage per tick when starving
  character.stats.hp = Math.max(0, character.stats.hp - damage);
  logStarvationDamage(character, damage);
}
```

#### Food Consumed
```typescript
function consumeFood(character: Character, foodItem: FoodItem): void {
  character.stats.hunger = Math.min(100, character.stats.hunger + foodItem.hungerRestore);
  logFoodConsumed(character, foodItem);
}
```

### 3. Energy System

#### Energy Decay
```typescript
function updateEnergy(character: Character, activityType: string): void {
  let decay = character.stats.energyDecayRate;

  // Apply activity multiplier
  const intensity = getActivityIntensity(activityType);
  decay *= intensity.multiplier;

  character.stats.energy = Math.max(0, character.stats.energy - decay);
  logEnergyChange(character, character.stats.energy);

  // Check for exhaustion
  if (character.stats.energy <= character.stats.energyExhaustThreshold) {
    handleExhaustion(character, activityType);
  }
}
```

#### Activity Intensities
```typescript
const ActivityIntensities = {
  IDLE: { multiplier: 0.1, name: 'idle' },
  WALKING: { multiplier: 0.3, name: 'walking' },
  RUNNING: { multiplier: 0.8, name: 'running' },
  COMBAT: { multiplier: 1.5, name: 'combat' },
  DECISION_MAKING: { multiplier: 0.5, name: 'decision-making' },
  SPRINTING: { multiplier: 2.0, name: 'sprinting' }
};
```

#### Exhaustion Handling
```typescript
function handleExhaustion(character: Character, attemptedActivity: string): void {
  if (character.stats.energy > character.stats.energyExhaustHPCost) {
    return; // Still have enough energy
  }

  // Exhaustion damage
  character.stats.hp = Math.max(0, character.stats.hp - character.stats.energyExhaustHPCost);
  character.stats.energy = 100; // Exhaustion costs energy, reset to 100

  // Replace attempted activity with rest
  character.stats.currentActivity = 'exhausted_rest';
  logExhaustion(character, attemptedActivity);
}
```

#### Energy Restoration
```typescript
function restCharacter(character: Character, restDuration: number): void {
  const recovery = character.stats.energyRestRate;
  character.stats.energy = Math.min(100, character.stats.energy + recovery * restDuration);

  if (character.stats.energy >= 100) {
    character.stats.currentActivity = null;
  }

  logRest(character, restDuration);
}
```

### 4. Self Preservation System

#### Self Preservation Calculation
```typescript
function calculateSelfPreservationPriority(stats: CharacterStats): number {
  // Base self preservation
  let priority = stats.selfPreservation;

  // Increase as HP decreases (survival instinct)
  const hpLossPercent = (stats.maxHP - stats.hp) / stats.maxHP;
  const panicFactor = Math.min(30, hpLossPercent * stats.selfPreservationHPFactor);
  priority += panicFactor;

  // Cap at maximum
  return Math.min(stats.selfPreservationMax, priority);
}
```

#### Self Preservation Override Decision
```typescript
function shouldOverrideCurrentActivity(character: Character): boolean {
  const stats = character.stats;
  const selfPres = calculateSelfPreservationPriority(stats);

  // Override if self preservation exceeds threshold
  if (selfPres >= stats.selfPreservationOverrideThreshold) {
    // Evaluate specific override scenarios
    if (stats.isCriticalHP && stats.currentActivity !== 'exhausted_rest') {
      return true; // Abandon mission when critically damaged
    }

    if (stats.shouldSeekFood && stats.currentActivity !== 'finding_food') {
      return true; // Seek food when starving
    }

    if (stats.energyExhaustThreshold <= stats.energy && stats.currentActivity !== 'resting') {
      return true; // Rest when exhausted
    }
  }

  return false;
}
```

#### NPC Retreat Decision
```typescript
function shouldRetreat(stats: CharacterStats, threatLevel: number): boolean {
  const selfPres = calculateSelfPreservationPriority(stats);

  // High self preservation + high threat = retreat
  if (selfPres > 50 && threatLevel > 60) {
    const retreatProbability = (selfPres - 50) / 50; // 0 to 1
    const roll = Math.random() * 100;
    return roll < (retreatProbability * 80); // 0-80% chance based on self preservation
  }

  // Low self preservation = continue despite danger
  return false;
}
```

## AI Integration

### Decision Tree Modification
```typescript
function selectNPCAction(observation, npc): Action {
  // Check for stat-based overrides first
  if (shouldOverrideCurrentActivity(npc)) {
    return determineOverrideAction(npc); // Food-seeking, resting, escaping
  }

  // Evaluate danger based on self preservation
  if (shouldRetreat(npc.stats, observation.threatLevel)) {
    return { type: 'retreat', target: findRetreatRoute(npc) };
  }

  // Check hunger
  if (npc.stats.shouldSeekFood) {
    return { type: 'seek_food', target: findFoodSource(observation) };
  }

  // Normal decision-making
  const plan = planNPCWithLLM(observation, npc);
  return plan;
}
```

## UI Components

### Stat Bar Component
```typescript
function renderHPBar(stats: CharacterStats, maxHP: number): string {
  const percentage = (stats.hp / maxHP) * 100;
  let color = 'green';

  if (percentage > 50) color = 'green';
  else if (percentage > 25) color = 'yellow';
  else if (percentage > 10) color = 'orange';
  else color = 'red';

  // Unicode bar: [====    ]
  const filled = Math.floor(percentage / 5); // 20 chars max
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);

  return `[${bar}] ${Math.round(percentage)}`;
}
```

### Hunger/Energy Meters
```
Hunger: ████████░░░░░░░ (65%)
Energy: ███████████████ (100%)
```

### Status Text Notifications
- "CRITICAL HP: 15/100" - HP below 25%
- "HUNGRY: Starvation damage incoming" - Hunger below 50%
- "EXHAUSTED: Cannot perform vigorous actions" - Energy below 30%

## Logging Integration

```typescript
// HP changes
logger?.actionExecuted('player', 'take_damage', null, `${damage} HP taken`, action.source, tickCounter);

// Hunger changes
logger?.dialogueAttempt('system', 'player', `hunger=${stats.hunger}%`, 'log', null, tickCounter);

// Energy exhaustion
logger?.error('player', 'EXHAUSTION', 'Energy depleted; HP damage applied', { exhaustion: true }, tickCounter);

// Self preservation override
logger?.dialogueAttempt('system', npc.id, 'override:seek_food', 'accepted', 'self_preservation', tickCounter);
```

## Sample Scenarios

### Scenario 1: Self Preservation Override
```
GIVEN: NPC with self_preservation = 80, HP = 100, current_mission = "guard chest"
WHEN: Enemy approaches chest
WHEN: NPC HP drops to 35 (36% damage)
THEN: NPCs self_preservation calculates to 70 (base 80 + panic from HP loss)
AND: NPC self_preservation > override_threshold (50)
AND: NPC abandons chest guard mission
AND: NPC evaluates escape route and retreats to safe zone
```

### Scenario 2: Energy Exhaustion
```
GIVEN: Player with energy = 15 and energy_cost_exhaust_threshold = 30
WHEN: Player attempts to sprint
WHEN: Energy cost for sprinting = 25 > 15
THEN: Player energy is reset to 100 (exhaustion cost)
AND: Player loses 15 HP
AND: Player enters exhausted state
AND: NPC recognizes player exhausted state and pauses combat
```

### Scenario 3: Starvation Damage
```
GIVEN: NPC with hunger = 0 (starving) and HP = 40
WHEN: 10 game ticks pass
AND: Starvation damage = 2 HP per tick
THEN: NPC HP decreases to 20
AND: NPC self_preservation increases due to survival threat
AND: NPC prioritizes food-seeking over patrol route
```

## Implementation Phases

### Phase 1: Data Structures (1-2 days)
- Define CharacterStats interface
- Create NPCStatsBehavior utility
- Implement validation functions

### Phase 2: Core Systems (4 days)
- HP system (damage, healing, critical thresholds)
- Hunger system (decay, starvation, food seeking)
- Energy system (decay, exhaustion, rest)
- Self preservation calculation

### Phase 3: AI Integration (2 days)
- Decision tree modifications
- Override behavior implementation
- Retreat and danger assessment

### Phase 4: UI & Testing (3 days)
- HUD components
- Status notifications
- Logging integration
- Unit and integration tests

**Estimated Total: 10-11 days**