# Design — Sample ASCII World

## Overview
Create a small, deterministic observation and a reference renderer that demonstrates the ASCII baseline per `openspec/specs/world-rendering/spec.md`. This is static (no sim tick) and engine-agnostic.

## Observation shape (sample)
- `viewport`: origin `{x,y}`, `width`, `height`.
- `legend`: glyph maps for terrain, objects (including stack marker), entities, emotes.
- `terrainRows`: array of strings representing terrain glyphs for each row (top to bottom, y increasing downward).
- `objects`: list with `id`, `type`, `x`, `y` (allows stacking when multiple share a cell).
- `entities`: list with `id`, `role` (player/npc), `glyph`, `x`, `y`, optional `emote` key referencing `legend.emotes`.

This is an already-derived observation (post world-state). No extra world queries are needed to render.

## Rendering rules implemented
- Initialize grid from `terrainRows`.
- Overlay objects: if multiple in a cell, render stack marker (e.g., `*`) and list their types in legend summary; else use object glyph.
- Overlay entities: one per cell; entity glyph replaces object glyph in the cell; emote is displayed adjacent (fixed two-character cell width: glyph + emote glyph or space).
- Legend: include only glyphs/emotes actually present in the rendered viewport; no leakage beyond observation.
- Deterministic output: same observation → same grid and legend text.

## Output format
- ASCII grid with fixed 2-character cells (glyph + emote/space) to keep alignment when emotes are present.
- Blank line.
- Legend grouped by terrain, objects, entities, emotes actually used.

## Notes
- No engine/cadence decisions are implied.
- This renderer is a reference implementation for contributors and tests; production engines can differ as long as they satisfy the spec.
