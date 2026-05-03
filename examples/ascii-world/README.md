# ASCII World Example

A tiny, deterministic ASCII render of a sample observation per `openspec/specs/world-rendering/spec.md`.

## Files
- `world.json` — sample observation (bounded grid, terrain, stacked objects, entities with emotes, glyph legend).
- `render.js` — Node.js renderer that consumes the observation and outputs ASCII grid + legend.
- `move.js` — interactive demo; move the player with arrow keys, obeying walls/bounds, live re-render with legend.
- `render-lib.js` — shared renderer used by both scripts.

## Run
```bash
node render.js           # uses world.json by default
node render.js other.json

node move.js             # interactive movement demo (arrow keys, q to quit)
node move.js other.json
```

## Observation shape
- `viewport`: `{ origin: {x, y}, width, height }`
- `legend`: glyph maps for `terrain`, `objects` (includes `stack`), `entities`, `emotes`
- `terrainRows`: array of strings, top-to-bottom, glyphs already applied
- `objects`: list with `id`, `type`, `x`, `y` (multiple allowed per cell for stacking)
- `entities`: list with `id`, `role` (player/npc), `glyph`, `x`, `y`, optional `emote` (key into `legend.emotes`)

## Rendering rules implemented
- Layer order: terrain → object → entity. One entity per cell; entity glyph replaces object glyph in the grid.
- Objects: if multiple in a cell, show stack marker (`stack` glyph) and list contents in legend summary.
- Emotes: shown adjacent to entity glyph (fixed two-character cell width). Emote glyphs come from `legend.emotes`.
- Legend: includes only glyphs/emotes actually present in the rendered viewport; no leakage beyond observation.
- Deterministic: same observation → identical output.

## Movement rules (move.js)
- Controls: arrow keys move the player; `q` or `Ctrl+C` quits.
- Blocking: cannot move outside the viewport, into walls `#`, water `~`, or into another entity.
- Map re-renders after each attempted move with the legend shown.

## Sample output (world.json)
```
## ##############
## #.#.#
```
``` Actually run to view.
```
