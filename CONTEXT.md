# Drakborgen Companion — Context

## What this is

A **web-based companion** for **Drakborgen** monster encounters. Players run combat
using the **direct-attribute + T12** house system (STR, VIG, RUST, TUR, KP) with the
app guiding round flow, rolls, damage, and KP — at the table with physical dice or
fully in-app.

## Goals

- Play through an encounter: hero declaration, monster action, flee, attack, damage, KP.
- Support **roll in app** or **enter physical die results** via a context-aware numpad (e.g. 1–12 for d12).
- Keep rules faithful to agreed mechanics; store precise probabilities internally where stats were fitted to dice bands.
- Portable context for multi-agent / multi-client work (see [AGENTS.md](AGENTS.md)).

## Non-goals (current)

- Full dungeon crawl, inventory, or campaign map.
- Official Drakborgen rules replacement — this is a companion for a specific combat variant.
- Granular task/ticket tracking inside context files.

## Principles

- **Repo is truth** — specs in `docs/`, volatile handoff in `STATE.md`.
- **Dice are ritual, data is precise** — show d12/damage dice to players; store attributes and exact action weights where helpful.
- **Small passes** — rules doc → encounter flow → UI → implementation.

## Key references

| Document | Content |
|----------|---------|
| [docs/RULES.md](docs/RULES.md) | Canonical combat rules |
| [docs/ENCOUNTER-FLOW.md](docs/ENCOUNTER-FLOW.md) | Round resolution and screen flow |
| [DECISIONS.md](DECISIONS.md) | Locked product/rule choices |

## Repo

- GitHub: `adag/drakborgen-companion`
- Stack: TBD (web app)
