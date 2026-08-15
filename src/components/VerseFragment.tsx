import type { Fragment } from '../engine/clues';
import { formatCountdown, nextUnsealingAt } from '../engine/day';
import type { PhaseId } from '../types';
import { phases } from '../data/decks';

export function VerseFragment({
  fragment,
  phase,
  now,
  caseNo,
  longDate,
  revealed,
  reference,
}: {
  fragment: Fragment;
  phase: PhaseId;
  now: Date;
  caseNo: number;
  longDate: string;
  revealed: boolean;
  reference: string | null;
}) {
  const nextAt = nextUnsealingAt(now);
  const phaseMeta = phases.find((p) => p.id === phase);

  return (
    <article className="fragment parchment">
      <header className="fragment-top">
        <div>
          <p className="stamp">Case No. {String(caseNo).padStart(3, '0')}</p>
          <p className="date-line">{longDate}</p>
        </div>
        <div className="seal-mark" aria-hidden="true">
          <img src="/textures/wax-seal.jpg" alt="" />
        </div>
      </header>

      <p className="kicker">{revealed ? 'The verse unsealed' : 'The fragment'}</p>

      <div className="verse-block" aria-live="polite">
        {revealed ? (
          <>
            <p className="verse-text full">“{fragment.revealed}”</p>
            {reference && <p className="reference">{reference}</p>}
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
        <p>
          {revealed
            ? phaseMeta?.blurb
            : `Seal ${fragment.unlocked} of ${fragment.total - 1} lifted. ${phaseMeta?.blurb ?? ''}`}
        </p>
        {!revealed && nextAt && (
          <p className="countdown">
            Next words unseal at {nextAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}{' '}
            — in {formatCountdown(now, nextAt)}.
          </p>
        )}
      </footer>
    </article>
  );
}
