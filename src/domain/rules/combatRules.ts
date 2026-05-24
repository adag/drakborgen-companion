import type { AttackResolution, DamageResolution, Die, FleeResolution, MonsterIntent } from './types';

export const dieMax: Record<Die, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
};

export function rollDie(die: Die, rng: () => number = Math.random): number {
  return Math.floor(rng() * dieMax[die]) + 1;
}

export function damageDieForStr(str: number): Die {
  if (str <= 3) return 'd4';
  if (str <= 6) return 'd6';
  if (str <= 8) return 'd8';
  return 'd10';
}

export function damageReductionForRust(rust: number): number {
  if (rust <= 3) return 0;
  if (rust <= 6) return 1;
  if (rust <= 8) return 2;
  return 3;
}

export function resolveAttack(roll: number, defenderVig: number): AttackResolution {
  if (roll === 12) {
    return { hit: true, crit: true };
  }

  if (roll === 1 || roll <= defenderVig) {
    return { hit: false, crit: false };
  }

  return { hit: true, crit: false };
}

export function resolveFlee(roll: number, opponentVig: number): FleeResolution {
  if (roll === 12) {
    return { success: true };
  }

  if (roll === 1) {
    return { success: false };
  }

  return { success: roll > opponentVig };
}

export function resolveDamage(raw: number, defenderRust: number, crit: boolean): DamageResolution {
  if (crit) {
    return { raw, dr: 0, crit, finalDamage: raw * 2 };
  }

  const dr = damageReductionForRust(defenderRust);
  return { raw, dr, crit, finalDamage: Math.max(0, raw - dr) };
}

export function resolveMonsterIntent(roll: number, attackFaces: number): MonsterIntent {
  return roll <= attackFaces ? 'attack' : 'fly';
}

export function rollId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `roll-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
