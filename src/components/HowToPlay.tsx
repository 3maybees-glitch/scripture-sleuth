import { badgeMeta } from '../data/decks';
import { BadgeIcon } from './Icons';

export function HowToPlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-labelledby="how-title">
      <div className="modal parchment">
        <p className="kicker">How the case is played</p>
        <h2 id="how-title">The Hidden Word</h2>
        <p>
          Scripture Sleuth is a daily case for The Hidden Word. Each dawn one verse is sealed.
          The reference stays hidden. You are given the first two or three words, and blanks
          for the rest.
        </p>
        <p>
          As the day unfolds — noon, afternoon, dusk — the next few words are unsealed. At
          nightfall the whole verse is shown, with a reflection for your Christian walk.
        </p>
        <p>
          Your work is the old game of Clue, turned toward encouragement. When you are ready,
          present the case:
        </p>
        <blockquote className="clue-line">
          It was <em>Paul the Apostle</em>, in <em>a prison</em>, speaking of <em>strength</em>.
        </blockquote>
        <p>
          Who is speaking? Where is this taking place? What lesson is on the table? You will be
          told how many of the three threads are true — not which ones.
        </p>
        <p>Guess earlier, and the honor is rarer:</p>
        <ul className="honor-list">
          {(Object.keys(badgeMeta) as Array<keyof typeof badgeMeta>).map((id) => (
            <li key={id}>
              <BadgeIcon id={id} className="honor-ico" />
              <div>
                <strong>{badgeMeta[id].title}</strong>
                <span>{badgeMeta[id].when}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="fine">
          Check one box in each column to choose your who, where, and what. Use the mark
          beside a name to strike it from your notes. A preview along the top lets you watch
          the whole day unfold.
        </p>
        <button type="button" className="btn gold" onClick={onClose}>
          Open today’s case
        </button>
      </div>
    </div>
  );
}
