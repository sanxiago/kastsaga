# Character Identity System — Implementation Tasks

## Overview
Tasks are organized by phase. Each task is specific, testable, and contributes to the overall character identity system.

## Phase 1: Trait Architecture Foundation (Week 1)

### Core Trait System

- [ ] **T1.1**: Define immutable/mutable trait type system
  - TypeScript interface for `ImmutableTraits`
  - TypeScript interface for `MutableTraits`
  - TypeScript interface for `TraitDefinition` (includes mutable flags, min/max, rate limits)
  - Location: `specs/npc-memory/spec-ts/interfaces.ts`

- [ ] **T1.2**: Implement trait mutation rules engine
  - Function `applyTraitMutations(npc, events, rules)`
  - Support additive, subtractive, state, and value reset mutations
  - Validate mutations against trait constraints (min/max, rates)
  - Location: `engine/trait-mutation.ts`

- [ ] **T1.3**: Create trait comparison utility
  - Function `compareTraits(oldTraits, newTraits)` returns changed traits
  - Function `calculateTraitEvolutionRate(changes)` returns net change for reporting

- [ ] **T1.4**: Build designer UI component for trait configuration
  - Trait checklist (select which traits are mutable or immutable per NPC)
  - Trait value sliders with min/max limits
  - Evolution rate inputs (daily change limits)
  - Location: `ui/character-creator.tsx`

### Character Data Structure

- [ ] **T1.5**: Design character data schema
  - Schema includes immutable_traits, mutable_traits, trait_evolution_rules
  - Includes age, species, role_archetype, base_presentation
  - Location: `schemas/character-schema.json`

- [ ] **T1.6**: Implement Character entity class
  - Encapsulates trait mutation logic
  - Provides getter/setter methods for traits
  - Validates trait changes before applying
  - Location: `engine/entities/Character.ts`

## Phase 2: Age-Based Memory Retention (Week 1)

### Memory Retention Logic

- [ ] **T2.1**: Implement age-to-retention mapping utility
  - Function `calculateRetentionPeriod(npcAge)` returns days
  - Supports interpolation between age ranges
  - Handles edge cases (age 0+, custom ages)
  - Location: `engine/memory/retention.ts`

- [ ] **T2.2**: Create memory decay filter
  - Function `filterDecayedMemory(memory, retentionPeriod)` removes old entries
  - Marks entries as "decayed" but retains summary in logs
  - Preserves decay events for analytics
  - Location: `engine/memory/decay.ts`

- [ ] **T2.3**: Add memory age tracking to data structures
  - Every long-term memory entry includes timestamp and entity age
  - Entity age advances over time (optional gameplay feature)
  - Location: `schemas/memory-schema.json`

- [ ] **T2.4**: Implement retention policy enforcement
  - Function `shouldRetainMemory(memory, entityAge, retentionMap)` returns boolean
  - Used during save/load and context building
  - Location: `engine/persistence/retention.ts`

### Documentation

- [ ] **T2.5**: Document memory retention policy table
  - Include narrative implications for each age range
  - Add examples: child vs elder memory recall differences
  - Location: `docs/memory-retention.md`

## Phase 3: Context Update Mechanics (Week 2)

### Context Lifecycle

- [ ] **T3.1**: Implement updateContext() function
  - Refreshes position, status, awareness
  - Applies trait decay
  - Rebuilds role-specific context
  - Returns updated context object
  - Location: `engine/context-manager.ts`

- [ ] **T3.2**: Create trait decay system
  - Per-trait decay rates (configurable)
  - Temporal decay (per tick, per day, per event)
  - Decay direction: always towards neutral/fade
  - Location: `engine/trait-decay.ts`

- [ ] **T3.3**: Build role-specific context templates
  - Templates for roleArchetypes (guard, merchant, scholar, etc.)
  - Include expected behaviors, interactions, social roles
  - Location: `core/roler-context-templates.ts`

- [ ] **T3.4**: Implement context diffing for logging
  - Function `diffContext(oldContext, newContext)` returns changed values
  - Used for logging trait changes and narrative events
  - Location: `engine/context-diff.ts`

### Integration with AI

- [ ] **T3.5**: Integrate context update with LLM decision system
  - Update context before calling `planNPCWithLLM()`
  - Pass context with mutable trait values updated
  - Include current trait values in system prompt
  - Location: `engine/ai/llm-integration.ts`

- [ ] **T3.6**: Build context serialization for save/load
  - Function `serializeContext(context)` returns serializable object
  - Function `deserializeContext(data)` rebuilds context
  - Include all required data for entity state reconstruction
  - Location: `engine/persistence/context.ts`

## Phase 4: Amnesia Mechanics (Week 2-3)

### Amnesia Scenarios

- [ ] **T4.1**: Define amnesia types and triggers
  - Document full amnesia, selective, transient, identity crisis
  - Create event constants: `AMNESIA_TRIGGER`, `MEMORY_LOSS_EVENT`
  - Location: `engine/constants/events.ts`

- [ ] **T4.2**: Implement amnesia state manager
  - Function `triggerAmnesia(npc, type, severity)` sets NPC amnesiac flag
  - Function `isAmnesiac(npc)` returns boolean
  - Location: `engine/entities/Character.ts`

- [ ] **T4.3**: Build memory recovery process
  - Function `recoverFromAmnesia(npc, knowledgeBase, allies)`
  - Rebuilds context from immutable traits
  - Retrieves relevant memories from long-term store
  - Asks allies for help reconstructing identity
  - Location: `engine/memory/recovery.ts`

- [ ] **T4.4**: Implement ally help system
  - Function `askAllyForHelp(ally, context)` returns ally's assistance
  - Allies provide shared traits and recounted events
  - Allies may have different perspectives on events
  - Location: `engine/social/ally-help.ts`

- [ ] **T4.5**: Create amnesia recovery visualizations
  - On-screen indicator when NPC recovering from amnesia
  - Narrative log messages about memory restoration
  - Option to fast-forward recovery (if allowed)
  - Location: `ui/amnesia-recovery.tsx`

### Testing

- [ ] **T4.6**: Test full amnesia workflow
  - Trigger amnesia, observe NPC behavior
  - Verify immutable traits remain constant
  - Verify memory recovery timeline
  - Verify ally interactions during recovery
  - Write test cases: `test-amnesia-recovery.ts`

## Phase 5: AI Integration & Logging (Week 3)

### AI System Integration

- [ ] **T5.1**: Update LLM prompt builder for trait updates
  - Include current trait values and evolution potential
  - Add evolution rules to system prompt for context
  - Include trait decay direction (fading memories)
  - Location: `engine/ai/prompt-builder.ts`

- [ ] **T5.2**: Implement trait change logging
  - Log trait mutations with timestamps, previous/current values
  - Filter logs to only show significant changes (threshold > 5)
  - Store in long-term memory if change is significant
  - Location: `engine/logging/trait-changes.ts`

- [ ] **T5.3**: Add correlation IDs for context updates
  - Track context update events with correlation IDs
  - Link trait changes to gameplay events
  - Location: `engine/correlation-tracker.ts`

### Observability

- [ ] **T5.4**: Create trait evolution dashboard
  - Visual display of trait values over time
  - Show mutation events on timeline
  - Compare trait evolution rates
  - Location: `ui/trait-evolution.tsx`

- [ ] **T5.5**: Implement analytics for trait changes
  - Track trait evolution patterns across NPCs
  - Calculate total trait mutation events per session
  - Identify NPC archetypes with rapid evolution
  - Location: `engine/analytics/trait-evolution.ts`

## Phase 6: Documentation & Polish (Week 3-4)

### Documentation

- [ ] **T6.1**: Write character creator user guide
  - Step-by-step instructions for setting up NPC traits
  - Screenshots of trait configuration UI
  - Tips for balancing mutable vs immutable traits
  - Location: `docs/character-creator-guide.md`

- [ ] **T6.2**: Document amnesia gameplay scenarios
  - Examples of how amnesia creates story opportunities
  - Guide for designers to integrate amnesia in scenarios
  - Location: `docs/amnesia-scenarios.md`

- [ ] **T6.3**: Write memory retention explanation
  - Explain age-based decay mechanics
  - Provide examples of how this affects decision-making
  - Add troubleshooting section for unusual memory behavior
  - Location: `docs/memory-retention-explanation.md`

### Examples & Tutorials

- [ ] **T6.4**: Create character evolution tutorial
  - Demonstrate trait mutation through gameplay
  - Show how to read trait evolution from logs
  - Location: `examples/character-evolution-tutorial/`

- [ ] **T6.5**: Write amnesia workshop example
  - Scenario design for NPCs with amnesia
  - Include ally help interactions
  - Show memory recovery with all mechanics
  - Location: `examples/amnesia-recovery-demo/`

### Testing & Validation

- [ ] **T6.6**: Test age-based decay accuracy
  - Verify retention periods match age ranges
  - Test interpolation logic at boundaries
  - Verify memory decay on save/load cycles
  - Location: `test/memory-decay.test.ts`

- [ ] **T6.7**: Test trait mutation constraints
  - Verify max_rate limits prevent trait explosions
  - Test min/max value enforcement
  - Verify immutable traits never change
  - Location: `test/trait-mutation.test.ts`

- [ ] **T6.8**: Test amnesia recovery with allies
  - Verify immutable traits remain constant
  - Verify allies' stories match their perspectives
  - Verify gradual vs instant recovery
  - Location: `test/amnesia-recovery.test.ts`

- [ ] **T6.9**: End-to-end integration testing
  - Run complete workflow: character creation → gameplay → trait evolution → amnesia → recovery
  - Verify save/load restores state correctly
  - Verify persistence across sessions
  - Location: `test/integration/character-system.test.ts`

## Priority Order

**Week 1 (Critical):** T1.1, T1.4, T1.5, T1.6, T2.1, T2.3
**Week 2 (Critical):** T3.1, T3.2, T3.4, T4.1, T4.2, T4.3
**Week 3 (High Priority):** T5.1, T5.2, T5.3, T6.3, T6.6
**Week 4 (Polish):** T6.4, T6.5, T6.7, T6.8, T6.9

## Success Criteria

✓ NPCs have age-based memory retention policies affecting decisions
✓ Designers can configure mutable vs immutable traits for each character
✓ NPCs dynamically update contextual trait values through gameplay
✓ Amnesia scenarios allow NPCs to recover memory with help from others
✓ Character evolution results in observable behavioral changes
✓ Save/load preserves character state (traits, memories, context)
✓ Logger tracks trait changes and evolution events
✓ Designer UI allows full flexibility in character configuration

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 6 tasks | 1.5 weeks |
| Phase 2 | 4 tasks | 1 week |
| Phase 3 | 6 tasks | 1 week |
| Phase 4 | 6 tasks | 1-2 weeks |
| Phase 5 | 4 tasks | 1 week |
| Phase 6 | 5 tasks | 0.5 weeks |
| **Total** | **31 tasks** | **4-5 weeks** |

## Dependencies

- Trait architecture (Phase 1) depends on existing `npc-memory` schema
- Context updates (Phase 3) depend on trait mutation system
- LLM integration (Phase 5) depends on context update system
- Amnesia mechanics (Phase 4) depend on context system and memory storage

## Open Questions

To be resolved during implementation:

- Q: Should NPCs have different memory decay for different memory types? (e.g., relationships vs events)
- Q: Can players influence memory decay via potions, artifacts, or environmental effects?
- Q: How detailed should trait evolution be? (single value vs vector of traits)
- Q: Should NPCs have "forget-trigger" thresholds (memory loss occurs at X% decay)?
- Q: Can NPC memories be magically erased without amnesia? (memory corruption vs loss)

These questions should be documented and resolved as needed during development lifecycle.