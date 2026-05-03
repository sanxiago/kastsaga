# Proposal: Add ASCII Movement Demo

## Summary
Provide a tiny interactive demo where the player moves on the ASCII grid with arrow keys, obeying boundaries/non-traversable tiles, and the map updates with legend displayed each step. This is an engine-agnostic example aligned with the ASCII rendering and grid-world specs, not a change to core requirements.

## Motivation
- Show the ASCII slice in motion: player movement, boundary checks, and live re-render.
- Give contributors a runnable example while engine/cadence remain open (Constitution P10: playable before polished).
- Exercise no-leakage and legend display from `world-rendering` in a concrete loop.

## Scope
- Add a Node.js CLI demo (`examples/ascii-world/move.js`) that reads the sample observation, lets the player move with arrow keys, blocks moves into walls/impassable tiles, and re-renders with legend.
- Factor the renderer into a reusable module to avoid duplication.
- Keep everything engine-agnostic; no networking, no cadence decisions.

## Non-goals
- Picking an engine or networking model.
- Implementing NPC movement/AI — only player movement via keyboard.
- Changing specs; this is a runnable example only.

## Success criteria
- Running `node examples/ascii-world/move.js` shows the grid and legend, updates the player position on arrow key presses, and prevents movement into walls/bounds/impassable tiles.
- Rendering remains deterministic for a given state and matches `world-rendering` layering rules.
