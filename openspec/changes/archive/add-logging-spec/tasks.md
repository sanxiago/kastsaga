# Tasks — add-logging-spec

- [ ] Author `openspec/changes/add-logging-spec/specs/logging/spec.md` with requirements and scenarios.
- [ ] Cover: structured event fields (timestamp/tick, actor/entity, action/result), correlation IDs, validation outcomes, timeouts, dialogue guardrail rejections, errors.
- [ ] Include rules for redaction/no-leakage and determinism for replay.
- [ ] Keep storage/backend unspecified but require append-only and queryable structure.
- [ ] Validate with `openspec validate add-logging-spec --strict`.
- [ ] Ensure alignment references to existing capabilities (npc-agency, dialogue, world-state, player-interaction).
