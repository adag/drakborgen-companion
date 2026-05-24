# State

## Now

Vite + React + TypeScript + Vitest app scaffold is in the repo. First v1 encounter shell, pure rules helpers, sample data, and encounter reducer are implemented.

## Next

1. Validate and harden the first encounter flow in browser.
2. Expand reducer tests for full round branches and edge cases.
3. Polish v1 UI copy/layout and add any missing setup controls.

## Blocked

Nothing.

## Active handoff

**App scaffold** — implementation now lives under `src/`. Reference docs: [docs/ENCOUNTER-STATE.md](docs/ENCOUNTER-STATE.md), [docs/ENCOUNTER-FLOW.md](docs/ENCOUNTER-FLOW.md), [docs/RULES.md](docs/RULES.md).

## Recent context

- GitHub repo created (`adag/drakborgen-companion`).
- Combat mechanics agreed in design sessions (crit, wait, flee, TUR, simultaneous damage, roll vs manual entry).
- Context Bridge adjustment adopted: MCP for portable layer; `docs/*` via normal repo access.
- v1 scope agreed: Swedish-only, single-client, encounter-local state; TUR handled outside app; command/event shape kept for later synced sessions.

- Stack chosen and scaffolded: Vite + React + TypeScript + Vitest.
- First implementation pass includes pure rules, encounter reducer, Swedish UI shell, roll strip, sample heroes/monsters, and tests.
