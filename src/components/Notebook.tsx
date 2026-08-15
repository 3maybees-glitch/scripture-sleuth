import { whatDeck, whereDeck, whoDeck } from '../data/decks';
import type { DeckItem } from '../types';
import type { DeckKind } from '../types';

function Column({
  title,
  kind,
  items,
  eliminated,
  picked,
  locked,
  onToggle,
  onPick,
}: {
  title: string;
  kind: DeckKind;
  items: DeckItem[];
  eliminated: string[];
  picked: string;
  locked: boolean;
  onToggle: (kind: DeckKind, id: string) => void;
  onPick: (kind: DeckKind, id: string) => void;
}) {
  return (
    <section className="note-col">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => {
          const out = eliminated.includes(item.id);
          const on = picked === item.id;
          return (
            <li key={item.id} className={`${out ? 'out' : ''} ${on ? 'on' : ''}`}>
              <button
                type="button"
                className="strike"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(kind, item.id);
                }}
                disabled={locked}
                title="Strike from your notes — this does not pick your answer"
                aria-pressed={out}
              >
                <span className="box" />
              </button>
              <button
                type="button"
                className="name"
                onClick={() => onPick(kind, item.id)}
                disabled={locked}
                aria-pressed={on}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Notebook({
  eliminated,
  pick,
  locked,
  onToggle,
  onPick,
  onAccuse,
}: {
  eliminated: Record<DeckKind, string[]>;
  pick: { who: string; where: string; what: string };
  locked: boolean;
  onToggle: (kind: DeckKind, id: string) => void;
  onPick: (kind: DeckKind, id: string) => void;
  onAccuse: () => void;
}) {
  const ready = Boolean(pick.who && pick.where && pick.what);

  return (
    <aside className="notebook">
      <header>
        <p className="kicker light">Detective’s notes</p>
        <h2>Who · Where · What</h2>
        <p className="lede">
          Tap one name in each column to fill the sentence below. The little boxes only strike a
          name out of your notes — they are not your answer.
        </p>
      </header>

      <div className="note-grid">
        <Column
          title="Who is speaking?"
          kind="who"
          items={whoDeck}
          eliminated={eliminated.who}
          picked={pick.who}
          locked={locked}
          onToggle={onToggle}
          onPick={onPick}
        />
        <Column
          title="Where is this?"
          kind="where"
          items={whereDeck}
          eliminated={eliminated.where}
          picked={pick.where}
          locked={locked}
          onToggle={onToggle}
          onPick={onPick}
        />
        <Column
          title="What is the lesson?"
          kind="what"
          items={whatDeck}
          eliminated={eliminated.what}
          picked={pick.what}
          locked={locked}
          onToggle={onToggle}
          onPick={onPick}
        />
      </div>

      <div className="accuse">
        <p className="clue-line preview">
          It was <em>{whoDeck.find((w) => w.id === pick.who)?.phrase ?? '________'}</em>, in{' '}
          <em>{whereDeck.find((w) => w.id === pick.where)?.phrase ?? '________'}</em>, speaking of{' '}
          <em>{whatDeck.find((w) => w.id === pick.what)?.phrase ?? '________'}</em>.
        </p>
        <button
          type="button"
          className="btn wax"
          disabled={locked || !ready}
          onClick={onAccuse}
        >
          {locked ? 'Case closed' : 'Present the case'}
        </button>
        {!locked && (
          <p className="fine light">
            {ready
              ? 'Present whenever you have a theory. A wrong guess will not lock you out.'
              : 'Pick one Who, one Where, and one What — the gold names are your accusation.'}
          </p>
        )}
      </div>
    </aside>
  );
}
