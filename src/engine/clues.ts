export type Blank = {
  display: string;
  punct: string;
  hidden: boolean;
};

export type Fragment = {
  revealed: string;
  blanks: Blank[];
  unlocked: number;
  total: number;
  complete: boolean;
};

function splitWord(raw: string): { letters: string; punct: string } {
  const match = raw.match(/^([A-Za-z'’]+)(.*)$/);
  if (!match) return { letters: '', punct: raw };
  return { letters: match[1], punct: match[2] };
}

export function buildFragment(chunks: string[], unlocked: number): Fragment {
  const total = chunks.length;
  const open = Math.min(Math.max(unlocked, 0), total);
  const revealedParts = chunks.slice(0, open).filter((c) => c.length > 0);
  const hiddenParts = chunks.slice(open).filter((c) => c.length > 0);
  const hiddenWords = hiddenParts.join(' ').split(/\s+/).filter(Boolean);

  return {
    revealed: revealedParts.join(' '),
    blanks: hiddenWords.map((word) => {
      const { letters, punct } = splitWord(word);
      return {
        display: letters.length > 0 ? letters : word,
        punct,
        hidden: letters.length > 0,
      };
    }),
    unlocked: open,
    total,
    complete: open >= total,
  };
}

export function scoreGuess(
  guess: { who: string; where: string; what: string },
  truth: { who: string; where: string; what: string },
): number {
  let n = 0;
  if (guess.who === truth.who) n += 1;
  if (guess.where === truth.where) n += 1;
  if (guess.what === truth.what) n += 1;
  return n;
}

export function threadCopy(correct: number): string {
  if (correct === 3) return 'Every thread holds.';
  if (correct === 2) return 'Two threads are true. One still wanders.';
  if (correct === 1) return 'One thread holds. The rest unravel.';
  return 'The case is colder than that.';
}
