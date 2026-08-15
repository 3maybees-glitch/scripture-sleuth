import type { CaseFile } from '../types';

export function Reflection({ verse }: { verse: CaseFile }) {
  return (
    <section className="reflection parchment">
      <p className="kicker">For the night watch</p>
      <h2>Walk with the word</h2>
      <p className="verse-text full">“{verse.text}”</p>
      <p className="reference">{verse.reference}</p>
      <h3>Reflection</h3>
      <p>{verse.reflection}</p>
      <h3>For your walk today</h3>
      <p>{verse.walk}</p>
    </section>
  );
}
