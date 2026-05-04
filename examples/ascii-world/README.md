# ASCII World Demo with NPC Agency

An interactive ASCII grid world demo demonstrating AI-controlled NPCs with autonomy, memory, and goal-based decision-making.

## Features

- **Player movement**: Arrow keys to move, boundary checks, obstacle detection
- **LLM-powered NPCs**: NPCs that think, remember, and act with purpose
- **Goal-based autonomy**: NPCs have identifiable goals (protect, gather, patrol)
- **Memory system**: NPCs remember observations and past attempts
- **Contextual reasoning**: NPCs explain their actions and intentions
- **Configurable modes**: Support for patrol, OpenRouter, and OLLAMA

## Controls

- **Arrow keys**: Move the player
- **i**: Inspect nearby cells
- **space**: Attempt dialogue with adjacent NPCs
- **q**: Quit

## Environment Variables

### NPC Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NPC_MODE` | `patrol` | Behavior mode: `patrol`, `llm`, or `ollama` |
| `NPC_GOAL` | `protect` | Goal type: `protect`, `gather`, `patrol`, or custom |
| `NPC_GOAL_TARGET` | `chest` | Specific target for the goal (e.g., object name) |
| `NPC_GOAL_REASONING` | *auto-generated* | Custom reasoning for the goal |

### OpenRouter Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | *required for LLM mode* | API key for OpenRouter |
| `OPENROUTER_MODEL` | `openrouter/auto` | Model to use for inference |
| `OPENROUTER_BASE` | `https://openrouter.ai/api/v1` | OpenRouter API base URL |
| `OPENROUTER_TIMEOUT_MS` | `10000` | Request timeout in milliseconds |

### OLLAMA Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE` | `http://localhost:11434` | OLLAMA server URL |
| `OLLAMA_MODEL` | `glm-4.7-flash:opencode_slow_max_ctx_thinking` | Model name |

## Usage

### Basic Usage (Patrol Mode)

NPC patrols automatically using a predefined path:

```bash
node move.js
```

### With OpenRouter (Goal-Based)

Set your OpenRouter API key and specify a goal:

```bash
export OPENROUTER_API_KEY="your-key-here"
export NPC_GOAL="gather"
export NPC_GOAL_TARGET="herb"

node move.js
```

### With OLLAMA (Local)

```bash
export OLLAMA_BASE="http://localhost:11434"
export NPC_GOAL="protect"
export NPC_GOAL_TARGET="chest"

node move.js
```

### Custom Goals

Create custom goals with specific reasoning:

```bash
export NPC_GOAL="guard"
export NPC_GOAL_TARGET="the exit door"
export NPC_GOAL_REASONING="I must prevent people from leaving the city"

node move.js
```

## NPC Behavior

### Current NPC State Display

The demo shows:

```
NPC Goal: protect - chest
  Reasoning: The chest contains valuable items; my duty is to prevent theft
Intent: I am guarding the chest
```

### Agent Memory

NPCs track:
- **Observations**: Recent locations and what they've seen
- **Attempts**: Past actions and their outcomes
- **Blocked counter**: Tracks persistent obstacles

### Decision-Making

NPCs consider:
1. Their current goal and what they need to achieve
2. Recent observations of the world
3. Past attempts and why they failed
4. Obstacles and alternatives
5. Their current intent when taking actions

## Example Scenarios

### Scenario 1: Guarding the Chest

```
export NPC_GOAL="protect"
export NPC_GOAL_TARGET="chest"
```

The NPC will actively try to protect the chest, moving toward it and warning about threats.

### Scenario 2: Gathering Herbs

```
export NPC_GOAL="gather"
export NPC_GOAL_TARGET="herb"
```

The NPC will explore the area and attempt to collect herbs shown in the world.

### Scenario 3: Patrol Mode

Without any goal configuration (or `NPC_MODE=patrol`), the NPC simply patrols the area in a predictable pattern.

## Design Notes

This demo showcases the RPG engine's core promise: **AI-controlled agents with goals, memory, and the ability to perceive and act on a shared world**.

### Agency Features

- **Goals**: Seeded by designers, chosen by the agent
- **Memory**: Short-term recollection of experience
- **Reasoning**: Explaining intent and choosing actions purposefully
- **Adaptation**: Fallback to wandering when goals are blocked

### Constraints

- All actions are validated by the authoritative world-state
- NPCs cannot walk through walls, water, or blocked terrain
- LLM outputs are advisory only—world rules are final

## Technical Implementation

### Memory Structure

```javascript
{
  goal: { type, target, reasoning, priority },
  memory: {
    seen: [{ turn, location, visibleEntities, nearbyObjects, nearbyEntities }],
    attempts: [{ turn, action, result, reason }],
    blockedCount: number
  },
  currentIntent: string
}
```

### Prompt Architecture

The LLM receives:
1. Goal description and reasoning
2. Current location and context
3. Recent observation history
4. Past attempts and failures
5. Action space and capabilities
6. World constraints and obstacles

### Output Format

LLM response includes:
- `action`: The chosen action
- `direction` (if move): North/south/east/west
- `intent`: Brief explanation of what's being aimed for
- `note`: Why this action makes sense

## Limitations

- Single location demo—no persistence across sessions
- LLM inference may be slow or fail (falls back to patrol)
- NPC memory is not persistent within a single run
- Goals are predefined; NPCs don't generate new goals autonomously

## Future Enhancements

- Character persistence across sessions
- Complex social dynamics and relationships
- Emotional states and personality
- Resource management (health, inventory)
- Multi-step planning with lookahead
- Dynamic goal generation
- Dialogue and conversation trees