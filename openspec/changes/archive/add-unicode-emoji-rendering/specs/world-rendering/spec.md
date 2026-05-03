## MODIFIED Requirements

### Requirement: ASCII rendering capability
The system SHALL provide a rendering capability that converts a viewer's observation into a rectangular grid (rows of glyphs) plus a legend. Glyphs MAY be ASCII or any Unicode grapheme (including emoji). The renderer SHALL be deterministic given the same observation input and glyph set.

#### Scenario: Deterministic render from same observation
- **GIVEN** the same observation for a viewer entity
- **WHEN** the renderer is invoked twice with that observation
- **THEN** the grid and legend produced are identical, including any Unicode/emoji glyphs

## ADDED Requirements

### Requirement: Unicode-safe glyph handling
The renderer SHALL treat glyphs and emotes as Unicode grapheme clusters and account for their display width when composing the grid. The renderer SHALL pad or truncate consistently so that column alignment is preserved regardless of glyph width.

#### Scenario: Wide emoji does not break alignment
- **GIVEN** an observation where an entity glyph is an emoji that renders double-width
- **WHEN** the renderer outputs the grid
- **THEN** columns remain aligned across rows
- **AND** the emoji appears in the correct cell without overlapping adjacent cells

### Requirement: Legend reflects Unicode glyphs used
The renderer SHALL include Unicode/emoji glyphs in the legend exactly as rendered in the viewport and SHALL NOT substitute or strip them. If an implementation provides fallbacks, the legend SHALL show the fallback glyphs actually used in the grid for determinism.

#### Scenario: Legend shows emoji emote
- **GIVEN** an emote rendered as an emoji glyph in the grid
- **WHEN** the legend is produced
- **THEN** the emoji glyph appears in the legend with its meaning
- **AND** no alternative ASCII-only symbol is shown unless that was the glyph used in the grid
