import { cases, casesById, seasonal } from '../data/cases';
import { phases } from '../data/decks';
import type { BadgeId, CaseFile, PhaseId } from '../types';

const CASE_EPOCH = Date.UTC(2024, 0, 1);
const DAWN_HOUR = 5;

/** A case-day runs 5:00 AM → 4:59 AM the next calendar morning. */
export function caseDate(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (now.getHours() < DAWN_HOUR) d.setDate(d.getDate() - 1);
  return d;
}

export function dateKey(now: Date): string {
  const d = caseDate(now);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatLongDate(now: Date): string {
  return caseDate(now).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function caseNumber(now: Date): number {
  const d = caseDate(now);
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((utc - CASE_EPOCH) / 86_400_000) + 1;
}

export function caseForDate(now: Date): CaseFile {
  const d = caseDate(now);
  const holy = seasonal.find((s) => s.month === d.getMonth() + 1 && s.day === d.getDate());
  if (holy && casesById[holy.caseId]) return casesById[holy.caseId];
  const utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const index = Math.floor((utc - CASE_EPOCH) / 86_400_000);
  const safe = ((index % cases.length) + cases.length) % cases.length;
  return cases[safe];
}

export function phaseForDate(now: Date): PhaseId {
  const hour = now.getHours();
  if (hour >= 21 || hour < DAWN_HOUR) return 'bedtime';
  if (hour >= 18) return 'evening';
  if (hour >= 15) return 'afternoon';
  if (hour >= 12) return 'midday';
  return 'morning';
}

export function clueCountForPhase(phase: PhaseId): number {
  switch (phase) {
    case 'morning':
      return 1;
    case 'midday':
      return 2;
    case 'afternoon':
      return 3;
    case 'evening':
      return 4;
    case 'bedtime':
      return 5;
  }
}

export function badgeForClues(clueCount: number): BadgeId | null {
  if (clueCount <= 1) return 'crown';
  if (clueCount === 2) return 'cross';
  if (clueCount === 3) return 'dove';
  if (clueCount === 4) return 'lamb';
  return null;
}

export function nextPhaseAfter(phase: PhaseId): (typeof phases)[number] | null {
  const i = phases.findIndex((p) => p.id === phase);
  if (i < 0 || i >= phases.length - 1) return null;
  return phases[i + 1];
}

/** Instant of the next unsealing after `now` (on this case-day or tonight's night). */
export function nextUnsealingAt(now: Date): Date | null {
  const phase = phaseForDate(now);
  const next = nextPhaseAfter(phase);
  if (!next) return null;
  const target = new Date(now);
  target.setSeconds(0, 0);
  target.setMinutes(0);
  target.setHours(next.hour);
  if (next.id === 'bedtime' && now.getHours() < DAWN_HOUR) {
    // already past 21:00 of the previous calendar day
    return null;
  }
  return target;
}

export function formatCountdown(from: Date, to: Date): string {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return m <= 1 ? 'about a minute' : `${m} minutes`;
  if (m === 0) return h === 1 ? '1 hour' : `${h} hours`;
  return `${h}h ${m}m`;
}

/** Build a Date on the current case-day that sits inside the requested phase. */
export function dateInPhase(live: Date, phase: PhaseId): Date {
  const base = caseDate(live);
  const hour = phases.find((p) => p.id === phase)?.hour ?? 9;
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 15, 0);
}

export function archiveDates(live: Date, count = 14): Date[] {
  const start = caseDate(live);
  const out: Date[] = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() - i);
    out.push(d);
  }
  return out;
}
