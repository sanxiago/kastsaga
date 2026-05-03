# Design — Adjacency-Gated Dialogue & Descriptive Observations

- **Observations with descriptions:** Extend observations to carry short, authoritative textual descriptions for visible tiles/objects/entities. This stays within world-state; no extra lookups needed by renderers or decision backends.
- **Inspect/describe action:** Add an action that returns the description of an observed tile/object/entity in immediate proximity (current cell or adjacent). It uses the same action pipeline and is read-only (no mutation).
- **Movement parity:** Reaffirm that NPCs use the same move action and validation as players (bounded by world-state traversability).
- **Dialogue adjacency:** Dialogue initiation requires the speaker and audience to be co-located or adjacent (cardinal adjacency). This sits in dialogue and leverages world-state positions.
- **Test scenario:** One player and one NPC in the same grid; both can move by the same rules; dialogue only when adjacent; inspect returns descriptions.

This is specs-only; no engine/runtime choices implied.
