import type { DayProgress, DeckKind, Store } from '../types';

const KEY = 'scripture-sleuth:v1';

const empty = (): Store => ({
  seenHowTo: false,
  days: {},
  reminders: null,
});

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Store;
    return {
      seenHowTo: Boolean(parsed.seenHowTo),
      days: parsed.days ?? {},
      reminders: parsed.reminders ?? null,
    };
  } catch {
    return empty();
  }
}

export function saveStore(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function emptyDay(dateKey: string, caseId: string): DayProgress {
  return {
    dateKey,
    caseId,
    eliminated: { who: [], where: [], what: [] },
    guesses: [],
    solved: false,
    badge: null,
    notes: '',
  };
}

export function toggleEliminated(day: DayProgress, kind: DeckKind, id: string): DayProgress {
  const list = day.eliminated[kind];
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  return { ...day, eliminated: { ...day.eliminated, [kind]: next } };
}
