# ScriptureSleuth

The Hidden Word — a daily Bible-verse mystery. At dawn a verse is sealed. A few words unseal as the day walks on. You bring the case in the old Clue form:

> It was *Paul the Apostle*, in *a prison*, speaking of *strength*.

Guess earlier and the honor is rarer: **crown** (first fragment), **cross**, **dove**, then **lamb**. Icons can change later.

## Play

```bash
cd Projects/scripture-sleuth
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

The top ribbon is the day’s unsealing. **Live hour** follows the real clock. Click Dawn / Noon / Afternoon / Dusk / Night to preview how the fragment grows — useful while we build, and for showing a friend the whole mystery in one sitting.

A case-day runs **5:00 AM → 4:59 AM** in the browser’s timezone so a late-night reading still belongs to the day that began at dawn.

## What is in v1

- 35 curated KJV cases on the daily wheel (public domain), plus Christmas / Easter overrides
- Progressive blanks for hidden words
- Clue notebook: strike names, then accuse *who / where / what*
- One assumption per unsealing; feedback tells you how many threads are true, not which
- Night (or a correct solve) opens the full verse, a reflection, and a walk for the day
- Watchman form collects email / text preferences locally — delivery comes next
- Archive of the last fortnight
- **The Press** sells *The Hidden Word · Volume One*, a 50-case PDF from the Archives (20 Lantern Watch, 20 Candle Inquiry, 10 Ember Vigil)

## The casebook

```bash
npm run casebook
```

Writes `public/casebook/the-hidden-word-volume-one.pdf` and a three-case sampler. After purchase, buyers unseal the download on The Press with the phrase `LANTERN-CANDLE-EMBER`. Set `VITE_STRIPE_PAYMENT_LINK` to a live Stripe Payment Link before charging real cards (see `.env.example`).

## What comes next

Email and SMS at each unsealing. The Watchman page already stores the intended payload shape in `src/notify/schema.ts` (email, phone, hours). Likely messengers: Resend for mail, Twilio for text.

## Stack

Vite, React, TypeScript. No backend yet. Progress lives in `localStorage` under `scripture-sleuth:v1`.
