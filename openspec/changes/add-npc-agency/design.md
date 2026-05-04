# Design — NPC Agency in ASCII Demo

## High-Level Architecture

The ASCII demo currently uses a one-shot decision loop: at each tick, the LLM receives current world state and outputs the next action. This lacks persistence and goal-oriented behavior.

### Agent Model

NPCs are now modeled as **bounded rational agents**:
- **Goals**: What the NPC wants/needs to do (e.g., "protect the chest," "gather herbs")
- **Memory**: What the NPC has observed, attempted, and experienced
- **Perception**: Current world state
- **Reasoning**: Planning actions toward goals considering obstacles
- **Action**: Taking validated moves/talks/dialogues

## Components

### 1. NPC State Object

Each NPC maintains an internal state object:

```javascript
const npcState = {
  id: "npc:guard",
  role: "npc",

  // Goals (seeded by designers, can be reconfigured)
  goal: {
    type: "protect",
    target: { id: "obj:chest", description: "worn wooden chest" },
    priority: 1
  },

  // Memory of observations
  memory: {
    seen: [],            // Array of past observation snapshots
    attempts: [],        // Actions tried with outcomes
    blockedPathCount: 0  // Track persistent obstacles
  },

  // Decision context
  currentIntent: "guarding the chest",  // What I'm doing now
  nextStepPlan: null                    // LLM-generated plan for next 3-5 moves
};
```

### 2. Goal System

Goals are designer-defined with:
- `type`: What kind of goal (protect, gather, traverse, patrol)
- `target`: Specific object/location/entity to act upon
- `priority`: Relative importance (higher = more important)
- `deadline`: Optional time horizon
- `reasoning`: Designer-supplied "why" this matters

Examples:
```javascript
// Guard NPC
goal: {
  type: "protect",
  target: { id: "obj:chest", description: "secure the treasure chest" },
  priority: 1,
  reasoning: "The chest contains valuable items; my duty is to prevent theft"
}

// Explorer NPC
goal: {
  type: "gather",
  target: { id: "obj:herb", description: "collect herbs for medicine" },
  priority: 1,
  reasoning: "Herbs are needed for healing; I must gather them and bring them home"
}
```

### 3. Memory System

The memory captures the agent's experience:

**Observation Memory** (`seen`):
```javascript
memory: {
  seen: [
    {
      turn: 1,
      location: "(5,5)",
      visibleEntities: ["npc:guard", "player:you", "npc:dog"],
      nearbyObjects: ["📦 chest at (5,4)"]
    },
    {
      turn: 2,
      location: "(6,5)",
      visibleEntities: ["npc:guard", "player:you", "npc:dog"],
      nearbyObjects: ["📦 chest at (5,4)"]
    }
  ]
}
```

**Attempt Memory** (`attempts`):
```javascript
memory: {
  attempts: [
    { action: "move west", result: "blocked by wall", reason: "path obstructed" },
    { action: "move east", result: "moved", reason: "closer to chest" }
  ]
}
```

### 4. LLM Prompt Architecture

The prompt is multi-layered to provide context:

```javascript
const systemPrompt = `
You are an autonomous NPC with a goal to achieve.

Your capabilities and constraints:
- You can move north/south/east/west, stay in place, or attempt dialogue
- Obstacles: walls (#), water (~), impassable terrain
- Actions must be validated: you cannot walk into blocked cells
- You have short-term memory of recent observations and attempts

Output format: JSON with
{
  "action": "move|stay|talk",
  "direction": "north|south|east|west" (if move),
  "intent": "briefly explain what you're aiming for",
  "note": "why this action makes sense given obstacles and your goal"
}
`;

const userPrompt = `
Current context:

MY GOAL: ${npcState.goal.type} ${npcState.goal.target.description}

MY LOCATION: (${npc.x}, ${npc.y})

RECENT HISTORY:
${npcState.memory.seen.slice(-3).map(obs =>
  `Turn ${obs.turn}: I was at ${obs.location} and saw: ${obs.visible.join(", ")}.`
).join("\n")}

RECENT ATTEMPTS:
${npcState.memory.attempts.slice(-3).map(att =>
  `Turn ${att.turn}: ${att.action} → ${att.result} (${att.reason}).`
).join("\n")}

I am currently ${npcState.currentIntent}.

VISIBLE WORLD:
${renderedGrid}

ADJACENT CELLS:
${adjacentDescription}
`;
```

### 5. Planning Horizon

The agent plans for multiple steps, but only executes one at a time:

- **1-step**: Immediate adjacent move (as now)
- **3-5 step**: Short-term plan (what I'll do next few turns)
- **Context**: What's blocking me, what's my progress, what's the next obstacle

This creates the appearance of agency even if the LLM doesn't have true long-term planning, because:

1. The reasoning explains *intent* (not just action)
2. Memory provides context of *experience*
3. Planning shows *consideration* of future obstacles

### 6. Fallback on Failure

When the NPC cannot make progress toward its goal:

1. **Re-evaluate goal**: Did something change?
2. **Adapt plan**: Take alternative path
3. **Idle fallback**: Wander or chat if no direction possible
4. **Report to designer**: Log "goal blocked by obstacles; adapting..."

## Key Design Decisions

### Q3.1 How Much Autonomy?
**Decision**: Goal-bounded autonomy (goal-bounded option)
- Designers seed goals and targets
- NPCs decide *how* to achieve them
- Actions still validated by authoritative world rules
- NPCs can only act within realistic bounds

### Q3.4 Handling "I Don't Know What to Do"
**Decision**: Adaptive wandering on blocked goals
- If a goal cannot be achieved (blocked path, no target), NPC switches to exploration
- Exploration becomes new temporary goal: "explore this area"
- After X turns of exploration, NPC may reassess original goal or switch to patrol

### Validated World Authority
**Crucial Principle**: LLM is advisory, world state is authoritative
- All moves/talks proceed through validation functions
- LLM output is advisory only, not definitive
- Validation enforces bounds, passability, adjacency, etc

## Implementation Notes

### Environment Variables for Testing
- `NPC_GOAL`: Custom goal type (affects prompt, not world)
- `NPC_GOAL_TARGET`: Specific object ID to target
- `NPC_GOAL_REASONING`: Designer-specified reasoning for the goal

### Backward Compatibility
- Default behavior: `NPC_MODE=patrol` still works as one-shot decisions
- `NPC_MODE=llm` now includes goal/memory context
- `NPC_MODE=ollama` uses same goal-based planning with OLLAMA API

### Extensibility
This foundation supports future enhancements:
- More complex goals (sequence of sub-goals)
- Emotional states (anxious, curious, defensive)
- Social goals (greet player, follow player)
- Resource management (health, inventory)