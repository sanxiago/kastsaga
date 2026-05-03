# Design — LLM-driven NPC demo (OpenRouter)

- **Modes:** `NPC_MODE=patrol` (default) or `NPC_MODE=llm`. If `llm` is selected but no API key/model is provided, fall back to patrol with a notice.
- **Action space:** `move` with directions `north|south|east|west|stay`, and `talk` (attempt dialogue) only when adjacent to player. All actions still validated by world-state checks (bounds, passable tiles, occupancy, adjacency for talk).
- **Prompt:** Summarize the grid (player/NPC positions, nearby objects, blocked tiles) and available actions. Ask for a strict JSON response with `action` and optional `direction`. Keep concise to fit small models.
- **API:** Use OpenRouter chat completions (model default `openrouter/auto` or `openrouter/free`), env-configurable: `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_BASE` (default `https://openrouter.ai/api/v1`), `OPENROUTER_TIMEOUT_MS`.
- **Determinism and validation:** LLM output is advisory; move/talk still go through the same validation used for the player. Invalid/parse errors cause a no-op + log. World constraints remain the only source of truth (P2/P3).
- **Fallback:** On API errors or missing config, automatically use patrol for that tick and continue.
- **Docs:** README updated with configuration, safety, and limitations. This is a demo only; does not decide project runtime.
