import type { HeroTemplate, MonsterTemplate } from '../../data/combatants';
import type { MonsterIntent, PendingRoll, RollRecord } from '../rules/types';

export type EncounterPhase =
  | 'setup'
  | 'heroDeclaration'
  | 'monsterAction'
  | 'flee'
  | 'attacks'
  | 'damage'
  | 'ended';

export type HeroDeclaration = 'anfall' | 'avvakta' | 'fly';

export type EndReason =
  | 'hero_fled'
  | 'monster_fled'
  | 'hero_dead'
  | 'monster_dead'
  | 'both_dead';

export interface CombatantState {
  id: string;
  name: string;
  maxKp: number;
  currentKp: number;
  str: number;
  vig: number;
  rust: number;
  tur?: {
    max: number;
    remaining: number;
    handledInApp: false;
  };
}

export interface FleeResult {
  roll: RollRecord;
  success: boolean;
}

export interface AttackResult {
  roll: RollRecord;
  hit: boolean;
  crit: boolean;
}

export interface DamageResult {
  roll: RollRecord;
  raw: number;
  dr: number;
  crit: boolean;
  finalDamage: number;
}

export interface RoundState {
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

export type EncounterEvent =
  | { type: 'encounterStarted'; heroId: string; monsterId: string; monsterKp: number }
  | { type: 'heroDeclared'; declaration: HeroDeclaration }
  | { type: 'rollCommitted'; roll: RollRecord }
  | { type: 'monsterIntentResolved'; intent: MonsterIntent }
  | { type: 'fleeResolved'; actorId: string; success: boolean }
  | { type: 'attackResolved'; actorId: string; hit: boolean; crit: boolean }
  | { type: 'damageResolved'; actorId: string; targetId: string; amount: number }
  | { type: 'kpChanged'; targetId: string; delta: number; currentKp: number }
  | { type: 'roundStarted'; roundNumber: number }
  | { type: 'encounterEnded'; reason: EndReason };

export interface EncounterLogEntry {
  id: string;
  roundNumber: number;
  event: EncounterEvent;
  message: string;
}

export interface EncounterState {
  id: string;
  phase: EncounterPhase;
  hero: CombatantState;
  monster: CombatantState;
  monsterAttackFaces: number;
  round: RoundState;
  pendingRoll: PendingRoll | null;
  log: EncounterLogEntry[];
  ended: null | {
    reason: EndReason;
    roundNumber: number;
  };
}

export type EncounterCommand =
  | { type: 'startEncounter'; hero: HeroTemplate; monster: MonsterTemplate; monsterKp: number }
  | { type: 'declareHeroAction'; declaration: HeroDeclaration }
  | { type: 'resolveMonsterIntent'; intent: MonsterIntent }
  | { type: 'commitRoll'; roll: RollRecord }
  | { type: 'startNextRound' };
