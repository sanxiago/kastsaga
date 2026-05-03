# Proposal: Add LLM-driven NPC demo via OpenRouter

## Summary
Extend the ASCII demo so the NPC can be driven by a small LLM (via OpenRouter) instead of the deterministic patrol. Keep world constraints authoritative: movement and dialogue remain bounded by collision/adjacency validation. Provide a fallback to the existing patrol when no API key is configured.

## Motivation
- Demonstrate NPC agency with an LLM backend on the existing text slice without committing to an engine or runtime.
- Keep alignment with Constitution P2/P3/P9: world-state validation and logs, no out-of-bounds or invalid actions.
- Use OpenRouter with a default free model router for quick experimentation; make it opt-in and non-binding.

## Scope
- Update the demo (`examples/ascii-world/move.js`) to support NPC mode `llm` (env-driven) using OpenRouter chat completions, with a small action space (move NSEW, stay, attempt dialogue when adjacent).
- Add configuration docs (API key, model, timeout) to the README.
- Keep deterministic world validation; LLM output is advisory.

## Non-goals
- Selecting an official LLM runtime for the engine (Q4.3 remains open).
- Changing specs; this is an example/demo only.
- Building full dialogue generation; NPC dialogue initiation remains adjacency-gated and minimal.

## Success criteria
- With `NPC_MODE=llm` and OpenRouter API key set, the NPC takes actions chosen by the LLM; world constraints reject invalid moves.
- With no API key, the demo falls back to the deterministic patrol.
- README documents configuration and limitations; default model points to OpenRouter free router.
