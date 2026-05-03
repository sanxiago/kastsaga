# Constitution

These principles are non-negotiable. Specs and code that violate them must be rejected, or the principle must be formally amended via a change proposal that explicitly modifies this document.

The constitution exists to be the tiebreaker when we disagree. It is short by design. This is a community project any framework used should be open and free license.

This is a role playing game engine. 

In traditional RPG games, there are Non Playable Characters (NPCs) that the player interacts with they provide clues, challenges, story, through scripted conversations.
As story progresses the NPCs there are events that trigger a change in the NPC script.

The idea of this engine game is to bring agency to NPC characters, instead of a script NPC characters use large language models and a prompt to react to events.

The game is owned and maintained by the council of elders (Developers).

---

## P1. NPCs have agency, not the illusion of it

NPC behavior emerges from internal state, goals, and observation of the world  not from pre-authored dialogue trees, branching scripts, or fixed state machines. Pre-written content (lore, quest hooks, faction goals) MAY seed an NPC's beliefs and goals but MUST NOT override the NPC's decision process at runtime.

## P2. The world is the source of truth, not the model

LLM (or other agent) outputs that propose actions inconsistent with world state, picking up an item that does not exist, walking through a wall, knowing things the NPC has not observed, are rejected or repaired by the engine. The world is authoritative; the model is a planner.

## P3. Latency budgets are explicit and enforced

Every interaction has a published latency budget. Player input never blocks on inference past its budget. The engine MUST have a fallback action for every NPC decision point, and exceeding budget MUST produce a logged event that is later inspectable.

## P4. Sessions are reproducible

All NPC decisions and world events are logged with enough context (seeds, prompts, observations, model identifiers) to replay a session — even when the underlying model is non-deterministic. "We could not reproduce that bug" is not an acceptable answer.

## P5. Authorial guardrails over emergent harm

When NPC autonomy and player experience conflict  harassment, soft-locks, irrecoverable quest states, content that doesn't belong in the game the engine intervenes. Guardrails are explicit, named, and reviewable. They live in inspectable code or configuration, not buried inside prompts. Both the NPCs and players can be deemed deviant and arrested by guards and taken to a dungeon. Were the council of elders (developers) may decide their fate.

## P6. Specs are readable by non-coders

People contributing to design read and write specs in this repository. Specs are markdown. Jargon is defined or removed. A friend who has never opened the codebase should be able to read a capability spec and tell you what the engine is supposed to do.

## P8. Free and open by default

Engine, runtime, language, and tooling default to free and open-source. A non-OSS choice requires an Architecture Decision Record (ADR) explaining the justification and identifying an open fallback. We are not betting the project on any single proprietary vendor.

## P9. Observability is a first-class feature

Every NPC and human decision MUST be inspectable by humans without re-running it: the observation it received, the prompt or rules it was evaluated against, the raw output, the validated action, and the result. Debugging an NPC is reading logs, not adding more print statemnets.

## P10. Playable before polished

A complete, ugly slice exists before any one part is improved. We do not refactor the dialogue system before the player can have a single conversation. We do not optimize inference before the simulation runs end-to-end. Polish follows playability.

---

## Amending this document

Changing a principle requires a change proposal under `openspec/changes/` with:

- The principle being modified or removed.
- The reason — concrete, not philosophical.
- The implications across existing specs.

Until that change is archived, the existing principle stands.
