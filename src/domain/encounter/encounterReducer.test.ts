import { describe, expect, it } from 'vitest';
import { heroes, monsters } from '../../data/combatants';
import type { EncounterState } from './types';
import { createEncounter, encounterReducer } from './encounterReducer';
import type { Die, RollPurpose, RollRecord } from '../rules/types';

function roll(purpose: RollPurpose, value: number, die: Die = 'd12'): RollRecord {
  return { id: `${purpose}-${value}`, purpose, die, source: 'manual', value };
}

function commit(state: EncounterState, purpose: RollPurpose, value: number, die: Die = 'd12'): EncounterState {
  return encounterReducer(state, { type: 'commitRoll', roll: roll(purpose, value, die) });
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

  it('ends when the hero successfully flees', () => {
    let state = createEncounter(heroes[0], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'fly' });
    expect(state.pendingRoll?.purpose).toBe('monsterAction');

    state = commit(state, 'monsterAction', 5);
    expect(state.pendingRoll?.purpose).toBe('heroFlee');

    state = commit(state, 'heroFlee', 12);
    expect(state.phase).toBe('ended');
    expect(state.ended?.reason).toBe('hero_fled');
  });

  it('lets the hero attack a monster that failed to flee', () => {
    let state = createEncounter(heroes[3], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'anfall' });
    state = commit(state, 'monsterAction', 6);
    expect(state.pendingRoll?.purpose).toBe('monsterFlee');

    state = commit(state, 'monsterFlee', 1);
    expect(state.pendingRoll?.purpose).toBe('heroHit');

    state = commit(state, 'heroHit', 12);
    expect(state.pendingRoll?.purpose).toBe('heroDamage');

    state = commit(state, 'heroDamage', 3, 'd8');
    expect(state.phase).toBe('ended');
    expect(state.ended?.reason).toBe('monster_dead');
    expect(state.monster.currentKp).toBe(0);
  });

  it('does not cancel a monster attack after lethal hero damage in the same attack round', () => {
    let state = createEncounter(heroes[3], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'anfall' });
    state = commit(state, 'monsterAction', 5);
    expect(state.pendingRoll?.purpose).toBe('heroHit');

    state = commit(state, 'heroHit', 12);
    state = commit(state, 'heroDamage', 3, 'd8');
    expect(state.monster.currentKp).toBe(0);
    expect(state.pendingRoll?.purpose).toBe('monsterHit');

    state = commit(state, 'monsterHit', 1);
    expect(state.phase).toBe('ended');
    expect(state.ended?.reason).toBe('monster_dead');
  });

  it('continues to the next round after Avvakta and a failed monster flee', () => {
    let state = createEncounter(heroes[0], monsters[0], 3);

    state = encounterReducer(state, { type: 'declareHeroAction', declaration: 'avvakta' });
    state = commit(state, 'monsterAction', 6);
    state = commit(state, 'monsterFlee', 1);

    expect(state.phase).toBe('heroDeclaration');
    expect(state.round.number).toBe(2);
    expect(state.pendingRoll).toBeNull();
  });
});
