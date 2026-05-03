# ASCII World Example

A tiny, deterministic ASCII render of a sample observation per `openspec/specs/world-rendering/spec.md`.

## Files
- `world.json` — sample observation (bounded grid, terrain, stacked objects, entities with emotes, glyph legend).
- `render.js` — Node.js renderer that consumes the observation and outputs ASCII grid + legend.
- `move.js` — interactive demo; move the player with arrow keys, obeying walls/bounds, live re-render with legend. Optional LLM-driven NPC mode.
- `render-lib.js` — shared renderer used by both scripts.

## Run
```bash
node render.js           # uses world.json by default
node render.js other.json

# Patrol NPC (default)
node move.js

# LLM-driven NPC (OpenRouter)
NPC_MODE=llm OPENROUTER_API_KEY=your_key node move.js
# Optional: OPENROUTER_MODEL=openrouter/free or openrouter/auto
```

### Controls (move.js)
- Arrow keys: move player (blocked by walls `#`, water `~`, occupied cells)
- `i`: inspect current and adjacent cells (prints descriptions)
- `space`: attempt dialogue with an adjacent NPC (must be adjacent/co-located)
- `q` or `Ctrl+C`: quit

### NPC modes
- `NPC_MODE=patrol` (default): deterministic patrol loop.
- `NPC_MODE=llm`: NPC actions chosen by an LLM via OpenRouter; world constraints still enforce bounds/collisions. Falls back to patrol if no API key or on errors.

### OpenRouter config (LLM mode)
- `OPENROUTER_API_KEY` (required for LLM mode)
- `OPENROUTER_MODEL` (default `openrouter/auto`, you can use `openrouter/free`)
- `OPENROUTER_BASE` (default `https://openrouter.ai/api/v1`)
- `OPENROUTER_TIMEOUT_MS` (default 10000)

The LLM action space is constrained: move `north|south|east|west|stay`, or `talk` when adjacent. All actions are validated by the world; invalid outputs are ignored/fallback.

## Observation shape
- `viewport`: `{ origin: {x, y}, width, height }`
- `legend`: glyph maps for `terrain`, `objects` (includes `stack`), `entities`, `emotes`
- `terrainRows`: array of strings, top-to-bottom, glyphs already applied
- `objects`: list with `id`, `type`, `x`, `y` (multiple allowed per cell for stacking)
- `entities`: list with `id`, `role` (player/npc), `glyph`, `x`, `y`, optional `emote` (key into `legend.emotes`), optional `description`, optional width hints for glyph/emote

## Rendering rules implemented
- Layer order: terrain → object → entity. One entity per cell; entity glyph replaces object glyph in the grid.
- Objects: if multiple in a cell, show stack marker (`stack` glyph) and list contents in legend summary.
- Glyphs: may be ASCII or Unicode/emoji. Renderer measures grapheme width and pads columns to keep alignment.
- Emotes: shown adjacent to entity glyph. Emoji emotes are supported; width hints in `world.json` are respected.
- Legend: includes only glyphs/emotes actually present in the rendered viewport; no leakage beyond observation.
- Deterministic: same observation → identical output.

## Movement rules (move.js)
- Blocking: cannot move outside the viewport, into walls `#`, water `~`, or into another entity.
- NPC (patrol or LLM-driven) uses the same blocking rules.
- Map re-renders after each action with the legend shown.

## Inspect / describe (move.js)
- `i` prints descriptions for the current cell and adjacent cells (terrain, objects, entities) drawn from `world.json`.

## Dialogue adjacency (move.js)
- `space` attempts to start dialogue with an adjacent NPC. Succeeds only if adjacent/co-located; otherwise prints a rejection.
- In LLM mode, the NPC may attempt `talk` when adjacent; otherwise its talk action is rejected.

## Sample output (world.json)
```
## ##############
## #.#.#
```
``` Actually run to view.
```
