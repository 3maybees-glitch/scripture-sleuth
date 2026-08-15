import { badgeMeta, clueSentence } from '../data/decks';
import { threadCopy } from '../engine/clues';
import type { BadgeId, Guess } from '../types';
import { BadgeIcon, IconSeal } from './Icons';

export function Verdict({
  last,
  solved,
  badge,
}: {
  last: Guess | null;
  solved: boolean;
  badge: BadgeId | null;
}) {
  if (!last) return null;

  return (
    <section className={`verdict ${solved ? 'won' : 'cold'}`} aria-live="polite">
      <div className="verdict-stamp">
        {solved ? <IconSeal className="stamp-ico" /> : <span className="not-yet">Not yet</span>}
      </div>
      <p className="clue-line">{clueSentence(last.who, last.where, last.what)}</p>
      <p className="thread">{threadCopy(last.correctCount)}</p>
      {solved && badge && (
        <div className="honor">
          <BadgeIcon id={badge} className="honor-ico lg" />
          <div>
            <strong>{badgeMeta[badge].title}</strong>
            <span>{badgeMeta[badge].line}</span>
          </div>
        </div>
      )}
      {solved && !badge && (
        <p className="fine">
          The verse was already unsealed for the night. The case is still closed — the walk
          remains.
        </p>
      )}
    </section>
  );
}
