# Proposal: Character Identity System & Evolution

## Summary
Formalize a two-tier memory and trait system where NPCs have age-based memory retention, mutable/immutable traits controlled by designers, and the ability to evolve their identity through gameplay. This system moves NPCs from static character definitions to living, evolving entities with player-influenced character arcs.

## Motivation
- **Depth & Narratives**: Characters with evolving traits create unique, replayable stories
- **Emergent Gameplay**: Player actions directly influence character behavior and relationships
- **Identity Systems**: Support complex scenarios like amnesia recovery, identity crises, and character development arcs
- **Designer Agency**: Creators control how much flexibility each NPC has in its own evolution
- **Age as Mechanics**: Memory retention tied to age creates temporal storytelling opportunities (aging erodes memories, youth captures everything)

## Scope

### Core Systems
- **Two-Tier Memory**: In-memory context (active state) + long-term memory (archive)
- **Age-Based Decay**: Memory retention policies tied to character age
- **Trait Architecture**: Separation of mutable (dynamic) vs immutable (fixed) traits
- **Trait Evolution**: Rules for how traits change based on gameplay events
- **Memory Loss Mechanics**: Amnesia scenarios for gameplay and storytelling

### In-Memory Context (Active Agent State)
- Dynamic character state updated every tick
- includes: position, status, beliefs, immediate awareness, role-specific context
- Fast access for LLM decision-making

### Long-Term Memory (Archive)
- Historical events and relationships
- Patterns learned over time
- Reference material for amnesia recovery or complex reasoning
- Subject to age-based decay policies

### Trait Evolution System
- Mutable traits (personality, beliefs, fears, etc.) change over time
- Immutable traits (species, role archetype, core identity) never change
- Evolution rates controlled by designers
- Context updates allow NPCs to rewrite contextual memory

## Non-Goals
- Full conversation system or dialogue AI (covered in other specs)
- Complete social simulation between NPCs (scope for future expansion)
- Emotional AI beyond trait-based behavior (focus on observable traits and beliefs)
- Memory backup/restore beyond save-game model (covered in persistence spec)

## Success Criteria
- NPCs have age-based memory retention policies that affect their decisions
- Designers can configure which traits are mutable vs immutable for each character
- NPCs can update their contextual trait values based on gameplay events
- Amnesia scenarios allow NPCs to recover from long-term memory loss
- Character evolution leads to observable behavioral changes in future context windows
- The system integrates cleanly with the decision-making LLM prompt architecture

## Blocking Dependencies
This resolves open questions:
- Q2.1 "Persistent or session-based characters?" — **Save-game model with selective persistence**: World state persists, character memories are individual and age-scoped
- Q8.1 "How does the group make decisions when we disagree?" — **Character evolution designer-controlled**: Immutable traits ensure stable identity while mutable traits allow growth

## Related OpenSpec
- `specs/npc-memory` — Detailed memory storage and retrieval specifications
- `specs/npc-agency` — Agent decision-making and trait-based behavior
- `specs/world-state` — Character-state representation
- `specs/player-interaction` — Character-to-player relationship management

## Timeline
- **Phase 1 (High Priority)**: Define trait architecture (immutable vs mutable) — 1 week
- **Phase 2 (High Priority)**: Implement age-based decay — 1 week
- **Phase 3 (High Priority)**: Context update mechanics — 1 week
- **Phase 4 (Medium)**: Amnesia mechanics and recovery — 1 week
- **Phase 5 (Documentation)**: Character creator UI/UX and designer docs — 1 week

## Estimated Completion: 4-5 weeks