import { casesById } from '../data/cases';
import { badgeMeta } from '../data/decks';
import { caseForDate, caseNumber, dateKey } from '../engine/day';
import type { Store } from '../types';
import { BadgeIcon } from './Icons';

export function Archive({
  dates,
  store,
}: {
  dates: Date[];
  store: Store;
}) {
  return (
    <section className="archive parchment">
      <p className="kicker">Closed cases</p>
      <h2>The last fortnight</h2>
      <p className="lede">
        Past days are unsealed. If you solved them, your honor still sits on the file.
      </p>
      <ol className="archive-list">
        {dates.map((d) => {
          const key = dateKey(d);
          const verse = caseForDate(d);
          const fromStore = store.days[key];
          const file = fromStore ? (casesById[fromStore.caseId] ?? verse) : verse;
          const badge = fromStore?.badge ?? null;
          return (
            <li key={key}>
              <div>
                <p className="stamp">Case {String(caseNumber(d)).padStart(3, '0')}</p>
                <p className="arch-date">
                  {d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="arch-ref">{file.reference}</p>
                <p className="arch-text">“{file.text}”</p>
              </div>
              {badge ? (
                <div className="arch-badge" title={badgeMeta[badge].title}>
                  <BadgeIcon id={badge} className="honor-ico" />
                  <span>{badgeMeta[badge].title}</span>
                </div>
              ) : fromStore?.solved ? (
                <span className="arch-closed">Closed at nightfall</span>
              ) : (
                <span className="arch-closed dim">Unattempted</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
