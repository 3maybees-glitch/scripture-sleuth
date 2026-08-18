export type PhaseId = 'morning' | 'midday' | 'afternoon' | 'evening' | 'bedtime';

export type BadgeId = 'crown' | 'cross' | 'dove' | 'lamb';

export type DeckKind = 'who' | 'where' | 'what';

export type DeckItem = {
  id: string;
  label: string;
  /** Used in the Clue sentence, e.g. "a prison" */
  phrase: string;
};

export type CaseFile = {
  id: string;
  reference: string;
  text: string;
  /** Five successive unsealings. First four are 2–3 words; last is the remainder. */
  chunks: [string, string, string, string, string];
  who: string;
  where: string;
  what: string;
  reflection: string;
  walk: string;
};

export type Guess = {
  who: string;
  where: string;
  what: string;
  clueCount: number;
  correctCount: number;
  at: string;
};

export type DayProgress = {
  dateKey: string;
  caseId: string;
  eliminated: Record<DeckKind, string[]>;
  guesses: Guess[];
  solved: boolean;
  badge: BadgeId | null;
  notes: string;
};

export type ReminderPrefs = {
  name: string;
  email: string;
  phone: string;
  emailOn: boolean;
  smsOn: boolean;
  times: PhaseId[];
};

export type CasebookProgress = {
  unlocked: boolean;
  cases: Record<string, DayProgress>;
};

export type Store = {
  seenHowTo: boolean;
  days: Record<string, DayProgress>;
  reminders: ReminderPrefs | null;
  casebook: CasebookProgress;
};

export type CaseRankId = 'lantern' | 'candle' | 'ember';

export type Phase = {
  id: PhaseId;
  label: string;
  hour: number;
  blurb: string;
};
