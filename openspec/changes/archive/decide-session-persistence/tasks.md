# Tasks for decide-session-persistence

- [ ] Finalize the session-persistence decision text and get reviewer sign-off.
- [ ] Add ADDED requirements to `logging` that capture persistent interaction logging, including environment and sentiment updates for replay.
- [ ] Add ADDED requirements to `npc-memory` clarifying which interactions are stored, how retention ties to NPC age, and how situational prompt context layers onto stored memory.
- [ ] Add ADDED requirements to `world-state` describing the world-NPC, how it owns plot-aligned environment actions, and how persistence is maintained/replayed.
- [ ] Run `openspec validate decide-session-persistence --strict` once the CLI is available (if not already).
