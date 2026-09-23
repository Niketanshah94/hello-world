# ProtoBuzz — Product & Build Specification

> The internet tests your idea before you waste months building it.

This document is everything needed to build ProtoBuzz as a real application: the idea, the
product rules, the exact formulas, the data model, the money, and the build order. It is written
for a **Laravel + Bootstrap** implementation.

The clickable prototype in this repo (`index.html`, `src/`, run `node tools/bundle.mjs`) is the
visual reference. Where this document and the prototype disagree, **this document wins** — the
prototype fakes several numbers that a real database must compute honestly. Those places are
marked ⚠️.

---

## 1. The idea

ProtoBuzz is a social network where people share prototypes, discover what others are building,
**test them**, and give useful feedback.

Think Product Hunt + Reddit + user testing, built for the AI era where a working prototype takes
a weekend instead of a quarter. The volume of prototypes has exploded; the ability to find out
whether any of them matter has not.

**The platform optimises for testing and validation, not likes.**

### The hierarchy that drives every design decision

```
Tested  >  Left an email  >  Would pay  >  Would use  >  Useful  >  Like
```

A like costs nothing, so it tells you nothing. Everything in the UI ranks by what someone *did*
after using the prototype, never by what they tapped without using it. When you have to choose
between two designs, pick the one that moves information up this ladder.

### Who it is for

| | Builder | Tester |
|---|---|---|
| Wants | To know if the idea is worth months of work | Credits, and to see what others are building |
| Gives | A URL and a question | 90 seconds and an honest answer |
| Pays with | Credits (earned) or money | Time |

The same person is usually both. That is the engine: **testers are builders who have not launched
yet.**

---

## 2. The four loops

Everything in the product serves one of these. If a feature serves none of them, cut it.

**1. The testing loop** — discover a prototype → open it → answer 4 questions → the score moves.
This is the product.

**2. The credit loop** — test others (+3, +2) → earn credits → spend 20 to launch your own.
This makes tester supply self-funding.

**3. The money loop** — buy credits to skip the queue, or buy guaranteed testers (Boost /
Validation Pack) where we pay the testers in cash. This is the business.

**4. The outcome loop** — 30 days after launch, ask what happened: shipped, pivoted, or killed.
This is the moat: nobody else knows which validation scores became real products.

---

## 3. Screens and routes

Laravel web routes, mapped from the prototype's hash routes.

| Screen | Route | Notes |
|---|---|---|
| Discover feed | `GET /` and `GET /feed/{feed}` | feeds: `trending`, `needs-testers`, `would-pay`, `hidden-gems`, `graveyard` |
| Prototype page | `GET /p/{prototype:slug}` | Public. Score, metrics, segments, feedback |
| Open prototype | `POST /p/{prototype}/open` | Records a visit, starts the session clock, redirects to the URL |
| Testing flow | `GET/POST /p/{prototype}/test` | Multi-step; see §4 |
| Validation report | `GET /report/{prototype:slug}` | Public, shareable. Emails gated to owner |
| Submit | `GET/POST /submit` | 3 steps; costs 20 credits |
| Creator dashboard | `GET /dashboard/{prototype}` | Owner only |
| Leaderboard | `GET /leaderboard` | 6 boards |
| My Lab | `GET /lab` | Own profile, wallet, ledger, outcome check-ins |
| Builder profile | `GET /u/{user:handle}` | Public version of My Lab |
| Pricing | `GET /pricing` | Credits, Boost, Pack, Pro |
| Buy credits | `GET/POST /credits/buy` | Stripe Checkout |
| Boost / Pack | `POST /p/{prototype}/boost`, `/pack` | Stripe Checkout |
| Test queue | `GET /test` | Prototypes needing testers, sorted by need |
| Saved | `GET /lab/saved` | |

### Navigation

Five items, everywhere: **Discover · Test · Submit · Leaderboard · My Lab.**
Bottom nav on mobile, left rail on desktop (≥900px).

### Feed rules

| Feed | Filter | Sort |
|---|---|---|
| 🔥 Trending | live | `testers_count * score` desc, limit 8 |
| 🧪 Needs Testers | `testers_count < 40` | `testers_count` asc |
| 💰 Would Pay | `pay_pct >= 35` | `pay_pct` desc |
| 🤯 Hidden Gems | `score >= 63 AND views < 5000` | `score` desc |
| 💀 Graveyard | `status = killed` | newest |

---

## 4. The testing flow

The heart of the product. Four questions, about 90 seconds.

### Step 0 — Tester profile (once per user, ever)

Asked before a user's first test, then never again. Stored on the user.

| Field | Options |
|---|---|
| `role` | Developer · Designer · Founder · Something else |
| `ships_cadence` | Weekly · Monthly · Rarely |
| `has_paid_for_tools` | Has paid for one · Never paid |

This is not onboarding friction for its own sake — **it is the thing builders pay to target**,
and it is what makes segment cuts possible (§6).

### Step 1 — Open the prototype

The tester must open the prototype before answering. Record `opened_at`; the answer form is
refused if the session is shorter than the minimum dwell time (§10).

### The four questions

| # | Question | Answers | Stored |
|---|---|---|---|
| 1 | Did you understand what it does? | Instantly / After a minute / Still not sure | `y` `m` `n` |
| 2 | Would you use it? | Yes, this week / Maybe later / No | `y` `m` `n` |
| 3 | **What would you pay for it?** | Nothing / Under $5 a month / $5–15 a month / $15+ a month | `none` `low` `mid` `high` |
| 4 | What is the one thing you would improve? | free text | `improve_text` |

Question 3 is asked **against the builder's real asking price** ("Loopcut is asking $12/mo"), so
the answer is a judgement on a real number rather than an abstraction.

### Step 3.5 — The email (only if the band is not "Nothing")

> **Want it at $5–15 a month?**
> Leave an email and Mira can tell you when it ships.

This is the most important screen in the product. Saying you would pay costs nothing; handing
over an address does. The report leads with the gap between the two numbers:

> **11 of 95** testers left an email at $12/mo.
> 38% *said* they would pay. 12% actually handed over an address.

Skippable, and skipping still pays the credits.

### Rewards

| Action | Credits |
|---|---|
| Completing a test | +3 |
| Written improvement the builder marks useful | +2 |
| Publishing a post-mortem | +5 |
| Launching a prototype | −20 |
| Welcome bonus (new account) | +15 |

The +2 is **released when the builder marks the feedback useful**, not on submission. Pay on
usefulness, never on volume.

A new user starts with 15 credits, so one full test (+5) is enough to afford their first launch.

---

## 5. Scoring and metrics

### ⚠️ Compute aggregates from rows, never by blending

The prototype starts from authored mock numbers and blends each new answer into the running
percentage. **Do not port this.** In Laravel, recompute from the `tests` table:

```php
$understood = 100 * $tests->avg(fn($t) => ['y'=>1,'m'=>0.5,'n'=>0][$t->understood]);
$use        = 100 * $tests->avg(fn($t) => ['y'=>1,'m'=>0.5,'n'=>0][$t->use_answer]);
$pay        = 100 * $tests->avg(fn($t) => self::PAY_WEIGHT[$t->pay_band]);
```

Recalculate on every new test (a queued job or an observer), and cache the result on the
`prototypes` row so feeds stay fast.

### Pay-band weights

```php
const PAY_WEIGHT = ['none' => 0.0, 'low' => 0.35, 'mid' => 0.75, 'high' => 1.0];
```

### Validation Score

```php
$score = round($understood * 0.25 + $use * 0.40 + $pay * 0.35)
       + min(8, intdiv($testersCount, 20));   // sample-size confidence bonus
$score = max(1, min(99, $score));
```

The three questions are weighted by how much they predict a real product: *would use* carries
most, *understood* least (a misunderstood prototype can be re-explained; an unwanted one cannot).
The bonus rewards a bigger sample, capped at 8 so volume can never manufacture a good score.

⚠️ The prototype also carries a `score_offset` per prototype. That exists only to keep the
hand-authored demo scores stable. **A real build has no offset — drop the column.**

### Verdict line

Shown wherever the score is. First match wins:

| Condition | Line |
|---|---|
| `pay >= 45` | People would pay. Build it. |
| `use >= 70 && pay < 30` | Loved, not bought. Find the buyer. |
| `understood < 70` | Misunderstood before it is judged. |
| `testers < 30` | Too early to call — needs testers. |
| `score < 55` | Weak signal. Change the idea, not the copy. |
| otherwise | Useful to a real group. Narrow it. |

### The email signal

⚠️ The prototype estimates `emails ≈ testers × pay% × 0.28`. **In the real app this is a
`count()` of `test_emails` rows.** Never estimate it — the whole point is that it is a real
number.

```
signal_rate = test_emails.count / tests.count
```

### The funnel

`Views → Opened it → Tested → Would use → Would pay`, each with a conversion percentage against
the previous step. Views and opens come from `prototype_views` / `opened_at`.

---

## 6. Segments

Feedback from a named kind of person is worth more than feedback from nobody in particular.

Group a prototype's tests by the tester's profile fields and report `use_pct`, `pay_pct` and
email count per group:

```php
Test::where('prototype_id', $p->id)
    ->join('users', 'users.id', '=', 'tests.user_id')
    ->groupBy('users.ships_cadence')
    ->selectRaw('users.ships_cadence, count(*) n, avg(...) use_pct, avg(...) pay_pct')
    ->get();
```

**Refuse to cut segments below 12 tests on the prototype, and below 4 tests in any one group.**
Showing "100% of 1 developer would pay" destroys trust in every other number on the page. Display
"Segments need at least 12 tested sessions — this has 7" instead.

⚠️ The prototype generates segments deterministically from a hash. Real segments come from real
profiles.

The useful segment axes, in order of how much builders care:

1. `ships_cadence` (weekly / monthly / rarely)
2. `has_paid_for_tools` (the single best predictor of willingness to pay)
3. `role`

---

## 7. Credits

A closed economy with one escape hatch (§8 payouts).

| Rule | Why |
|---|---|
| Credits are earned by testing or bought with money | Two supplies, one currency |
| **Only earned credits can be cashed out** | Closes the buy-cheap-then-cash-out arbitrage |
| Launching costs 20 credits | Four tests, or $4.99 |
| **Bought credits never change reputation** | Money buys time, not rank — see §9 |
| The ledger is append-only | Every balance change is auditable |

### The ledger

Never store a bare balance that gets mutated. Store transactions and keep a cached balance:

```php
// credit_transactions: append-only
['user_id', 'amount', 'kind' => 'earn|spend|buy|payout', 'reason',
 'source_type', 'source_id', 'balance_after', 'created_at']
```

⚠️ **Spending must be atomic.** Two launch requests in the same second must not both pass the
"has 20 credits" check:

```php
DB::transaction(function () use ($user) {
    $u = User::lockForUpdate()->find($user->id);
    abort_if($u->credit_balance < 20, 402, 'Not enough credits');
    // insert transaction, decrement cached balance, create prototype
});
```

### Reputation

```php
$reputation = min(99, $base + 2 * $user->tests()->count());
```

Earned from testing only. Feeds the Best Builder leaderboard and ranking weight in Trending.
**A purchase must never touch it** — this is the rule that keeps the free loop alive next to a
buy button.

---

## 8. Money

### Three products, deliberately different

| | Credit packs | Boost | Validation Pack |
|---|---|---|---|
| Price | $4.99 / 20 · $11.99 / 60 · $28.99 / 200 | **$39** | **$99** |
| Buys | A place in the **peer queue** | 25 targeted testers in 24h | 50 testers + the report + the emails + segments |
| Who tests | Peers, paid in credits | Testers paid in cash (~$0.40/test) | Same, twice the sample |
| Guarantee | — | 25 in 24h or you pay nothing | 50 in 48h or you pay nothing |
| Rough margin | ~$4.50 of $4.99 | ~$28 | ~$76 |

Plus **Pro at $29/month**: unlimited launches, private testing before going public, two custom
questions, a report on every batch, funnel history and compare.

### Tester payouts

`100 earned credits = $8`, funded from Boost and Pack revenue. Peer tests pay credits only — no
cash leaves the system for them, which is what makes credit packs almost pure margin.

Gate payouts behind: email verification, a minimum number of feedbacks marked useful, and a
manual review above a threshold. This is where fraud will try to enter.

### The five rules that keep it balanced

1. **Money buys time, not rank.** Bought credits launch a prototype; only testing raises
   reputation and Trending position. A pay-only builder can always launch and can never out-rank
   a tester.
2. **Two queues, two currencies.** Selling credits never drains tester supply, because peer tests
   are paid in credits and only the cash products draw cash out.
3. **Paid demand is capped by real supply.** Boost sells only what the panel can deliver that day.
   "Sold out" is honest; 25 testers who do not exist is not. Enforce this with a daily counter.
4. **Feedback is paid on usefulness, not volume.** 12 tests a day maximum, plus the dwell-time
   floor.
5. **The free path never closes.** Every launch is reachable with four tests. The free feed is the
   reason anyone visits.

### Why these prices

The market already clears at these levels: PickFu charges ~$1 per poll response and $99/mo for a
subscription; the Google Play "12 testers for 14 days" services charge $15–40 for testers who
never write a word. A guaranteed panel *plus* a report is worth more than either. Launch-board
listing fees ($19–39 one-off) are a commodity — over 30 competitors, and Product Hunt itself only
reached an estimated ~$4M ARR with the category-defining brand. Sell the report, not the listing.

---

## 9. Data model

Laravel migrations. `id` is `bigIncrements`, timestamps on everything unless noted.

### users
```
name, handle (unique), email (unique), password, bio, avatar_hue (int 0-359)
role, ships_cadence, has_paid_for_tools        // tester profile, nullable until first test
profile_completed_at
reputation_base (int, default 40)
credit_balance (int, default 15)               // cached; source of truth is the ledger
credits_earned_total, credits_purchased_total  // cached, for the wallet split
pro_until (nullable timestamp)
email_verified_at, last_test_at
```

### prototypes
```
user_id, name, slug (unique), tagline, about, feedback_question
url, category_id, stage enum[concept,prototype,mvp,live]
price_anchor (string, e.g. "$12/mo")
status enum[draft,live,shipped,pivoted,killed] default live
is_private (bool, Pro only)
score, understood_pct, use_pct, pay_pct        // all cached aggregates
testers_count, views, visits, emails_count     // cached counters
launched_at, outcome_asked_at
```
Indexes: `(status, score)`, `(status, testers_count)`, `(status, pay_pct)`, `user_id`, `slug`.

### tests
```
prototype_id, user_id
understood enum[y,m,n], use_answer enum[y,m,n], pay_band enum[none,low,mid,high]
improve_text (text, nullable)
marked_useful (bool, default false), marked_useful_at
opened_at, submitted_at, dwell_seconds
source enum[peer,boost,pack]                   // which queue delivered this tester
```
**Unique `(prototype_id, user_id)`** — one test per person per prototype, enforced in the DB.

### test_emails
```
test_id, prototype_id, email (encrypted), price_band, created_at
```
Separate table because it is PII with a different lifecycle and a different access policy.
Encrypt at rest (`encrypted` cast). Never expose to anyone but the prototype's owner, and only
when they hold a Validation Pack.

### comments
```
prototype_id, user_id, test_id (nullable), body
verdict enum[would_pay,would_use,not_for_me]   // derived from their test
helpful_count
```
A comment linked to a test earns the ✓ verified badge. Untested comments are allowed but earn
nothing.

### reactions
```
prototype_id, user_id, kind enum[useful,would_pay,not_for_me]
```
Unique `(prototype_id, user_id, kind)`. `useful` and `not_for_me` are mutually exclusive.

### saves · follows
```
saves:   user_id, prototype_id        unique(user_id, prototype_id)
follows: follower_id, following_id    unique pair, follower != following
```

### credit_transactions
```
user_id, amount (signed int), kind enum[earn,spend,buy,payout]
reason (string), source_type, source_id (nullable morph), balance_after
```
Append-only. Never update or delete a row.

### purchases
```
user_id, prototype_id (nullable)
product enum[credits_20,credits_60,credits_200,boost,pack,pro]
amount_cents, currency, provider enum[stripe]
provider_session_id, provider_payment_intent, status enum[pending,paid,refunded,failed]
```

### panel_orders   (a Boost or Pack being delivered)
```
prototype_id, purchase_id, target_testers, delivered_testers
deadline_at, status enum[queued,running,delivered,refunded]
```
The guarantee is enforced here: a scheduled job refunds any order past `deadline_at` with
`delivered_testers < target_testers`.

### outcomes
```
prototype_id, outcome enum[shipped,pivoted,killed], learned (text, nullable)
time_spent (string), published (bool)         // published = appears in the graveyard
```

### payouts
```
user_id, credits_spent, amount_cents, status enum[requested,approved,paid,rejected], provider_ref
```

### Supporting
`categories` (name, slug), `prototype_views` (prototype_id, user_id nullable, ip_hash, created_at).

---

## 10. Integrity — you are selling a number

If the Validation Score can be gamed, the report is worthless and the business dies with it.
Treat these as core features, not hardening to do later.

| Rule | Implementation |
|---|---|
| One test per user per prototype | DB unique constraint |
| You cannot test your own prototype | Policy check |
| Minimum dwell time before answering | Reject if `submitted_at - opened_at < 45s` |
| Maximum 12 tests per user per day | Rate limiter on the submit route |
| The +2 needs a human to mark it useful | `marked_useful` gate before the credit posts |
| Low-rated testers stop earning | If useful-rate < 20% over last 20 tests, suspend earning |
| Verified email before payout | `email_verified_at` + manual review over a threshold |
| Publish the methodology | A `/how-scoring-works` page, linked from every score |

Rate-limit the open/test endpoints per IP as well as per user — the cheapest attack is many
throwaway accounts.

---

## 11. Payments

**Never let card data touch the application.** Use Stripe Checkout (hosted) for one-off purchases
and Laravel Cashier for the Pro subscription. That keeps you on SAQ-A, the lightest PCI scope.

```php
// one-off: credits, Boost, Pack
$session = $user->checkout(['price_xxx' => 1], [
    'success_url' => route('credits.success').'?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url'  => route('pricing'),
    'metadata'    => ['product' => 'credits_20', 'prototype_id' => $p?->id],
]);

// subscription
$user->newSubscription('pro', 'price_pro_monthly')->checkout();
```

**Credits are granted by the webhook, never by the success redirect.** A user can navigate to the
success URL without paying; only `checkout.session.completed` is proof.

```php
// routes/webhook.php — signature-verified by Cashier
checkout.session.completed  -> grant credits / queue panel order / activate Pro
charge.refunded             -> reverse the ledger entry
invoice.payment_failed      -> downgrade Pro at period end
```

Make webhook handling **idempotent** — Stripe retries, and granting 20 credits twice is a bug you
will only notice in the ledger.

Also required before taking real money: receipts, a refund path (credits are refundable while
unspent), VAT/GST handling for digital goods sold internationally (Stripe Tax is the least
painful), and clear terms on what a guarantee refund covers.

---

## 12. Privacy

The email capture is the product's crown jewel and its biggest liability.

- Tell the tester exactly who sees the address and why, on the screen where you ask for it.
- Store it encrypted; expose it only to the prototype owner holding a Validation Pack.
- Never show addresses on a public report — the count is public, the list is not.
- Honour deletion requests across `test_emails` (a tester must be able to withdraw an address).
- Log every access to the email list. If it leaks, you are finished.

---

## 13. Jobs, schedules, events

```php
// app/Jobs
RecalculatePrototypeScore::class      // after each test, queued
DeliverPanelOrder::class              // invites paid testers, tracks delivery
RefundUndeliveredPanels::class        // enforces the guarantee
GenerateAiSummary::class              // unlocks at 7 tested sessions
SendOutcomeCheckIn::class             // 30 days after launch

// routes/console.php
Schedule::job(RefundUndeliveredPanels::class)->hourly();
Schedule::job(SendOutcomeCheckIn::class)->daily();
```

**The AI summary** (what testers like / dislike / what to improve next) runs over the
`improve_text` of every test plus the comments, and unlocks at 7 tested sessions. Below that the
sample is too small to summarise honestly — say so rather than generating something.

---

## 14. Design system

The prototype's tokens, ready to drop into a Bootstrap theme. Identity: a hive — hexagons carry
the structure, honey amber is the accent, mint means money, low-chroma slate is reserved for weak
signals so they never look exciting.

```css
--bg:#0A0F11; --surface:#101819; --surface-2:#162022; --line:#243335;
--text:#E9F1EF; --text-2:#9DB0B0; --text-3:#6C8082;
--honey:#FFB43D;  /* accent, "would use" */
--mint:#34D999;   /* money, "would pay" */
--slate:#7E9094;  /* "not for me" — deliberately dull */
--rose:#E8695E;   /* killed */
```

Light theme (`:root[data-theme="light"]`): `--bg:#EFF3F1; --surface:#FFF; --text:#0C1416;
--honey:#C97C00; --mint:#0E9E6A` — the accents darken so they stay readable on a light ground.

**Type:** Bricolage Grotesque (display) · Hanken Grotesk (body) · JetBrains Mono (scores, credits,
prices — anything where digits line up).

### Bootstrap mapping

| Prototype element | Bootstrap 5 |
|---|---|
| Feed card | `.card` with custom radius (20–26px) and border colour |
| Bottom sheet (test flow, checkout) | `.offcanvas-bottom` on mobile, `.modal` on desktop |
| Feed tabs | `.nav-pills` with custom active colour |
| Meters and price ladder | `.progress` with a token background |
| Chips, stage badges, verdict tags | `.badge` with pill radius |
| Toasts | `.toast` (position fixed, above the nav) |
| Bottom nav | custom — Bootstrap has no equivalent |
| **Hex score badge** | custom SVG, keep as-is |
| **Generated prototype thumbnails** | custom SVG, keep as-is (`mock()` in `src/app.js`) |

Override Bootstrap's `$primary` with `--honey` and `$success` with `--mint` in your Sass entry so
the default components inherit the identity instead of fighting it.

Keep the hex badge and the generated thumbnails — they are the two things that make the product
look like itself rather than like a Bootstrap template.

---

## 15. Build order

Ship in this order; each milestone is usable on its own.

**M1 — The loop (2 weeks).** Auth, submit a prototype, discover feed, the 4-question test, score
computation, credit ledger. No money. Seed 20 real prototypes from friends so the feed is never
empty — an empty feed kills this product on day one.

**M2 — The evidence (1 week).** Tester profile, price bands, email capture, segments, the
Validation Report. This is what makes it a validation product rather than a launch board.

**M3 — Money (1 week).** Stripe Checkout, credit packs, the wallet, webhooks, refunds.

**M4 — The panel (2 weeks).** Boost and Pack, panel orders, tester payouts, the delivery
guarantee and its automatic refund. Recruit the first 50 paid testers by hand — this is
operations, not code.

**M5 — Compounding (ongoing).** 30-day outcome check-ins, the graveyard, AI summaries,
leaderboards, Pro.

**Do not build first:** notifications, chat, teams, an API, mobile apps, anything social beyond
follows. They all feel urgent and none of them move the four loops.

---

## 16. Seeding and the cold-start problem

The hardest problem is not code. A validation platform with no testers validates nothing.

- Launch with 20–30 real prototypes and 50 people who have agreed to test, recruited by hand.
- Your own testing counts: test every prototype in the first month personally.
- Do not open paid Boost until the panel can actually deliver 25 tests in 24 hours. Selling a
  guarantee you cannot keep is worse than having no paid product.
- The graveyard is the best content marketing available — post-mortems travel. Seed it with four
  honest ones before launch.

---

## 17. Open decisions

Things this spec deliberately leaves to you:

1. **Anonymous testing.** Should a tester's identity be public on the feedback? Public builds
   trust; anonymous gets harsher, more honest answers. Consider anonymous by default with a
   verified badge.
2. **Who owns the captured emails** if the builder churns. Legally the tester consented to hear
   from that builder — get this into the terms before the first capture.
3. **Whether Trending should weight reputation.** It should, but the weight decides how much
   buying credits is worth. Start at zero weight and add it once you see gaming.
4. **Refund policy on the guarantee** — automatic, or on request? Automatic is more expensive and
   worth far more in word of mouth.

---

## 18. Reference: the prototype

| File | What it holds |
|---|---|
| `index.html` | App shell, rails, bottom nav |
| `styles.css` | The complete token system and every component, both themes |
| `src/data.js` | Mock data: 15 prototypes, 8 builders, graveyard, pricing, segments |
| `src/app.js` | Router, views, testing flow, credits, report, interactions |
| `tools/bundle.mjs` | Inlines everything into `dist/protobuzz.html` |

Open `index.html` directly, or `npx http-server . -p 8080`. All state is in `localStorage`; clear
site data to reset the demo.

The prototype's mock maths — blended scores, estimated email counts, hashed segments, the
`score_offset` — exist to make a static demo feel alive. **None of it belongs in the Laravel
build.** Compute everything from rows.
