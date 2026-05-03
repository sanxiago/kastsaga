# Design — ASCII World Slice (engine-agnostic)

## Overview
Provide a minimal, inspectable world view rendered as ASCII. Observations from `world-state` are serialized into a 2D grid of characters with a legend. This is a baseline profile that works today and can be superseded by 2D rendering later without changing semantics.

## Rendering model
- **Input:** The authoritative observation for a viewer entity (player or NPC), as defined by `world-state` (location, visible tiles, visible objects/entities, and any per-entity display metadata such as glyph + emote).
- **Process:** Project the observation into a rectangular grid (rows × columns) with layers:
  - Terrain (one tile per cell).
  - Object overlay (optional, one per cell; stacking rendered via priority or a stacked marker).
  - Entity overlay (player/NPC in a cell) with a glyph and optional emote/status marker.
- **Output:**
  - A character buffer (rows of text) sized to the viewport.
  - A legend mapping glyphs to meanings (terrain types, objects, entities, emotes).
  - Viewport origin/extent so consumers know what part of the world they see.

## Grid / world profile
- Baseline world slice is a bounded rectangular grid with:
  - **Terrain layer:** immutable per cell (e.g., floor, wall, water).
  - **Object layer:** zero or more placeable objects; max-one-visible enforced for ASCII; if multiple, show stack marker (e.g., `*`) and list in legend.
  - **Entity layer:** at most one entity per cell for simplicity; collisions/stacking resolved in the action pipeline.
  - **Boundaries:** outer walls or void are explicit tiles; out-of-bounds is not rendered.
- Deterministic layout for the slice (seeded generator allowed but must be replayable per P5).

## Emotes / status
- Each entity may expose a short status/emote code in its observation metadata.
- Rendering shows this as a suffix or overlay (e.g., `@!` or `@` with a side legend `! = alert`).
- Emote meaning/production is out-of-scope here; this spec only renders what is present in observation.

## Engine and cadence neutrality
- No commitment to update cadence; render on observation changes or per tick as configured (Q2.4 stays open).
- No commitment to any engine; ASCII renderer is a reference/diagnostic surface compatible with future 2D/tiles.

## Observability and reproducibility
- Rendering is a pure function of observation + legend rules; no hidden state.
- Given the same observation, renderer outputs identical buffer/legend (deterministic, helps P5/P9).

## Future migration
- The grid/profile can map 1:1 to 2D tiles later (terrain/object/entity layers).
- Emote/status remains as an overlay concept in richer UIs.
