# Encounter flow & roll UX

Implementation-oriented companion to [RULES.md](RULES.md). See
[ENCOUNTER-STATE.md](ENCOUNTER-STATE.md) for the concrete state model.

## Encounter state (conceptual)

```
landing → encounter(round_loop) → ended
  ended.reason: hero_fled | monster_fled | hero_dead | monster_dead | both_dead
```

### Landing / setup

- Select hero from a dropdown.
- Select monster with a button.
- Selecting a monster starts the encounter immediately.
- Monster KP is set automatically in v1; no monster KP roll step is shown.
- Initialize combat log in chronological order.

### Round loop

| Step | UI focus |
|------|----------|
| 1 | Hero declare: Anfall / Avvakta / Fly |
| 2 | Resolve hero action first: hit/damage, flee, or wait |
| 3 | If encounter continues, app resolves monster intent automatically |
| 4 | Monster Fly ends encounter immediately |
| 5 | Monster Attack resolves hit/damage |
| 6 | End check or next round |

## Roll strip pattern

One active player-facing roll at a time. Each step exposes:

- Label: die + purpose (e.g. `T12 - Träff`, `T6 - Skada`).
- **Slå i app** — RNG, log `source: app`.
- **Numpad** — only valid integers for that die; log `source: manual`.

Monster intent is not a roll-strip step in v1. The app resolves it automatically.

### Numpad ranges

| Purpose | Keys |
|---------|------|
| To-hit, hero flee | 1–12 |
| Damage (from attacker STR) | 1–max for T4/T6/T8/T10 |

After manual or app value, show outcome (miss / hit / crit) before next step.

## Suggested screen blocks

1. **Landing** — hero dropdown and monster buttons.
2. **Combatants** — KP, STR/VIG/RUST; monster action hint (% or band).
3. **Round** — declaration buttons; current step indicator.
4. **Roll strip** — active roll (modes above).
5. **Log** — chronological declarations, rolls with source, DR, crit, and KP deltas.
6. **Rules note** — v1 omits in-app TUR spending; TUR is handled outside the app.

## Roll record (data shape)

```ts
type RollSource = 'app' | 'manual';

interface RollRecord {
  die: 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
  purpose: 'heroFlee' | 'heroHit' | 'monsterHit' | 'heroDamage' | 'monsterDamage';
  source: RollSource;
  value: number;
}
```

Derive `min`/`max` from `die`. Disable confirm until value set.

## TUR touchpoints

- Not in v1. TUR is handled outside the app.
- Later app-managed adventure state can add:
  - After a roll, before locking: offer **reroll** (same step).
  - After damage computed, before KP apply: offer **halve** on incoming hit.

When implemented later, decrement the adventure-scoped TUR pool on use.

## Branch quick reference

| Hero | Monster intent | Notes |
|------|----------------|-------|
| Anfall | Attack | Hero attacks first; if monster survives, monster attacks |
| Anfall | Fly | Hero attacks first; if monster survives, monster flees successfully |
| Avvakta | Attack | Monster attacks after hero waits |
| Avvakta | Fly | Monster flees successfully |
| Fly (success) | n/a | Hero escapes before monster intent |
| Fly (fail) | Attack | Monster attacks after failed hero flee |
| Fly (fail) | Fly | Monster flees successfully after failed hero flee |

## Not in v1 (unless added later)

- Pursuit after failed flee
- Separate monster flee roll
- Automatic initiative
- In-app TUR spending
