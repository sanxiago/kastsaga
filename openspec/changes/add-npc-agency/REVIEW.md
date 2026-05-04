# Demo Specification Review — ASCII World

## Summary
The ASCII world demo has been implemented with NPC agency features but is missing the structured logging system required by the OpenSpec.

## Implementation Status

### ✅ Implemented
- NPC state with goals, memory, and intent tracking
- Goal-based behavior (protect, gather, patrol)
- LLM integration with OpenRouter
- OLLAMA integration for local inference
- Memory system (observations, attempts, blocked counts)
- Configuration via environment variables
- Comprehensive README documentation

### ❌ Missing (per Logging Spec Requirements)

#### Structured Log Entries
- Current: No structured logging implemented
- Required: JSON-formatted log entries at each decision point

#### Required Events (per spec)

| Event Type | Spec Requirement | Current Status |
|------------|------------------|----------------|
| action.proposed | Log before LLM call | ❌ Not logged |
| action.validated | Log validation result | ❌ Not logged |
| action.executed | Log action result | ❌ Not logged (partial console output only) |
| backend.decision | Log LLM/OLLAMA response | ❌ Not logged (response in console only) |
| timeout | Log timeout events | ❌ Not logged |
| error | Log errors | ❌ Not logged |
| dialogue.attempt | Log dialogue attempts | ❌ Not logged |

#### Required Fields (per log entry)
- Timestamp/tick: ❌ Not tracked
- Event type: ❌ Not tracked
- Actor/entity ID: ❌ Not tracked
- Correlation ID: ❌ Not tracked (no session management)
- Backend identifier/version: ❌ Not tracked
- Outcome/status: ❌ Not logged structurally
- Reason: ❌ Only in console messages

#### Spec Compliance

**Requirement: Structured log entries**
- NOT COMPLIANT: No structured JSON entries emitted

**Requirement: Required fields**
- NOT COMPLIANT: Missing all structured fields

**Requirement: Dialogue guardrail logging**
- NOT COMPLIANT: No dialogue logging

**Requirement: No leakage of hidden information**
- NOT APPLICABLE: No logging system exists
- SHOULD BE ADDRESSED: Secrets (API keys, prompts) would not be logged (good default)

**Requirement: Append-only and queryable**
- NOT APPLICANT: No logging mechanism

**Requirement: Replay support**
- NOT APPLICANT: No mechanism to replay decisions from logs

## Impact

### What's Working
- NPC agency features function correctly
- Goal-based behavior works as expected
- LLM integration produces decisions
- Memory system tracks NPC state
- User can inspect and interact with NPCs

### What's Broken (compliance-wise)
- No audit trail for decisions
- No correlation between actions and backends
- Cannot replay decision sequences
- No way to debug why an NPC made a particular choice
- Cannot verify NPC actions against spec requirements

### Operational Concerns
1. **Debugging**: Without logs, debugging NPC decisions is difficult
2. **Compliance**: Cannot verify the demo meets the logging spec requirements
3. **Observability**: System lacks transparency for decision-making
4. **Testing**: Cannot test/replay scenarios without logs

## Recommended Actions

1. **Add logger.js module** (already created)
   - Provides AsciiLogger class with structured logging
   - Handles all required event types
   - Tracks correlation IDs

2. **Integrate into move.js**
   - Import logger
   - Add logging at each decision point
   - Track ticks and correlations

3. **Enable via environment variable**
   ```bash
   LOG_FILE=1 node move.js
   ```

4. **Review with spec validation**
   - Run `openspec validate` suite
   - Verify all logging scenarios in spec
   - Add unit tests for logging outputs

## Next Steps

**Immediate (High Priority):**
- [ ] Add missing `OLLAMA_TIMEOUT_MS` environment variable
- [ ] Integrate logger.js into move.js
- [ ] Add logging for all action lifecycle events
- [ ] Add tick tracking to all logged entries
- [ ] Add logging for all error cases

**Medium Priority:**
- [ ] Add command-line argument parsing for logging options
- [ ] Add file-based logging to ./logs/ directory
- [ ] Add replay capability from log files
- [ ] Add redaction markers for player-facing logs

**Low Priority:**
- [ ] Add correlation ID persistence across sessions
- [ ] Add log aggregation utilities
- [ ] Add log analytics/reporting

## Conclusion

The demo successfully implements NPC agency features but is non-compliant with the logging spec. A structured logging system needs to be added to track actions, decisions, and outcomes. This is essential for observability, debugging, and verifying compliance with the OpenSpec requirements.

**Compliance Score:** 0% (logging requirements not implemented)

**Recommendation:** Add logging integration before considering the demo "production-ready" from a specification compliance perspective.