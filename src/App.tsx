import { useMemo, useState } from 'react';
import { heroes, monsters, type HeroTemplate, type MonsterTemplate } from './data/combatants';
import { createEncounter, encounterReducer } from './domain/encounter/encounterReducer';
import type { EncounterState, HeroDeclaration } from './domain/encounter/types';
import { damageDieForStr, damageReductionForRust, dieMax, rollDie, rollId } from './domain/rules/combatRules';
import type { PendingRoll, RollRecord } from './domain/rules/types';
import { declarationLabels, endReasonLabels, labels } from './ui/labels';

function initialMonsterKp(monster: MonsterTemplate): number {
  return dieMax[monster.kp.die] + monster.kp.bonus;
}

function rollMonsterKp(monster: MonsterTemplate): number {
  return rollDie(monster.kp.die) + monster.kp.bonus;
}

export default function App() {
  const [heroId, setHeroId] = useState(heroes[0].id);
  const [monsterId, setMonsterId] = useState(monsters[0].id);
  const selectedHero = useMemo(() => heroes.find((hero) => hero.id === heroId) ?? heroes[0], [heroId]);
  const selectedMonster = useMemo(
    () => monsters.find((monster) => monster.id === monsterId) ?? monsters[0],
    [monsterId],
  );
  const [monsterKp, setMonsterKp] = useState(initialMonsterKp(selectedMonster));
  const [encounter, setEncounter] = useState<EncounterState>(() =>
    createEncounter(selectedHero, selectedMonster, initialMonsterKp(selectedMonster)),
  );

  function startEncounter(hero: HeroTemplate = selectedHero, monster: MonsterTemplate = selectedMonster) {
    const nextMonsterKp = monsterKp > 0 ? monsterKp : initialMonsterKp(monster);
    setEncounter(createEncounter(hero, monster, nextMonsterKp));
  }

  function selectMonster(nextId: string) {
    const nextMonster = monsters.find((monster) => monster.id === nextId) ?? monsters[0];
    setMonsterId(nextId);
    setMonsterKp(initialMonsterKp(nextMonster));
  }

  function dispatch(command: Parameters<typeof encounterReducer>[1]) {
    setEncounter((state) => encounterReducer(state, command));
  }

  return (
    <main className="app-shell">
      <header className="hero-header">
        <p className="eyebrow">V1 · svensk klient</p>
        <h1>{labels.appTitle}</h1>
        <p>Stöd för möten med T12-regler, appslag eller fysisk tärning via numpad.</p>
      </header>

      <section className="panel setup-panel" aria-labelledby="setup-title">
        <div>
          <h2 id="setup-title">{labels.setup}</h2>
          <p>{labels.turOutsideApp}</p>
        </div>
        <label>
          {labels.hero}
          <select value={heroId} onChange={(event) => setHeroId(event.target.value)}>
            {heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {labels.monster}
          <select value={monsterId} onChange={(event) => selectMonster(event.target.value)}>
            {monsters.map((monster) => (
              <option key={monster.id} value={monster.id}>
                {monster.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Monster-KP
          <input
            type="number"
            min="1"
            value={monsterKp}
            onChange={(event) => setMonsterKp(Number(event.target.value))}
          />
        </label>
        <div className="button-row">
          <button type="button" onClick={() => setMonsterKp(rollMonsterKp(selectedMonster))}>
            Slå monster-KP
          </button>
          <button type="button" onClick={() => startEncounter()}>
            {labels.restartEncounter}
          </button>
        </div>
      </section>

      <section className="combat-grid">
        <CombatantCard title={labels.hero} combatant={encounter.hero} />
        <CombatantCard title={labels.monster} combatant={encounter.monster} attackFaces={encounter.monsterAttackFaces} />
      </section>

      <section className="panel round-panel" aria-labelledby="round-title">
        <div className="round-heading">
          <div>
            <p className="eyebrow">Runda {encounter.round.number}</p>
            <h2 id="round-title">{labels.currentStep}</h2>
          </div>
          {encounter.ended ? (
            <strong className="status-pill">{endReasonLabels[encounter.ended.reason]}</strong>
          ) : (
            <strong className="status-pill">{phaseLabel(encounter.phase)}</strong>
          )}
        </div>

        {encounter.phase === 'heroDeclaration' && !encounter.ended ? (
          <div className="declaration-buttons" aria-label={labels.declaration}>
            {(Object.keys(declarationLabels) as HeroDeclaration[]).map((declaration) => (
              <button
                type="button"
                key={declaration}
                onClick={() => dispatch({ type: 'declareHeroAction', declaration })}
              >
                {declarationLabels[declaration]}
              </button>
            ))}
          </div>
        ) : null}

        <RollStrip pendingRoll={encounter.pendingRoll} onCommit={(roll) => dispatch({ type: 'commitRoll', roll })} />
      </section>

      <section className="panel" aria-labelledby="log-title">
        <h2 id="log-title">{labels.combatLog}</h2>
        {encounter.log.length === 0 ? (
          <p>{labels.noLog}</p>
        ) : (
          <ol className="combat-log">
            {[...encounter.log].reverse().map((entry) => (
              <li key={entry.id}>
                <span>R{entry.roundNumber}</span> {entry.message}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function CombatantCard({
  title,
  combatant,
  attackFaces,
}: {
  title: string;
  combatant: EncounterState['hero'];
  attackFaces?: number;
}) {
  return (
    <article className="panel combatant-card">
      <p className="eyebrow">{title}</p>
      <h2>{combatant.name}</h2>
      <div className="kp-bar" aria-label={`${combatant.currentKp} av ${combatant.maxKp} KP`}>
        <span style={{ width: `${Math.max(0, (combatant.currentKp / combatant.maxKp) * 100)}%` }} />
      </div>
      <strong>
        {combatant.currentKp}/{combatant.maxKp} {labels.kp}
      </strong>
      <dl className="stats-grid">
        <div>
          <dt>{labels.str}</dt>
          <dd>
            {combatant.str} ({damageDieForStr(combatant.str).toUpperCase()})
          </dd>
        </div>
        <div>
          <dt>{labels.vig}</dt>
          <dd>{combatant.vig}</dd>
        </div>
        <div>
          <dt>{labels.rust}</dt>
          <dd>
            {combatant.rust} (DR {damageReductionForRust(combatant.rust)})
          </dd>
        </div>
      </dl>
      {combatant.tur ? <p className="note">TUR {combatant.tur.remaining} visas som referens.</p> : null}
      {attackFaces ? <p className="note">Anfall {attackFaces}/12 · Fly {12 - attackFaces}/12</p> : null}
    </article>
  );
}

function RollStrip({ pendingRoll, onCommit }: { pendingRoll: PendingRoll | null; onCommit: (roll: RollRecord) => void }) {
  const [manualValue, setManualValue] = useState<number | null>(null);

  if (!pendingRoll) {
    return <p className="note">Ingen tärning väntar just nu.</p>;
  }

  const activeRoll = pendingRoll;

  function commit(value: number, source: RollRecord['source']) {
    onCommit({
      id: rollId(),
      purpose: activeRoll.purpose,
      die: activeRoll.die,
      source,
      value,
    });
    setManualValue(null);
  }

  const keys = Array.from({ length: activeRoll.max - activeRoll.min + 1 }, (_, index) => activeRoll.min + index);

  return (
    <div className="roll-strip">
      <div>
        <p className="eyebrow">Aktiv tärning</p>
        <h3>{activeRoll.label}</h3>
      </div>
      <button type="button" onClick={() => commit(rollDie(activeRoll.die), 'app')}>
        {labels.rollInApp}
      </button>
      <div className="numpad" aria-label={labels.enterDie}>
        {keys.map((value) => (
          <button
            type="button"
            key={value}
            className={manualValue === value ? 'selected' : undefined}
            onClick={() => setManualValue(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <button type="button" disabled={manualValue === null} onClick={() => manualValue !== null && commit(manualValue, 'manual')}>
        Bekräfta {manualValue ?? ''}
      </button>
    </div>
  );
}

function phaseLabel(phase: EncounterState['phase']): string {
  switch (phase) {
    case 'heroDeclaration':
      return 'Hjältens val';
    case 'monsterAction':
      return 'Monstrets handling';
    case 'flee':
      return 'Flykt';
    case 'attacks':
      return 'Anfall';
    case 'damage':
      return 'Skada';
    case 'ended':
      return 'Avslutat';
    case 'setup':
    default:
      return 'Förberedelse';
  }
}
