import { phases } from '../data/decks';
import type { PhaseId } from '../types';

export function Timeline({
  active,
  preview,
  onPreview,
}: {
  active: PhaseId;
  preview: PhaseId | 'live';
  onPreview: (next: PhaseId | 'live') => void;
}) {
  return (
    <div className="timeline">
      <div className="timeline-head">
        <span className="kicker">The day’s unsealing</span>
        <button
          type="button"
          className={preview === 'live' ? 'text-btn on' : 'text-btn'}
          onClick={() => onPreview('live')}
        >
          Live hour
        </button>
      </div>
      <ol>
        {phases.map((p, i) => {
          const reached = phases.findIndex((x) => x.id === active) >= i;
          const selected = (preview === 'live' ? active : preview) === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                className={`phase ${reached ? 'reached' : ''} ${selected ? 'selected' : ''}`}
                onClick={() => onPreview(p.id)}
                title={`${p.label} — preview this hour`}
              >
                <span className="dot" />
                <span className="phase-label">{p.label}</span>
                <span className="phase-hour">
                  {p.hour === 0 ? '12a' : p.hour < 12 ? `${p.hour}a` : p.hour === 12 ? '12p' : `${p.hour - 12}p`}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      {preview !== 'live' && (
        <p className="preview-note">
          Previewing {phases.find((p) => p.id === preview)?.label}. Words unlock as if it were
          that hour — handy while we build, and for showing a friend the whole mystery.
        </p>
      )}
    </div>
  );
}
