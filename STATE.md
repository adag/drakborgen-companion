# State

## Now

Portable context protocol, combat rules, encounter flow spec, and encounter state model are in the repo.
App not scaffolded.

## Next

1. Choose web stack (e.g. Vite + React + TypeScript + Vitest).
2. Scaffold app and wire first encounter screen shell.
3. Implement encounter reducer/state machine against [docs/ENCOUNTER-STATE.md](docs/ENCOUNTER-STATE.md).
4. Implement roll strip (app roll + numpad) against [docs/ENCOUNTER-FLOW.md](docs/ENCOUNTER-FLOW.md).

## Blocked

Nothing.

## Active handoff

**[docs/ENCOUNTER-STATE.md](docs/ENCOUNTER-STATE.md)** — v1 state model and v2 sync path. Flow: [docs/ENCOUNTER-FLOW.md](docs/ENCOUNTER-FLOW.md). Rules: [docs/RULES.md](docs/RULES.md).

## Recent context

- GitHub repo created (`adag/drakborgen-companion`).
- Combat mechanics agreed in design sessions (crit, wait, flee, TUR, simultaneous damage, roll vs manual entry).
- Context Bridge adjustment adopted: MCP for portable layer; `docs/*` via normal repo access.
- v1 scope agreed: Swedish-only, single-client, encounter-local state; TUR handled outside app; command/event shape kept for later synced sessions.
