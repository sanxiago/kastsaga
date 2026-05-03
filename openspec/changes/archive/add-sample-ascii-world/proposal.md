# Proposal: Add Sample ASCII World

## Summary
Provide a tiny, deterministic ASCII world example and a reference renderer script that consumes an observation and outputs the ASCII grid + legend, per `openspec/specs/world-rendering/spec.md`. This demonstrates the baseline slice and gives contributors something runnable while engine and cadence remain undecided.

## Motivation
- Make the ASCII spec tangible with a runnable example (Constitution P10: playable before polished).
- Provide a template observation structure and renderer behavior for future tooling/tests.
- Keep it engine-agnostic; no commitment on Godot/other engines.

## Scope
- A small, fixed world observation JSON (bounded grid, terrain, objects including a stack, entities with emotes).
- A Node.js reference renderer (`examples/ascii-world/render.js`) that renders observation → ASCII grid + legend deterministically.
- Minimal README with run instructions.

## Non-goals
- Choosing engine, networking, or cadence (Q4.1, Q5, Q2.4 remain open).
- Implementing gameplay loops; this is a static observation render, not a sim.

## Success criteria
- Running `node examples/ascii-world/render.js` produces a deterministic grid and legend from the sample observation.
- Renderer respects layering (terrain → object → entity) and shows emotes without leaking information beyond the observation.
- The example remains compatible with later 2D rendering migration.
