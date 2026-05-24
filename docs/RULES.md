# Combat rules (canonical)

Direct-attribute + **T12** system for Drakborgen companion encounters.

## Attributes

All units (heroes & monsters): **STR**, **VIG**, **RUST**, **TUR** on scale **1–10** (used directly, no modifiers).

| Stat | Role |
|------|------|
| STR | Damage die size |
| VIG | To-hit and flee threshold |
| RUST | Damage reduction (DR) |
| TUR | Hero only — meta resource per **adventure** |
| KP | Body points (health) |

All primary checks use **1T12** unless noted.

## To-hit (attack)

1. Attacker rolls **1T12**.
2. **Miss:** natural **1**, or `roll ≤ defender.VIG`.
3. **Hit:** `roll > defender.VIG`.
4. **Crit:** natural **12** → always a **hit** and **crit** (double damage result, ignore DR).

Display hit range for VIG *v*: rolls *v+1* … 11 plus 12 (with 1 always miss).

**Hit chance** (for UI): outcomes that hit = `(12 - VIG) / 12` for VIG 1…10 on a fair d12 with 1 always miss (12 included as hit/crit).

## Damage

### Damage die (from STR)

| STR | Die |
|-----|-----|
| 1–3 | T4 |
| 4–6 | T6 |
| 7–8 | T8 |
| 9–10 | T10 |

### DR (from RUST)

| RUST | DR |
|------|-----|
| 1–3 | 0 |
| 4–6 | 1 |
| 7–8 | 2 |
| 9–10 | 3 |

### Resolution

```
raw = rollDamage(STR_die)

if crit:
  damage = raw * 2    // DR ignored
else:
  damage = max(0, raw - DR)
```

Crit **doubles the damage roll result**, not an extra die.

## Flee

Same d12 test as to-hit vs opponent **VIG**:

- **1** → fail  
- **12** → auto success  
- Else success if `roll > VIG`

## TUR (heroes)

Pool per **adventure**. Each spend, player chooses **one**:

1. **Reroll** one relevant die (to-hit, flee, damage, monster action — scope defined in UI).
2. **Halve incoming damage** this hit: `damage = floor(damage / 2)`.

## Round flow

1. Hero declares: **Anfall** | **Avvakta** | **Fly**.
2. Resolve hero action first:
   - **Anfall** → hero rolls to hit and damage if needed.
   - **Fly** → hero flee vs monster VIG. Success → encounter ends (hero escaped).
   - **Avvakta** → hero does not attack.
3. If the encounter continues, app resolves monster **intent** automatically from type weights / d12 band.
4. Resolve monster intent:
   - **Fly** → encounter ends (monster escaped). No separate monster flee roll in v1.
   - **Attack** → monster rolls to hit and damage if needed.
5. Update KP; repeat until escape or KP ≤ 0.

## Monster action weights

Store as exact fractions; UI may show equivalent d12 bands.

| Monster | Attack | Fly |
|---------|--------|-----|
| Svartalv | 5/12 (41.67%) | 7/12 |
| Bergstroll | 6/12 (50%) | 6/12 |
| Skelett | 9/12 (75%) | 3/12 |
| Orch | 8/12 (66.67%) | 4/12 |

Example bands (Svartalv): 1–5 Attack, 6–12 Fly.

## Example heroes (reference)

| Hjälte | KP | STR | Skada | VIG | RUST | DR | TUR |
|--------|-----|-----|-------|-----|------|----|-----|
| Adilric Brunkåpa | 15 | 4 | 1T6 | 7 | 4 | 1 | 8 |
| Astrid Gråsystrar | 14 | 5 | 1T6 | 8 | 3 | 0 | 9 |
| Bela Snabbskälka | 10 | 2 | 1T4 | 9 | 2 | 0 | 6 |
| Sigrun Sköldkross | 15 | 7 | 1T8 | 5 | 6 | 1 | 6 |
| Sigtryg Skarpyxe | 16 | 9 | 1T10 | 5 | 7 | 2 | 5 |
| Riddar Rut | 16 | 9 | 1T10 | 5 | 6 | 1 | 6 |
| Bardbor Bagman | 15 | 5 | 1T6 | 7 | 7 | 2 | 7 |
| Riddar Rohan | 17 | 9 | 1T10 | 5 | 7 | 2 | 4 |

## Example monsters (reference)

| Monster | KP | STR | Skada | VIG | RUST | DR |
|---------|-----|-----|-------|-----|------|-----|
| Svartalv | 1T4 | 6 | 1T6 | 8 | 5 | 1 |
| Bergstroll | 1T4+1 | 9 | 1T10 | 4 | 6 | 1 |
| Skelett | 1T4+1 | 7 | 1T8 | 3 | 8 | 2 |
| Orch | 1T6 | 8 | 1T8 | 6 | 6 | 1 |

KP formulas are rolled or set at **encounter start**, not each round.

## Die input (product)

Each roll step: **roll in app** or **enter manual value** on a numpad limited to valid faces for that die (see [ENCOUNTER-FLOW.md](ENCOUNTER-FLOW.md)).
