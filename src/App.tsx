import { useEffect, useMemo, useState } from 'react';
import { heroes, monsters, type MonsterTemplate } from './data/combatants';
import { createEncounter, encounterReducer } from './domain/encounter/encounterReducer';
import type { EncounterState, HeroDeclaration } from './domain/encounter/types';
import {
  damageDieForStr,
  damageReductionForRust,
  dieMax,
  resolveMonsterIntent,
  rollDie,
  rollId,
} from './domain/rules/combatRules';
import type { PendingRoll, RollRecord } from './domain/rules/types';
import { declarationLabels, endReasonLabels, labels } from './ui/labels';

function fixedMonsterKp(monster: MonsterTemplate): number {
  return dieMax[monster.kp.die] + monster.kp.bonus;
}

export default function App() {
  const [heroId, setHeroId] = useState(heroes[0].id);
  const [encounter, setEncounter] = useState<EncounterState | null>(null);
  const selectedHero = useMemo(() => heroes.find((hero) => hero.id === heroId) ?? heroes[0], [heroId]);

  function startEncounter(monster: MonsterTemplate) {
    setEncounter(createEncounter(selectedHero, monster, fixedMonsterKp(monster)));
  }

  function dispatch(command: Parameters<typeof encounterReducer>[1]) {
    setEncounter((state) => (state ? encounterReducer(state, command) : state));
  }

  useEffect(() => {
    if (!encounter || encounter.phase !== 'monsterAction' || encounter.pendingRoll || encounter.ended || encounter.round.monsterIntent) {
      return;
    }

    const intentRoll = rollDie('d12');
    dispatch({ type: 'resolveMonsterIntent', intent: resolveMonsterIntent(intentRoll, encounter.monsterAttackFaces) });
  }, [encounter]);

  return (
    <main className="app-shell">
      <header className="hero-header">
        <p className="eyebrow">V1 · svensk klient</p>
        <h1>{labels.appTitle}</h1>
        <p>Stöd för möten med T12-regler, appslag eller fysisk tärning via numpad.</p>
      </header>

      {!encounter ? (
        <LandingScreen heroId={heroId} onHeroChange={setHeroId} onStartEncounter={startEncounter} />
      ) : (
        <EncounterScreen encounter={encounter} dispatch={dispatch} onBackToLanding={() => setEncounter(null)} />
      )}
    </main>
  );
}

function LandingScreen({
  heroId,
  onHeroChange,
  onStartEncounter,
}: {
  heroId: string;
  onHeroChange: (heroId: string) => void;
  onStartEncounter: (monster: MonsterTemplate) => void;
}) {
  return (
    <section className="panel landing-panel" aria-labelledby="landing-title">
      <div>
        <p className="eyebrow">Nytt möte</p>
        <h2 id="landing-title">Välj hjälte och monster</h2>
        <p>Monster-KP sätts automatiskt för v1. Välj ett monster för att starta mötet direkt.</p>
      </div>

      <label className="hero-select">
        {labels.hero}
        <select value={heroId} onChange={(event) => onHeroChange(event.target.value)}>
          {heroes.map((hero) => (
            <option key={hero.id} value={hero.id}>
              {hero.name}
            </option>
          ))}
        </select>
      </label>

      <div className="monster-buttons" aria-label="Välj monster">
        {monsters.map((monster) => (
          <button type="button" key={monster.id} onClick={() => onStartEncounter(monster)}>
            <strong>{monster.name}</strong>
            <span>{fixedMonsterKp(monster)} KP</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function EncounterScreen({
  encounter,
  dispatch,
  onBackToLanding,
}: {
  encounter: EncounterState;
  dispatch: (command: Parameters<typeof encounterReducer>[1]) => void;
  onBackToLanding: () => void;
}) {
  return (
    <>
      <div className="top-actions">
        <button type="button" onClick={onBackToLanding}>
          Välj nytt möte
        </button>
      </div>

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
            {encounter.log.map((entry) => (
              <li key={entry.id}>
                <span>R{entry.roundNumber}</span> {entry.message}
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
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
      return 'Monstret agerar';
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
