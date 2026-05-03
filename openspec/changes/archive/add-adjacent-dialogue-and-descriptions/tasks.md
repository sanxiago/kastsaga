# Tasks — add-adjacent-dialogue-and-descriptions

- [ ] Update `world-state` spec to include descriptive text in observations and support an inspect/describe action for observed tiles/objects/entities.
- [ ] Update `player-interaction` spec to cover movement validation (shared with NPCs) and the inspect/describe action availability to players.
- [ ] Update `npc-agency` spec to state NPC movement uses the same action pipeline/constraints as players.
- [ ] Update `dialogue` spec to require adjacency (same or neighboring cell) to initiate dialogue, with a scenario.
- [ ] Add a cross-capability scenario describing one player and one NPC moving under the same rules and initiating dialogue only when adjacent.
- [ ] Validate the change with `openspec validate add-adjacent-dialogue-and-descriptions --strict`.
