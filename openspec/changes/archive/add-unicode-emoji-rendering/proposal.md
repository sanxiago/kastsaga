# Proposal: Add Unicode/Emoji Rendering Support

## Summary
Update the rendering and world-state specs to allow Unicode glyphs (including emoji) for tiles, objects, entities, and emotes while preserving deterministic, non-leaking rendering. This improves legibility and expressiveness beyond plain ASCII without committing to any engine.

## Motivation
- Emoji and wider Unicode glyphs improve readability and convey emotes/state more clearly than ASCII.
- Keeps the ASCII baseline but formally permits richer glyphs in the same rendering pipeline.
- Aligns future UI work with Unicode-safe handling (grapheme width, alignment) early.

## Scope
- Extend `world-rendering` to support Unicode glyphs/emoji in grids and legends, with alignment rules for variable-width graphemes.
- Extend `world-state` render metadata to allow Unicode glyphs and optional display-width hints.
- No engine choice; no change to action or world semantics.

## Non-goals
- Choosing a font, terminal, or engine; rendering environment specifics remain implementation details.
- Changing emote semantics or adding new action types; this is representational only.

## Success criteria
- Specs permit Unicode/emoji glyphs and require deterministic alignment handling.
- Emotes can be shown as emoji without breaking grid alignment or leaking info.
- World-state render metadata clarifies Unicode glyph carriage and optional width hints.
