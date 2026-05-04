# Character Identity System — Change Proposal Review

## Summary
We are proposing a comprehensive character identity system with age-based memory retention, mutable/immutable trait architecture, trait evolution, and amnesia mechanics. This system transforms NPCs from static AI agents into living characters with player-influenced character arcs.

## Context
This proposal responds to open question Q2.1 (persistent or session-based characters) and Q8.1 (decision-making process). It provides a concrete implementation path for treating NPCs as living entities with personal identities.

## Implementation Status

### Proposed Features (Not Yet Implemented)

1. **Two-Tier Memory System**
   - In-memory context (active state, updated every tick)
   - Long-term memory (archive, subject to age-based decay)
   - Location-dependent retention for NPCs near player

2. **Age-Based Memory Retention**
   - 0-10: 100% retention for 1 year (sponge memory)
   - 11-30: 365 days (good recall, details fade)
   - 31-60: 180 days (remember key moments)
   - 61-80: 90 days (fragile memory)
   - 81+: 30 days (significant decay)

3. **Trait Architecture**
   - Immutable traits (species, name, core roles): never change
   - Mutable traits (personality, beliefs, fears): change via gameplay
   - Trait evolution rates controlled by designers (max mutations per day)

4. **Context Update Mechanics**
   - Every tick: refresh position, status, awareness
   - Apply trait decay to mutable traits
   - Rebuild role-specific context templates
   - Update emotional states

5. **Amnesia Mechanics**
   - Full amnesia: complete memory loss
   - Selective amnesia: specific trait types lost
   - Transient amnesia: recovers over time
   - Identity crisis: role archetype guides behavior
   - Recovery: allies help reconstruct identity

## Implementation Plan

### Phase 1: Trait Architecture Foundation
- [ ] Define immutable/mutable trait type system
- [ ] Implement trait mutation rules engine
- [ ] Create character data schema
- [ ] Build designer UI for trait configuration
- [ ] Implement Character entity class

### Phase 2: Age-Based Memory Retention
- [ ] Implement age-to-retention mapping utility
- [ ] Create memory decay filter
- [ ] Add memory age tracking
- [ ] Implement retention policy enforcement

### Phase 3: Context Update Mechanics
- [ ] Implement updateContext() function
- [ ] Create trait decay system
- [ ] Build role-specific context templates
- [ ] Implement context diffing for logging
- [ ] Integrate with LLM decision system
- [ ] Build context serialization for save/load

### Phase 4: Amnesia Mechanics
- [ ] Define amnesia types and triggers
- [ ] Implement amnesia state manager
- [ ] Build memory recovery process
- [ ] Implement ally help system
- [ ] Create amnesia recovery visualizations

### Phase 5: AI Integration & Logging
- [ ] Update LLM prompt builder for trait updates
- [ ] Implement trait change logging
- [ ] Add correlation IDs for context updates
- [ ] Create trait evolution dashboard
- [ ] Implement analytics for trait changes

### Phase 6: Documentation & Polish
- [ ] Write character creator user guide
- [ ] Document amnesia gameplay scenarios
- [ ] Write memory retention explanation
- [ ] Create character evolution tutorial
- [ ] Write amnesia workshop example
- [ ] End-to-end integration testing

## Success Criteria

- ✅ NPCs have age-based memory retention policies affecting decisions
- ✅ Designers can configure mutable vs immutable traits for each character
- ✅ NPCs dynamically update contextual trait values through gameplay
- ✅ Amnesia scenarios allow NPCs to recover memory with help from others
- ✅ Character evolution results in observable behavioral changes
- ✅ Save/load preserves character state (traits, memories, context)
- ✅ Logger tracks trait changes and evolution events
- ✅ Designer UI allows full flexibility in character configuration

## Dependencies

### Must Have
- Existing NPC memory storage system (partially implemented)
- Character entity class structure (existing)
- LLM decision-making infrastructure (existing)
- World state and location system (existing)

### Should Have
- Save/load system for entity state (existing)
- Logger module for structured logging (existing)
- Character creator UI framework (existing)

### Nice to Have
- Social interaction system (future)
- Emotional AI visualization (future)
- Time-of-day/cycle system (future)

## Risks & Mitigations

### Risk 1: Performance Impact
**Risk:** Age-based memory filtering and trait mutation calculations add CPU overhead per tick.
**Mitigation:**
- Cache calculated retention periods for entities
- Batch memory decay operations
- Limit decay checks to only mutable trait properties
- Profile per-npc overhead before full implementation

### Risk 2: Design Overload
**Risk:** Designers may be overwhelmed by too many mutable traits and complexity.
**Mitigation:**
- Provide pre-configured archetype templates (merchant, guard, scholar)
- Default to sensible settings based on age
- Include tooltips describing implications of each trait
- Provide AI-assisted trait balancing suggestions

### Risk 3: Game Balance
**Risk:** Traits change too rapidly, causing NPC behavior to flip unpredictably.
**Mitigation:**
- Enforce strict daily mutation limits
- Make trait changes significant but gradual
- Require multiple events before trait shifts direction
- Allow designers to disable mutable traits for certain NPCs

### Risk 4: Emergent Complexity
**Risk:** NPC-to-NPC memory interactions create unexpected social dynamics.
**Mitigation:**
- Define clear boundaries for ally help (don't reveal secrets)
- Limit ally help to immutable traits only (relationships intact)
- Add social contract system for what information can be shared
- Test emergent scenarios through gameplay loops

### Risk 5: Save/Load Size
**Risk:** Long-term memory with age-based decay could create large save files.
**Mitigation:**
- Implement automatic age-based pruning during save cycles
- Set reasonable max memory entry counts per NPC
- Make long-term memory optional (cache vs archive)
- Support incremental saves (only changed memories)

## Open Questions (To Be Resolved)

### High Priority
- **Q: What are the defaults for each NPC archetype's mutable vs immutable traits?**
  - Should guards default to immutably loyal? Scholars immutably curious?
  - **Proposal:** Provide archetype trait presets in design.md

- **Q: Do NPCs have different decay rates for different memory types?**
  - Relationships might decay slower than event details
  - **Proposal:** Add `memoryType` attribute with decay rules per type

- **Q: Can players influence memory decay via artifacts/potions?**
  - Potion of Recall, Memory Corruption, etc.
  - **Proposal:** Add item effects to memory retention (future feature)

### Medium Priority
- **Q: How detailed should trait evolution be?**
  - Single scalar trait value, or vector of related traits?
  - **Proposal:** Use scalar values simplified to single-trait updates, but store relationships

- **Q: Should NPCs have "forget-trigger" thresholds (memory loss at X% decay)?**
  - If trust decays below 20%, NPC becomes untrusting
  - **Proposal:** Add trigger thresholds in designer UI for each trait

- **Q: Can memory be magically erased without amnesia?**
  - Memory corruption spells, mind reading, etc.
  - **Proposal:** Add memory manipulation events with different severity levels

### Low Priority
- **Q: Can NPCs forget other NPCs entirely (not just specific memories)?**
  - Long-term relationships can fade like fading friendships
  - **Proposal:** Implement relationship decay system separate from memory

- **Q: Do NPCs remember events before their birth?**
  - Knowledge, legends, lore might be accessible
  - **Proposal:** Separate `knowledge` vs `experience` memories

## Impact on Other Systems

### Existing Systems Affected

| System | Impact | Required Updates |
|--------|--------|------------------|
| NPC Decision System | Updated context with trait values | Ensure context includes mutable traits in LLM prompts |
| Save/Load | Store trait states and evolution history | Serialize/deserialize complete character state |
| Logger | New log types: `trait.evolved`, `memory.decayed` | Add logging for trait changes and memory retention/decay |
| Social System | NPCs reference other NPCs' traits in interactions | Add context includes `otherNPC.traits` for ally help |
| Quest System | Quests tie to trait changes (trust, relationships) | Update quest triggers to include trait mutation events |

### New Systems Enabling

| System | Description | Priority |
|--------|-------------|----------|
| Character Evolution Dashboard | Visual tracking of trait changes over time | Medium |
| Memory Recovery Editor | Tools for designers to help NPCs recover memory | Medium |
| Trait Impact Predictor | Simulate how trait changes will affect behavior | Low |
| Amnesia Workshop | Scenarios testing amnesia mechanics | Medium |

## Alignment with Project Goals

### Constitution Principles

| Principle | Alignment | Notes |
|-----------|-----------|-------|
| P1: Real Agency, Not Just Decision Points | ✅ High alignment | NPCs take actions based on evolving identity, not just current state |
| P2: World Simulates Without Observers | ✅ High alignment | Characters exist and change even without player involvement |
| P3: Single Source of Truth | ✅ High alignment | Character state is authoritative, traits don't diverge across clients |
| P4: Explicit Latency Budgets | ✅ Partial alignment | Agent decisions limited to trait evolution rate (e.g., daily changes), not per-tick |
| P5: Reproducibility | ✅ Partial alignment | Can replay decision sequence, but trait evolution creates unique branches |
| P6: Authorial Guardrails | ✅ High alignment | Trait evolution constrained by designer-configurable limits |
| P7: Readable Specs | ✅ High alignment | Design and tasks are detailed and implementation-focused |
| P8: Free, Open-Source by Default | ✅ Aligned | Character system is engine-level, open to all implementations |
| P9: Inspectability | ✅ High alignment | Extensive logging for debugging trait evolution and amnesia recovery |
| P10: Playable Before Polished | ✅ Aligned | Can implement basic trait mechanics quickly, add polish later |

### RPG Engine Vision
- Moves from static character definitions → living, evolving entities
- Enables emergent narratives through player-influenced arcs
- Provides depth through memory loss and recovery stories
- Supports character customization flexibility while maintaining identity stability

## Conclusion

This character identity system proposal provides a comprehensive framework for making NPCs feel like living, evolving characters. It balances AI-driven behavior with designer control, supporting both emergent gameplay and intentional character arcs.

**Compliance Score:** N/A (new system, no existing compliance)

**Recommendation:** Proceed with implementation, starting with Phase 1 and 2. These provide the core architectural foundation that enables all advanced features (amnesia, evolution, age-based mechanics).

**Next Steps:**
1. Review and approve this proposal
2. Create `specs/npc-memory` subsystem specs (already partially implemented)
3. Start Phase 1 implementation (Week 1)
4. Update `DISCUSSION.md` to mark Q2.1 and Q8.1 as resolved

**Estimated Timeline:** 4-5 weeks for complete implementation

**Estimated Complexity:** Moderate — requires careful balance between AI flexibility and designer control