import type { Die } from '../domain/rules/types';

export interface HeroTemplate {
  id: string;
  name: string;
  kp: number;
  str: number;
  vig: number;
  rust: number;
  tur: number;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  kp: { die: Die; bonus: number };
  str: number;
  vig: number;
  rust: number;
  attackFaces: number;
}

export const heroes: HeroTemplate[] = [
  { id: 'adilric-brunkapa', name: 'Adilric Brunkåpa', kp: 15, str: 4, vig: 7, rust: 4, tur: 8 },
  { id: 'astrid-grasystrar', name: 'Astrid Gråsystrar', kp: 14, str: 5, vig: 8, rust: 3, tur: 9 },
  { id: 'bela-snabbskalka', name: 'Bela Snabbskälka', kp: 10, str: 2, vig: 9, rust: 2, tur: 6 },
  { id: 'sigrun-skoldkross', name: 'Sigrun Sköldkross', kp: 15, str: 7, vig: 5, rust: 6, tur: 6 },
  { id: 'sigtryg-skarpyxe', name: 'Sigtryg Skarpyxe', kp: 16, str: 9, vig: 5, rust: 7, tur: 5 },
  { id: 'riddar-rut', name: 'Riddar Rut', kp: 16, str: 9, vig: 5, rust: 6, tur: 6 },
  { id: 'bardbor-bagman', name: 'Bardbor Bagman', kp: 15, str: 5, vig: 7, rust: 7, tur: 7 },
  { id: 'riddar-rohan', name: 'Riddar Rohan', kp: 17, str: 9, vig: 5, rust: 7, tur: 4 },
];

export const monsters: MonsterTemplate[] = [
  { id: 'svartalv', name: 'Svartalv', kp: { die: 'd4', bonus: 0 }, str: 6, vig: 8, rust: 5, attackFaces: 5 },
  { id: 'bergstroll', name: 'Bergstroll', kp: { die: 'd4', bonus: 1 }, str: 9, vig: 4, rust: 6, attackFaces: 6 },
  { id: 'skelett', name: 'Skelett', kp: { die: 'd4', bonus: 1 }, str: 7, vig: 3, rust: 8, attackFaces: 9 },
  { id: 'orch', name: 'Orch', kp: { die: 'd6', bonus: 0 }, str: 8, vig: 6, rust: 6, attackFaces: 8 },
];
