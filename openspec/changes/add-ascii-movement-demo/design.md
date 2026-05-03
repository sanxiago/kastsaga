# Design — ASCII Movement Demo

- Reuse the existing ASCII renderer as a library so both `render.js` (static) and `move.js` (interactive) call the same render function.
- Movement loop: read arrow keys in raw mode via `readline`, mutate the player's coordinates if the target cell is passable and in-bounds; otherwise ignore. Quit on `q` or `Ctrl+C`.
- Passability: treat `#` and `~` as non-traversable; `.` as traversable. Configurable map in the demo to stay data-driven.
- Rendering on each tick uses the same deterministic renderer; legend is always printed to satisfy visibility of glyph meanings.
- No spec changes; this is an example aligned with `world-state` grid profile and `world-rendering` rules.
