# Project Context

## What we are building

An RPG engine where **non-player characters are AI-driven agents with goals, memory, and the ability to perceive and act on a shared world state** — instead of pre-scripted dialogue trees and finite state machines.

This is an **engine**, not a specific game. Theme, setting, and story are deliberately undecided. See `DISCUSSION.md` for the questions still open.

## Status

Pre-prototype. Constitution and initial capability specs are in place. No code yet. Many design questions are explicitly open and tracked in `DISCUSSION.md`.

## Tech stack (provisional, not yet committed)

| Concern | Current candidate | Status |
|---|---|---|
| Game engine | Godot 4 | Leading candidate. MIT-licensed, native 2D, text-based scenes, mature MCP server ecosystem. Not yet committed — see `DISCUSSION.md` Q4.1. |
| Scripting | GDScript and/or C# | Decided once engine commits. |
| LLM runtime | Open | Local (Ollama / llama.cpp), hosted, or hybrid — see Q4.3. |
| Networking | Open | Depends on session model (Q2.1) and authority model (Q5.1). |
| Persistence | Open | Likely SQLite or Godot resources — see Q6.3. |

Nothing here is binding until a corresponding change proposal is archived.

## Conventions

### Spec format

Specs follow OpenSpec conventions:

- Capabilities are organized under `openspec/specs/<capability>/spec.md`.
- Capability names are verb-noun, kebab-case: `npc-agency`, `world-state`, `player-interaction`.
- Each capability has a single purpose. If a description needs the word "AND", split it.
- Requirements use `### Requirement: <name>` followed by `The system SHALL ...`.
- Scenarios use `#### Scenario: <name>` with GIVEN / WHEN / THEN.
- Deltas (in `openspec/changes/<change>/specs/<capability>/spec.md`) use `## ADDED Requirements`, `## MODIFIED Requirements`, or `## REMOVED Requirements`.

### Code (when we have any)

To be defined per `decide-engine`. Until then, conventions for code are not yet meaningful.

### Documentation

- All design documents are markdown.
- Architectural decisions go in `docs/adr/` once we start making them, using a standard ADR template.
- Diagrams are mermaid in markdown when possible; SVG / PNG only when mermaid is insufficient.
- Specs avoid jargon or define it inline (Constitution P7).

### Naming

- **Capability** — a coherent area of behavior (e.g., `npc-agency`).
- **NPC** — non-player character; an entity controlled by an autonomous agent rather than a player.
- **Backend** (in the context of NPC decisions) — the implementation that produces a decision: LLM, rule-based, hybrid.
- **Director** — a higher-order agent that supervises NPCs for narrative pacing. May or may not exist depending on Q3.1.
- **Action** — a validated mutation of world state. NPCs and players both produce actions.
- **Observation** — the slice of world state an entity perceives on a given tick.
- **Tick** — one step of the simulation clock. Cadence is open (Q2.4).
- **Session** — one continuous play period. May or may not persist across restarts (Q2.1).

## Non-goals (for v1)

- A specific game, story, or setting. The engine ships first; games come second.
- Photorealistic graphics. Pixel-art / sprite aesthetic is fine.
- Open-to-strangers multiplayer. Friends-only is the audience.
- Anti-cheat, matchmaking, account systems.
- Mobile platforms.
- Localization beyond English.

## Working with AI assistants

This project is built collaboratively with AI coding assistants (Claude Code, Cursor, etc.). Conventions:

- **Specs precede code, always.** The constitution requires this (P10 implicit; P7 explicit). Asking an AI to "just build it" without an open change proposal is out of process.
- **Pin the engine version** in any prompt that asks for code. Godot 4.x has had API churn between minor versions; assistants sometimes confuse Godot 3 and 4.
- **Reference specs by path** in prompts: `implement per openspec/specs/npc-agency/spec.md`.
- **Open questions are not for the AI to answer.** If a spec references something marked open in DISCUSSION.md, the AI should say so and stop, not improvise.
