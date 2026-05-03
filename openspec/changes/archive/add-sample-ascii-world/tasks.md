# Tasks — add-sample-ascii-world

- [x] Draft sample observation JSON for the ASCII slice (bounded grid, terrain, boundary, stacked objects, entities with emotes) consistent with world-state and world-rendering specs.
- [x] Implement a deterministic Node.js renderer `examples/ascii-world/render.js` that consumes the observation and outputs grid + legend per spec (layering, viewport, emotes, no leakage).
- [x] Write `examples/ascii-world/README.md` with run instructions and describe the observation structure.
- [x] Run the renderer to verify deterministic output and alignment.
- [ ] (Optional) Run `openspec validate add-sample-ascii-world --strict` — expected to have no spec deltas; document if skipped.
