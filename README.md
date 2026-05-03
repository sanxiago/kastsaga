# RPG Engine — Spec Kit

A multiplayer RPG engine where non-player characters are **AI-controlled agents with goals, memory, and the ability to perceive and act on a shared world**, instead of pre-scripted dialogue trees and finite state machines.

We are building an **engine**, not a specific game. Theme, setting, and story are deliberately undecided.

## Status

Pre-prototype. No code yet. This repository contains:

- A **constitution** of non-negotiable principles.
- An **OpenSpec scaffold** with initial capability specs.
- A **DISCUSSION.md** of unanswered questions that need to be resolved (often by the group, not the engine designer alone).

## How to read this repo

1. **Start here:** [`CONSTITUTION.md`](./CONSTITUTION.md) — what we will not compromise on.
2. **Then:** [`DISCUSSION.md`](./DISCUSSION.md) — what we still need to decide. This is where group input matters most.
3. **Then:** [`openspec/project.md`](./openspec/project.md) — current technical context and conventions.
4. **Finally:** [`openspec/specs/`](./openspec/specs/) — the current "source of truth" specs for each capability.

Specs are deliberately high-level right now. They get more concrete as open questions get answered (each answer becomes a change proposal under `openspec/changes/`).

## How to extend this with OpenSpec

Install OpenSpec (requires Node 20.19+):

```bash
npm install -g @fission-ai/openspec
```

Initialize / refresh AI assistant guidance (will rewrite `openspec/AGENTS.md`):

```bash
cd rpg-engine-spec-kit
openspec init        # first time
openspec update      # subsequent updates
```

Workflow for any new capability or change:

```bash
# In your AI assistant (Claude Code, Cursor, etc.):
/opsx:propose <change-name>      # creates a proposal
/opsx:apply                      # implements tasks
/opsx:archive                    # merges deltas into specs/
```

## Suggested first change proposals

In rough priority order — these are the decisions that unblock the most other work:

1. `decide-session-model` — persistent characters vs session-based. **The single most expensive question** in the whole kit.
2. `decide-engine` — Godot 4 is the leading candidate, but commit before scaffolding.
3. `decide-llm-runtime` — local (Ollama / llama.cpp), hosted, or hybrid; affects every other technical decision.
4. `decide-decision-cadence` — how often NPCs think, and on what clock (real-time vs turn-based vs hybrid).
5. `decide-team-process` — how the group makes decisions when we disagree.

See `DISCUSSION.md` for the questions behind each.
