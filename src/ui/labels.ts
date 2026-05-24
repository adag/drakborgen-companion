import type { EndReason, HeroDeclaration, MonsterIntent } from '../domain/encounter/types';
import type { RollPurpose } from '../domain/rules/types';

export const labels = {
  appTitle: 'Drakborgen Companion',
  setup: 'Förbered möte',
  startEncounter: 'Starta möte',
  restartEncounter: 'Starta om möte',
  hero: 'Hjälte',
  monster: 'Monster',
  kp: 'KP',
  str: 'STR',
  vig: 'VIG',
  rust: 'RUST',
  turOutsideApp: 'TUR hanteras utanför appen i v1.',
  declaration: 'Vad gör hjälten?',
  rollInApp: 'Slå i app',
  enterDie: 'Ange tärning',
  manualValue: 'Manuellt resultat',
  combatLog: 'Stridslogg',
  noLog: 'Inga händelser ännu.',
  currentStep: 'Aktivt steg',
};

export const declarationLabels: Record<HeroDeclaration, string> = {
  anfall: 'Anfall',
  avvakta: 'Avvakta',
  fly: 'Fly',
};

export const intentLabels: Record<MonsterIntent, string> = {
  attack: 'Anfall',
  fly: 'Fly',
};

export const endReasonLabels: Record<EndReason, string> = {
  hero_fled: 'Hjälten flydde',
  monster_fled: 'Monstret flydde',
  hero_dead: 'Hjälten föll',
  monster_dead: 'Monstret föll',
  both_dead: 'Båda föll',
};

export const purposeLabels: Record<RollPurpose, string> = {
  monsterAction: 'Monstrets handling',
  heroFlee: 'Hjälten flyr',
  monsterFlee: 'Monstret flyr',
  heroHit: 'Hjältens träffslag',
  monsterHit: 'Monstrets träffslag',
  heroDamage: 'Hjältens skada',
  monsterDamage: 'Monstrets skada',
};
