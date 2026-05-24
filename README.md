# Drakborgen Companion

Web-based companion for **Drakborgen** monster encounters. Runs the direct-attribute + T12 combat system (STR, VIG, RUST, TUR, KP) so you can play through an encounter on the table or at the keyboard.

## For agents

Start with [AGENTS.md](AGENTS.md) → [STATE.md](STATE.md) → the active handoff doc under `docs/`.

## Docs

- [docs/RULES.md](docs/RULES.md) — canonical combat rules
- [docs/ENCOUNTER-FLOW.md](docs/ENCOUNTER-FLOW.md) — round flow and roll/numpad UX
- [docs/ENCOUNTER-STATE.md](docs/ENCOUNTER-STATE.md) — v1 encounter state model and later sync path
- [DECISIONS.md](DECISIONS.md) — durable decisions

## Status

Vite + React + TypeScript + Vitest scaffolded with a first encounter UI shell.

## Stack

Vite + React + TypeScript + Vitest. v1 is a single-client web app.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```
