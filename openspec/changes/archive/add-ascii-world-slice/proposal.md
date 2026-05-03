# Proposal: Add ASCII World Slice

## Summary
Create a minimal, engine-agnostic ASCII world slice so we can reach "playable before polished" quickly. This adds a capability for rendering observations as ASCII tiles, defines a baseline grid world profile (terrain, objects, boundaries, entities), and ensures NPCs and players can display simple emotes in that view. This is a stepping stone to later 2D rendering, not a commitment to stay text-only.

## Motivation
- We need a concrete, inspectable slice before investing in 2D art/engine pipelines (Constitution P10).
- Text/ASCII keeps us decoupled from the undecided engine (Q4.1) while allowing rapid iteration.
- A standard grid-and-glyph profile clarifies what the world must expose to render, improving specs for world-state and player-interaction.
- Emote display is a lightweight way to communicate NPC/player state without full UI.

## Scope
- Define an ASCII rendering capability: how observations are turned into a 2D character buffer with a legend.
- Define a baseline grid world profile (tile + object + entity layers, boundaries) sufficient for ASCII rendering.
- Define how entity emotes/status are surfaced in the ASCII view.
- Keep all requirements engine-agnostic and compatible with later 2D rendering.

## Non-goals
- Choosing the game engine (Q4.1 remains open).
- Choosing turn-based vs real-time cadence (Q2.4 remains open).
- Final art/UX; this is a functional diagnostic view, not polished UI.
- Network replication details; multiplayer questions (Q5) stay open.

## Risks / Mitigations
- **Risk:** Lock-in to grid-only worlds. **Mitigation:** Specify this as a baseline profile; richer layouts allowed later.
- **Risk:** Rendering spec drifts from world-state. **Mitigation:** Explicit interface: render consumes authoritative observations; no side channels.
- **Risk:** Emote semantics unclear. **Mitigation:** Limit scope to display-only; generation/meaning stays with action systems.

## Success criteria
- We have a validated spec delta describing ASCII rendering and the grid world profile.
- Observations can be rendered losslessly enough for debugging (no leaked information beyond observation).
- NPCs/players can display an emote/status marker in the ASCII view.
- No engine or cadence decisions are implicitly made.
