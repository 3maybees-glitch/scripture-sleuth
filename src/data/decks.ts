import type { BadgeId, DeckItem, Phase } from '../types';

export const whoDeck: DeckItem[] = [
  { id: 'jesus', label: 'Jesus of Nazareth', phrase: 'Jesus of Nazareth' },
  { id: 'paul', label: 'Paul the Apostle', phrase: 'Paul the Apostle' },
  { id: 'david', label: 'King David', phrase: 'King David' },
  { id: 'moses', label: 'Moses', phrase: 'Moses' },
  { id: 'the-lord', label: 'The LORD God', phrase: 'the LORD God' },
  { id: 'peter', label: 'Peter', phrase: 'Peter' },
  { id: 'solomon', label: 'Solomon', phrase: 'Solomon' },
  { id: 'isaiah', label: 'Isaiah', phrase: 'Isaiah' },
  { id: 'john', label: 'John', phrase: 'John' },
  { id: 'angel', label: 'An angel of the Lord', phrase: 'an angel of the Lord' },
  { id: 'mary', label: 'Mary', phrase: 'Mary' },
  { id: 'psalmist', label: 'A psalmist', phrase: 'a psalmist' },
  { id: 'ruth', label: 'Ruth', phrase: 'Ruth' },
  { id: 'daniel', label: 'Daniel', phrase: 'Daniel' },
];

export const whereDeck: DeckItem[] = [
  { id: 'mountain', label: 'A mountain', phrase: 'a mountain' },
  { id: 'prison', label: 'A prison', phrase: 'a prison' },
  { id: 'city', label: 'A city', phrase: 'a city' },
  { id: 'wilderness', label: 'The wilderness', phrase: 'the wilderness' },
  { id: 'temple', label: 'The temple', phrase: 'the temple' },
  { id: 'garden', label: 'A garden', phrase: 'a garden' },
  { id: 'sea', label: 'The sea', phrase: 'the sea' },
  { id: 'palace', label: 'A palace', phrase: 'a palace' },
  { id: 'upper-room', label: 'An upper room', phrase: 'an upper room' },
  { id: 'road', label: 'A road', phrase: 'a road' },
  { id: 'pasture', label: 'A pasture', phrase: 'a pasture' },
  { id: 'well', label: 'A well', phrase: 'a well' },
  { id: 'golgotha', label: 'Golgotha', phrase: 'Golgotha' },
  { id: 'den', label: 'A den of lions', phrase: 'a den of lions' },
];

export const whatDeck: DeckItem[] = [
  { id: 'faith', label: 'Faith', phrase: 'faith' },
  { id: 'love', label: 'Love', phrase: 'love' },
  { id: 'courage', label: 'Courage', phrase: 'courage' },
  { id: 'forgiveness', label: 'Forgiveness', phrase: 'forgiveness' },
  { id: 'hope', label: 'Hope', phrase: 'hope' },
  { id: 'humility', label: 'Humility', phrase: 'humility' },
  { id: 'prayer', label: 'Prayer', phrase: 'prayer' },
  { id: 'trust', label: 'Trust', phrase: 'trust' },
  { id: 'peace', label: 'Peace', phrase: 'peace' },
  { id: 'obedience', label: 'Obedience', phrase: 'obedience' },
  { id: 'wisdom', label: 'Wisdom', phrase: 'wisdom' },
  { id: 'salvation', label: 'Salvation', phrase: 'salvation' },
  { id: 'provision', label: 'Provision', phrase: 'provision' },
  { id: 'witness', label: 'Witness', phrase: 'witness' },
  { id: 'strength', label: 'Strength', phrase: 'strength' },
  { id: 'mercy', label: 'Mercy', phrase: 'mercy' },
];

export const phases: Phase[] = [
  { id: 'morning', label: 'Dawn', hour: 5, blurb: 'The first seal lifts. Two or three words, and a page of blanks.' },
  { id: 'midday', label: 'Noon', hour: 12, blurb: 'A second fragment arrives — enough to start a theory.' },
  { id: 'afternoon', label: 'Afternoon', hour: 15, blurb: 'The voice grows clearer. Strike names from your notes.' },
  { id: 'evening', label: 'Dusk', hour: 18, blurb: 'Almost the whole sentence. One last chance at an early honor.' },
  { id: 'bedtime', label: 'Night', hour: 21, blurb: 'The verse is unsealed. Close the case, then walk with it.' },
];

export const badgeMeta: Record<
  BadgeId,
  { title: string; when: string; line: string }
> = {
  crown: {
    title: 'Crown of Dawn',
    when: 'Solved on the first fragment',
    line: 'You named the case before the day had fully opened.',
  },
  cross: {
    title: 'Cross of Noon',
    when: 'Solved after the second unsealing',
    line: 'Two clues were enough. The rest was attention.',
  },
  dove: {
    title: 'Dove of Afternoon',
    when: 'Solved after the third unsealing',
    line: 'You waited for more light, then named what you saw.',
  },
  lamb: {
    title: 'Lamb of Evening',
    when: 'Solved after the fourth unsealing',
    line: 'The last fragment before nightfall was the one you needed.',
  },
};

export function deckItem(kind: 'who' | 'where' | 'what', id: string): DeckItem | undefined {
  const deck = kind === 'who' ? whoDeck : kind === 'where' ? whereDeck : whatDeck;
  return deck.find((item) => item.id === id);
}

export function clueSentence(who: string, where: string, what: string): string {
  const speaker = deckItem('who', who)?.phrase ?? who;
  const place = deckItem('where', where)?.phrase ?? where;
  const topic = deckItem('what', what)?.phrase ?? what;
  return `It was ${speaker}, in ${place}, speaking of ${topic}.`;
}
