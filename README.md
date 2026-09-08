# ProtoBuzz

A clickable prototype for **ProtoBuzz** — a social network where people share prototypes,
discover what others are building, test them, and give useful feedback.

> The internet tests your idea before you waste months building it.

The platform optimises for **testing and validation, not likes**. The whole product is built
around one hierarchy:

```
Tested  >  Would Use  >  Would Pay  >  Useful  >  Like
```

## Run it

No build step, no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
npx http-server . -p 8080   # then open http://localhost:8080
```

A single-file build (everything inlined) is generated into `dist/protobuzz.html`:

```bash
node tools/bundle.mjs
```

## The demo journey

Every step below is clickable, and state persists across reloads via `localStorage`.

1. **Discover** — browse the feed (🔥 Trending, 🧪 Needs Testers, 💰 Would Pay, 🤯 Hidden Gems, 💀 Graveyard).
2. **Try it** — open a prototype; a simulated session opens with a running clock.
3. **Test it** — four questions: understood it / would use it / would pay for it / one thing to improve.
4. **Earn credits** — +3 for the test, +2 more for a written improvement. Your answers move that
   prototype's real validation score and testers count, and your comment gets a ✓ verified badge.
5. **Submit your own** — costs 20 credits, so you have to test before you can launch. Paste a URL,
   say what you built and what you want feedback on, pick a category and stage.
6. **See validation results** — the creator dashboard opens and the first testers arrive live:
   the Views → Opened → Tested → Would Use → Would Pay funnel fills in, and an AI summary
   unlocks at 7 sessions (what testers like / dislike / what to improve next).

Start with 15 credits, so one full test (+5) is enough to afford a launch.

## What's in it

| Screen | Route | Notes |
| --- | --- | --- |
| Discover feed | `#/discover?feed=trending` | Five feeds, large cards, validation metrics, reactions |
| Prototype page | `#/p/loopcut` | Score, three validation metrics, what the creator wants feedback on, verified feedback |
| Testing flow | sheet over any page | 4 questions, keyboard `1`–`3`, then the credits reward |
| Submit | `#/submit` | 3 steps, live preview of the card testers will see, blocked under 20 credits |
| Creator dashboard | `#/dash/loopcut` | Funnel, AI summary, verified feedback |
| Leaderboard | `#/leaderboard` | Hottest, Most Tested, Most Would Pay, Fastest Rising, Best Builder, Best Tester |
| My Lab | `#/lab` | Experiments, launched, killed, tested, saved, reputation, credit ledger |
| Builder profile | `#/u/dev_kaz` | Public version of My Lab |
| Graveyard | `#/discover?feed=grave` | Killed prototypes: what they built, how long, final score, why, what they learned |

## Design

Named for the buzz, built like a hive: honeycomb hexagons carry the structure (the validation
score lives in a hex badge, credits are hex coins), honey amber is the accent, mint reads as
money for *Would Pay*, and a low-chroma slate is deliberately reserved for *Not for me* so the
weak signal never looks exciting. Dark-first, with a full light theme; mobile-first with bottom
navigation, a left rail and contextual right rail on desktop.

Type: Bricolage Grotesque (display), Hanken Grotesk (body), JetBrains Mono (scores and credits).

Prototype "screenshots" are generated SVG mock-ups of each product's real interface — one per
archetype (editor, chat, camera, document, chart, grid, timer) tinted with the product's hue —
so the prototype ships with no external image dependencies.

## Structure

```
index.html        app shell, rails, bottom nav
styles.css        design tokens + every component (dark-first, light theme included)
src/data.js       mock data: 15 prototypes, 8 builders, graveyard, AI summaries
src/app.js        router, views, testing flow, credits, interactions
tools/bundle.mjs  inlines everything into dist/protobuzz.html
```

All data is mock data. Nothing is sent anywhere, and no prototype URL is actually opened —
"Try it" simulates the session so every flow stays clickable.
