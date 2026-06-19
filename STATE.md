# State

## Now

Vite + React + TypeScript + Vitest app scaffold is in the repo. v1 encounter shell now has a fold-focused interaction prototype: compact hero/monster cards, hero roll/outcome modals, monster action/outcome modals, automatic monster roll resolution, lower debug roll breakdowns, monster-crit toggle, and chronological logs.

## Next

1. Playtest the modal sequence: hero action/outcome → monster action/outcome.
2. Compare playtest feel with Monsterkritar on/off; tune monster HP/default crit behavior after testing.
3. Iterate layout/composition; visual direction is still exploratory.

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
- Wireframe references are directional, not final. Current pass prioritizes interaction clarity over final styling.

- Playtest note: monster hit/damage prompts were removed; monster turns now resolve fully automatically after hero action.
- Layout note: primary fold now prioritizes hero/monster state; STR/VIG/RUST details moved to lower debug section.

- Debug note: automatic monster rolls now show intent/hit/damage breakdowns, and Monsterkritar can be toggled for playtesting.
- Flow note: monster action is now visible as its own modal before automatic monster outcome resolution.
- Rules note: crit damage now doubles the raw damage roll, then applies DR (`raw * 2 - DR`).
- Deferred idea: successful hero flee may still allow monster consequence damage; documented but not implemented.
