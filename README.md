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

Start with 15 credits, so one full test (+5) is enough to afford a launch — or buy 20 for $4.99
and launch immediately. Both routes are offered side by side wherever you run short, with the
trade spelled out: buying is instant, testing is free and is the only thing that raises your rank.

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
| Buy credits | sheet, from any short-on-credits moment | Earn-vs-buy comparison, 3 packs, simulated checkout |
| Pricing | `#/pricing` | Packs, Boost, Pro, and the five balance rules |
| Graveyard | `#/discover?feed=grave` | Killed prototypes: what they built, how long, final score, why, what they learned |

## What the platform sells

The product is not a launch listing, it is **evidence**. Three changes carry that:

**The price question asks for a price, then an email.** "Would you pay?" is the least reliable
question in research, so the test asks which band you would actually put on a card — measured
against the builder's real asking price — and, if it is not "nothing", asks for an email at that
price. The report then leads with the gap: *38% said they would pay. 12% handed over an address.*
That gap is the finding.

**Every tester has a profile.** Asked once (role, shipping cadence, whether they have paid for a
tool like this), so results cut into segments: *87% of people who record 3+ calls a week would use
it, versus 47% of occasional creators.* Segments are what make targeted testing worth paying for,
and they need 12+ sessions before the platform will cut them.

**A Validation Report is the deliverable.** A shareable page — verdict, the email signal, the
price ladder, segment cuts, verbatim quotes, what to do next — that a builder forwards to a
cofounder or an investor. Public by design, because a shared report is the best advertisement the
platform has. The email addresses behind the count are the paid part.

**A 30-day outcome loop** asks every builder what happened: shipped, pivoted, or killed. That
produces the one dataset no competitor has — *prototypes scoring 75+ shipped 7× more often than
those under 50* — and killed ones flow into the graveyard with a post-mortem worth +5 credits.

## Making money without breaking the loop

The scarce resource on ProtoBuzz is not credits, it is **tester attention**. If $4.99 minted the
same 20 credits that four tests earn, nobody would test and there would be nothing to sell. So
cash and credits deliberately buy different things.

**Two products, two queues.**

| | Credit packs | Boost | Validation Pack |
| --- | --- | --- | --- |
| Price | $4.99 / 20 · $11.99 / 60 · $28.99 / 200 | $39 | $99 |
| What it buys | A place in the **peer queue** | 25 targeted testers in 24h | 50 testers, the report, the emails, segments |
| Who tests you | Other builders, paid in credits | Testers paid in cash (~$0.40 a test) | Same, at twice the sample |
| Guarantee | — | 25 in 24h or you pay nothing | 50 in 48h or you pay nothing |
| Margin | High — no cash leaves the system | ~$28 after payouts and processing | ~$76 after payouts and processing |

Plus **Pro at $29/month** (unlimited launches, private testing before you go public, two custom
questions, a report on every batch, funnel history). Packs are the impulse buy that converts a
stuck builder at 11pm; the Pack is the deliverable people actually forward; Pro is the revenue
that compounds.

Pricing is anchored on what the market already clears: PickFu charges ~$1 per poll response and
$99/mo for a subscription, and the Google Play tester services charge $15–40 for 12–25 testers who
never write a word of feedback. A guaranteed panel plus a report is worth more than either.

**The five rules that keep it balanced** (all stated in-product on `#/pricing`):

1. **Money buys time, not rank.** Bought credits launch a prototype; only testing raises builder
   reputation and position in Trending. Someone who only pays can always launch and can never
   out-rank someone who tests. This is the load-bearing rule — without it the currency collapses.
2. **Two queues, two currencies.** Selling credits never quietly drains tester supply, because
   peer tests are paid in credits and only Boost draws cash out of the business.
3. **Paid demand is capped by real supply.** Boost sells only as many tests as the panel can
   deliver that day. "Sold out" is honest; 25 testers who do not exist is not.
4. **Feedback is paid on usefulness, not volume.** The +2 lands when the builder marks the
   improvement useful. Twelve tests a day maximum, plus the session clock, so farming credits is
   slower than earning them honestly.
5. **The free path never closes.** Every launch is reachable with four tests. The free feed is the
   reason anyone visits; paywalling it kills the supply that the paying customers are buying.

**Why testers still test once buying exists:** credits earned by testing are the only ones that
cash out (100 tested credits = $8, funded by Boost revenue), and the only ones that move
reputation. Bought credits are spend-only, which also closes the obvious arbitrage — buy cheap
credits, cash them out.

**Unit economics, roughly.** On a $4.99 pack, payment processing takes ~$0.44 (8.8% — small
tickets are expensive, which is why the $11.99 tier is flagged best value) and serving the
launch costs cents, so nearly all of it is margin. On a $19 Boost, ~$10 goes to testers and ~$0.85
to processing, leaving ~$8. The honest risk to watch: at $4.99 most builders will pay rather than
test four prototypes, so tester supply is the side you will have to subsidise deliberately —
Boost exists to buy that supply back when peers are slow.

**Not implemented here (and required before taking real money):** a payment provider. The checkout
in this prototype is simulated — no card details are collected and nothing is charged. A real
build should hand off to a hosted payment page (Stripe Checkout or Payment Element) so card data
never reaches this app, and add refunds, receipts, tax/VAT handling, and fraud limits on cash-out.

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
src/data.js       mock data: 15 prototypes, 8 builders, graveyard, AI summaries, pricing
src/app.js        router, views, testing flow, credits, interactions
tools/bundle.mjs  inlines everything into dist/protobuzz.html
```

All data is mock data. Nothing is sent anywhere, and no prototype URL is actually opened —
"Try it" simulates the session so every flow stays clickable.
