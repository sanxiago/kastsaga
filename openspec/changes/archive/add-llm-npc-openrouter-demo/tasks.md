# Tasks — add-llm-npc-openrouter-demo

- [x] Add NPC LLM mode to `examples/ascii-world/move.js` (env-driven), keeping patrol as fallback.
- [x] Define constrained action space (move N/S/E/W, stay, attempt dialogue if adjacent) and world validation for NPC actions.
- [x] Implement OpenRouter call (configurable API key/model/timeout), defaulting to free router; handle errors with graceful fallback.
- [x] Update README with configuration instructions and limitations; note non-binding to engine/runtime.
- [x] Run basic demo (patrol mode) to ensure no regressions; document LLM path (cannot be run here without key).
