# Proposal: Decide session persistence

## Summary
We resolve Q2.1 by committing to persistent sessions where every meaningful interaction is logged and replayable, and NPC memory retention is governed by character age and context. World state acts as an authoritative “world-NPC” that owns plot state, orchestrates environment interactions, and keeps characters aligned to ongoing story beats. This decision ensures persistence without contradicting Constitution principles (P1–P9) and gives implementers a concrete reference for logging, memory, and world-state behavior.

## Decision
- Sessions are persistent: world state, environment changes, and NPC memories survive ticks and are replayable across sessions.
- Only interactions between characters (players or player-controlled avatars) and NPCs/world-NPCs are stored in NPC memory. Memory retention spans are inversely correlated with NPC age (younger NPCs retain details longer; older NPCs exhibit accelerated forgetting), and situational traits (current prompt context) are layered on top of those stores.
- The world is modelled as a special NPC per room/region that can interact, log, and authoritatively decide outcomes of player- or NPC-driven environmental actions (e.g., constructing or deconstructing bridges).
- Every interaction that mutates shared state (player breaks tree, NPC builds bridge, world-NPC removes bridge, NPC dislikes player) is logged in the audit trail with enough data to replay it.

## Implications
- `openspec/specs/world-state/spec.md` must define world-NPC behavior, how plot-aligned environment interactions are owned/applied, and how world state enforces persistence and replays interactions (e.g., bridge built/destroyed).
- `openspec/specs/npc-memory/spec.md` must describe what counts as memory (character/NPC interactions), how retention depends on age, and how situational context augments prompt-based traits without duplicating replay logs.
- `openspec/specs/logging/spec.md` must require that interaction outcomes (environmental, NPC sentiments, world-NPC interventions) are persisted, correlated by entity, and include the necessary fields for replay.

## Testing & Validation
- Logs and snapshots should demonstrate that a player-built bridge persists across sessions and that a later NPC action removing it is traceable.
- NPC audits should show age-based retention windows (e.g., test case where younger NPC recalls a prior interaction that older NPCs forget within a bounded window).
- World-state snapshots must be replayable to rebuild the same chain of interactions involving the world-NPC.

## Next Steps
Pending review and approval, author the spec deltas under `openspec/changes/decide-session-persistence/specs/` (logging, npc-memory, world-state) and then continue through the usual apply/archive phases.
