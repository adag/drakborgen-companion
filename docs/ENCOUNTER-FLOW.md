# Encounter flow & roll UX

Implementation-oriented companion to [RULES.md](RULES.md).

## Encounter state (conceptual)

```
setup → round_loop → ended
  ended.reason: hero_fled | monster_fled | hero_dead | monster_dead
```

### Setup

- Select hero (stats, TUR remaining for adventure).
- Select monster type; roll or set KP max.
- Initialize combat log.

### Round loop

| Step | UI focus |
|------|----------|
| 1 | Hero declare: Anfall / Avvakta / Fly |
| 2 | Monster action (d12 band or weighted random) |
| 3 | Flee block if hero Fly and/or monster Fly intent |
| 4 | Attacks (hero and/or monster) |
| 5 | Damage + KP update |
| 6 | Optional TUR prompts during 3–5 |

## Roll strip pattern

One active roll at a time. Each step exposes:

- Label: die + purpose (e.g. `T12 · Träff`, `T6 · Skada`).
- **Slå i app** — RNG, log `source: app`.
- **Numpad** — only valid integers for that die; log `source: manual`.

### Numpad ranges

| Purpose | Keys |
|---------|------|
| To-hit, flee, monster action | 1–12 |
| Damage (from attacker STR) | 1–max for T4/T6/T8/T10 |

After manual or app value, show outcome (miss / hit / crit) before next step.

## Suggested screen blocks

1. **Combatants** — KP, STR/VIG/RUST; monster action hint (% or band).
2. **Round** — declaration buttons; current step indicator.
3. **Roll strip** — active roll (modes above).
4. **Log** — declarations, rolls with source, DR, crit, and KP deltas.
5. **TUR** — remaining; offer reroll vs halve when rules allow.

## Roll record (data shape)

```ts
type RollSource = 'app' | 'manual';

interface RollRecord {
  die: 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
  purpose: 'hit' | 'flee' | 'damage' | 'monsterAction';
  source: RollSource;
  value: number;
}
```

Derive `min`/`max` from `die`. Disable confirm until value set.

## TUR touchpoints

- After a roll, before locking: offer **reroll** (same step).
- After damage computed, before KP apply: offer **halve** on incoming hit.

Decrement TUR pool on use; pool is adventure-scoped (persist outside encounter if app tracks campaign).

## Branch quick reference

| Hero | Monster intent | Notes |
|------|----------------|-------|
| Anfall | Attack | Both may attack; both damage if both hit |
| Anfall | Fly (fail) | Hero may attack |
| Avvakta | Attack | Monster only attacks |
| Avvakta | Fly | Monster flee roll only |
| Fly | Attack | Hero flee first; on fail monster attacks |
| Fly | Fly | Hero flee, then monster flee if still relevant |

See [RULES.md](RULES.md) for authoritative ordering.

## Not in v1 (unless added later)

- Pursuit after failed flee
- Death cancelling second swing in same round
- Automatic initiative
