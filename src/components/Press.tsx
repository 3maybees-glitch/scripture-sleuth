import { useState, type FormEvent } from 'react';
import { VOLUME_ONE, rankMeta, unlockMatches, volumeOneCases } from '../data/volumeOne';
import { revealByWordRatio } from '../engine/clues';
import type { CaseRankId } from '../types';
import { RankIcon } from './Icons';

const sample = volumeOneCases[0];
const sampleFragment = revealByWordRatio(sample.file.text, rankMeta.lantern.ratio);

export function Press({
  unlocked,
  onUnlock,
  onOpenVolume,
}: {
  unlocked: boolean;
  onUnlock: () => void;
  onOpenVolume: () => void;
}) {
  const [phrase, setPhrase] = useState('');
  const [error, setError] = useState(false);
  const paymentLink = VOLUME_ONE.paymentLink;

  function submitUnlock(e: FormEvent) {
    e.preventDefault();
    if (!unlockMatches(phrase)) {
      setError(true);
      return;
    }
    setError(false);
    onUnlock();
  }

  return (
    <section className="press">
      <div className="press-hero parchment">
        <p className="kicker">The Press</p>
        <h2>
          {VOLUME_ONE.title}
          <span className="vol-mark">{VOLUME_ONE.volume}</span>
        </h2>
        <p className="lede press-sub">{VOLUME_ONE.subtitle}</p>
        <p>
          Fifty closed files from the Archives, bound as a casebook you can keep. Each page leaves
          the verse partly sealed, sets the green felt board beside it, and waits for the old
          sentence: <em>who</em>, <em>where</em>, <em>what</em>. The answer sheets sit at the back,
          under a last wax seal.
        </p>
        <p className="fine">
          The daily case still turns with the sun. This volume is for the table, the pew, a long
          evening — twenty Lantern Watch, twenty Candle Inquiry, ten Ember Vigil.
        </p>
      </div>

      <ol className="rank-cards">
        {(Object.keys(rankMeta) as CaseRankId[]).map((id) => {
          const rank = rankMeta[id];
          const count = volumeOneCases.filter((c) => c.rank === id).length;
          return (
            <li key={id} className={`rank-card rank-${id}`}>
              <RankIcon id={id} className="rank-ico" />
              <p className="kicker light">{rank.epithet}</p>
              <h3>{rank.name}</h3>
              <p>{rank.blurb}</p>
              <p className="fine light">
                {count} cases · {Math.round(rank.ratio * 100)}% of the words unsealed
              </p>
            </li>
          );
        })}
      </ol>

      <div className="press-grid">
        <article className="fragment parchment sample-leaf">
          <header className="fragment-top">
            <div>
              <p className="stamp">Case No. {String(sample.number).padStart(3, '0')}</p>
              <p className="date-line">A leaf from {VOLUME_ONE.volume}</p>
            </div>
            <div className="seal-mark" aria-hidden="true">
              <img src="/textures/wax-seal.jpg" alt="" />
            </div>
          </header>
          <p className="kicker">The fragment · {rankMeta.lantern.name}</p>
          <div className="verse-block">
            <p className="verse-text">
              {sampleFragment.revealed && <span className="known">{sampleFragment.revealed} </span>}
              {sampleFragment.blanks.map((b, i) => (
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
                  {i < sampleFragment.blanks.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
          </div>
          <footer className="fragment-foot">
            <p>The reference stays hidden. The green board is printed on every case.</p>
          </footer>
        </article>

        <aside className="buy-card">
          <p className="kicker light">From the press</p>
          <h3>Take the volume home</h3>
          <p className="price">
            {VOLUME_ONE.priceLabel}
            <span>one download · yours to keep</span>
          </p>
          <ul className="buy-list">
            <li>50 cases on parchment, with the felt board on each leaf</li>
            <li>Printable check-boxes for Who, Where, and What</li>
            <li>Answer key sealed at the back — break it last</li>
            <li>Open the same files here after purchase, on the live green board</li>
          </ul>
          {unlocked ? (
            <div className="unlocked-actions">
              <a className="btn gold" href={VOLUME_ONE.pdfPath} download>
                Download the PDF
              </a>
              <button type="button" className="btn wax ready" onClick={onOpenVolume}>
                Open the volume
              </button>
              <p className="fine light">The casebook is on your shelf. Work it on paper or on the felt.</p>
            </div>
          ) : (
            <>
              {paymentLink ? (
                <a className="btn gold" href={paymentLink}>
                  Purchase Volume One
                </a>
              ) : (
                <p className="fine light">
                  The payment desk is still being set. You can unseal a purchased copy with the
                  phrase from your receipt.
                </p>
              )}
              <a className="text-btn sampler-link" href={VOLUME_ONE.samplerPath} download>
                Download a three-case sampler
              </a>
              <form className="unlock-form" onSubmit={submitUnlock}>
                <label>
                  Already bought? Enter the unsealing phrase from your receipt.
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => {
                      setPhrase(e.target.value);
                      setError(false);
                    }}
                    placeholder="Lantern — Candle — Ember"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
                {error && <p className="unlock-err">That phrase does not lift the seal.</p>}
                <button type="submit" className="btn wax">
                  Unseal the volume
                </button>
              </form>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
