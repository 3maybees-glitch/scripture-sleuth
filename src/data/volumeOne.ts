import type { CaseFile, CaseRankId } from '../types';
import { archiveExtra } from './archiveExtra';
import { cases, casesById } from './cases';
import { clueSentence } from './decks';

export type RankMeta = {
  id: CaseRankId;
  name: string;
  epithet: string;
  blurb: string;
  ratio: number;
  honor: string;
};

export const rankMeta: Record<CaseRankId, RankMeta> = {
  lantern: {
    id: 'lantern',
    name: 'Lantern Watch',
    epithet: 'First Light',
    blurb: 'Most of the verse is already burning. Three words in four stand in the open.',
    ratio: 0.75,
    honor: 'The room is lit. Name what you can already see.',
  },
  candle: {
    id: 'candle',
    name: 'Candle Inquiry',
    epithet: 'Half-Light',
    blurb: 'You work by a smaller flame. Half the words remain under the seal.',
    ratio: 0.5,
    honor: 'A shorter wick. Theory and patience in equal measure.',
  },
  ember: {
    id: 'ember',
    name: 'Ember Vigil',
    epithet: 'Night Watch',
    blurb: 'Only a glow remains. One word in four is given; the rest you must name.',
    ratio: 0.25,
    honor: 'Almost the whole sentence is night. Stay with the spark.',
  },
};

export type VolumeCase = {
  number: number;
  rank: CaseRankId;
  file: CaseFile;
};

const lanternIds = [
  'phil-4-13',
  'ps-23-1',
  'john-3-16',
  'john-14-27',
  'prov-3-5',
  'luke-2-10',
  'matt-28-6',
  'eph-2-8',
  'ps-119-105',
  'matt-11-28',
  'pet-5-7',
  'jer-29-11',
  'john-4-14',
  'matt-5-14',
  'john-10-11',
  'matt-7-7',
  'rom-5-8',
  'john-8-12',
  'isa-9-6',
  'cor-5-17',
] as const;

const candleIds = [
  'josh-1-9',
  'isa-40-31',
  'ex-14-14',
  'ruth-1-16',
  'acts-16-25',
  'micah-6-8',
  'tim-1-7',
  'isa-41-10',
  'matt-6-33',
  'acts-1-8',
  'col-3-23',
  'cor-13-13',
  'ps-46-10',
  'rom-8-28',
  'dan-6-22',
  'luke-1-38',
  'phil-4-6',
  'john-13-34',
  'isa-26-3',
  'ps-46-1',
] as const;

const emberIds = [
  'john-11-25',
  'ps-121-1',
  'luke-23-34',
  'rev-21-4',
  'ps-27-1',
  'deut-31-6',
  'acts-4-12',
  'kings-3-9',
  'chron-7-14',
  'john-16-33',
] as const;

const extraById: Record<string, CaseFile> = Object.fromEntries(
  archiveExtra.map((c) => [c.id, c]),
);

function fileFor(id: string): CaseFile {
  const file = casesById[id] ?? extraById[id];
  if (!file) throw new Error(`Volume One is missing case ${id}`);
  return file;
}

function gather(ids: readonly string[], rank: CaseRankId, start: number): VolumeCase[] {
  return ids.map((id, i) => ({
    number: start + i,
    rank,
    file: fileFor(id),
  }));
}

/** Fifty closed files: twenty Lantern, twenty Candle, ten Ember. */
export const volumeOneCases: VolumeCase[] = [
  ...gather(lanternIds, 'lantern', 1),
  ...gather(candleIds, 'candle', 21),
  ...gather(emberIds, 'ember', 41),
];

export const volumeOneByNumber: Record<number, VolumeCase> = Object.fromEntries(
  volumeOneCases.map((c) => [c.number, c]),
);

export const volumeOneById: Record<string, VolumeCase> = Object.fromEntries(
  volumeOneCases.map((c) => [c.file.id, c]),
);

export const VOLUME_ONE = {
  title: 'The Hidden Word',
  volume: 'Volume One',
  subtitle: 'A Casebook of the Archives',
  line: 'Fifty sealed verses. The green board. The sentence at the back.',
  priceCents: 1200,
  priceLabel: '$12',
  pdfPath: '/casebook/the-hidden-word-volume-one.pdf',
  samplerPath: '/casebook/volume-one-sampler.pdf',
  unlockPhrase: 'LANTERN-CANDLE-EMBER',
  paymentLink: (((import.meta as { env?: { VITE_STRIPE_PAYMENT_LINK?: string } }).env
    ?.VITE_STRIPE_PAYMENT_LINK ??
    'https://buy.stripe.com/test_dRmbJ0a4w6n19Mmgm90x200') as string),
} as const;

export function normalizeUnlock(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function unlockMatches(value: string): boolean {
  return normalizeUnlock(value) === VOLUME_ONE.unlockPhrase;
}

export function answerLine(file: CaseFile): string {
  return clueSentence(file.who, file.where, file.what);
}

/** Daily wheel plus the extra archive files — used only to assert the vault is complete. */
export function allArchiveFiles(): CaseFile[] {
  return [...cases, ...archiveExtra];
}
