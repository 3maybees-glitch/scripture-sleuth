import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { whatDeck, whereDeck, whoDeck } from '../src/data/decks.ts';
import {
  answerLine,
  rankMeta,
  volumeOneCases,
  type VolumeCase,
} from '../src/data/volumeOne.ts';
import { revealByWordRatio } from '../src/engine/clues.ts';
import type { DeckItem } from '../src/types.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'public/casebook');
const printPath = resolve(root, 'scripts/.casebook-print.html');
const samplerPrintPath = resolve(root, 'scripts/.casebook-sampler.html');

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fileUrl(rel: string): string {
  return `file://${resolve(root, rel)}`;
}

function assertVolume(): void {
  const ids = volumeOneCases.map((c) => c.file.id);
  if (volumeOneCases.length !== 50) {
    throw new Error(`Expected 50 cases, got ${volumeOneCases.length}`);
  }
  if (new Set(ids).size !== 50) throw new Error('Duplicate case ids in Volume One');
  const counts = { lantern: 0, candle: 0, ember: 0 };
  for (const leaf of volumeOneCases) counts[leaf.rank] += 1;
  if (counts.lantern !== 20 || counts.candle !== 20 || counts.ember !== 10) {
    throw new Error(`Rank mix is ${JSON.stringify(counts)}`);
  }
  for (const leaf of volumeOneCases) {
    const words = leaf.file.text.trim().split(/\s+/).length;
    const shown = revealByWordRatio(leaf.file.text, rankMeta[leaf.rank].ratio).unlocked;
    if (shown < 1 || shown >= words) {
      throw new Error(`Reveal failed for ${leaf.file.id}`);
    }
  }
}

function fragmentHtml(text: string, ratio: number, solved = false): string {
  if (solved) return `<p class="verse full">“${esc(text)}”</p>`;
  const frag = revealByWordRatio(text, ratio);
  const blanks = frag.blanks
    .map((b, i) => {
      const mark = b.hidden
        ? `<span class="blank" style="width:${Math.max(b.display.length, 2)}ch"></span>`
        : esc(b.display);
      const space = i < frag.blanks.length - 1 ? ' ' : '';
      return `<span class="blank-wrap">${mark}<span class="punct">${esc(b.punct)}</span>${space}</span>`;
    })
    .join('');
  const known = frag.revealed ? `<span class="known">${esc(frag.revealed)} </span>` : '';
  return `<p class="verse">${known}${blanks}</p>`;
}

function columnHtml(title: string, items: DeckItem[]): string {
  const rows = items
    .map(
      (item) => `
        <li>
          <span class="box"></span>
          <span class="name">${esc(item.label)}</span>
        </li>`,
    )
    .join('');
  return `<section class="note-col"><h3>${esc(title)}</h3><ul>${rows}</ul></section>`;
}

function boardHtml(): string {
  return `
    <aside class="notebook">
      <header>
        <p class="kicker light">Detective’s notes</p>
        <h2>Who · Where · What</h2>
        <p class="lede">Check one box in each column when you are ready to name the case. Use a mark to strike a name from your notes — that is not your answer.</p>
      </header>
      <div class="note-grid">
        ${columnHtml('Who is speaking?', whoDeck)}
        ${columnHtml('Where is this?', whereDeck)}
        ${columnHtml('What is the lesson?', whatDeck)}
      </div>
      <p class="clue-line">It was <em>________________</em>, in <em>________________</em>, speaking of <em>________________</em>.</p>
    </aside>`;
}

function casePage(leaf: VolumeCase): string {
  const rank = rankMeta[leaf.rank];
  const shown = Math.round(rank.ratio * 100);
  return `
    <article class="page case-page">
      <div class="case-inner">
        <header class="leaf-head">
          <div>
            <p class="brand">Scripture Sleuth · The Hidden Word</p>
            <p class="stamp">Case No. ${String(leaf.number).padStart(3, '0')}</p>
          </div>
          <div class="rank-pill rank-${leaf.rank}">
            <span class="epithet">${esc(rank.epithet)}</span>
            <strong>${esc(rank.name)}</strong>
          </div>
        </header>
        <section class="fragment">
          <p class="kicker">The fragment</p>
          ${fragmentHtml(leaf.file.text, rank.ratio)}
          <p class="frag-foot">${shown}% of the words unsealed. The reference stays hidden until you close the case — or break the seal at the back of the book.</p>
        </section>
        ${boardHtml()}
      </div>
    </article>`;
}

function coverPage(kind: 'full' | 'sampler'): string {
  const kicker = kind === 'full' ? 'Volume One' : 'Volume One · Sampler';
  const line =
    kind === 'full'
      ? 'Fifty sealed verses from the Archives. Twenty Lantern Watch. Twenty Candle Inquiry. Ten Ember Vigil.'
      : 'Three sealed leaves from the Archives — one of each watch — so you can feel the paper before you buy the volume.';
  return `
    <section class="page cover">
      <div class="cover-veil"></div>
      <div class="cover-inner">
        <p class="brand gold">Scripture Sleuth</p>
        <p class="kicker gold">${kicker}</p>
        <h1>The Hidden Word</h1>
        <p class="cover-sub">A Casebook of the Archives</p>
        <img class="cover-seal" src="${fileUrl('public/textures/wax-seal.jpg')}" alt="" />
        <p class="cover-line">${line}</p>
        <p class="cover-clue">It was <em>who</em>, in <em>where</em>, speaking of <em>what</em>.</p>
      </div>
    </section>`;
}

function howToPage(): string {
  return `
    <section class="page paper how-page">
      <div class="paper-inner">
        <p class="kicker">How the case is played</p>
        <h2>The Hidden Word</h2>
        <p>Each leaf is a closed file from the Archives. A verse is sealed. Some of the words have already unsealed — more on a Lantern Watch, fewer on an Ember Vigil. The reference is withheld. Your work is the old game of Clue, turned toward encouragement.</p>
        <blockquote>It was <em>Paul the Apostle</em>, in <em>a prison</em>, speaking of <em>strength</em>.</blockquote>
        <p>Who is speaking? Where is this taking place? What lesson is on the table? Use the green felt board to strike names as you think, then check one box in each column and write the sentence. A wrong theory does not lock you out. Turn to the sealed sheets at the back only when you are ready to close the case.</p>
        <div class="rank-row">
          ${(['lantern', 'candle', 'ember'] as const)
            .map((id) => {
              const r = rankMeta[id];
              return `<div class="rank-tile">
                <p class="kicker">${esc(r.epithet)}</p>
                <h3>${esc(r.name)}</h3>
                <p>${esc(r.blurb)}</p>
                <p class="tiny">${volumeOneCases.filter((c) => c.rank === id).length} cases · ${Math.round(r.ratio * 100)}% unsealed</p>
              </div>`;
            })
            .join('')}
        </div>
        <p class="tiny foot-note">King James text, public domain. Scripture Sleuth · The Hidden Word.</p>
      </div>
    </section>`;
}

function contentsPage(): string {
  const rows = volumeOneCases
    .map(
      (c) =>
        `<li><span class="no">${String(c.number).padStart(3, '0')}</span><span class="rn">${esc(rankMeta[c.rank].name)}</span></li>`,
    )
    .join('');
  return `
    <section class="page paper contents-page">
      <div class="paper-inner">
        <p class="kicker">The docket</p>
        <h2>Fifty files</h2>
        <p>References stay in the answer sheets. Work the fragment. Do not hunt the verse by number.</p>
        <ol class="toc">${rows}</ol>
      </div>
    </section>`;
}

function warningPage(): string {
  return `
    <section class="page paper warn-page">
      <div class="paper-inner warn-inner">
        <img class="cover-seal" src="${fileUrl('public/textures/wax-seal.jpg')}" alt="" />
        <p class="kicker">Break this seal last</p>
        <h2>The answer sheets</h2>
        <p>The next leaves name every case: the sentence, the reference, and the verse in full. If a file is still open on your table, turn back. The honor is in the naming, not in the peek.</p>
        <p class="cover-clue">It was who, in where, speaking of what.</p>
      </div>
    </section>`;
}

function answerPages(): string {
  const chunks: VolumeCase[][] = [];
  for (let i = 0; i < volumeOneCases.length; i += 17) {
    chunks.push(volumeOneCases.slice(i, i + 17));
  }
  return chunks
    .map((group, pageIndex) => {
      const rows = group
        .map((leaf) => {
          return `<tr>
            <td class="no">${String(leaf.number).padStart(3, '0')}</td>
            <td class="rk">${esc(rankMeta[leaf.rank].name)}</td>
            <td class="sent">${esc(answerLine(leaf.file))}</td>
            <td class="ref">${esc(leaf.file.reference)}</td>
          </tr>
          <tr class="verse-row"><td></td><td colspan="3">“${esc(leaf.file.text)}”</td></tr>`;
        })
        .join('');
      return `
        <section class="page paper key-page">
          <div class="paper-inner">
            <p class="kicker">Answer key · sheet ${pageIndex + 1} of ${chunks.length}</p>
            <h2>Closed cases</h2>
            <table>
              <thead>
                <tr><th>No.</th><th>Watch</th><th>The sentence</th><th>Reference</th></tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </section>`;
    })
    .join('');
}

function samplerClose(): string {
  return `
    <section class="page paper warn-page">
      <div class="paper-inner warn-inner">
        <p class="kicker">The rest is sealed</p>
        <h2>Forty-seven files remain</h2>
        <p>Volume One binds all fifty cases, the felt board on every leaf, and the answer sheets under wax at the back. Purchase it from The Press on Scripture Sleuth. After the receipt, the unsealing phrase is <strong>LANTERN-CANDLE-EMBER</strong>.</p>
      </div>
    </section>`;
}

function styles(): string {
  const parchment = fileUrl('public/textures/parchment.jpg');
  const felt = fileUrl('public/textures/felt.jpg');
  const desk = fileUrl('public/textures/desk.jpg');
  return `
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #120b08; }
    body {
      font: 12.5px/1.45 Outfit, "Segoe UI", sans-serif;
      color: #1c140c;
    }
    h1, h2, h3 { font-family: Cinzel, Palatino, serif; font-weight: 600; letter-spacing: 0.04em; line-height: 1.15; margin: 0 0 0.45rem; }
    p { margin: 0 0 0.65em; }
    .page { width: 8.5in; height: 11in; page-break-after: always; position: relative; overflow: hidden; }
    .page:last-child { page-break-after: auto; }
    .kicker { margin: 0 0 0.28rem; font-family: Cinzel, Palatino, serif; font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; color: #8b1e2d; }
    .kicker.light, .kicker.gold { color: #e8c56b; }
    .brand { font-family: Cinzel, Palatino, serif; letter-spacing: 0.28em; text-transform: uppercase; font-size: 10px; margin: 0 0 0.2rem; }
    .brand.gold { color: #e8c56b; }
    .stamp { font-family: "Special Elite", "Courier New", monospace; color: #8b1e2d; font-size: 15px; margin: 0; }
    .cover {
      background:
        linear-gradient(180deg, rgba(18,11,8,0.35) 0%, rgba(18,11,8,0.78) 55%, #120b08 100%),
        url("${desk}") center 40% / cover no-repeat;
      color: #faf4e6;
    }
    .cover-inner { position: relative; z-index: 1; padding: 1.35in 0.9in 0.9in; text-align: center; }
    .cover h1 { font-size: 46px; color: #faf4e6; margin: 0.15in 0 0.2in; text-shadow: 0 2px 18px rgba(0,0,0,0.55); }
    .cover-sub { font-family: Cinzel, Palatino, serif; letter-spacing: 0.12em; text-transform: uppercase; color: #e8c56b; font-size: 13px; }
    .cover-line { max-width: 4.8in; margin: 0.35in auto 0.25in; color: rgba(250,244,230,0.82); font-size: 14px; }
    .cover-clue { font-family: "Special Elite", "Courier New", monospace; font-size: 15px; color: #e8c56b; }
    .cover-clue em { font-style: normal; border-bottom: 1px solid rgba(232,197,107,0.45); }
    .cover-seal { width: 1.35in; height: 1.35in; border-radius: 50%; object-fit: cover; margin: 0.28in auto; display: block; box-shadow: 0 8px 18px rgba(80,10,16,0.45); transform: rotate(8deg); }
    .paper {
      background:
        linear-gradient(180deg, rgba(255,250,235,0.28), rgba(210,180,120,0.12)),
        url("${parchment}") center / cover;
      color: #1c140c;
    }
    .paper-inner { padding: 0.62in 0.62in 0.5in; height: 100%; }
    .how-page p, .warn-page p { font-size: 13.5px; }
    .how-page blockquote {
      margin: 0.7rem 0 1rem;
      padding: 0.7rem 0.8rem;
      border-left: 3px solid #8b1e2d;
      background: rgba(139,30,45,0.06);
      font-family: "Special Elite", "Courier New", monospace;
      font-size: 15px;
    }
    .how-page blockquote em { color: #8b1e2d; font-style: normal; }
    .rank-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.22in; margin-top: 0.28in; }
    .rank-tile { border: 1px solid rgba(80,50,20,0.2); padding: 0.16in 0.14in; background: rgba(255,250,235,0.35); }
    .rank-tile h3 { font-size: 13px; }
    .rank-tile p { font-size: 11.5px; }
    .tiny { font-size: 10.5px; color: #4a3824; }
    .foot-note { margin-top: 0.45in; }
    .toc { list-style: none; margin: 0.2in 0 0; padding: 0; columns: 2; column-gap: 0.35in; }
    .toc li { display: flex; justify-content: space-between; gap: 0.4rem; border-bottom: 1px solid rgba(80,50,20,0.16); padding: 0.18rem 0; font-size: 11px; break-inside: avoid; }
    .toc .no { font-family: "Special Elite", "Courier New", monospace; color: #8b1e2d; width: 2rem; }
    .toc .rn { font-family: Cinzel, Palatino, serif; letter-spacing: 0.06em; text-transform: uppercase; font-size: 9px; }
    .warn-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding-top: 1.6in; }
    .warn-inner h2 { font-size: 28px; }
    .warn-inner p { max-width: 5.2in; }
    .case-page { background: #120b08; }
    .case-inner { height: 100%; display: flex; flex-direction: column; padding: 0.38in 0.4in 0.32in; }
    .leaf-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.14in; }
    .case-page .brand { color: #e8c56b; }
    .case-page .stamp { color: #e8c56b; }
    .rank-pill { text-align: right; color: #e8c56b; }
    .rank-pill .epithet { display: block; font-family: Cinzel, Palatino, serif; letter-spacing: 0.16em; text-transform: uppercase; font-size: 8px; color: #c9a44a; }
    .rank-pill strong { font-family: Cinzel, Palatino, serif; font-size: 13px; }
    .fragment {
      background:
        linear-gradient(180deg, rgba(255,250,235,0.34), rgba(210,180,120,0.14)),
        url("${parchment}") center / cover;
      border-radius: 6px;
      box-shadow: 0 10px 22px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(90,55,20,0.18);
      padding: 0.12in 0.18in 0.11in;
      margin-bottom: 0.11in;
      flex: 0 0 auto;
    }
    .verse { font-family: "Cormorant Garamond", Palatino, serif; font-size: 19px; line-height: 1.35; font-weight: 600; margin: 0.06in 0 0.08in; }
    .verse.full { font-style: italic; }
    .blank-wrap { white-space: nowrap; }
    .blank { display: inline-block; height: 0.85em; border-bottom: 2px solid rgba(80,40,16,0.55); transform: translateY(-0.08em); vertical-align: baseline; }
    .frag-foot { margin: 0; color: #4a3824; font-size: 11px; border-top: 1px solid rgba(80,50,20,0.2); padding-top: 0.08in; }
    .notebook {
      flex: 1;
      background:
        linear-gradient(180deg, rgba(10,28,20,0.28), rgba(8,20,14,0.45)),
        url("${felt}") center / cover;
      color: #faf4e6;
      border-radius: 6px;
      border: 1px solid rgba(201,164,74,0.22);
      padding: 0.12in 0.13in 0.1in;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .notebook h2 { color: #e8c56b; font-size: 16px; margin: 0 0 0.15rem; }
    .notebook .lede { color: rgba(250,244,230,0.72); font-size: 10.5px; margin-bottom: 0.1in; }
    .note-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.12in; flex: 1; }
    .note-col h3 {
      margin: 0 0 0.2rem;
      font-size: 8px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #c9a44a;
      border-bottom: 1px solid rgba(232,197,107,0.22);
      padding-bottom: 0.15rem;
    }
    .note-col ul { list-style: none; margin: 0; padding: 0; }
    .note-col li {
      display: flex;
      align-items: center;
      gap: 0.28rem;
      border-bottom: 1px dashed rgba(232,197,107,0.22);
      padding: 0.07rem 0.04rem;
    }
    .box {
      flex: 0 0 auto;
      width: 8px;
      height: 8px;
      border: 1.4px solid rgba(232,197,107,0.75);
      background: transparent;
    }
    .name { font-family: "Special Elite", "Courier New", monospace; font-size: 8.7px; line-height: 1.15; }
    .clue-line {
      font-family: "Special Elite", "Courier New", monospace;
      font-size: 12px;
      color: #faf4e6;
      border-top: 1px solid rgba(232,197,107,0.22);
      margin: 0.08in 0 0;
      padding-top: 0.07in;
      flex: 0 0 auto;
    }
    .clue-line em { color: #e8c56b; font-style: normal; border-bottom: 1px solid rgba(232,197,107,0.45); }
    .key-page table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
    .key-page th {
      font-family: Cinzel, Palatino, serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 8px;
      text-align: left;
      border-bottom: 1px solid rgba(80,50,20,0.28);
      padding: 0.12rem 0.2rem 0.2rem 0;
      color: #8b1e2d;
    }
    .key-page td { padding: 0.18rem 0.22rem 0.1rem 0; vertical-align: top; }
    .key-page .no { font-family: "Special Elite", "Courier New", monospace; color: #8b1e2d; width: 0.45in; }
    .key-page .rk { font-family: Cinzel, Palatino, serif; font-size: 8.5px; letter-spacing: 0.04em; text-transform: uppercase; width: 1.25in; }
    .key-page .sent { font-family: "Special Elite", "Courier New", monospace; font-size: 10.5px; }
    .key-page .ref { font-family: Cinzel, Palatino, serif; font-size: 8.5px; letter-spacing: 0.05em; text-transform: uppercase; color: #8b1e2d; width: 1.35in; }
    .verse-row td { font-family: "Cormorant Garamond", Palatino, serif; font-style: italic; font-size: 12.5px; padding-bottom: 0.28rem; border-bottom: 1px solid rgba(80,50,20,0.14); color: #4a3824; }
  `;
}

function documentHtml(body: string, title: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${esc(title)}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Cormorant+Garamond:ital,wght@0,600;1,600&family=Outfit:wght@400;500&family=Special+Elite&display=swap" rel="stylesheet" />
    <style>${styles()}</style>
  </head>
  <body>${body}</body>
</html>`;
}

function printPdf(htmlPath: string, pdfPath: string): void {
  const chrome = process.env.CHROME_PATH ?? 'google-chrome-stable';
  const result = spawnSync(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      '--hide-scrollbars',
      '--virtual-time-budget=20000',
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error(`Chrome failed to print ${pdfPath}`);
  }
}

assertVolume();
mkdirSync(outDir, { recursive: true });

const fullBody = [
  coverPage('full'),
  howToPage(),
  contentsPage(),
  ...volumeOneCases.map(casePage),
  warningPage(),
  answerPages(),
].join('\n');

const samplerLeaves = [volumeOneCases[0], volumeOneCases[20], volumeOneCases[40]];
const samplerBody = [
  coverPage('sampler'),
  howToPage(),
  ...samplerLeaves.map(casePage),
  samplerClose(),
].join('\n');

writeFileSync(
  printPath,
  documentHtml(fullBody, 'The Hidden Word · Volume One'),
  'utf8',
);
writeFileSync(
  samplerPrintPath,
  documentHtml(samplerBody, 'The Hidden Word · Volume One Sampler'),
  'utf8',
);

const fullPdf = resolve(outDir, 'the-hidden-word-volume-one.pdf');
const samplerPdf = resolve(outDir, 'volume-one-sampler.pdf');
printPdf(printPath, fullPdf);
printPdf(samplerPrintPath, samplerPdf);
console.log(`Wrote ${fullPdf}`);
console.log(`Wrote ${samplerPdf}`);
