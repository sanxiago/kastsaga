# Logging Integration TODO

## Overview
Add structured logging to `examples/ascii-world/move.js` to comply with the OpenSpec logging specification requirements.

## Current Status
✅ Logger module created (`logger.js`) with all required event types
✅ Basic import and configuration added to move.js
✅ OpenSpec logging requirements documented in review
❌ Logging integration points NOT added to gameplay logic

## Pending Tasks

### High Priority (Required for Spec Compliance)

- [ ] **Add logging to `planNPCWithLLM` function**
  - Log action proposal before API call
  - Log backend decision with model info
  - Log timeout/error when API fails

  Location: Around line 228-313 in move.js
  ```javascript
  // Before API call
  logger.actionProposed(npc.id, 'llm-decision', null, npcState.currentIntent);
  logger.backendDecision(correlationId, 'openrouter', OPENROUTER_MODEL, action, reasoning);

  // In timeout handler
  logger.timeout(npc.id, 'openrouter', OPENROUTER_MODEL, OPENROUTER_TIMEOUT_MS, elapsed, fallback);
  logger.error(npc.id, e.name, errorMsg, { correlationId });
  ```

- [ ] **Add logging to `planNPCWithOLLAMA` function**
  - Log action proposal with context
  - Log backend decision
  - Log timeout/error handling
  - Track correlation IDs per NPC tick

  Location: Around line 298-406 in move.js

- [ ] **Add logging to `stepNPC` function**
  - Create correlation ID for each tick
  - Log all NPC actions before validation
  - Log validation results (accept/reject)
  - Log execution results
  - Add tick numbers to all logged entries

  Location: Around line 408-486 in move.js

- [ ] **Add logging for player actions**
  - Log player movement actions
  - Log validation failures
  - Log dialogue attempts

  Location: In `keypress` handler around line 487-502

- [ ] **Add tick counter tracking**
  - Create global `tickCounter` variable
  - Update tickCounter before each logged action
  - Include tick in all log entries (timestamp + tick)

  ```javascript
  let tickCounter = 0; // Add at top of file
  tickCounter++; // Before logging action
  ```

### Medium Priority (Enhanced Observability)

- [ ] **Update logger to include tick field**
  - Modify AsciiLogger to accept and store tick numbers
  - Update `actionProposed`, `actionValidated`, `actionExecuted` to include tick
  - Add helper method `logWithTick(eventType, data)`

- [ ] **Add logging to `attemptDialogue` functions**
  - Log dialogue attempts with speaker/listener IDs
  - Track guardrail results (accepted/rejected/modified)
  - Store original utterance vs. modified utterance

- [ ] **Add error context logging**
  - Store request/prompt in error entries (redacted)
  - Store full stack traces for debugging
  - Log validation error details

- [ ] **Add validation logging**
  - Log all movement validations (wall, terrain, entity blocking)
  - Track validation failure reasons
  - Log validation success with pre/post state

### Low Priority (Future Enhancements)

- [ ] **Add file-based logging persistence**
  - Create FileLogger utility that appends to log file
  - Use ./logs/ directory for log files
  - Add log rotation based on size or time

- [ ] **Add replay capability**
  - Parse log files to recreate game state
  - Replay decisions from logged entries
  - Add replay command-line flag

- [ ] **Add log analytics dashboard**
  - Aggregate logging stats (API success rates, avg latency)
  - Visualize decision patterns
  - Track performance metrics

- [ ] **Add sensitive data redaction**
  - Auto-redact API keys in logs
  - Redact prompts and system messages
  - Add redaction markers for hidden entities

## Integration Pattern

For each logging insertion point:

```javascript
// 1. Create correlation ID for this session/tick
const correlationId = logger.setCorrelation(`npc-${npcId}-tick${tickCounter}`);

// 2. Log event with required fields
logger.actionProposed(actorId, actionType, direction, intent);
logger.backendDecision(correlationId, backend, model, action, reasoning);
logger.actionValidated(actorId, actionType, direction, 'accepted', reason);
logger.actionExecuted(actorId, actionType, direction, result, note);
logger.dialogueAttempt(speakerId, listenerId, utterance, result, ruleId);

// 3. Include tick and timestamp (added by logger automatically)

// 4. Handle errors
logger.timeout(actorId, backend, model, budget, elapsed, fallback);
logger.error(actorId, errorType, message, context);
```

## Testing Checklist

After integration:

- [ ] Test with LOG_FILE=1 flag enabled
- [ ] Verify JSON log entries are valid
- [ ] Verify all required fields present (timestamp, event type, actor, correlation, backend, outcome)
- [ ] Test with NPC in patrol mode (no logging needed)
- [ ] Test with NPC in LLM mode (logging all actions)
- [ ] Test with NPC in OLLAMA mode (logging all actions)
- [ ] Verify log entries include tick numbers
- [ ] Test timeout scenarios (force API failure)
- [ ] Test error scenarios (invalid API key, network issues)
- [ ] Test dialogue logging (accepted/rejected cases)
- [ ] Verify player-facing logs don't leak hidden info
- [ ] Test log file persistence across restarts

## Expected Log Output Example

```json
{"timestamp":1714567890123,"tick":1,"event":"action.proposed","correlationId":"npc-npc:guard-tick1","actor":"npc:guard","actionType":"llm-decision","intent":"guarding the chest"}
{"timestamp":1714567890125,"tick":1,"event":"backend.decision","correlationId":"npc-npc:guard-tick1","backend":"openrouter","model":"openrouter/auto","action":"move east","reasoning":"Planning to approach the chest"}
{"timestamp":1714567890128,"tick":1,"event":"action.validated","correlationId":"npc-npc:guard-tick1","actor":"npc:guard","actionType":"llm-decision","direction":"east","validity":"accepted","reason":null}
{"timestamp":1714567890129,"tick":1,"event":"action.executed","correlationId":"npc-npc:guard-tick1","actor":"npc:guard","actionType":"llm-decision","direction":"east","result":"Moved","note":"approaching chest"}
{"timestamp":1714567890130,"tick":1,"event":"dialogue.attempt","correlationId":"npc-npc:guard-tick1","speaker":"player:player","listener":"npc:guard","utterance":"hello","guardrailResult":"accepted","guardrailRule":null}
```

## Completion Criteria

✅ All action lifecycle events logged (proposed, validated, executed)
✅ All backend events logged (API calls, timeouts, errors)
✅ All validation results logged (accepted/rejected with reasons)
✅ All dialogue attempts logged (with guardrail results)
✅ Correlation IDs link all related events
✅ Timestamps and ticks recorded for all entries
✅ Actor/entity IDs tracked for traceability
✅ Backend info included for AI decisions
✅ Replay support possible from log files

## Dependencies

- **Must have:** Logger module already created (`logger.js`)
- **Must have:** Move.js file updated at integration points
- **Should have:** Working LLM or OLLAMA backend for testing
- **Nice to have:** Log file analysis tools for validation

## Notes

- Use `??` operator instead of `||` for null coalescing to handle empty strings
- Correlation IDs should be unique per game session/tick
- Error messages should be plain text, not structured (except for context object)
- Do not log secrets (API keys, prompts, tokens)
- Player-facing console output should remain clean (only summary, not raw logs)

---

**Created:** 2026-05-03
**Status:** Implementation started, integration pending
**Priority:** High (spec compliance requirement)