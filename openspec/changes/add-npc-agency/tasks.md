# Tasks: Add NPC Agency to ASCII Demo

## Phase 1: Data Structure Foundation

- [ ] **T1.1**: Add NPC state object structure to `move.js`
  - Define `npcState` object with id, role, goal, memory, currentIntent
  - Initialize state in `start()` function for the NPC entity

- [ ] **T1.2**: Add memory tracking functions
  - `addObservation(observation)`: Snapshot current state to history
  - `addAttempt(action, result, reason)`: Record actions taken
  - `getObservationHistory(n, offset=0)`: Get recent observations

- [ ] **T1.3**: Add goal configuration from environment
  - `getNpcGoalType()`: Read `NPC_GOAL` env var (default: "protect")
  - `getNpcGoalTarget()`: Read `NPC_GOAL_TARGET` (default: "chest")
  - `getNpcGoalReasoning()`: Read `NPC_GOAL_REASONING` (custom reasoning)

## Phase 2: Enhanced Prompt System

- [ ] **T2.1**: Create system prompt template
  - Include agent capabilities and constraints
  - Explain output JSON format
  - Document memory and goal context

- [ ] **T2.2**: Build user prompt from context
  - Goal description (type + target + reasoning)
  - Current location
  - Recent observation history (last N turns)
  - Recent attempt history (last N turns)
  - Current intent state
  - Rendered grid view
  - Adjacent cell descriptions
  - Entity and object visibility

- [ ] **T2.3**: Add step-ahead planning field
  - Request LLM to consider next 3-5 moves
  - Allow "stay" command as option
  - Include "intent" and "note" fields for reasoning

## Phase 3: Integration with LLM Calls

- [ ] **T3.1**: Update `planNPCWithLLM()` to include goal/memory
  - Pass `npcState` object to prompt builder
  - Include goal information in user prompt
  - Include memory context in user prompt
  - Parse new JSON fields (intent, note)

- [ ] **T3.2**: Update `planNPCWithOLLAMA()` similarly
  - Mirror changes from T3.1 but use OLLAMA API format
  - Ensure JSON response format handling

- [ ] **T3.3**: Create `updateNpcState()` function
  - After LLM action, update `currentIntent` based on parsed intent
  - Add current observation to memory
  - Add attempted action to attempt history

## Phase 4: Action Execution with Intent Display

- [ ] **T4.1**: Enhance `printState()` to show agent state
  - Display goal description after legend
  - Show current intent: "I am: [intent]"
  - Optionally show progress: "[goal] - attempting to..."

- [ ] **T4.2**: Update `performNPCAction()` to include intent
  - Prefix action messages with intent: "Moving west to get closer to chest"
  - Log reasoning from LLM `note` field when available

## Phase 5: Fallback Behavior

- [ ] **T5.1**: Add blocked-goal detection
  - Check if `currentIntent` results in move failure
  - Track how many consecutive blocked attempts

- [ ] **T5.2**: Implement adaptive wandering fallback
  - If blocked > X consecutive times, switch to exploration mode
  - Change goal to "explore this area"
  - Generate wandering direction (per coordinate change)

## Phase 6: Backward Compatibility & Testing

- [ ] **T6.1**: Maintain patrol mode as-is
  - Ensure `NPC_MODE=patrol` functions with existing logic

- [ ] **T6.2**: Test goal-based mode (llm/ollama)
  - Run with default settings (no custom env vars)
  - Verify NPC takes goal-directed actions
  - Check memory persists across turns

- [ ] **T6.3**: Test persistent goals
  - Set custom `NPC_GOAL` and `NPC_GOAL_TARGET`
  - Verify NPC persists toward that goal
  - Confirm actions are reasoned

- [ ] **T6.4**: Test exploration fallback
  - Place obstacles between NPC and goal
  - Verify NPC adapts after repeated failures
  - Confirm switch to wandering

## Phase 7: Documentation

- [ ] **T7.1**: Update README in examples/ascii-world/
  - Document new NPC modes and behavior
  - Explain how to configure goals via environment variables
  - Provide usage examples

- [ ] **T7.2**: Update task completion criteria
  - NPC shows its goal and current intent
  - NPC remembers past observations and attempts
  - NPC plans multi-step reasoning
  - NPC communicates intent when taking actions
  - All world validations still enforced

## Dependencies

- Resolves: Q3.1 "How much autonomy do NPCs actually have?"
- Resolves: Q3.4 "How do NPCs handle 'I don't know what to do'?"

## Success Metrics

1. **Agency demonstrated**: NPC actions show purpose, not randomness
2. **Memory displayed**: NPC can reference past situations in reasoning
3. **Plan shown**: LLM outputs include intent and step-ahead planning
4. **Contextual reasoning**: LLM explains *why* actions are taken
5. **Adaptive behavior**: NPC adapts when goals are blocked

## Estimated Effort

- Phase 1: Small (data structures)
- Phase 2: Moderate (prompt engineering)
- Phase 3: Moderate (LLM integration changes)
- Phase 4: Small (display updates)
- Phase 5: Moderate (fallback logic)
- Phase 6: Large (testing different scenarios)
- Phase 7: Small (documentation)

**Total**: Approximately 4-6 hours of focused work