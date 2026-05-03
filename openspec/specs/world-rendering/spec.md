# World Rendering (ASCII Baseline)

## Purpose
Provide a minimal, deterministic ASCII rendering of a viewer's observation to reach a playable/diagnostic slice before full 2D rendering. This is a baseline profile that can be superseded by richer rendering without changing semantics.

## Scope
- Rendering a viewer's observation into a rectangular ASCII grid plus legend.
- Viewport definition and layering (terrain, objects, entities, emotes/status).
- Boundaries/void depiction and no-leakage guarantees.
- Update triggers (cadence remains open per Q2.4).

Out of scope: engine choice, final UI/UX, network replication, cadence decision, how emotes/status are generated.

## Requirements

### Requirement: ASCII rendering capability
The system SHALL provide a rendering capability that converts a viewer's observation into a rectangular ASCII grid (rows of characters) plus a legend. The renderer SHALL be deterministic given the same observation input.

#### Scenario: Deterministic render from same observation
- **GIVEN** the same observation for a viewer entity
- **WHEN** the renderer is invoked twice with that observation
- **THEN** the ASCII grid and legend produced are identical

### Requirement: Viewport definition
The renderer SHALL define a viewport with origin and extent (width × height) relative to world coordinates. Content outside the viewport SHALL NOT be rendered. Viewport selection strategy (follow player, fixed camera, etc.) is configurable and MUST NOT leak information beyond the viewer's observation.

#### Scenario: Content outside viewport is hidden
- **GIVEN** an observation that includes entities outside the chosen viewport
- **WHEN** the renderer produces the ASCII grid
- **THEN** only tiles within the viewport are included
- **AND** entities outside the viewport are absent from the grid and legend

### Requirement: Layered glyph mapping
The renderer SHALL map observation data into layers, resolved into a single glyph per cell:
- Terrain layer (one tile per cell).
- Object overlay (zero or one visible object per cell; if multiple objects exist, render a stack marker and list contents in legend or a side panel).
- Entity overlay (zero or one entity per cell). Entity glyphs SHALL be distinct for player(s) vs NPCs.

#### Scenario: Entity overlay replaces object glyph
- **GIVEN** a cell with terrain, an object, and an entity present in the observation
- **WHEN** the renderer outputs the ASCII grid
- **THEN** the cell shows the entity glyph (with optional emote), not the object glyph
- **AND** the object's presence is reflected via legend or stack marker if applicable

### Requirement: Boundaries and void
Out-of-bounds or non-traversable cells SHALL be rendered explicitly (e.g., walls, boundary glyph). The renderer SHALL NOT imply traversability that the world-state does not permit.

#### Scenario: Boundary rendered as non-traversable
- **GIVEN** the viewport edge aligns with a world boundary marked non-traversable
- **WHEN** the ASCII grid is produced
- **THEN** boundary cells render with the boundary glyph (e.g., `#` for wall)
- **AND** no empty/blank space suggests traversability beyond the boundary

### Requirement: Emote / status display
If an entity's observation metadata includes an emote or short status code, the renderer SHALL display it adjacent to or combined with the entity glyph (e.g., suffix, bubble, or side legend). Rendering SHALL NOT invent or infer emotes not present in observation data.

#### Scenario: Emote shown when present
- **GIVEN** an entity in observation with an emote code `!`
- **WHEN** the renderer outputs the grid and legend
- **THEN** the entity cell shows the emote alongside the glyph (e.g., `@!`)
- **AND** the legend explains the emote marker

### Requirement: Legend
The renderer SHALL output a legend that maps each glyph used in the viewport to its meaning (terrain types, objects, entities, emote/status markers). The legend SHALL be derived from the same observation and SHALL NOT include entities or tiles outside the viewport.

#### Scenario: Legend matches visible glyphs
- **GIVEN** a viewport that includes a wall `#` and a player `@`
- **WHEN** the renderer emits the legend
- **THEN** the legend contains entries for `#` and `@` with their meanings
- **AND** the legend omits glyphs not present in the current viewport

### Requirement: No information leakage
The renderer SHALL display only what is present in the viewer's observation. Tiles, objects, entities, or emotes not in observation SHALL NOT be rendered.

#### Scenario: Unobserved entity is hidden
- **GIVEN** an entity exists behind a wall and is not included in the viewer's observation
- **WHEN** the ASCII grid is rendered
- **THEN** the hidden entity does not appear in the grid or legend

### Requirement: Update cadence
Rendering updates SHALL be triggered by observation changes or on the simulation clock tick. The cadence value remains open (Q2.4); the renderer MUST accept an external trigger and SHALL NOT block on NPC inference.

#### Scenario: Render during slow NPC inference
- **GIVEN** an NPC backend is still computing a decision
- **WHEN** the simulation tick triggers a render update for the player viewport
- **THEN** the renderer updates the view within budget
- **AND** it does not wait for the NPC inference to complete
