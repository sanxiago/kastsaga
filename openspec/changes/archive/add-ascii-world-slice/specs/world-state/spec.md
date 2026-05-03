## ADDED Requirements

### Requirement: Grid world baseline profile
The system SHALL support a bounded rectangular grid world profile for the ASCII slice, consisting of:
- Terrain tiles (one per cell) with traversability metadata.
- Optional object layer per cell (zero or more objects). For the ASCII slice, at most one object is rendered per cell; stacks are represented via a stack marker and listed separately.
- Entity occupancy (at most one entity per cell in this profile). Collisions/stacking are resolved by the action pipeline.
- Explicit boundaries (walls or void) marking non-traversable edges.

#### Scenario: Stacked objects indicated via marker
- **GIVEN** a cell contains two objects in world state
- **WHEN** the world is presented via the ASCII slice
- **THEN** the cell is rendered with a stack marker (e.g., `*`)
- **AND** the legend or side listing names both objects
- **AND** no second object glyph is placed in the grid cell

### Requirement: Deterministic layout for replay
The grid layout for the ASCII slice SHALL be deterministic or seedable such that the same seed and rules produce the same layout (to satisfy P5 replayability).

#### Scenario: Same seed yields same layout
- **GIVEN** a generator seed `S`
- **WHEN** the grid layout is produced twice using seed `S`
- **THEN** the resulting terrain, objects, and boundary placement are identical

### Requirement: Observation includes render metadata
Observations for the grid profile SHALL include per-cell data sufficient for rendering without extra world queries:
- Terrain type identifier.
- Object presence and identifier(s).
- Entity presence and identifier(s).
- Per-entity render metadata: glyph, role (player/NPC), and optional emote/status code when available.

#### Scenario: Observation contains glyphs for visible entities
- **GIVEN** a viewer can observe two entities in adjacent cells
- **WHEN** the observation is constructed
- **THEN** each visible entity entry includes its glyph and role (player/NPC)
- **AND** any emote/status codes present are included for those entities

### Requirement: Render metadata is non-authoritative
Render metadata (glyphs, emote/status codes) SHALL be derived from authoritative world state but SHALL NOT confer authority; action validation continues to rely on world-state truth, not on rendered representations.

#### Scenario: Invalid action rejected despite glyph
- **GIVEN** a rendered glyph suggests a door, but the underlying world state marks the cell as a wall
- **WHEN** a player proposes to walk through that cell based on the glyph
- **THEN** the action validation rejects the move per world-state rules
- **AND** the rejection reason does not depend on the glyph
