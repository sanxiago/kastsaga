# Discussion — Open Questions

This document holds questions the project has not yet answered. **Do not answer them here directly.** When a question is decided, the resolution becomes a change proposal in `openspec/changes/` (and, for architectural decisions, an ADR in `docs/adr/`).

Questions are grouped by theme. Each question has:
- **Why it matters** — what other decisions hinge on it.
- **Constraints** — what we already know from the constitution or from earlier decisions.
- **Options on the table** — the realistic alternatives, not exhaustive.

Questions marked **[blocking]** must be resolved before meaningful prototyping begins. Others can be deferred.

---

## 1. Theme & creative direction

### Q1.1 — What is the setting and tone? **[non-blocking for engine, blocking for any vertical slice]**

- **Why it matters:** The engine is theme-agnostic, but a prototype needs *some* setting to test against. Choice of setting also constrains art and asset budgets.
- **Constraints:** None at the engine level. Pixel-art / sprite aesthetic preferred (from earlier discussion).
- **Options:** Low fantasy (village + nearby region), sci-fi colony, weird-west frontier, post-collapse small town, surreal/dreamlike, contemporary with one twist.

### Q1.2 — What is the player fantasy?

- **Why it matters:** "Investigator unraveling NPC lives" implies very different mechanics from "wanderer who shapes a town" or "courtly intriguer playing factions." NPC autonomy supports several of these well, but the *first* prototype should pick one.
- **Constraints:** The fantasy must benefit from NPC agency — a fantasy that would work fine with scripted NPCs is a poor showcase of the engine.
- **Options:** Detective / mystery, social simulation / town-builder, intrigue / faction politics, slice-of-life, survival with social dynamics.

### Q1.3 — What is the playable scope of the first prototype?

- **Why it matters:** "An RPG" can mean 5 hours or 500. The first slice should be much smaller — enough to demonstrate the mechanic.
- **Options:** A single location with 3–5 NPCs, a single day, a single scenario, an unbounded sandbox.

---

## 2. Player & session model

### Q2.1 — Persistent or session-based characters? **[blocking]**

- **Why it matters:** This is the single most expensive design decision in the project. Persistent worlds require authoritative servers, save/load infrastructure, conflict resolution, anti-griefing, and inventory persistence. Session-based games can ship in a fraction of the time.
- **Constraints:** Constitution P2 (world simulates without observers) does **not** require persistence — a session can simulate world activity for the duration of that session.
- **Options:**
  - **Pure session.** World resets between sessions. Cheap, fast.
  - **Persistent world, ephemeral characters.** World saves; players make new characters each session.
  - **Persistent world, persistent characters.** MMO-style. Most expensive.
  - **Save-game model.** One person hosts a save; group plays from that save.

### Q2.2 — How many players per session?

- **Why it matters:** 2 vs 4 vs 8 changes UI, pacing, and networking complexity dramatically.
- **Options:** 2, 3–4, 4–6, scalable up to 8.

### Q2.3 — Cooperative, competitive, or mixed?

- **Why it matters:** Competitive multiplayer with AI NPCs introduces fairness questions (does an NPC favor one player?). Cooperative is simpler to design around.
- **Options:** Pure co-op, mostly co-op with occasional friction, faction-based competition, free PvP.

### Q2.4 — Real-time, turn-based, or hybrid?

- **Why it matters:** This sets the latency budget for NPC decisions. Real-time means decisions in tens of milliseconds (or pre-computed); turn-based affords seconds. Hybrid (turn-based combat + real-time exploration) is common but doubles the engine surface area.
- **Constraints:** Constitution P4 (explicit latency budgets).
- **Options:** Real-time, turn-based, hybrid.

---

## 3. NPC autonomy boundaries

### Q3.1 — How much autonomy do NPCs *actually* have?

- **Why it matters:** Total autonomy is unmanageable (NPCs walk out of the playable area, pursue uninteresting goals, generate inappropriate content). Insufficient autonomy violates Constitution P1.
- **Constraints:** P1 (real agency), P3 (world is authoritative), P6 (authorial guardrails).
- **Options:**
  - **Goal-bounded:** NPCs choose actions but goals are seeded by designers.
  - **Scene-bounded:** NPCs have full autonomy within a scene/location but are pulled back by scenes the author controls.
  - **Director-supervised:** A "director" agent watches NPC actions and intervenes for narrative pacing.
  - **Free-roaming:** Maximum autonomy; game design accommodates emergent outcomes.

### Q3.2 — Can NPCs do things the player can do?

- **Why it matters:** If NPCs can pick up items, fight, trade, then players and NPCs share an action space — clean. If NPCs use a different action space, the engine has two systems to maintain.
- **Constraints:** Constitution P3 (world is authoritative, same world for all entities).
- **Options:** Symmetric (same actions), asymmetric (NPCs have a richer or poorer action set), tiered (NPCs gain capabilities by importance).

### Q3.3 — How are NPC outputs constrained for safety / appropriateness?

- **Why it matters:** Players type things to NPCs. NPCs respond. Without constraints, this becomes an unsupervised LLM chat. The constitution requires explicit guardrails (P6).
- **Options:** Output filtering (block list / classifier), prompt-level guardrails (inviolable instructions), hard-coded action validation only (no text filter), human-in-the-loop for new sessions.

### Q3.4 — How do NPCs handle "I don't know what to do"?

- **Why it matters:** Real autonomy includes ambiguity. The fallback behavior matters more than people realize — it's what players see most often.
- **Options:** Idle behavior (wander, chat), seek information, ask the director, pick from a default action list.

---

## 4. Engine, language, and runtime

### Q4.1 — Which game engine? **[blocking]**

- **Why it matters:** Engine choice determines language, asset pipeline, multiplayer primitives, deployment targets, and AI tooling integration.
- **Constraints:** Constitution P8 (free, open-source by default). 2D pixel-art aesthetic.
- **Options:**
  - **Godot 4** — leading candidate. MIT-licensed, native 2D, text-based scenes (great for AI-assisted development), built-in multiplayer API, mature MCP server ecosystem.
  - **LÖVE / LÖVE2D** — minimal, Lua-based, no editor; multiplayer is BYO.
  - **Phaser** — JavaScript / TypeScript, browser-first; useful if "send a URL, play in browser" matters.
  - **Custom (Bevy, custom Rust)** — maximum control, maximum cost.

### Q4.2 — Scripting language?

- **Why it matters:** Determined by Q4.1 in most cases.
- **Options (Godot):** GDScript (simple, Python-like), C# (better for typed dependencies and library reuse), or both.

### Q4.3 — Where do LLMs run? **[blocking]**

- **Why it matters:** Cost, latency, and offline-playability all hinge on this.
- **Constraints:** P4 (latency budgets), P8 (open by default), P5 (reproducibility — easier with local models).
- **Options:**
  - **Local only** (Ollama, llama.cpp). Free at runtime. Constrained model size by player's hardware.
  - **Hosted only** (Anthropic, OpenAI, etc.). Best models. Requires API keys, internet, and per-token cost.
  - **Hybrid** — small/fast model local for most decisions, large model hosted for high-stakes ones.
  - **Per-host choice** — host configures runtime; clients use whatever the host has.

### Q4.4 — What size / class of model is the design budget?

- **Why it matters:** A 7B parameter local model and Claude Opus produce wildly different NPC behavior. The engine should be designed for the smaller end and gracefully use larger models when available.
- **Options:** 7–8B local, 14–30B local with quantization, 70B+ hosted, mixed.

### Q4.5 — Tool / function calling vs free-text NPC outputs?

- **Why it matters:** Function-calling models can directly emit validated actions (clean, predictable). Free-text models require parsing (flexible, error-prone). Affects Constitution P3.
- **Options:** Strict function calling, structured-output JSON, free-text + parser, ReAct-style mixed.

---

## 5. Networking & multiplayer

### Q5.1 — Authority model?

- **Why it matters:** Server-authoritative (one party owns the world) or peer-to-peer with consensus (no single owner). LLM-driven NPCs make P2P consensus harder because outputs may differ across peers.
- **Constraints:** P3 (single source of truth for world state).
- **Options:** Dedicated server, host-as-server (one player runs the server), pure P2P.

### Q5.2 — Where do NPC decisions happen in a multiplayer session?

- **Why it matters:** If every client runs every NPC, results diverge. If only the server runs NPCs, server load (and cost) is concentrated.
- **Constraints:** P3, P5 (reproducibility).
- **Options:** All NPCs on server, NPCs sharded by location, host runs NPCs, peer election per NPC.

### Q5.3 — Transport?

- **Why it matters:** ENet (UDP, Godot built-in), WebSocket (browser-friendly), WebRTC (P2P-friendly). Engine choice constrains options.
- **Options:** ENet, WebSocket, WebRTC, custom over QUIC.

---

## 6. Persistence & state

### Q6.1 — What gets saved between sessions?

- **Why it matters:** Decided by Q2.1, but worth enumerating: world entities, NPC memories, dialogue history, player progress, decision logs.
- **Constraints:** Storage size grows over time; some retention policy is needed.

### Q6.2 — How are NPC memories represented and bounded?

- **Why it matters:** Naive logs grow without limit. Summarization and decay are common but lose fidelity.
- **Options:** Raw event log, periodic summarization, vector store + retrieval, salience-weighted memory.

### Q6.3 — Save format?

- **Options:** SQLite (structured, queryable), JSON / msgpack files, custom binary, Godot's built-in resource format.

---

## 7. Observability, testing, replay

### Q7.1 — Replay format?

- **Why it matters:** Constitution P5 requires reproducibility. The format determines how logs are stored and what tools we need to inspect them.
- **Options:** Append-only event log, full state snapshots at intervals, hybrid.

### Q7.2 — How do we test NPC behavior?

- **Why it matters:** Testing is the part that breaks for AI-driven systems. Standard unit tests are insufficient; behavior is statistical.
- **Options:** Scenario-based golden runs, evaluator LLM grading, deterministic seed + assert, manual playtesting only.

### Q7.3 — How do we debug an NPC that does something weird?

- **Why it matters:** P9 demands inspectability. The team needs a workflow.
- **Options:** Decision viewer GUI, structured logs + grep, replay-and-step debugger, prompt-and-output diff against last working version.

---

## 8. Team process

### Q8.1 — How does the group make decisions when we disagree? **[blocking, social rather than technical]**

- **Why it matters:** Without an answer, the first real disagreement stalls the project.
- **Options:**
  - **Anyone proposes, one person decides, dissent is documented.** Common; needs a designated decider.
  - **Consensus on principles, dictator on implementation.** Constitution-level changes need agreement; tactical choices do not.
  - **Voting.** Works for small groups, breaks at scale.
  - **Proposer-decides-unless-vetoed.** Whoever proposes a change owns it unless someone formally objects.

### Q8.2 — How do non-coders contribute meaningfully?

- **Why it matters:** The constitution (P7) commits to readable specs but doesn't say *how* non-coders contribute.
- **Options:** Spec authorship, level/scene design in editor, NPC personality writing, playtest leadership, art and audio.

### Q8.3 — Cadence and time commitment?

- **Why it matters:** "Forever side project" and "ship in 6 months" are both valid, but they imply very different decisions.
- **Options:** Weekly sync, monthly milestone, async-only, quarterly demo cadence.

### Q8.4 — Where does discussion happen?

- **Options:** GitHub issues, Discord, periodic synchronous meetings, this DISCUSSION.md updated by the group.

---

## 9. Scope & timeline

### Q9.1 — Target ship date for the first playable prototype?

- **Why it matters:** Forces scope decisions on every other open question. The constitution requires "playable before polished" (P10) but does not name a date.
- **Options:** 4 weeks, 8 weeks, 3 months, 6 months, undated.

### Q9.2 — What is "done" for v1?

- **Why it matters:** Without a definition, everyone has a private one and we never agree we're finished.
- **Options:** A 30-minute scripted demo, a 2-hour replayable session, a sandbox you can leave running, a vertical slice with art polish.

### Q9.3 — What is explicitly out of scope for v1?

- **Suggested defaults (open to challenge):** Mobile platforms, public matchmaking, anti-cheat, monetization, non-English content, accessibility beyond keyboard + display scaling.

---

## How to close a question

When the group decides on a question:

1. Write a change proposal in `openspec/changes/decide-<question-slug>/`.
2. Include the answer, the reasoning, and the implications for any specs.
3. Apply and archive the change.
4. Mark the question here as resolved with a link to the archived change:

   > Q2.1 — **Resolved** by `changes/archive/decide-session-model/`. Decision: session-based, save-game model.

5. Architectural decisions also get an ADR in `docs/adr/`.
