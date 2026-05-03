# Dialogue

## Purpose

Defines how NPCs and players exchange natural-language utterances, and how those utterances are reconciled with world state and the action pipeline. Dialogue is a special class of action — it has effects on world state (memory, relationships, possibly information transfer) and is subject to the same authority and validation rules as any other action.

## Scope

This capability covers:

- The structure of utterances.
- The flow of conversation between an NPC and a player, or between two NPCs.
- How dialogue actions interact with world state.
- Guardrails on dialogue content.

It does **not** cover:

- The decision backend that produces NPC utterances — see `npc-agency`.
- The memory of past conversations — see `npc-memory`.
- The UI presentation of dialogue — engine-dependent.

## Requirements

### Requirement: Utterances are actions

The system SHALL treat each utterance as an action flowing through the standard action pipeline. Utterances SHALL be subject to:

- Authority validation (the speaker is permitted to speak in this context).
- World-state validation (the speaker exists, is co-located with audience, etc.).
- Guardrail review (see below).

### Requirement: Dialogue initiation requires adjacency

Dialogue initiation SHALL require the speaker and audience to be co-located or in adjacent cells (cardinal adjacency) according to authoritative world state. Dialogue requests that fail this proximity check SHALL be rejected with a structured reason.

#### Scenario: Dialogue rejected when not adjacent
- **GIVEN** a player attempts to start dialogue with an NPC two cells away
- **WHEN** the engine validates the dialogue action
- **THEN** the action is rejected for failing adjacency
- **AND** the rejection reason is logged

### Requirement: Dialogue initiation when adjacent

If a speaker and audience are adjacent or co-located and otherwise eligible, the dialogue initiation action SHALL succeed and proceed through the dialogue pipeline.

#### Scenario: Dialogue succeeds when adjacent
- **GIVEN** a player and NPC are in adjacent cells
- **WHEN** the player initiates dialogue
- **THEN** the adjacency check passes
- **AND** the dialogue action proceeds to utterance generation/guardrails per the dialogue capability

### Requirement: Utterance structure

Each utterance SHALL carry at minimum:

- Speaker entity ID.
- Audience (one or more entity IDs, or "all in earshot").
- Content (natural-language text).
- Timestamp / tick.
- Optional structured intent (e.g., a function-call style action proposal embedded in dialogue).

> Whether NPCs produce free-text, structured outputs, or both is open — see Q4.5.

### Requirement: Conversation context

The system SHALL provide each participant with a coherent conversational context — the recent history of the conversation — when producing or interpreting an utterance. Context length SHALL be bounded; bounded-history strategy is open (rolling window, summarization, retrieval) and decided per `npc-memory`.

### Requirement: Conversational latency budget

The system SHALL enforce a per-utterance latency budget. If an NPC backend exceeds the budget, the engine SHALL substitute a fallback utterance (e.g., a brief acknowledgment, a "still thinking" indicator, or silence) and log the timeout.

> Constitution P4. The budget for dialogue is typically larger than for non-conversational decisions; exact value is open.

#### Scenario: NPC utterance generation times out

- **GIVEN** an NPC is producing a response to a player's utterance
- **WHEN** the latency budget elapses before generation completes
- **THEN** the engine produces a fallback utterance for the NPC
- **AND** the NPC's actual generation, if it later completes, is discarded or appended to memory only
- **AND** the timeout is logged

### Requirement: Dialogue does not bypass world authority

If an NPC utterance contains a claim about world state ("I have the key"), the system SHALL NOT alter world state to match the claim. Players who act on the claim are subject to the same world validation as always.

> Constitution P3. NPCs may bluff, lie, or be mistaken. The world does not reorganize itself to make their statements true.

### Requirement: Dialogue guardrails

The system SHALL provide a mechanism to filter or reject utterances based on configured rules. Rejected utterances SHALL be replaced by a fallback or absence of utterance, and the rejection SHALL be logged.

Guardrails SHALL be defined externally to the speaker's prompt or rules — they are reviewable engine configuration, not invisible prompt instructions.

> Constitution P6.

#### Scenario: Generated utterance fails guardrail check

- **GIVEN** an NPC has produced a candidate utterance
- **WHEN** a configured guardrail rejects the utterance
- **THEN** the utterance is not delivered to the audience
- **AND** the engine substitutes a fallback or omits the utterance
- **AND** the rejection is logged with the rule, the original utterance, and the substitution

### Requirement: NPC-to-NPC dialogue

The system SHALL support NPC-to-NPC dialogue when both NPCs are co-located and the engine determines a conversation is appropriate. NPC-to-NPC conversations are subject to all the same validation, guardrail, and audit-trail requirements as conversations involving players.

### Requirement: Dialogue audit trail

Every utterance SHALL be persisted in the decision audit trail with:

- All fields of the utterance.
- The conversational context provided to the speaker.
- The backend invocation parameters (prompt, seed) for AI-generated utterances.
- Any guardrail decisions.
- Audience reception (delivered, rejected, fallback substituted).

> Constitution P5 and P9.

## Out of scope

- UI presentation (text bubbles, voice, animation).
- Localization, translation.
- Voice / audio dialogue — text-only for v1 unless changed by proposal.
- Dialogue-driven combat or persuasion mechanics — those are separate capabilities.
