# Proposal: Add Adjacency-Gated Dialogue and Descriptive Observations

## Summary
- Add descriptive text in observations so NPCs and players can understand surroundings without relying only on glyphs.
- Require movement parity: NPCs move with the same constraints as players (authoritative world validation).
- Gate dialogue initiation on adjacency (co-location or neighboring cell) to enforce spatial plausibility.
- Add an inspect/describe action for immediate objects/tiles within observation.
- Provide a test scenario with one player and one NPC moving in the same grid world, interacting (movement + adjacency-gated dialogue).

## Motivation
- NPC decision backends need textual context of surroundings to act intelligently; players also benefit from descriptive inspection.
- Spatial consistency: adjacency requirement prevents “shouting across the map” and aligns dialogue with world authority.
- Parity between players and NPCs reduces divergence and simplifies validation (P3, P9).

## Scope
- Specs only: world-state (observation descriptors, inspect action), player-interaction (movement + inspect), npc-agency (movement parity), dialogue (adjacency precondition), plus a combined scenario (player & NPC movement + dialogue when adjacent).
- No engine selection; no networking/cadence decisions.

## Non-goals
- Pathfinding, long-range perception, or LOS algorithms (beyond adjacency requirement for dialogue).
- Combat or other action types beyond move + inspect + dialogue initiation.

## Success criteria
- New requirements with scenarios across relevant capabilities (world-state, player-interaction, npc-agency, dialogue) captured and validated.
- A test scenario describes player/NPC moving under the same rules and initiating dialogue only when adjacent.
