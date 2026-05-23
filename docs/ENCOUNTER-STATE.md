# Encounter state model

Implementation planning for the first app scaffold. This complements
[ENCOUNTER-FLOW.md](ENCOUNTER-FLOW.md) and [RULES.md](RULES.md).

## Scope

### v1

- Single browser client.
- Swedish-only UI labels.
- Encounter-local state: setup, rounds, rolls, KP, end reason, and log.
- TUR is handled outside the app. The encounter model may keep hero TUR as reference
  data, but v1 should not decrement it or offer TUR prompts.
- No campaign, dungeon turn, inventory, or cross-device sync.

### Later

- Persist broader adventure state: game turn, KP across encounters, TUR, inventory, and
  other campaign resources.
- Sync a session between devices by sharing the same command/event stream.
- Add localization only when another language is needed.

## State machine

```ts
type EncounterPhase =
  | 'setup'
  | 'heroDeclaration'
  | 'monsterAction'
  | 'flee'
  | 'attacks'
  | 'damage'
  | 'ended';

type HeroDeclaration = 'anfall' | 'avvakta' | 'fly';
type MonsterIntent = 'attack' | 'fly';

type EndReason =
  | 'hero_fled'
  | 'monster_fled'
  | 'hero_dead'
  | 'monster_dead';
```

Only one player decision or roll should be active at a time. The UI advances by
dispatching commands; pure rules/state helpers derive the next phase and pending roll.

## Encounter state

```ts
interface EncounterState {
  id: string;
  phase: EncounterPhase;

  hero: CombatantState;
  monster: CombatantState;

  round: RoundState;
  pendingRoll: PendingRoll | null;
  log: EncounterLogEntry[];

  ended: null | {
    reason: EndReason;
    roundNumber: number;
  };
}

interface CombatantState {
  id: string;
  name: string;

  maxKp: number;
  currentKp: number;

  str: number;
  vig: number;
  rust: number;

  // Reference only in v1. TUR is not spent or resolved by the app yet.
  tur?: {
    max: number;
    remaining: number;
    handledInApp: false;
  };
}
```

## Combat log

Keep log entries structured. Render Swedish text from the event payload rather than
storing only display strings.

```ts
interface EncounterLogEntry {
  id: string;
  roundNumber: number;
  event: EncounterEvent;
  message: string;
}
```

## Round state

```ts
interface RoundState {
  number: number;

  heroDeclaration: HeroDeclaration | null;
  monsterIntent: MonsterIntent | null;

  heroFlee: FleeResult | null;
  monsterFlee: FleeResult | null;

  heroAttack: AttackResult | null;
  monsterAttack: AttackResult | null;

  heroDamage: DamageResult | null;
  monsterDamage: DamageResult | null;
}
```

Start a fresh `RoundState` after a non-ended damage/KP step.

## Rolls

```ts
type Die = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
type RollSource = 'app' | 'manual';

type RollPurpose =
  | 'monsterAction'
  | 'heroFlee'
  | 'monsterFlee'
  | 'heroHit'
  | 'monsterHit'
  | 'heroDamage'
  | 'monsterDamage';

interface PendingRoll {
  id: string;
  purpose: RollPurpose;
  die: Die;
  label: string;
  min: number;
  max: number;
}

interface RollRecord {
  id: string;
  purpose: RollPurpose;
  die: Die;
  source: RollSource;
  value: number;
}
```

`PendingRoll.label` should be a Swedish display string such as `T12 - Hjälten flyr`
or `T6 - Monstrets skada`. Manual entry must only allow `min..max`.

## Results

```ts
interface FleeResult {
  roll: RollRecord;
  success: boolean;
}

interface AttackResult {
  roll: RollRecord;
  hit: boolean;
  crit: boolean;
}

interface DamageResult {
  roll: RollRecord;
  raw: number;
  dr: number;
  crit: boolean;
  finalDamage: number;
}
```

## Commands and events

Use command-shaped UI actions even in the single-client v1. That keeps the reducer
testable and leaves a clean path to later synchronized sessions.

```ts
type EncounterCommand =
  | { type: 'startEncounter'; heroId: string; monsterId: string; monsterKp: number }
  | { type: 'declareHeroAction'; declaration: HeroDeclaration }
  | { type: 'commitRoll'; roll: RollRecord }
  | { type: 'startNextRound' };

type EncounterEvent =
  | { type: 'encounterStarted'; heroId: string; monsterId: string; monsterKp: number }
  | { type: 'heroDeclared'; declaration: HeroDeclaration }
  | { type: 'rollCommitted'; roll: RollRecord }
  | { type: 'fleeResolved'; actorId: string; success: boolean }
  | { type: 'attackResolved'; actorId: string; hit: boolean; crit: boolean }
  | { type: 'damageResolved'; actorId: string; targetId: string; amount: number }
  | { type: 'kpChanged'; targetId: string; delta: number; currentKp: number }
  | { type: 'roundStarted'; roundNumber: number }
  | { type: 'encounterEnded'; reason: EndReason };
```

v1 can apply commands directly to local state. Later sync can transmit ordered
commands/events and replay them into the same reducer.

## Swedish labels

Centralize labels rather than hard-coding strings across components.

```ts
const labels = {
  anfall: 'Anfall',
  avvakta: 'Avvakta',
  fly: 'Fly',
  rollInApp: 'Slå i app',
  enterDie: 'Ange tärning',
  heroFled: 'Hjälten flydde',
  monsterFled: 'Monstret flydde',
};
```

Do not add an i18n framework for v1 unless another product requirement appears.
