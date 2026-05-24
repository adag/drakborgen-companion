import type { HeroTemplate, MonsterTemplate } from '../../data/combatants';
import { declarationLabels, endReasonLabels, intentLabels, purposeLabels } from '../../ui/labels';
import {
  damageDieForStr,
  dieMax,
  resolveAttack,
  resolveDamage,
  resolveFlee,
  resolveMonsterIntent,
} from '../rules/combatRules';
import type { Die, PendingRoll, RollRecord, RollPurpose } from '../rules/types';
import type {
  AttackResult,
  CombatantState,
  DamageResult,
  EncounterCommand,
  EncounterEvent,
  EncounterLogEntry,
  EncounterState,
  EndReason,
  FleeResult,
  RoundState,
} from './types';

function id(prefix: string): string {
  return globalThis.crypto?.randomUUID?.() ?? `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createRound(number: number): RoundState {
  return {
    number,
    heroDeclaration: null,
    monsterIntent: null,
    heroFlee: null,
    monsterFlee: null,
    heroAttack: null,
    monsterAttack: null,
    heroDamage: null,
    monsterDamage: null,
  };
}

function heroToCombatant(hero: HeroTemplate): CombatantState {
  return {
    id: hero.id,
    name: hero.name,
    maxKp: hero.kp,
    currentKp: hero.kp,
    str: hero.str,
    vig: hero.vig,
    rust: hero.rust,
    tur: { max: hero.tur, remaining: hero.tur, handledInApp: false },
  };
}

function monsterToCombatant(monster: MonsterTemplate, monsterKp: number): CombatantState {
  return {
    id: monster.id,
    name: monster.name,
    maxKp: monsterKp,
    currentKp: monsterKp,
    str: monster.str,
    vig: monster.vig,
    rust: monster.rust,
  };
}

export function createEncounter(hero: HeroTemplate, monster: MonsterTemplate, monsterKp: number): EncounterState {
  const state: EncounterState = {
    id: id('encounter'),
    phase: 'heroDeclaration',
    hero: heroToCombatant(hero),
    monster: monsterToCombatant(monster, monsterKp),
    monsterAttackFaces: monster.attackFaces,
    round: createRound(1),
    pendingRoll: null,
    log: [],
    ended: null,
  };

  return appendLog(state, { type: 'encounterStarted', heroId: hero.id, monsterId: monster.id, monsterKp }, `${hero.name} möter ${monster.name}.`);
}

export function encounterReducer(state: EncounterState, command: EncounterCommand): EncounterState {
  switch (command.type) {
    case 'startEncounter':
      return createEncounter(command.hero, command.monster, command.monsterKp);
    case 'declareHeroAction':
      return declareHeroAction(state, command.declaration);
    case 'commitRoll':
      return commitRoll(state, command.roll);
    case 'startNextRound':
      return startNextRound(state);
    default:
      return state;
  }
}

function declareHeroAction(state: EncounterState, declaration: NonNullable<RoundState['heroDeclaration']>): EncounterState {
  if (state.phase !== 'heroDeclaration' || state.ended) {
    return state;
  }

  const withDeclaration: EncounterState = {
    ...state,
    phase: 'monsterAction',
    round: { ...state.round, heroDeclaration: declaration },
    pendingRoll: createPendingRoll('monsterAction'),
  };

  return appendLog(
    withDeclaration,
    { type: 'heroDeclared', declaration },
    `Hjälten väljer ${declarationLabels[declaration]}.`,
  );
}

function commitRoll(state: EncounterState, roll: RollRecord): EncounterState {
  if (!state.pendingRoll || state.pendingRoll.purpose !== roll.purpose) {
    return state;
  }

  assertRollInRange(state.pendingRoll, roll);

  const withRoll = appendLog(
    { ...state, pendingRoll: null },
    { type: 'rollCommitted', roll },
    `${purposeLabels[roll.purpose]}: ${roll.value} (${roll.source === 'app' ? 'app' : 'manuell'}).`,
  );

  switch (roll.purpose) {
    case 'monsterAction':
      return resolveMonsterActionRoll(withRoll, roll);
    case 'heroFlee':
      return resolveHeroFleeRoll(withRoll, roll);
    case 'monsterFlee':
      return resolveMonsterFleeRoll(withRoll, roll);
    case 'heroHit':
      return resolveHeroHitRoll(withRoll, roll);
    case 'monsterHit':
      return resolveMonsterHitRoll(withRoll, roll);
    case 'heroDamage':
      return resolveHeroDamageRoll(withRoll, roll);
    case 'monsterDamage':
      return resolveMonsterDamageRoll(withRoll, roll);
  }
}

function resolveMonsterActionRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const intent = resolveMonsterIntent(roll.value, state.monsterAttackFaces);
  const withIntent = appendLog(
    { ...state, round: { ...state.round, monsterIntent: intent } },
    { type: 'monsterIntentResolved', intent },
    `Monstret väljer ${intentLabels[intent]}.`,
  );

  if (withIntent.round.heroDeclaration === 'fly') {
    return setPending(withIntent, 'flee', createPendingRoll('heroFlee'));
  }

  if (intent === 'fly') {
    return setPending(withIntent, 'flee', createPendingRoll('monsterFlee'));
  }

  return nextAttackOrFinish(withIntent);
}

function resolveHeroFleeRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const result: FleeResult = { roll, ...resolveFlee(roll.value, state.monster.vig) };
  const withResult = appendLog(
    { ...state, round: { ...state.round, heroFlee: result } },
    { type: 'fleeResolved', actorId: state.hero.id, success: result.success },
    result.success ? 'Hjälten flyr från mötet.' : 'Hjälten misslyckas med att fly.',
  );

  if (result.success) {
    return endEncounter(withResult, 'hero_fled');
  }

  if (withResult.round.monsterIntent === 'fly') {
    return setPending(withResult, 'flee', createPendingRoll('monsterFlee'));
  }

  return nextAttackOrFinish(withResult);
}

function resolveMonsterFleeRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const result: FleeResult = { roll, ...resolveFlee(roll.value, state.hero.vig) };
  const withResult = appendLog(
    { ...state, round: { ...state.round, monsterFlee: result } },
    { type: 'fleeResolved', actorId: state.monster.id, success: result.success },
    result.success ? 'Monstret flyr från mötet.' : 'Monstret misslyckas med att fly.',
  );

  if (result.success) {
    return endEncounter(withResult, 'monster_fled');
  }

  return nextAttackOrFinish(withResult);
}

function resolveHeroHitRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const attack: AttackResult = { roll, ...resolveAttack(roll.value, state.monster.vig) };
  const withAttack = appendLog(
    { ...state, round: { ...state.round, heroAttack: attack } },
    { type: 'attackResolved', actorId: state.hero.id, hit: attack.hit, crit: attack.crit },
    attack.hit ? `Hjälten träffar${attack.crit ? ' kritiskt' : ''}.` : 'Hjälten missar.',
  );

  if (attack.hit) {
    return setPending(withAttack, 'damage', createDamageRoll('heroDamage', state.hero.str));
  }

  return nextAttackOrFinish(withAttack);
}

function resolveMonsterHitRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const attack: AttackResult = { roll, ...resolveAttack(roll.value, state.hero.vig) };
  const withAttack = appendLog(
    { ...state, round: { ...state.round, monsterAttack: attack } },
    { type: 'attackResolved', actorId: state.monster.id, hit: attack.hit, crit: attack.crit },
    attack.hit ? `Monstret träffar${attack.crit ? ' kritiskt' : ''}.` : 'Monstret missar.',
  );

  if (attack.hit) {
    return setPending(withAttack, 'damage', createDamageRoll('monsterDamage', state.monster.str));
  }

  return nextAttackOrFinish(withAttack);
}

function resolveHeroDamageRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const damage = resolveDamage(roll.value, state.monster.rust, state.round.heroAttack?.crit ?? false);
  const withDamage = applyDamage(
    { ...state, round: { ...state.round, heroDamage: { roll, ...damage } } },
    state.hero.id,
    state.monster.id,
    damage,
  );

  return nextAttackOrFinish(withDamage);
}

function resolveMonsterDamageRoll(state: EncounterState, roll: RollRecord): EncounterState {
  const damage = resolveDamage(roll.value, state.hero.rust, state.round.monsterAttack?.crit ?? false);
  const withDamage = applyDamage(
    { ...state, round: { ...state.round, monsterDamage: { roll, ...damage } } },
    state.monster.id,
    state.hero.id,
    damage,
  );

  return nextAttackOrFinish(withDamage);
}

function nextAttackOrFinish(state: EncounterState): EncounterState {
  if (state.round.heroDeclaration === 'anfall' && !state.round.heroAttack) {
    return setPending(state, 'attacks', createPendingRoll('heroHit'));
  }

  if (state.round.monsterIntent === 'attack' && !state.round.monsterAttack) {
    return setPending(state, 'attacks', createPendingRoll('monsterHit'));
  }

  return finishRound(state);
}

function finishRound(state: EncounterState): EncounterState {
  const heroDead = state.hero.currentKp <= 0;
  const monsterDead = state.monster.currentKp <= 0;

  if (heroDead && monsterDead) {
    return endEncounter(state, 'both_dead');
  }

  if (heroDead) {
    return endEncounter(state, 'hero_dead');
  }

  if (monsterDead) {
    return endEncounter(state, 'monster_dead');
  }

  return startNextRound(state);
}

function startNextRound(state: EncounterState): EncounterState {
  if (state.ended) {
    return state;
  }

  const nextRound = state.round.number + 1;
  return appendLog(
    {
      ...state,
      phase: 'heroDeclaration',
      pendingRoll: null,
      round: createRound(nextRound),
    },
    { type: 'roundStarted', roundNumber: nextRound },
    `Runda ${nextRound} börjar.`,
  );
}

function applyDamage(
  state: EncounterState,
  actorId: string,
  targetId: string,
  damage: DamageResult,
): EncounterState {
  const target = targetId === state.hero.id ? state.hero : state.monster;
  const nextKp = Math.max(0, target.currentKp - damage.finalDamage);
  const nextState: EncounterState = targetId === state.hero.id
    ? { ...state, hero: { ...state.hero, currentKp: nextKp } }
    : { ...state, monster: { ...state.monster, currentKp: nextKp } };

  return appendLog(
    appendLog(
      nextState,
      { type: 'damageResolved', actorId, targetId, amount: damage.finalDamage },
      `${target.name} tar ${damage.finalDamage} skada${damage.crit ? ' (kritisk träff)' : ''}.`,
    ),
    { type: 'kpChanged', targetId, delta: -damage.finalDamage, currentKp: nextKp },
    `${target.name}: ${nextKp}/${target.maxKp} KP.`,
  );
}

function endEncounter(state: EncounterState, reason: EndReason): EncounterState {
  return appendLog(
    {
      ...state,
      phase: 'ended',
      pendingRoll: null,
      ended: { reason, roundNumber: state.round.number },
    },
    { type: 'encounterEnded', reason },
    `Mötet slutar: ${endReasonLabels[reason]}.`,
  );
}

function setPending(state: EncounterState, phase: EncounterState['phase'], pendingRoll: PendingRoll): EncounterState {
  return { ...state, phase, pendingRoll };
}

function createDamageRoll(purpose: Extract<RollPurpose, 'heroDamage' | 'monsterDamage'>, str: number): PendingRoll {
  return createPendingRoll(purpose, damageDieForStr(str));
}

function createPendingRoll(purpose: RollPurpose, die: Die = 'd12'): PendingRoll {
  return {
    id: id('pending-roll'),
    purpose,
    die,
    label: `${die.toUpperCase()} - ${purposeLabels[purpose]}`,
    min: 1,
    max: dieMax[die],
  };
}

function assertRollInRange(pendingRoll: PendingRoll, roll: RollRecord): void {
  if (roll.die !== pendingRoll.die || roll.value < pendingRoll.min || roll.value > pendingRoll.max) {
    throw new Error(`Invalid roll for ${pendingRoll.purpose}: ${roll.value}`);
  }
}
