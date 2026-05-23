# Working Instructions

Portable context and handoff protocol for **drakborgen-companion**. The repo is the
source of truth; Context Bridge is the **portable minimum interface** for orientation
and session continuity when a client lacks full local repo access.

## Doctrine

> Context Bridge is the portable minimum interface. When a client has richer repo
> access (local git, GitHub connector, IDE), use it for normal repo work while
> preserving the same context-file protocol.

### Practical split

| Layer | Use for |
|-------|---------|
| **Context Bridge MCP** | `read_project`, concise `STATE.md`, durable `DECISIONS.md`, cross-client handoff |
| **Local git / GitHub connector** | `docs/*`, specs, plans, source, detailed handoffs, arbitrary file edits |
| **`docs/`** | Real working material — rules, flows, UI notes, implementation briefs |
| **`CONTEXT.md`** | Stable identity; **links** to important docs; does not contain them |
| **`STATE.md`** | Volatile phase + next action + **pointer** to active handoff doc |

Context Bridge must stay narrow. Do not put detailed specs in `STATE.md` or `CONTEXT.md`.

## Orientation (every session)

1. Run `git status` and refresh relevant files from disk (or `read_project` if cloud-only).
2. Read `STATE.md` — current phase, next action, active handoff path.
3. Read the handoff doc named by `STATE.md` (under `docs/` unless noted otherwise).
4. Read `CONTEXT.md` for stable goals and principles only.
5. Skim `DECISIONS.md` if the task references a decision you do not recognize.
6. Confirm understanding of the active task before changing files.

## Project working rules

- Local filesystem and git state are authoritative when available.
- Keep detailed knowledge in `docs/*`, not in portable context files.
- Keep `CONTEXT.md` and `STATE.md` concise — index and summarize, do not replace docs.
- Do not let `CONTEXT.md` become the design bible.
- Update `STATE.md` only when phase, next action, or active handoff changes meaningfully.
- Append `DECISIONS.md` only for durable product, architecture, or workflow decisions.
- Prefer small, reviewable passes with focused validation.

## Current project docs

| Doc | Purpose |
|-----|---------|
| [docs/RULES.md](docs/RULES.md) | Canonical T12 combat rules |
| [docs/ENCOUNTER-FLOW.md](docs/ENCOUNTER-FLOW.md) | Round state machine and UI steps (when present) |
| [docs/ENCOUNTER-STATE.md](docs/ENCOUNTER-STATE.md) | v1 encounter state model and future sync path |

`STATE.md` names the **active** handoff doc; this table is a stable index.

## Portable context files

- **AGENTS.md** — This file. Client-agnostic protocol.
- **CONTEXT.md** — Goals, non-goals, principles, doc index. Updated rarely.
- **STATE.md** — Now / next / blocked / active handoff path. Updated each meaningful session.
- **DECISIONS.md** — Append-only durable decisions (newest first).

## Update discipline

- Update `STATE.md` at the end of every working session, even short ones.
- Update `CONTEXT.md` only when project shape changes (goals, constraints, principles).
- Append `DECISIONS.md` for choices worth preserving; never edit past entries — supersede with a new entry.
- Never edit `CONTEXT.md` and `STATE.md` in the same commit.

## Commit discipline

Same rules whether using Context Bridge MCP or direct git:

| Change | Message prefix |
|--------|----------------|
| Context | `context: <what changed>` |
| State | `state: <session summary>` |
| Decision | `decision: <title>` |
| Docs | `docs: <what changed>` |
| Code | `feat:`, `fix:`, etc. |

- Commit context updates separately from code when possible.
- Put detailed spec changes in `docs/*`, not in `STATE.md` body.

## Client notes

### Cursor / local agents

- Prefer local reads and git writes for `docs/*` and source.
- Context Bridge MCP is optional (e.g. sync state for a cloud session). Unpushed local commits may not be visible to MCP.
- After local work, update `STATE.md` via git so cloud agents see it on `main`.

### Cloud agents (ChatGPT, Claude.ai, Context Bridge)

- Orient with `read_project` when MCP is available.
- Use `update_state`, `append_decision`, `propose_context_change` per MCP design.
- Use GitHub connector (or equivalent) for `docs/*` and implementation files.
- If MCP is unavailable, follow this protocol manually via repo access.

## When something is unclear

- Repo wins over `STATE.md` — fix `STATE.md` before continuing.
- Newest `DECISIONS.md` entry wins over older context — update `CONTEXT.md` if needed.
- Unsure CONTEXT vs DECISION → almost always **DECISIONS.md**.

## What this is not

Not a task tracker or ticket system. For granular tasks, use a dedicated doc and reference it from `STATE.md`.
