import { describe, expect, it } from 'vitest';
import {
  damageDieForStr,
  damageReductionForRust,
  resolveAttack,
  resolveDamage,
  resolveFlee,
  resolveMonsterIntent,
  rollDie,
} from './combatRules';

describe('combat rules', () => {
  it('maps STR to damage dice', () => {
    expect(damageDieForStr(1)).toBe('d4');
    expect(damageDieForStr(6)).toBe('d6');
    expect(damageDieForStr(8)).toBe('d8');
    expect(damageDieForStr(10)).toBe('d10');
  });

  it('maps RUST to damage reduction', () => {
    expect(damageReductionForRust(3)).toBe(0);
    expect(damageReductionForRust(6)).toBe(1);
    expect(damageReductionForRust(8)).toBe(2);
    expect(damageReductionForRust(10)).toBe(3);
  });

  it('resolves d12 attacks with natural 1 and 12 rules', () => {
    expect(resolveAttack(1, 5)).toEqual({ hit: false, crit: false });
    expect(resolveAttack(5, 5)).toEqual({ hit: false, crit: false });
    expect(resolveAttack(6, 5)).toEqual({ hit: true, crit: false });
    expect(resolveAttack(12, 10)).toEqual({ hit: true, crit: true });
  });

  it('resolves flee tests against opponent VIG', () => {
    expect(resolveFlee(1, 3)).toEqual({ success: false });
    expect(resolveFlee(4, 4)).toEqual({ success: false });
    expect(resolveFlee(5, 4)).toEqual({ success: true });
    expect(resolveFlee(12, 10)).toEqual({ success: true });
  });

  it('applies DR to normal damage and ignores it on crits', () => {
    expect(resolveDamage(2, 8, false)).toEqual({ raw: 2, dr: 2, crit: false, finalDamage: 0 });
    expect(resolveDamage(4, 8, false)).toEqual({ raw: 4, dr: 2, crit: false, finalDamage: 2 });
    expect(resolveDamage(4, 8, true)).toEqual({ raw: 4, dr: 0, crit: true, finalDamage: 8 });
  });

  it('uses monster attack faces for d12 intent bands', () => {
    expect(resolveMonsterIntent(5, 5)).toBe('attack');
    expect(resolveMonsterIntent(6, 5)).toBe('fly');
  });

  it('rolls inclusive die faces', () => {
    expect(rollDie('d6', () => 0)).toBe(1);
    expect(rollDie('d6', () => 0.999)).toBe(6);
  });
});
