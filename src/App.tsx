import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { heroes, monsters, type HeroTemplate, type MonsterTemplate } from './data/combatants';
import { createEncounter, encounterReducer } from './domain/encounter/encounterReducer';
import type { CombatantState, EncounterState, HeroDeclaration } from './domain/encounter/types';
import {
  damageDieForStr,
  damageReductionForRust,
  dieMax,
  resolveAttack,
  resolveDamage,
  resolveFlee,
  resolveMonsterIntent,
  rollDie,
  rollId,
} from './domain/rules/combatRules';
import type { Die, PendingRoll, RollRecord, RollPurpose } from './domain/rules/types';
import { declarationLabels, endReasonLabels, labels } from './ui/labels';

type LandingStep = 'hero' | 'monster';

type ResultModalState = {
  title: string;
  lines: string[];
};

type CardStatus = {
  label: string;
  detail?: string;
  tone?: 'neutral' | 'danger' | 'success' | 'dead';
};

function fixedMonsterKp(monster: MonsterTemplate): number {
  return dieMax[monster.kp.die] + monster.kp.bonus;
}

function dieLabel(die: Die): string {
  return die.toUpperCase().replace('D', 'T');
}

function createAppRoll(purpose: RollPurpose, die: Die): RollRecord {
  return {
    id: rollId(),
    purpose,
    die,
    source: 'app',
    value: rollDie(die),
  };
}

export default function App() {
  const [landingStep, setLandingStep] = useState<LandingStep>('hero');
  const [heroId, setHeroId] = useState(heroes[0].id);
  const [encounter, setEncounter] = useState<EncounterState | null>(null);
  const [resultModal, setResultModal] = useState<ResultModalState | null>(null);
  const selectedHero = useMemo(() => heroes.find((hero) => hero.id === heroId) ?? heroes[0], [heroId]);

  function startEncounter(monster: MonsterTemplate) {
    setResultModal(null);
    setEncounter(createEncounter(selectedHero, monster, fixedMonsterKp(monster)));
  }

  function returnToLanding(step: LandingStep = 'hero') {
    setEncounter(null);
    setResultModal(null);
    setLandingStep(step);
  }

  function dispatch(command: Parameters<typeof encounterReducer>[1]) {
    setEncounter((state) => (state ? encounterReducer(state, command) : state));
  }

  function commitRoll(roll: RollRecord) {
    if (!encounter) {
      return;
    }

    const nextEncounter = encounterReducer(encounter, { type: 'commitRoll', roll });
    setEncounter(nextEncounter);
    setResultModal(describeRollResult(encounter, nextEncounter, roll));
  }

  useEffect(() => {
    if (
      !encounter ||
      resultModal ||
      encounter.phase !== 'monsterAction' ||
      encounter.pendingRoll ||
      encounter.ended ||
      encounter.round.monsterIntent
    ) {
      return;
    }

    const intentRoll = rollDie('d12');
    const intent = resolveMonsterIntent(intentRoll, encounter.monsterAttackFaces);

    if (intent === 'fly') {
      dispatch({ type: 'resolveMonsterIntent', intent });
      return;
    }

    const attackRoll = createAppRoll('monsterHit', 'd12');
    const attack = resolveAttack(attackRoll.value, encounter.hero.vig);
    const damageDie = damageDieForStr(encounter.monster.str);
    const damageRoll = attack.hit ? createAppRoll('monsterDamage', damageDie) : undefined;

    dispatch({ type: 'resolveMonsterIntent', intent, attackRoll, damageRoll });
  }, [encounter, resultModal]);

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="logo-mark" aria-hidden="true">
          Drakborgen
        </div>
        <p className="eyebrow">Interaktionsprototyp · v1</p>
      </header>

      {!encounter ? (
        <LandingScreen
          heroId={heroId}
          landingStep={landingStep}
          selectedHero={selectedHero}
          onHeroChange={setHeroId}
          onStepChange={setLandingStep}
          onStartEncounter={startEncounter}
        />
      ) : (
        <EncounterScreen
          encounter={encounter}
          onBackToLanding={() => returnToLanding('monster')}
          onDeclare={(declaration) => dispatch({ type: 'declareHeroAction', declaration })}
          onCommitRoll={commitRoll}
          resultModal={resultModal}
          onCloseResult={() => setResultModal(null)}
        />
      )}
    </main>
  );
}

function LandingScreen({
  heroId,
  landingStep,
  selectedHero,
  onHeroChange,
  onStepChange,
  onStartEncounter,
}: {
  heroId: string;
  landingStep: LandingStep;
  selectedHero: HeroTemplate;
  onHeroChange: (heroId: string) => void;
  onStepChange: (step: LandingStep) => void;
  onStartEncounter: (monster: MonsterTemplate) => void;
}) {
  if (landingStep === 'monster') {
    return (
      <section className="landing-stack" aria-labelledby="monster-title">
        <button type="button" className="ghost-button back-button" onClick={() => onStepChange('hero')}>
          Tillbaka
        </button>
        <div className="section-heading">
          <p className="eyebrow">Hjälte vald: {selectedHero.name}</p>
          <h1 id="monster-title">Välj monster</h1>
          <p>Monster-KP sätts automatiskt i prototypen. Välj ett monster för att starta mötet.</p>
        </div>
        <div className="monster-card-grid" aria-label="Välj monster">
          {monsters.map((monster) => (
            <button type="button" className="choice-card monster-choice" key={monster.id} onClick={() => onStartEncounter(monster)}>
              <span className="choice-art placeholder-art" aria-hidden="true" />
              <strong>{monster.name}</strong>
              <small>{fixedMonsterKp(monster)} KP</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="landing-stack" aria-labelledby="hero-title">
      <div className="section-heading">
        <p className="eyebrow">Nytt möte</p>
        <h1 id="hero-title">Välj hjälte</h1>
        <p>Första passet håller valet enkelt: välj hjälte, gå vidare och välj sedan monster.</p>
      </div>
      <div className="panel hero-picker">
        <label>
          {labels.hero}
          <select value={heroId} onChange={(event) => onHeroChange(event.target.value)}>
            {heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.name}
              </option>
            ))}
          </select>
        </label>
        <HeroSummary hero={selectedHero} />
        <button type="button" onClick={() => onStepChange('monster')}>
          Välj monster
        </button>
      </div>
    </section>
  );
}

function HeroSummary({ hero }: { hero: HeroTemplate }) {
  return (
    <dl className="summary-grid" aria-label={`${hero.name} egenskaper`}>
      <div>
        <dt>KP</dt>
        <dd>{hero.kp}</dd>
      </div>
      <div>
        <dt>STR</dt>
        <dd>{hero.str}</dd>
      </div>
      <div>
        <dt>VIG</dt>
        <dd>{hero.vig}</dd>
      </div>
      <div>
        <dt>RUST</dt>
        <dd>{hero.rust}</dd>
      </div>
    </dl>
  );
}

function EncounterScreen({
  encounter,
  onBackToLanding,
  onDeclare,
  onCommitRoll,
  resultModal,
  onCloseResult,
}: {
  encounter: EncounterState;
  onBackToLanding: () => void;
  onDeclare: (declaration: HeroDeclaration) => void;
  onCommitRoll: (roll: RollRecord) => void;
  resultModal: ResultModalState | null;
  onCloseResult: () => void;
}) {
  const heroStatus = describeHeroStatus(encounter);
  const monsterStatus = describeMonsterStatus(encounter);
  const isHeroTurn = encounter.phase === 'heroDeclaration' && !encounter.ended;

  return (
    <>
      <div className="top-actions">
        <button type="button" className="ghost-button" onClick={onBackToLanding}>
          Välj nytt möte
        </button>
      </div>

      <section className="encounter-board" aria-label="Pågående möte">
        <CombatantCard title={labels.hero} combatant={encounter.hero} status={heroStatus}>
          {isHeroTurn ? (
            <div className="action-row" aria-label={labels.declaration}>
              {(Object.keys(declarationLabels) as HeroDeclaration[]).map((declaration) => (
                <button type="button" key={declaration} onClick={() => onDeclare(declaration)}>
                  {declarationLabels[declaration]}
                </button>
              ))}
            </div>
          ) : null}
        </CombatantCard>

        <CombatantCard
          title={labels.monster}
          combatant={encounter.monster}
          attackFaces={encounter.monsterAttackFaces}
          status={monsterStatus}
        />
      </section>

      <section className="panel flow-panel" aria-labelledby="flow-title">
        <div>
          <p className="eyebrow">Runda {encounter.round.number}</p>
          <h2 id="flow-title">{encounter.ended ? endReasonLabels[encounter.ended.reason] : phaseLabel(encounter.phase)}</h2>
        </div>
        <p>{nextInstruction(encounter)}</p>
      </section>

      <section className="panel log-panel" aria-labelledby="log-title">
        <h2 id="log-title">{labels.combatLog}</h2>
        <ol className="combat-log">
          {encounter.log.map((entry) => (
            <li key={entry.id}>
              <span>R{entry.roundNumber}</span> {entry.message}
            </li>
          ))}
        </ol>
      </section>

      {encounter.pendingRoll && !resultModal ? <RollModal pendingRoll={encounter.pendingRoll} onCommit={onCommitRoll} /> : null}
      {resultModal ? <ResultModal result={resultModal} onClose={onCloseResult} /> : null}
    </>
  );
}

function CombatantCard({
  title,
  combatant,
  attackFaces,
  status,
  children,
}: {
  title: string;
  combatant: CombatantState;
  attackFaces?: number;
  status: CardStatus;
  children?: ReactNode;
}) {
  const kpPercent = Math.max(0, (combatant.currentKp / combatant.maxKp) * 100);

  return (
    <article className="panel combatant-card">
      <p className="eyebrow">{title}</p>
      <h2>{combatant.name}</h2>
      <div className="kp-bar" aria-label={`${combatant.currentKp} av ${combatant.maxKp} KP`}>
        <span style={{ width: `${kpPercent}%` }} />
      </div>
      <div className="kp-line">
        <span>{labels.kp}</span>
        <strong>
          {combatant.currentKp}/{combatant.maxKp}
        </strong>
      </div>
      <dl className="stats-grid">
        <div>
          <dt>{labels.str}</dt>
          <dd>
            {combatant.str} ({dieLabel(damageDieForStr(combatant.str))})
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
      <div className={`card-status ${status.tone ?? 'neutral'}`}>
        <strong>{status.label}</strong>
        {status.detail ? <span>{status.detail}</span> : null}
      </div>
      {children}
      {combatant.tur ? <p className="note">TUR {combatant.tur.remaining} visas som referens.</p> : null}
      {attackFaces ? <p className="note">Anfall {attackFaces}/12 · Fly {12 - attackFaces}/12</p> : null}
    </article>
  );
}

function RollModal({ pendingRoll, onCommit }: { pendingRoll: PendingRoll; onCommit: (roll: RollRecord) => void }) {
  const [manualValue, setManualValue] = useState<number | null>(null);
  const keys = Array.from({ length: pendingRoll.max - pendingRoll.min + 1 }, (_, index) => pendingRoll.min + index);

  function commit(value: number, source: RollRecord['source']) {
    onCommit({
      id: rollId(),
      purpose: pendingRoll.purpose,
      die: pendingRoll.die,
      source,
      value,
    });
    setManualValue(null);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="roll-modal-title">
        <p className="eyebrow">{dieLabel(pendingRoll.die)}</p>
        <h2 id="roll-modal-title">{rollTitle(pendingRoll.purpose)}</h2>
        <div className="modal-numpad" aria-label={labels.enterDie}>
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
        <button type="button" className="primary-wide" disabled={manualValue === null} onClick={() => manualValue !== null && commit(manualValue, 'manual')}>
          Bekräfta{manualValue === null ? '' : ` ${manualValue}`}
        </button>
        <button type="button" className="ghost-button primary-wide" onClick={() => commit(rollDie(pendingRoll.die), 'app')}>
          {labels.rollInApp}
        </button>
      </section>
    </div>
  );
}

function ResultModal({ result, onClose }: { result: ResultModalState; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-card result-card" role="dialog" aria-modal="true" aria-labelledby="result-modal-title">
        <h2 id="result-modal-title">{result.title}</h2>
        {result.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <button type="button" className="primary-wide" onClick={onClose}>
          Stäng
        </button>
      </section>
    </div>
  );
}

function describeRollResult(before: EncounterState, after: EncounterState, roll: RollRecord): ResultModalState {
  switch (roll.purpose) {
    case 'heroHit': {
      const result = resolveAttack(roll.value, before.monster.vig);
      return {
        title: 'Anfall',
        lines: [result.hit ? `Du träffar${result.crit ? ' kritiskt' : ''}.` : 'Du missar.'],
      };
    }
    case 'monsterHit': {
      const result = resolveAttack(roll.value, before.hero.vig);
      return {
        title: 'Monstrets anfall',
        lines: [result.hit ? `Monstret träffar${result.crit ? ' kritiskt' : ''}.` : 'Monstret missar.'],
      };
    }
    case 'heroDamage': {
      const result = resolveDamage(roll.value, before.monster.rust, before.round.heroAttack?.crit ?? false);
      return { title: 'Skada', lines: [`Du gör ${result.finalDamage} KP skada.`, `${after.monster.name}: ${after.monster.currentKp}/${after.monster.maxKp} KP.`] };
    }
    case 'monsterDamage': {
      const result = resolveDamage(roll.value, before.hero.rust, before.round.monsterAttack?.crit ?? false);
      return { title: 'Skada', lines: [`Du tar ${result.finalDamage} KP skada.`, `${after.hero.name}: ${after.hero.currentKp}/${after.hero.maxKp} KP.`] };
    }
    case 'heroFlee': {
      const result = resolveFlee(roll.value, before.monster.vig);
      return { title: 'Fly', lines: [result.success ? 'Du lyckas.' : 'Du misslyckas.'] };
    }
    case 'monsterAction':
    case 'monsterFlee':
      return { title: rollTitle(roll.purpose), lines: ['Slaget är registrerat.'] };
  }
}

function describeHeroStatus(encounter: EncounterState): CardStatus {
  if (encounter.ended?.reason === 'hero_dead' || encounter.ended?.reason === 'both_dead') {
    return { label: 'Död', tone: 'dead' };
  }

  if (encounter.ended?.reason === 'hero_fled') {
    return { label: 'Flydde', tone: 'success' };
  }

  if (encounter.pendingRoll?.purpose === 'heroHit') {
    return { label: 'Anfaller', detail: 'Väntar på träffslag' };
  }

  if (encounter.pendingRoll?.purpose === 'heroDamage') {
    return { label: 'Träffar', detail: 'Väntar på skada', tone: 'success' };
  }

  if (encounter.pendingRoll?.purpose === 'heroFlee') {
    return { label: 'Flyr', detail: 'Väntar på flyktslag' };
  }

  if (encounter.phase === 'heroDeclaration') {
    return { label: 'Välj handling' };
  }

  return { label: 'Väntar' };
}

function describeMonsterStatus(encounter: EncounterState): CardStatus {
  if (encounter.ended?.reason === 'monster_dead' || encounter.ended?.reason === 'both_dead') {
    return { label: 'Död', tone: 'dead' };
  }

  if (encounter.ended?.reason === 'monster_fled') {
    return { label: 'Flyr', detail: 'Lyckas', tone: 'success' };
  }

  if (encounter.pendingRoll?.purpose === 'monsterHit') {
    return { label: 'Anfaller', detail: 'Väntar på träffslag', tone: 'danger' };
  }

  if (encounter.pendingRoll?.purpose === 'monsterDamage') {
    return { label: 'Anfaller', detail: 'Väntar på skada', tone: 'danger' };
  }

  if (encounter.round.monsterDamage) {
    return { label: 'Anfaller', detail: `Gör ${encounter.round.monsterDamage.finalDamage} KP skada`, tone: 'danger' };
  }

  if (encounter.round.monsterAttack) {
    return { label: 'Anfaller', detail: encounter.round.monsterAttack.hit ? 'Träffar' : 'Missar', tone: encounter.round.monsterAttack.hit ? 'danger' : 'neutral' };
  }

  if (encounter.round.monsterIntent === 'attack') {
    return { label: 'Anfaller', tone: 'danger' };
  }

  if (encounter.phase === 'monsterAction') {
    return { label: 'Agerar...' };
  }

  return { label: 'Idle' };
}

function nextInstruction(encounter: EncounterState): string {
  if (encounter.ended) {
    return 'Mötet är avslutat. Välj nytt möte för att spela igen.';
  }

  if (encounter.pendingRoll) {
    return `Slå ${dieLabel(encounter.pendingRoll.die)} för ${rollTitle(encounter.pendingRoll.purpose).toLowerCase()}.`;
  }

  if (encounter.phase === 'heroDeclaration') {
    return 'Välj hjältens handling för rundan.';
  }

  if (encounter.phase === 'monsterAction') {
    return 'Monstret agerar automatiskt efter hjältens handling.';
  }

  return 'Följ nästa markerade steg.';
}

function rollTitle(purpose: RollPurpose): string {
  switch (purpose) {
    case 'heroHit':
      return 'Anfall';
    case 'monsterHit':
      return 'Monstrets anfall';
    case 'heroDamage':
      return 'Skada';
    case 'monsterDamage':
      return 'Monstrets skada';
    case 'heroFlee':
      return 'Fly';
    case 'monsterAction':
      return 'Monstrets handling';
    case 'monsterFlee':
      return 'Monstret flyr';
  }
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
