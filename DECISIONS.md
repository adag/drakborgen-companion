# Decisions

Newest first. Do not edit past entries — supersede with a new entry if a decision changes.

---

## v1 turn order: hero action before automatic monster intent

**Date:** 2026-05-24
**Context:** Browser testing showed the previous monster-action-first flow felt unsynced. Monster flee also created an unnecessary extra roll step.
**Decision:** In v1, each round resolves the hero declaration/action first. If the encounter continues, the app resolves monster intent automatically from the monster action weights. Monster Fly succeeds immediately and ends the encounter; no separate monster flee roll is made. Monster Attack proceeds to hit and damage rolls.
**Reasoning:** Keeps turns cohesive in the UI and removes a roll prompt that did not represent a meaningful player action.
**Alternatives:** Keep monster action as a visible d12 roll before hero action (superseded); keep monster flee as a d12 flee test (superseded for v1 UX).

---

## v1 encounter state scope

**Date:** 2026-05-23
**Context:** Stack choice and first implementation planning. TUR is currently handled outside the app, but later versions may manage full adventure state and synced sessions.
**Decision:** v1 is a single-client, Swedish-only encounter app. It manages encounter setup, round flow, rolls, KP, end reason, and log locally. TUR spending is outside the app in v1. Shape UI actions as commands/events so a later version can persist or synchronize sessions between devices without redesigning the encounter reducer.
**Reasoning:** Keeps the first app small while preserving a clean path to game-turn/adventure state, TUR, HP/KP persistence, and cross-device sync.
**Alternatives:** Implement adventure state and sync immediately (deferred); ignore future sync shape in v1 (rejected because command/event boundaries are cheap now).

---

## Portable context: Context Bridge + rich `docs/`

**Date:** 2026-05-23  
**Context:** Multi-client work (Cursor, cloud chat, Context Bridge MCP).  
**Decision:** Use Context Bridge as the portable minimum (`read_project`, `STATE.md`, `DECISIONS.md`). Put detailed specs and plans in `docs/*` via local git or GitHub connector. `CONTEXT.md` and `STATE.md` stay concise; `STATE.md` points to the active handoff doc.  
**Reasoning:** Resilient when MCP or connector differs per client; matches dungeon-game protocol with explicit split. MCP does not write `docs/*`; that is intentional.  
**Alternatives:** All cloud work only through Context Bridge (rejected — blocks normal doc workflow).

---

## Die input: roll in app or enter physical result

**Date:** 2026-05-23  
**Context:** Table play often uses real dice.  
**Decision:** Every roll step offers **Slå i app** (RNG) or **Ange tärning** (manual). Manual entry uses a **context numpad** with only valid faces (e.g. 1–12 for d12, 1–6 for damage die). Log `source: app | manual`.  
**Reasoning:** Supports both solo and table play; prevents invalid values.  
**Alternatives:** App-only rolls (rejected for table use).

---

## TUR: reroll or halve incoming damage

**Date:** 2026-05-23  
**Context:** TUR is spent per adventure, player chooses effect.  
**Decision:** Each TUR spend is **either** reroll one relevant die **or** halve incoming damage this hit: `damage = floor(damage / 2)`.  
**Reasoning:** Player flexibility; halve is simple and strong enough for v1.  
**Alternatives:** Fixed −1 reduction; reroll-only (rejected).

---

## Simultaneous attacks apply both damages

**Date:** 2026-05-23  
**Context:** Hero Anfall + monster Attack in the same round.  
**Decision:** Both resolve hits and damage; **both** KP adjustments apply in that round (no “kill cancels second swing” in v1).  
**Reasoning:** Simplest resolution; predictable.  
**Alternatives:** Initiative order; death stops second attack (deferred).

---

## Monster action: Attack vs Fly bands

**Date:** 2026-05-23  
**Context:** Monster behavior on d12 table.  
**Decision:** Action roll determines **intent** (Attack or Fly). Fly intent triggers a **flee roll** (d12 vs hero VIG, same rules as hero flee). Store precise **percentages** internally; UI may show d12 bands derived from them.  
**Reasoning:** Separates disposition from flee success; fixes misleading rounded % labels.  
**Alternatives:** Fly band = auto-escape (rejected).

---

## Avvakta (wait)

**Date:** 2026-05-23  
**Context:** Hero round declaration.  
**Decision:** Hero does not attack. Monster still rolls action; if Attack, monster may hit and deal damage normally.  
**Reasoning:** Wait is defensive/passive, not a combat skip for the monster.  
**Alternatives:** Monster skips turn (rejected).

---

## Flee tests

**Date:** 2026-05-23  
**Context:** Hero Fly declaration and monster Fly intent.  
**Decision:** Flee uses 1T12 vs opponent **VIG**: natural 1 = fail, natural 12 = auto success, else success if `roll > VIG`. Same test for hero and monster.  
**Reasoning:** Symmetric, matches to-hit structure.  
**Alternatives:** Separate flee table (rejected).

---

## Critical hit damage

**Date:** 2026-05-23  
**Context:** Natural 12 on to-hit.  
**Decision:** Crit = **hit** and **double the damage roll result** (not an extra damage die). DR is ignored on crit. Natural 1 on to-hit is always a miss.  
**Reasoning:** Clear math; avoids 2d6 vs 1d6×2 confusion.  
**Alternatives:** Roll damage die twice and sum (rejected).

---

## Attributes and data model

**Date:** 2026-05-23  
**Context:** Stats fitted roughly to common dice bands.  
**Decision:** Heroes/monsters use STR, VIG, RUST, TUR (1–10) as source of truth. Derive damage die and DR from bands. Monster action weights stored as exact fractions; player-facing UI may show d12 ranges. Monster KP may be rolled at encounter start or fixed per type.  
**Reasoning:** Dice stay authentic in UI; backend/balance can use precise %.  
**Alternatives:** Pure dice tables only (rejected for maintainability).
