import { useMemo, useState } from 'react';
import { clueSentence } from '../data/decks';
import { rankMeta, volumeOneCases, type VolumeCase } from '../data/volumeOne';
import { revealByWordRatio, scoreGuess } from '../engine/clues';
import { emptyDay, toggleEliminated } from '../engine/storage';
import type { DeckKind, Store } from '../types';
import { Notebook } from './Notebook';
import { RankIcon } from './Icons';
import { Verdict } from './Verdict';

export function CasebookReader({
  store,
  onPatch,
  onBack,
}: {
  store: Store;
  onPatch: (caseId: string, next: Store['casebook']['cases'][string]) => void;
  onBack: () => void;
}) {
  const [number, setNumber] = useState(1);
  const [pick, setPick] = useState({ who: '', where: '', what: '' });
  const leaf = volumeOneCases.find((c) => c.number === number) ?? volumeOneCases[0];
  const day = store.casebook.cases[leaf.file.id] ?? emptyDay(`v1-${leaf.file.id}`, leaf.file.id);
  const fragment = useMemo(
    () => revealByWordRatio(leaf.file.text, rankMeta[leaf.rank].ratio),
    [leaf],
  );
  const rank = rankMeta[leaf.rank];
  const last = day.guesses[day.guesses.length - 1] ?? null;

  function select(next: VolumeCase) {
    setNumber(next.number);
    setPick({ who: '', where: '', what: '' });
  }

  function onToggle(kind: DeckKind, id: string) {
    onPatch(leaf.file.id, toggleEliminated(day, kind, id));
  }

  function onAccuse() {
    if (day.solved || !pick.who || !pick.where || !pick.what) return;
    const correct = scoreGuess(pick, leaf.file);
    const solved = correct === 3;
    onPatch(leaf.file.id, {
      ...day,
      caseId: leaf.file.id,
      guesses: [
        ...day.guesses,
        {
          who: pick.who,
          where: pick.where,
          what: pick.what,
          clueCount: Math.round(rank.ratio * 4),
          correctCount: correct,
          at: new Date().toISOString(),
        },
      ],
      solved: day.solved || solved,
      badge: null,
    });
  }

  return (
    <section className="casebook-reader">
      <div className="reader-toolbar">
        <button type="button" className="text-btn" onClick={onBack}>
          Back to the press
        </button>
        <p className="kicker">Volume One · the study</p>
      </div>

      <div className="reader-layout">
        <aside className="dossier parchment">
          <h2>The docket</h2>
          <p className="lede">Fifty files. Strike a name on the felt; present when you have a theory.</p>
          <ol className="docket-list">
            {volumeOneCases.map((c) => {
              const closed = store.casebook.cases[c.file.id]?.solved;
              return (
                <li key={c.file.id}>
                  <button
                    type="button"
                    className={`${c.number === leaf.number ? 'on' : ''} ${closed ? 'closed' : ''}`}
                    onClick={() => select(c)}
                  >
                    <span className="docket-no">{String(c.number).padStart(3, '0')}</span>
                    <span className="docket-rank">{rankMeta[c.rank].name}</span>
                    <span className="docket-state">{closed ? 'Closed' : 'Open'}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <div className="case-grid reader-case">
          <div className="case-main">
            <article className="fragment parchment">
              <header className="fragment-top">
                <div>
                  <p className="stamp">Case No. {String(leaf.number).padStart(3, '0')}</p>
                  <p className="date-line">{rank.epithet}</p>
                </div>
                <div className="rank-seal">
                  <RankIcon id={leaf.rank} className="rank-ico" />
                </div>
              </header>
              <p className="kicker">
                {day.solved ? 'The verse unsealed' : `The fragment · ${rank.name}`}
              </p>
              <div className="verse-block">
                {day.solved ? (
                  <>
                    <p className="verse-text full">“{leaf.file.text}”</p>
                    <p className="reference">{leaf.file.reference}</p>
                  </>
                ) : (
                  <p className="verse-text">
                    {fragment.revealed && <span className="known">{fragment.revealed} </span>}
                    {fragment.blanks.map((b, i) => (
                      <span key={`${b.display}-${i}`} className="blank-wrap">
                        {b.hidden ? (
                          <span
                            className="blank"
                            style={{ width: `${Math.max(b.display.length, 2)}ch` }}
                            aria-label="hidden word"
                          />
                        ) : (
                          <span>{b.display}</span>
                        )}
                        <span className="punct">{b.punct}</span>
                        {i < fragment.blanks.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <footer className="fragment-foot">
                <p>{day.solved ? clueSentence(leaf.file.who, leaf.file.where, leaf.file.what) : rank.blurb}</p>
              </footer>
            </article>
            <Verdict last={last} solved={day.solved} badge={null} />
            {day.solved && (
              <section className="reflection parchment">
                <p className="kicker">For the night watch</p>
                <h2>Walk with the word</h2>
                <h3>Reflection</h3>
                <p>{leaf.file.reflection}</p>
                <h3>For your walk</h3>
                <p>{leaf.file.walk}</p>
              </section>
            )}
          </div>
          <Notebook
            eliminated={day.eliminated}
            pick={pick}
            locked={day.solved}
            onToggle={onToggle}
            onPick={(kind, id) => setPick((p) => ({ ...p, [kind]: id }))}
            onAccuse={onAccuse}
          />
        </div>
      </div>
    </section>
  );
}
