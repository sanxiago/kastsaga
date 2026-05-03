## MODIFIED Requirements

### Requirement: Observation includes render metadata
Observations for the grid profile SHALL include per-cell data sufficient for rendering without extra world queries:
- Terrain type identifier and glyph (ASCII or Unicode grapheme).
- Object presence, identifier(s), and glyphs (ASCII or Unicode grapheme).
- Entity presence, identifier(s), and glyphs (ASCII or Unicode grapheme) plus role (player/NPC).
- Optional emote/status code mapped to a glyph (ASCII or Unicode grapheme).
- Optional display-width hint per glyph/emote to assist Unicode-aware rendering.

#### Scenario: Observation contains emoji glyphs for visible entities
- **GIVEN** a viewer can observe an entity whose glyph is "🧙" and emote is "✨"
- **WHEN** the observation is constructed
- **THEN** the entity entry includes those glyphs and (optionally) display-width hints
- **AND** no additional queries are required by the renderer to display them
