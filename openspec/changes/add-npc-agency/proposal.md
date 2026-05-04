# Proposal: Add NPC Agency to ASCII Demo

## Summary
Enhance the ASCII movement demo to give NPCs genuine autonomy with goals, memory, and reasoning capabilities. The NPC should not merely react to the current state, but actively pursue objectives and reflect on its experiences over time.

## Motivation
- The current `move.js` demo uses LLM for one-shot decision-making without persistence, lacking the core definition of "agency" as stated in the RPG engine project.
- Constitution P1 requires "real agency, not just decision points" — NPCs must have goals, memory, and the ability to act on a shared world.
- A demo should showcase the engine's core promise: AI-controlled agents, not pre-scripted dialogue trees.
- Current behavior leads to repetitive, uninformed decisions that don't demonstrate the engine's potential.

## Scope
- Add goal-based planning to the NPC decision system:
  - NPCs have identifiable goals (e.g., protect chest, gather herbs, patrol checkpoint)
  - NPCs reason about how to achieve goals (multi-step planning)
  - NPCs understand obstacles and adapt plans when needed
- Introduce memory system for NPCs:
  - Short-term memory of recent observations and actions
  - Memory of past attempts and failures
  - Context for decision-making (why am I doing this?)
- Enhance the LLM prompt architecture:
  - Goals and objectives seeded by designers
  - Multi-step action planning (not just one move)
  - Contextual reasoning (considering history and consequences)
- Maintain backward compatibility with existing modes (patrol, llm, ollama)

## Non-goals
- Changing the core ASCII rendering or world-state specs.
- Implementing full character persistence across sessions (separate from action agency).
- Adding complex emotional or social dynamics beyond goal-based agency.
- Creating a full RPG scenario with dialogues (remain conversation-focused with LLM).

## Success criteria
- The NPC can execute its goal with purposeful, reasoned actions.
- The NPC remembers past attempts and adapts when blocked.
- The NPC reasons about multiple-step sequences toward its goal.
- The NPC communicates its intent when taking actions.
- All action validation remains authoritative (world-state is truth).

## Blocking Dependencies
Resolved by:
- Q3.1 "How much autonomy do NPCs actually have?" — We are adopting **goal-bounded autonomy** where designers seed goals but NPCs choose actions autonomously.
- Q3.4 "How do NPCs handle 'I don't know what to do'?" — We will use idle/wander fallback when goals are blocked or unknown.

## Related OpenSpec
- `specs/world-state` — Grid world profile for observation structure
- `specs/world-rendering` — ASCII rendering layering rules