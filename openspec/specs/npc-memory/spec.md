# NPC Memory

## Purpose

Defines how NPCs retain and recall information from past observations and interactions. Memory is what makes an NPC's agency continuous — without it, every decision is independent of what came before, and the illusion of a coherent character collapses.

This capability is bounded: naive logs grow without limit, so memory MUST have a representation strategy that allows retention to scale beyond a single session of play.

## Scope

This capability covers:

- The structure and lifecycle of an NPC's memory.
- How memory is written (events, observations, dialogue).
- How memory is read into a decision context.
- Retention, summarization, and decay.

It does **not** cover:

- The decision backend itself — see `npc-agency`.
- World state representation — see `world-state`.
- Persistent multi-session storage format — see Q6.3.

## Requirements

### Requirement: Per-NPC memory

The system SHALL provide each NPC with its own memory store, isolated from other NPCs' memory and from world state. NPCs SHALL NOT have access to memory belonging to another NPC unless that information was explicitly shared via observation or dialogue.

### Requirement: Memory writes are inspectable events

The system SHALL write memory entries as structured events with at minimum:

- NPC identifier.
- Source — e.g., `observation`, `dialogue`, `goal-update`, `internal-reflection`.
- Tick or timestamp of the originating event.
- Content (form depends on strategy chosen for Q6.2).
- Optional salience / importance score.

Memory writes SHALL be inspectable in the audit trail.

### Requirement: Memory affects decisions

The system SHALL include relevant memory in the observation or context provided to the decision backend. "Relevant" is determined by the chosen retrieval strategy (open — see Q6.2).

#### Scenario: NPC recalls a recent interaction

- **GIVEN** an NPC has a memory entry describing a recent interaction with a player
- **WHEN** the NPC's decision tick fires while interacting with the same player
- **THEN** the entry is included in the decision context
- **AND** the NPC's chosen action may reference the past interaction

### Requirement: Bounded memory size

The system SHALL enforce a bound on memory size per NPC, configurable per NPC and per game. Bounding strategy MAY be:

- Eviction (oldest or lowest-salience entries removed).
- Summarization (clusters of entries replaced by a summary entry).
- Retrieval-only (entries retained but only a bounded subset retrieved into context).
- Hybrid.

The chosen strategy SHALL be inspectable — entries that have been summarized or evicted SHALL leave a trace sufficient to know they existed.

> Q6.2 in DISCUSSION.md remains open. This requirement constrains the answer without prescribing it.

### Requirement: Memory does not contradict world state

When memory and current world state conflict (the NPC remembers an item that has since been moved or destroyed), the engine SHALL prefer current world state for any action validation. Memory MAY still inform the NPC's belief and may produce in-character behavior consistent with the outdated belief — but it SHALL NOT override world authority.

> Constitution P3.

#### Scenario: NPC's memory of an item conflicts with world state

- **GIVEN** an NPC remembers an item being in a location
- **AND** the item has since been moved or destroyed
- **WHEN** the NPC attempts an action that depends on the item being in the remembered location
- **THEN** the action is rejected by world-state validation
- **AND** the NPC may produce in-character behavior consistent with the surprise (e.g., asking where the item went)

### Requirement: Memory persistence across sessions

Whether NPC memory persists across game sessions is determined by the session model (Q2.1). The system SHALL support both modes:

- **Session-only memory** — memory is discarded when a session ends.
- **Persistent memory** — memory is serialized at session end and restored at session start.

The mode is configurable at the engine level.

### Requirement: Memory of dialogue

The system SHALL persist dialogue utterances (the NPC's own and others' that the NPC heard) as memory entries, on the same footing as other observations.

### Requirement: Memory privacy

The system SHALL respect the privacy implication of memory: an NPC's memory of an interaction is inspectable to developers (P9) but is NOT a part of any other NPC's observation, nor is it surfaced to players unless an explicit in-game mechanic shares it.

## Out of scope

- Cross-NPC shared memory / "common knowledge" — separate capability if needed.
- Embedding model selection / vector store implementation — engine-level choice once Q6.2 is decided.
- Memory editing tools for designers — useful eventually, not v1.
