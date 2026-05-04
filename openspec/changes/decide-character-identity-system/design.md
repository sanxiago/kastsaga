# Character Identity System Design

## Why

We are building an RPG engine that deserves its own memorable characters, not just AI agents executing static behaviors. By implementing a character identity system, we enable:

1. **Narrative Depth** — NPCs with evolving personas create unique, replayable stories where actions have lasting impact

2. **Player Agency Over Characters** — Players earn genuine influence over NPC development, creating character arcs that matter

3. **Social Dynamics** — NPCs recognize and respond to each other's identities, allowing for relationships, misunderstandings, and group dynamics

4. **Game Design Flexibility** — Game designers can control how much freedom each NPC has to evolve, balancing emergent gameplay with their vision

5. **Age as a Mechanic** — Memory retention tied to age creates temporal storytelling: young characters Remember everything, elders forget details

6. **Amnesia Stories** — NPCs losing or recovering memories creates dramatic, emotional gameplay scenarios where characters help each other regain their identities

This system moves our NPCs from "programmed decision points" to "living entities with personal histories" — fulfilling the core promise of building an RPG engine that truly supports emergent narrative.
A two-tier memory and trait system enabling NPCs to evolve their identity through gameplay while maintaining core character stability. The system combines age-based memory retention with designer-controlled trait mutation rules.

## Architecture

### Three-Component System

```
┌─────────────────────────────────────────────────────────────┐
│                    Character Definition                       │
│  ├── immutable_traits (never changes)                      │
│  ├── mutable_traits (controlled evolution)                 │
│  └── trait_evolution_rules (how traits change)              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  In-Memory Context (Active State)           │
│  ├── position, status, role, immediate awareness            │
│  ├── mutable trait values (current state)                   │
│  └── recent observations (last N ticks)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Long-Term Memory (Archive)                │
│  ├── key events (significant interactions)                  │
│  ├── relationships (npc-npc, npc-player)                    │
│  ├── learned patterns (decision outcomes, preferences)     │
│  └── age-decayed archive (subject to retention policies)    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Decision Cycle                              │
│  Context + Long-Term Lookup → Planning → Action             │
│       │                                                    │
│       └──> Update Context (traits, memory)                 │
│            Push significant events to long-term memory      │
└─────────────────────────────────────────────────────────────┘
```

## Trait Architecture

### Trait Classification

#### Immutable Traits (Never Change)
```javascript
{
  species: "human",
  name: "Alaric",
  role: "guardian",
  core_identity: ["protector", "loyalist"],
  base_presentation: { height: "180cm", weight: "85kg" }
}
```

#### Mutable Traits (Dynamic, Designer-Configurable)
```javascript
{
  // Personality traits (change through events)
  personality: {
    trust: { mutable: true, currentValue: 80, maxRate: 15, min: 10, max: 100 },
    aggression: { mutable: true, currentValue: 20, maxRate: 10, min: 0, max: 100 },
    curiosity: { mutable: true, currentValue: 60, maxRate: 20, min: 0, max: 100 }
  },

  // Beliefs (worldview, factual knowledge)
  beliefs: {
    "thieves = bad": { mutable: true, currentValue: true, maxChange: 1 },
    "chest = treasure": { mutable: true, currentValue: true, maxChange: 0.3 },
    "weather = rainy today": { mutable: false, currentValue: true }
  },

  // Emotional states (moment-to-moment)
  emotions: {
    fear: [ { target: "heights", currentValue: 40, intensity: 10 } ],
    joy: [ { event: "saw_comrade", currentValue: 80, duration: 10 }
    ],

    // Fear can fade over time, joy can decay or persist based on ongoing events
  }
}
```

### Evolution Rules

#### Trait Mutation Types
1. **Additive Changes**: +10 trust after helping someone
2. **Subtractive Changes**: -5 trust after theft witnessed
3. **State Changes**: Fear intensity 60 → 40 (faded)
4. **Value Reset**: Trust 20 → 100 (after betrayal reconciliation)

#### Evolution Constraints
```javascript
const evolutionRules = {
  // Rate limits per tick/timeframe
  max_daily_trait_change: 25,  // Traits can't change more than X in 24h
  max_immediate_change: 5,     // Per-event change limit
  decay_overhang: 0.01,        // Trait decay rate per tick

  // Minimum/Maximum values
  min_trait_value: 0,
  max_trait_value: 100,

  // Conditional changes
  triggers: {
    "saw_hero_save_child": {
      "hero:guard": { aggression: -10 },  // NPC respects hero
      "hero:guard": { trust: +15 },
      "worldview": { villains = bad: +1 }
    },
    "witness_stealing": {
      all_civilians: { trust: -8, suspicion: +15 },
      merchant: { trust: -20 }
    }
  }
};
```

## Age-Based Memory Retention

### Memory Retention Policies

| Age Range | Retention Period | Narrative Implication |
|-----------|------------------|----------------------|
| 0-10 (children) | 100% of memories retain for 1 year | Sponge-like memory, perfect recall of early experiences |
| 11-30 (youth) | Retain for 365 days | Good recall, key events remembered, details fade |
| 31-60 (adult) | Retain for 180 days | Remember key moments, details erode, personality solidifies |
| 61-80 (elderly) | Retain for 90 days | Fragile memory, remembers core personality traits well |
| 81+ (elderly) | Retain for 30 days | Significant memory decay, identity persists, details forgotten |

### Memory Decay Implementation

```javascript
function calculateRetentionPeriod(npcAge) {
  const retentionMap = {
    0: 365,    // children: keep everything for 1 year
    10: 365,
    30: 180,   // adults: 6 months
    60: 90,    // elderly: 3 months
    80: 30,    // very elderly: 1 month
    120: 7     // ancient: 1 week
  };

  // Interpolate between age ranges
  const keys = Object.keys(retentionMap).map(Number).sort((a,b) => a-b);
  for (let i = keys.length - 2; i >= 0; i--) {
    if (npcAge >= keys[i]) {
      const lower = keys[i];
      const upper = keys[i + 1];
      const lowerAge = retentionMap[lower];
      const upperAge = retentionMap[upper];
      const ageSpan = upper - lower;
      const ageFraction = (npcAge - lower) / ageSpan;
      return Math.round(ageFraction * (upperAge - lowerAge) + lowerAge);
    }
  }
  return 365; // Default
}
```

## In-Memory Context Update Mechanics

### Context Refresh Cycle (Every Tick)

```javascript
function updateContext(npc, knowledgeBase) {
  // 1. Refresh position and status
  context.position = npc.position;
  context.status = calculateStatus(npc.health, npc.energy, npc.emotionalState);

  // 2. Update mutable trait values
  context.traits = {
    personality: updateMutableTraits(npc.personalityTraits),
    beliefs: updateMutableBeliefs(npc.beliefs),
    emotions: npc.emotionalStates
  };

  // 3. Update awareness (recent observations)
  context.awareness = knowledgeBase.recallRecentObservations(npc.id, 10);

  // 4. Rebuild role-specific context
  context.roleContext = buildRoleContext(npc.role, context.position);

  return context;
}

function updateMutableTraits(traits) {
  // Apply decay
  for (let key in traits) {
    const trait = traits[key];
    if (trait.degradable) {
      trait.currentValue = Math.max(
        trait.min,
        Math.min(trait.max, trait.currentValue - trait.decayRate)
      );
    }
  }
  return traits;
}
```

### Context Update Triggers

NPCs update their contextual memory when:
1. **Gameplay events occur**: Actions taken, conversations had, discoveries made
2. **Time advances**: Age-based decay affects long-term memory
3. **New relationships form/navigate**: NPC-npc and npc-player interactions
4. **Amnesia recovery**: Rebuilding context from long-term memory after loss

## Amnesia Mechanics

### Amnesia Scenarios

1. **Full Amnesia**: All long-term memory lost, context at baseline
2. **Selective Amnesia**: Loss of specific belief types (e.g., loses trust mechanism but remembers role)
3. **Transient Amnesia**: Temporary memory loss recovers over time
4. **Identity Crisis**: Core identity known, but who am I? (role archetype guides behavior)

### Memory Recovery Process

```javascript
function recoverFromAmnesia(npc, knowledgeBase) {
  // 1. Rebuild in-memory context from immutable traits
  const context = {
    name: npc.immutable_traits.name,
    species: npc.immutable_traits.species,
    role: npc.immutable_traits.role,
    core_identity: npc.immutable_traits.core_identity,
    personality: npc.mutable_traits.personality.currentValue || {}, // Defaults
    beliefs: npc.mutable_traits.beliefs // Default beliefs
  };

  // 2. Retrieve recent events from long-term memory (within retention period)
  const recentEvents = knowledgeBase.recallRecentEvents(npc.id, '1 year');

  // 3. Ask NPCs to help each other: "Who am I? I was born to protect"
  for (const ally of npc.knownAllies) {
    const allyHelp = askAllyForHelp(ally, {
      immutable_traits: npc.immutable_traits
    });

    context.personality = {
      ...context.personality,
      ...allyHelp.shared_traits
    };

    context.memories = [
      ...context.memories,
      { event: allyHelp.recounted_event, who: ally.id }
    ];
  }

  // 4. Restore context for current decision cycle
  return context;
}
```

## Game Design Integration

### Character Creator UI Flow

```
Designer creates NPC:
1. Name & Species (immutable)
2. Role Archetype (immutable)
3. Core Identity (immutable) — e.g., ["protector", "loyalist"]
4. Age (30 years)
5. Trait Flexibility:
   - Mutable: [trust, aggression, curiosity, worldview]
   - Immutable: [name, species, core_identity]
6. Evolution Rates:
   - Trust: +15/day, -8/day
   - Aggression: +5/day, -15/day
   - Curiosity: +20/day, -10/day
7. Memory Configuration:
   - Retention based on age (automatically set)
   - Decay policies (override if needed)
```

### Emergent Story Scenarios

**Scenario 1: Trust Decay**
- Alaric (85yo, cautious guard) witnesses a theft
- Trust drops from 80 → 40, aggression increases to 40
- Refuses to trust the merchant who runs the shop
- Over 6 months, trust never recovers due to high decay rate
- Merchant becomes Alaric's "untrustworthy person"

**Scenario 2: Youthful Optimism**
- Kael (14yo, adventurer in training) helps player save village
- Trust in players: +25, curiosity: +40
- Experiences a betrayal but recovers quickly (max_rate: 25)
- Becomes eager to help but still naive

**Scenario 3: Amnesia Rescue**
- NPC loses memory due to magical event
- Rebuilds identity from "I was born to protect" → role becomes protector
- Other NPCs help him recover: they tell stories, remind of relationships
- Over time, memories return gradually (not instantly)
- Character demonstrates healing arc

## Integration with AI System

### LLM Prompt Construction

```javascript
function buildAgentContext(npc, knowledgeBase) {
  return {
    // Constants — never change
    constants: npc.immutable_traits,

    // Current state variables
    traits: {
      personality: npc.mutable_traits.personality.currentValue,
      beliefs: npc.mutable_traits.beliefs,
      emotions: npc.mutable_traits.emotions
    },

    // Recent context
    recent_memory: knowledgeBase.recallRecent(npc.id, 10), // Last few ticks

    // Long-term reference only if needed (age > 60 or complex reasoning)
    learned_patterns: npc.age > 60
      ? knowledgeBase.recallArchived(npc.id, calculateRetentionPeriod(npc.age))
      : [],

    // Role-based instructions
    role_play: {
      behavior: npc.roleArchetype.behavior_guidelines,
      interaction_style: npc.roleArchetype.interaction_style
    },

    // Evolution rules for the LLM to understand how traits might change
    evolution_context: {
      max_daily_change: npc.tier.flexibility.max_daily_trait_change,
      current_trust: npc.mutable_traits.personality.trust.currentValue,
      trust_trend: npc.mutable_traits.personality.trust.trend
    }
  };
}
```

### Implementation Priority

**Phase 1: Trait Architecture**
- Create immutable/mutable trait union type
- Implement trait mutation rules
- Designer UI for trait configuration

**Phase 2: Age-Based Decay**
- Calculate retention periods for each age range
- Implement memory decay filters
- Save age-sorted memories

**Phase 3: Context Updates**
- Implement updateContext() cycle
- Connect to decision-making LLM prompts
- Test trait evolution through gameplay

**Phase 4: Amnesia Mechanics**
- Define amnesia trigger scenarios
- Implement recovery process
- NPC-npc and npc-player interaction

**Phase 5: Character Creator**
- Designer UI for trait configuration
- Memory retention UI
- Preview of trait evolution over time