export type Die = 'd4' | 'd6' | 'd8' | 'd10' | 'd12';
export type RollSource = 'app' | 'manual';

export type RollPurpose =
  | 'monsterAction'
  | 'heroFlee'
  | 'monsterFlee'
  | 'heroHit'
  | 'monsterHit'
  | 'heroDamage'
  | 'monsterDamage';

export interface RollRecord {
  id: string;
  purpose: RollPurpose;
  die: Die;
  source: RollSource;
  value: number;
}

export interface PendingRoll {
  id: string;
  purpose: RollPurpose;
  die: Die;
  label: string;
  min: number;
  max: number;
}

export interface AttributeBlock {
  str: number;
  vig: number;
  rust: number;
}

export interface AttackResolution {
  hit: boolean;
  crit: boolean;
}

export interface FleeResolution {
  success: boolean;
}

export interface DamageResolution {
  raw: number;
  dr: number;
  crit: boolean;
  finalDamage: number;
}

export type MonsterIntent = 'attack' | 'fly';
