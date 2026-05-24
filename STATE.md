# State

## Now

Vite + React + TypeScript + Vitest app scaffold is in the repo. v1 encounter shell now uses a landing screen, hero-first turns, automatic monster intent, and chronological logs.

## Next

1. Browser-test the revised hero-first flow on Vercel/local preview.
2. Tune monster HP defaults if max-by-die feels too hard/easy.
3. Polish v1 UI copy/layout after playtesting.

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

- Browser testing found flow issues: monster intent should be automatic after hero action, monster flee succeeds immediately, logs should read chronologically, and setup should be a landing screen.
