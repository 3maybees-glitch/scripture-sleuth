import { useEffect, useMemo, useState } from 'react';
import { Archive } from './components/Archive';
import { HowToPlay } from './components/HowToPlay';
import { BadgeIcon, IconGlass } from './components/Icons';
import { Notebook } from './components/Notebook';
import { Reflection } from './components/Reflection';
import { Timeline } from './components/Timeline';
import { Verdict } from './components/Verdict';
import { VerseFragment } from './components/VerseFragment';
import { Watchman } from './components/Watchman';
import { clueSentence } from './data/decks';
import { buildFragment, scoreGuess } from './engine/clues';
import {
  archiveDates,
  badgeForClues,
  caseForDate,
  caseNumber,
  clueCountForPhase,
  dateInPhase,
  dateKey,
  formatLongDate,
  phaseForDate,
} from './engine/day';
import { emptyDay, loadStore, saveStore, toggleEliminated } from './engine/storage';
import type { DeckKind, PhaseId, ReminderPrefs, Store } from './types';
import './App.css';

type View = 'case' | 'archive' | 'watchman';

export default function App() {
  const [live, setLive] = useState(() => new Date());
  const [preview, setPreview] = useState<PhaseId | 'live'>('live');
  const [view, setView] = useState<View>('case');
  const [store, setStore] = useState<Store>(() => loadStore());
  const [howTo, setHowTo] = useState(() => !loadStore().seenHowTo);
  const [pick, setPick] = useState({ who: '', where: '', what: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setLive(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const now = preview === 'live' ? live : dateInPhase(live, preview);
  const key = dateKey(now);
  const verse = useMemo(() => caseForDate(now), [key]);
  const phase = phaseForDate(now);
  const clues = clueCountForPhase(phase);
  const day = store.days[key] ?? emptyDay(key, verse.id);
  const fragment = buildFragment(
    verse.chunks,
    day.solved || clues >= 5 ? 5 : clues,
  );
  const revealed = fragment.complete;
  const last = day.guesses[day.guesses.length - 1] ?? null;
  const showReflection = day.solved || revealed;

  function patchDay(next: typeof day) {
    setStore((s) => ({ ...s, days: { ...s.days, [key]: next } }));
  }

  function onToggle(kind: DeckKind, id: string) {
    patchDay(toggleEliminated(day, kind, id));
  }

  function onPick(kind: DeckKind, id: string) {
    setPick((p) => ({ ...p, [kind]: id }));
  }

  function reopenCase() {
    patchDay({
      ...emptyDay(key, verse.id),
      eliminated: day.eliminated,
      notes: day.notes,
    });
    setPick({ who: '', where: '', what: '' });
  }

  function onAccuse() {
    if (day.solved || !pick.who || !pick.where || !pick.what) return;
    const correct = scoreGuess(pick, verse);
    const solved = correct === 3;
    const badge = solved ? badgeForClues(clues) : day.badge;
    patchDay({
      ...day,
      caseId: verse.id,
      guesses: [
        ...day.guesses,
        {
          who: pick.who,
          where: pick.where,
          what: pick.what,
          clueCount: clues,
          correctCount: correct,
          at: new Date().toISOString(),
        },
      ],
      solved: day.solved || solved,
      badge,
    });
  }

  function closeHowTo() {
    setHowTo(false);
    setStore((s) => ({ ...s, seenHowTo: true }));
  }

  function saveWatch(prefs: ReminderPrefs) {
    setStore((s) => ({ ...s, reminders: prefs }));
  }

  async function shareFragment() {
    const line = revealed
      ? `${verse.reference} — ScriptureSleuth`
      : `Today’s fragment: ${fragment.revealed} ${fragment.blanks.map((b) => '_'.repeat(Math.max(b.display.length, 2)) + b.punct).join(' ')}`;
    const text = `${line}\nA mystery of the Word.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'ScriptureSleuth', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <p className="mark">
            <IconGlass className="mark-ico" />
            ScriptureSleuth
          </p>
          <h1>The daily mystery of the Word</h1>
          <p className="tag">
            A verse, sealed at dawn. Words unseal as the day walks on. Bring the case:{' '}
            <em>who</em> is speaking, <em>where</em> this is taking place, and <em>what</em> lesson
            is on the table.
          </p>
          <nav>
            <button type="button" className={view === 'case' ? 'on' : ''} onClick={() => setView('case')}>
              Today’s case
            </button>
            <button
              type="button"
              className={view === 'archive' ? 'on' : ''}
              onClick={() => setView('archive')}
            >
              Archive
            </button>
            <button
              type="button"
              className={view === 'watchman' ? 'on' : ''}
              onClick={() => setView('watchman')}
            >
              Watchman
            </button>
            <button type="button" onClick={() => setHowTo(true)}>
              How to play
            </button>
          </nav>
        </div>
      </header>

      <main>
        {view === 'case' && (
          <>
            <Timeline active={phase} preview={preview} onPreview={setPreview} />
            <div className="case-grid">
              <div className="case-main">
                <VerseFragment
                  fragment={fragment}
                  phase={phase}
                  now={now}
                  caseNo={caseNumber(now)}
                  longDate={formatLongDate(now)}
                  revealed={revealed}
                  reference={revealed ? verse.reference : null}
                />
                <div className="share-row">
                  <button type="button" className="text-btn" onClick={() => void shareFragment()}>
                    {copied ? 'Copied to the notebook' : 'Share the fragment'}
                  </button>
                  {day.badge && (
                    <span className="mini-honor">
                      <BadgeIcon id={day.badge} className="honor-ico" />
                    </span>
                  )}
                </div>
                <Verdict last={last} solved={day.solved} badge={day.badge} />
                {(day.solved || day.guesses.length > 0) && (
                  <p className="share-row">
                    <button type="button" className="text-btn" onClick={reopenCase}>
                      Reopen this case
                    </button>
                  </p>
                )}
                {showReflection && <Reflection verse={verse} />}
              </div>
              <Notebook
                eliminated={day.eliminated}
                pick={pick}
                locked={day.solved}
                onToggle={onToggle}
                onPick={onPick}
                onAccuse={onAccuse}
              />
            </div>
          </>
        )}

        {view === 'archive' && <Archive dates={archiveDates(live)} store={store} />}
        {view === 'watchman' && <Watchman saved={store.reminders} onSave={saveWatch} />}
      </main>

      <footer className="colophon">
        <p>
          ScriptureSleuth · verses in the King James text (public domain). The honors — crown,
          cross, dove, lamb — may change. The sentence stays:{' '}
          <span className="clue-line inline">
            {clueSentence('paul', 'prison', 'strength')}
          </span>
        </p>
      </footer>

      <HowToPlay open={howTo} onClose={closeHowTo} />
    </div>
  );
}
