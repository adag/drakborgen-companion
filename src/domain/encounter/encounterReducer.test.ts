import { describe, expect, it } from 'vitest';
import { heroes, monsters } from '../../data/combatants';
import type { EncounterState } from './types';
import { createEncounter, encounterReducer } from './encounterReducer';
import type { Die, MonsterIntent, RollPurpose, RollRecord } from '../rules/types';

function roll(purpose: RollPurpose, value: number, die: Die = 'd12'): RollRecord {
  return { id: `${purpose}-${value}`, purpose, die, source: 'manual', value };
}

function commit(state: EncounterState, purpose: RollPurpose, value: number, die: Die = 'd12'): EncounterState {
  return encounterReducer(state, { type: 'commitRoll', roll: roll(purpose, value, die) });
}

function monsterIntent(state: EncounterState, intent: MonsterIntent): EncounterState {
  return encounterReducer(state, { type: 'resolveMonsterIntent', intent });
}

describe('encounter reducer', () => {
  it('starts an encounter ready for hero declaration', () => {
    const state = createEncounter(heroes[0], monsters[0], 3);

    expect(state.phase).toBe('heroDeclaration');
    expect(state.hero.currentKp).toBe(15);
    expect(state.monster.currentKp).toBe(3);
    expect(state.round.number).toBe(1);
    expect(state.log[0].message).toContain('möter');
  });

  it('resolves hero flee as the hero action before monster intent', () => {
    let state = createEncounter(heroes[0], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'fly' });
    expect(state.pendingRoll?.purpose).toBe('heroFlee');

    state = commit(state, 'heroFlee', 12);
    expect(state.phase).toBe('ended');
    expect(state.ended?.reason).toBe('hero_fled');
    expect(state.round.monsterIntent).toBeNull();
  });

  it('ends immediately when the monster automatically chooses to flee', () => {
    let state = createEncounter(heroes[0], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'avvakta' });
    expect(state.phase).toBe('monsterAction');
    expect(state.pendingRoll).toBeNull();

    state = monsterIntent(state, 'fly');
    expect(state.phase).toBe('ended');
    expect(state.ended?.reason).toBe('monster_fled');
    expect(state.pendingRoll).toBeNull();
  });

  it('lets the hero kill a monster before monster intent', () => {
    let state = createEncounter(heroes[3], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'anfall' });
    expect(state.pendingRoll?.purpose).toBe('heroHit');

    state = commit(state, 'heroHit', 12);
    expect(state.pendingRoll?.purpose).toBe('heroDamage');

    state = commit(state, 'heroDamage', 3, 'd8');
    expect(state.phase).toBe('ended');
    expect(state.ended?.reason).toBe('monster_dead');
    expect(state.monster.currentKp).toBe(0);
    expect(state.round.monsterIntent).toBeNull();
  });

  it('moves to automatic monster intent after a missed hero attack', () => {
    let state = createEncounter(heroes[3], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'anfall' });
    state = commit(state, 'heroHit', 1);

    expect(state.phase).toBe('monsterAction');
    expect(state.pendingRoll).toBeNull();

    state = monsterIntent(state, 'attack');
    expect(state.pendingRoll?.purpose).toBe('monsterHit');
  });

  it('continues to the next round after Avvakta and a missed monster attack', () => {
    let state = createEncounter(heroes[0], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'avvakta' });
    state = monsterIntent(state, 'attack');
    state = commit(state, 'monsterHit', 1);

    expect(state.phase).toBe('heroDeclaration');
    expect(state.round.number).toBe(2);
    expect(state.pendingRoll).toBeNull();
  });
});
