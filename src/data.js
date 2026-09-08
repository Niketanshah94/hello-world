/* ProtoBuzz mock data — everything the prototype renders comes from here. */
(function (global) {
  "use strict";

  var BUILDERS = {
    mira:      { handle: "mira",      name: "Mira Okonkwo",   hue: 34,  rep: 87, followers: 1284, bio: "Shipping small tools for video people. 3 launched, 5 killed, no regrets.", built: 8,  launched: 3, killed: 5,  tests: 212 },
    dev_kaz:   { handle: "dev_kaz",   name: "Kazu Ito",       hue: 160, rep: 92, followers: 2140, bio: "Dev tools, mostly. I test 4 prototypes a day and it made me a better builder.", built: 11, launched: 4, killed: 7,  tests: 486 },
    lin:       { handle: "lin",       name: "Lin Alvarez",    hue: 12,  rep: 74, followers: 631,  bio: "Ex-restaurant, now building for kitchens. Everything I make gets tested by 50 cooks first.", built: 5,  launched: 2, killed: 3,  tests: 141 },
    prakash:   { handle: "prakash",   name: "Prakash Menon",  hue: 268, rep: 68, followers: 402,  bio: "Weekend prototypes about money and paperwork. Validation before code.", built: 6,  launched: 1, killed: 5,  tests: 98  },
    zo:        { handle: "zo",        name: "Zoë Bramante",   hue: 196, rep: 81, followers: 977,  bio: "Consumer hardware in a one-bedroom apartment. Solder, test, repeat.", built: 7,  launched: 2, killed: 5,  tests: 173 },
    ade:       { handle: "ade",       name: "Ade Ferrante",   hue: 88,  rep: 79, followers: 812,  bio: "Health and sleep. I only build things I need at 3am.", built: 4,  launched: 1, killed: 3,  tests: 260 },
    hana:      { handle: "hana",      name: "Hana Duarte",    hue: 320, rep: 84, followers: 1533, bio: "Learning tools. My prototypes argue with you on purpose.", built: 9,  launched: 3, killed: 6,  tests: 322 },
    niketan:   { handle: "niketan",   name: "Niketan",        hue: 44,  rep: 41, followers: 76,   bio: "Testing everything on ProtoBuzz before I build anything. Currently 1 experiment in flight.", built: 3, launched: 0, killed: 2, tests: 27 }
  };

  /* score = the platform's Validation Score; understood/use/pay are the three questions. */
  var PROTOTYPES = [
    {
      id: "loopcut", name: "Loopcut", hue: 34, archetype: "editor",
      tagline: "Drop a 60-minute call recording, get the 30 seconds worth sharing.",
      creator: "mira", category: "Creative", stage: "MVP", url: "loopcut.build/try",
      score: 82, testers: 94, understood: 82, use: 71, pay: 38,
      askedFor: "Is 30 seconds the right length, or should it be 3 clips of 10?",
      about: "Loopcut watches your call recording, finds the moment where someone actually said the thing, and cuts a shareable clip with captions. No timeline, no scrubbing. You get three candidates and pick one.",
      posted: "3 days ago", views: 4820, visits: 1610, feeds: ["trending", "pay"],
      reactions: { useful: 213, pay: 61, nope: 34 },
      comments: [
        { by: "dev_kaz", verdict: "pay", tested: true, when: "2d", text: "Tested with a 47-minute standup recording. It found the one decision we made and cut it clean. I would pay $12/mo today. The captions font is ugly, fix that before launch.", up: 34 },
        { by: "hana",    verdict: "use", tested: true, when: "2d", text: "Understood instantly from the landing page — rare. But 30s is too long for Slack and too short for LinkedIn. Give me both.", up: 21 },
        { by: "zo",      verdict: "nope", tested: true, when: "1d", text: "Not for me, I don't record calls. That said, the three-candidate pattern is smart — you're not asking me to trust one AI guess.", up: 9 }
      ]
    },
    {
      id: "standup-ghost", name: "Standup Ghost", hue: 160, archetype: "chat",
      tagline: "Writes your daily standup from your commits, in your voice.",
      creator: "dev_kaz", category: "Dev Tools", stage: "Live", url: "standupghost.dev",
      score: 88, testers: 168, understood: 94, use: 79, pay: 52,
      askedFor: "Would you let it post to Slack automatically, or always review first?",
      about: "Connects to your repo, reads yesterday's commits and PR comments, and drafts the standup you were going to type anyway. It learns your phrasing after about a week, including how you say 'blocked'.",
      posted: "6 days ago", views: 9130, visits: 3402, feeds: ["trending", "pay"],
      reactions: { useful: 402, pay: 141, nope: 26 },
      comments: [
        { by: "mira",    verdict: "pay", tested: true, when: "4d", text: "52% would pay is underselling this. My team spends 10 minutes a day on this exact task. Auto-post, but let me edit for 5 minutes first.", up: 58 },
        { by: "prakash", verdict: "use", tested: true, when: "3d", text: "It nailed the summary but invented a blocker I never had. Hallucinated blockers are worse than no standup — add a 'only from what you actually wrote' mode.", up: 44 },
        { by: "ade",     verdict: "pay", tested: true, when: "2d", text: "Review first, always. The day it posts something wrong to Slack is the day I churn.", up: 31 }
      ]
    },
    {
      id: "fridge-oracle", name: "Fridge Oracle", hue: 88, archetype: "camera",
      tagline: "Photograph your fridge, get three dinners you can make right now.",
      creator: "lin", category: "Consumer", stage: "Prototype", url: "fridgeoracle.app/demo",
      score: 74, testers: 61, understood: 91, use: 68, pay: 19,
      askedFor: "Everyone loves it and nobody would pay. Is there a business here at all?",
      about: "One photo. It reads what's actually in there — including the sad half-onion — and gives three recipes ranked by what expires first. No pantry setup, no scanning barcodes.",
      posted: "1 day ago", views: 2260, visits: 980, feeds: ["trending", "needs"],
      reactions: { useful: 188, pay: 22, nope: 41 },
      comments: [
        { by: "zo",      verdict: "use", tested: true, when: "18h", text: "Understood in two seconds. Used it for actual dinner. Would not pay — this is a feature of a grocery app, not an app.", up: 27 },
        { by: "hana",    verdict: "use", tested: true, when: "12h", text: "The expiry ranking is the whole product. Lead with waste, not recipes, and the paying customer changes completely.", up: 39 }
      ]
    },
    {
      id: "rentprint", name: "Rentprint", hue: 268, archetype: "doc",
      tagline: "Scan a lease, see the seven clauses that will cost you money.",
      creator: "prakash", category: "Fintech", stage: "Prototype", url: "rentprint.co/scan",
      score: 79, testers: 47, understood: 77, use: 74, pay: 61,
      askedFor: "Is one-time $9 per lease better than a subscription nobody needs twice a year?",
      about: "Upload a rental agreement. It flags the clauses that historically cost tenants money — automatic renewal, restoration charges, joint liability — and rewrites each one in a sentence you can actually read.",
      posted: "4 days ago", views: 3310, visits: 1120, feeds: ["pay", "gems"],
      reactions: { useful: 141, pay: 88, nope: 12 },
      comments: [
        { by: "dev_kaz", verdict: "pay", tested: true, when: "3d", text: "One-time. Nobody signs a lease monthly. Charge $19 and put it in front of people at the moment they get the PDF.", up: 51 },
        { by: "lin",     verdict: "pay", tested: true, when: "2d", text: "I sent it my actual lease and it caught the restoration clause my lawyer missed in 2022. That is a real receipt. Understood score is low because the landing page buries what it does.", up: 46 }
      ]
    },
    {
      id: "sleep-tape", name: "Sleep Tape", hue: 196, archetype: "chart",
      tagline: "Records the night, scores the snore, tells you which one to blame.",
      creator: "ade", category: "Health", stage: "MVP", url: "sleeptape.io",
      score: 71, testers: 132, understood: 88, use: 62, pay: 29,
      askedFor: "Does the morning report make you change anything, or is it just a fun number?",
      about: "Phone on the nightstand. It separates snoring, talking, the dog, and the street, and correlates each with how broken your night was. The report is one screen: what woke you, how many times, and the one change worth trying tonight.",
      posted: "1 week ago", views: 6740, visits: 2140, feeds: ["gems"],
      reactions: { useful: 231, pay: 44, nope: 58 },
      comments: [
        { by: "mira", verdict: "nope", tested: true, when: "5d", text: "Fun number. I looked at it for four mornings and then stopped. Tell me what to do, not what happened.", up: 62 },
        { by: "hana", verdict: "use", tested: true, when: "4d", text: "The 'blame the dog' breakdown made me laugh and then made me move the dog. That's a behavior change, ship it louder.", up: 28 }
      ]
    },
    {
      id: "tinygrid", name: "Tinygrid", hue: 12, archetype: "grid",
      tagline: "A spreadsheet where every formula is a plain English sentence.",
      creator: "hana", category: "Productivity", stage: "MVP", url: "tinygrid.sh",
      score: 85, testers: 203, understood: 73, use: 81, pay: 47,
      askedFor: "Do people trust a formula they can't see? Should I show the generated formula?",
      about: "Type 'total of column B where the date is this month' into a cell. It computes, and shows the sentence, not the formula. Every cell keeps its sentence, so the sheet explains itself six months later.",
      posted: "5 days ago", views: 11400, visits: 4830, feeds: ["trending", "pay"],
      reactions: { useful: 512, pay: 168, nope: 61 },
      comments: [
        { by: "prakash", verdict: "pay", tested: true, when: "4d", text: "Show the formula. Not because I'll read it, but because I need to know I could. Trust comes from the escape hatch.", up: 88 },
        { by: "dev_kaz", verdict: "use", tested: true, when: "3d", text: "73% understood is your bug, not your ceiling. I got it only after the second example. Put the sentence-in-a-cell animation above the fold.", up: 57 },
        { by: "ade",     verdict: "pay", tested: true, when: "2d", text: "Tested for a budget sheet. It's the first time a sheet I made in March still made sense in September.", up: 40 }
      ]
    },
    {
      id: "second-draft", name: "Second Draft", hue: 320, archetype: "chat",
      tagline: "Catches the Slack message you'll regret and rewrites it once.",
      creator: "hana", category: "Social", stage: "Prototype", url: "seconddraft.chat",
      score: 68, testers: 38, understood: 86, use: 55, pay: 21,
      askedFor: "Does an intervention feel helpful or condescending? Be honest.",
      about: "It sits in your compose box. When a message reads as angrier than you probably mean, it offers exactly one rewrite — never a lecture, never a second popup. You can send the original with one keystroke.",
      posted: "2 days ago", views: 1980, visits: 640, feeds: ["needs", "gems"],
      reactions: { useful: 96, pay: 18, nope: 44 },
      comments: [
        { by: "zo",  verdict: "nope", tested: true, when: "1d", text: "Condescending. I know I'm angry. The one thing that would flip it: let me trigger it, don't let it judge me.", up: 43 },
        { by: "lin", verdict: "use", tested: true, when: "1d", text: "Opposite take — I want the interruption at 11pm. Maybe it's a time-of-day feature, not an always-on one.", up: 25 }
      ]
    },
    {
      id: "promptfossil", name: "PromptFossil", hue: 160, archetype: "doc",
      tagline: "Version control for prompts, with diffs that show what broke.",
      creator: "dev_kaz", category: "Dev Tools", stage: "MVP", url: "promptfossil.dev",
      score: 76, testers: 88, understood: 81, use: 70, pay: 44,
      askedFor: "Is this a standalone tool or should it just be a git plugin?",
      about: "Every prompt change gets a commit, an eval run, and a diff that shows which test cases flipped. When quality drops, you can see the exact word that did it.",
      posted: "1 week ago", views: 5210, visits: 1980, feeds: ["pay", "gems"],
      reactions: { useful: 204, pay: 71, nope: 29 },
      comments: [
        { by: "mira",    verdict: "use", tested: true, when: "6d", text: "Git plugin. The moment I have a second dashboard to check, I stop checking it.", up: 66 },
        { by: "niketan", verdict: "pay", tested: true, when: "5d", text: "The flipped-test-case diff is the feature. Everything else is table stakes.", up: 19 }
      ]
    },
    {
      id: "cold-open", name: "Cold Open", hue: 44, archetype: "chat",
      tagline: "Rehearse the hard conversation with someone who pushes back.",
      creator: "hana", category: "Productivity", stage: "Prototype", url: "coldopen.practice",
      score: 66, testers: 29, understood: 79, use: 59, pay: 24,
      askedFor: "Is 'raise' the right first scenario, or should I start with 'firing someone'?",
      about: "Pick the conversation — asking for a raise, ending a contract, telling a cofounder no. It plays the other person at the difficulty you choose, then tells you the one sentence that lost you the room.",
      posted: "16 hours ago", views: 1140, visits: 410, feeds: ["needs"],
      reactions: { useful: 61, pay: 12, nope: 20 },
      comments: [
        { by: "ade", verdict: "use", tested: true, when: "9h", text: "Start with firing. That's the conversation people lose sleep over and there's no one to practice with.", up: 22 }
      ]
    },
    {
      id: "mise", name: "Mise", hue: 12, archetype: "timer",
      tagline: "A kitchen timer that thinks in parallel, like a cook does.",
      creator: "lin", category: "Consumer", stage: "Prototype", url: "mise.kitchen",
      score: 63, testers: 24, understood: 68, use: 66, pay: 17,
      askedFor: "Nobody gets it from the description. How would you explain it in one line?",
      about: "You tell it what you're cooking. It works backwards from when you want to eat and tells you the next physical action, one at a time, across every pan on the stove.",
      posted: "22 hours ago", views: 890, visits: 300, feeds: ["needs", "gems"],
      reactions: { useful: 44, pay: 7, nope: 18 },
      comments: [
        { by: "zo", verdict: "use", tested: true, when: "14h", text: "\"It's a GPS for dinner — it only ever tells you the next turn.\" Use that line, the current one made me think it was a recipe app.", up: 31 }
      ]
    },
    {
      id: "doorbell-ai", name: "Doorbell.ai", hue: 196, archetype: "camera",
      tagline: "Turns a building intercom into a bouncer that knows the delivery guy.",
      creator: "zo", category: "Hardware", stage: "Concept", url: "doorbell.ai/waitlist",
      score: 58, testers: 19, understood: 63, use: 52, pay: 33,
      askedFor: "Is the privacy story a dealbreaker before I order the boards?",
      about: "A $40 module behind the existing intercom. It recognizes recurring deliveries, buzzes them in with a rule you wrote, and texts you a five-word summary instead of a video you'll never watch.",
      posted: "2 days ago", views: 1420, visits: 380, feeds: ["needs"],
      reactions: { useful: 38, pay: 14, nope: 21 },
      comments: [
        { by: "prakash", verdict: "nope", tested: true, when: "1d", text: "Dealbreaker for me and for every building committee you'll pitch. Do the on-device story first or don't order the boards.", up: 29 }
      ]
    },
    {
      id: "papercut", name: "Papercut", hue: 268, archetype: "doc",
      tagline: "Reads the paper, then argues with it so you don't have to be an expert.",
      creator: "hana", category: "Education", stage: "MVP", url: "papercut.study",
      score: 81, testers: 112, understood: 84, use: 76, pay: 35,
      askedFor: "Students love it, researchers ignore it. Which one should I build for?",
      about: "Paste an arXiv link. It gives you the claim, the evidence, and the three objections a reviewer would raise — with the exact paragraph each objection lands on.",
      posted: "5 days ago", views: 7300, visits: 2900, feeds: ["trending", "gems"],
      reactions: { useful: 288, pay: 82, nope: 33 },
      comments: [
        { by: "dev_kaz", verdict: "use", tested: true, when: "4d", text: "Students. Researchers already have the objections in their head — you're selling them a mirror.", up: 71 },
        { by: "mira",    verdict: "pay", tested: true, when: "3d", text: "I'd pay as a non-expert reading outside my field. That's a bigger market than either group you named.", up: 48 }
      ]
    },
    {
      id: "chorekit", name: "Chorekit", hue: 88, archetype: "grid",
      tagline: "Roommate chores that settle themselves in money, weekly.",
      creator: "prakash", category: "Consumer", stage: "MVP", url: "chorekit.house",
      score: 69, testers: 74, understood: 89, use: 64, pay: 26,
      askedFor: "Does putting money on chores make it worse socially? Testers seem split.",
      about: "Every chore has a price the house agrees on once. Skip it, and it moves to whoever does it, and the balance settles Sunday. No nagging, no wheel of names.",
      posted: "1 week ago", views: 4100, visits: 1330, feeds: ["gems"],
      reactions: { useful: 152, pay: 38, nope: 49 },
      comments: [
        { by: "lin", verdict: "nope", tested: true, when: "6d", text: "Worse. In my house this turns into 'I'll just pay' and one person cleans forever. Cap how often someone can buy out.", up: 55 },
        { by: "ade", verdict: "use", tested: true, when: "5d", text: "Better. We already argue about money, at least now it's explicit. The cap idea is right though.", up: 33 }
      ]
    },
    {
      id: "refactor-roulette", name: "Refactor Roulette", hue: 320, archetype: "editor",
      tagline: "One risky refactor a day, reviewed before you can merge it.",
      creator: "mira", category: "Dev Tools", stage: "Concept", url: "roulette.dev/spin",
      score: 44, testers: 16, understood: 51, use: 33, pay: 9,
      askedFor: "Is this a real tool or a joke I got too attached to?",
      about: "Each morning it picks one file with bad complexity numbers, proposes the refactor, and opens the PR. You have until end of day to merge it or it closes itself.",
      posted: "3 days ago", views: 1610, visits: 420, feeds: ["needs"],
      reactions: { useful: 24, pay: 3, nope: 38 },
      comments: [
        { by: "dev_kaz", verdict: "nope", tested: true, when: "2d", text: "A joke you got attached to. 51% understood means half of us couldn't tell if it was satire. But 'complexity budget with a deadline' — that's a real tool.", up: 47 }
      ]
    }
  ];

  var GRAVEYARD = [
    { id: "petfluencer",  name: "Petfluencer",  builder: "mira",    time: "6 weeks",   score: 24, category: "Consumer",
      built: "AI captions and posting schedule for pet accounts.",
      why: "Everyone said it was fun. 82% understood it, 9% came back a second time, 2% would pay.",
      learned: "'Would use' means nothing if you never ask 'would you open it twice'. I now put a 7-day return question in every test." },
    { id: "meetingcoin",  name: "MeetingCoin",  builder: "prakash", time: "3 weekends", score: 31, category: "Productivity",
      built: "Charge colleagues credits to book time on your calendar.",
      why: "4% would pay, and all four were founders who wanted it for their own calendar, not their team's.",
      learned: "When only the buyer likes it and the users hate it, you don't have a market, you have a fantasy org chart." },
    { id: "fitcast",      name: "Fitcast",      builder: "ade",     time: "4 months",  score: 47, category: "Health",
      built: "A podcast that re-cuts itself to your running pace.",
      why: "Validation was fine. Licensing was not. Four months in, no catalogue would talk to a prototype.",
      learned: "Test the thing that can kill you first. Mine wasn't the product, it was a rights conversation I could have had in week one." },
    { id: "dreamstack",   name: "DreamStack",   builder: "zo",      time: "9 days",    score: 18, category: "Creative",
      built: "Type your dream, get a 3D scene you can walk through.",
      why: "22% understood it. The demo was beautiful and no one could say what it was for.",
      learned: "Beautiful and unexplainable is a portfolio piece, not a product. 9 days is the cheapest lesson I've bought." }
  ];

  /* Feed definitions used by the Discover tabs. */
  var FEEDS = [
    { id: "trending", emoji: "🔥", label: "Trending",     blurb: "Most tested in the last 48 hours." },
    { id: "needs",    emoji: "🧪", label: "Needs Testers", blurb: "Under 40 testers. Your feedback moves the score." },
    { id: "pay",      emoji: "💰", label: "Would Pay",     blurb: "Above 35% would pay — the rarest signal here." },
    { id: "gems",     emoji: "🤯", label: "Hidden Gems",   blurb: "High validation, low views. Found before the crowd." },
    { id: "grave",    emoji: "💀", label: "Graveyard",     blurb: "Killed prototypes and what they cost to learn." }
  ];

  var CATEGORIES = ["Dev Tools", "Consumer", "Productivity", "Creative", "Health", "Fintech", "Education", "Social", "Hardware", "AI Agents"];

  /* The current user's own experiment — already launched, used by the dashboard demo. */
  var MY_FIRST = {
    id: "shelfquiet", name: "Shelfquiet", hue: 44, archetype: "grid",
    tagline: "Turns your unread book pile into one 6-minute daily reading plan.",
    creator: "niketan", category: "Education", stage: "Prototype", url: "shelfquiet.app/try",
    score: 61, testers: 22, understood: 86, use: 59, pay: 18,
    askedFor: "Is 6 minutes a day too small to be worth paying for?",
    about: "Photograph your shelf. It picks the one book you're most likely to finish, then gives you a 6-minute chunk each morning with the thread from yesterday.",
    posted: "yesterday", views: 780, visits: 244, feeds: ["needs"],
    reactions: { useful: 51, pay: 9, nope: 14 },
    comments: [
      { by: "hana", verdict: "use", tested: true, when: "20h", text: "6 minutes is the reason it works, not the reason it's cheap. Price it on finishing books, not on minutes.", up: 17 },
      { by: "ade",  verdict: "nope", tested: true, when: "16h", text: "I don't have a shelf problem, I have a phone problem. Not for me — but the 'thread from yesterday' line is the strongest thing on the page.", up: 11 }
    ]
  };


  /* ---- Money -------------------------------------------------------------
     Two products, deliberately different. Credit packs buy a place in the
     PEER queue (other builders test you, paid in credits — pure margin).
     Boost buys the PAID panel: real testers, cash-paid, targeted, capped by
     real supply. Pro is the durable revenue line. */
  var PACKS = [
    { id: "starter", label: "Starter", credits: 20,  price: 4.99,  launches: 1,  per: 0.25 },
    { id: "builder", label: "Builder", credits: 60,  price: 11.99, launches: 3,  per: 0.20, best: true },
    { id: "studio",  label: "Studio",  credits: 200, price: 28.99, launches: 10, per: 0.14 }
  ];

  var BOOST = {
    price: 19, testers: 25, hours: 24,
    blurb: "Targeted testers we pay, not peers you wait for.",
    filters: ["Ships code weekly", "Has paid for a tool like this", "Uses it on mobile"]
  };

  var PRO = {
    price: 12,
    perks: [
      "Unlimited launches — no credits needed",
      "Private testing before you go public",
      "Two custom questions on top of the four",
      "Funnel history and prototype-vs-prototype compare",
      "AI summary on every batch, from the first tester"
    ]
  };

  /* Testers cash out from Boost revenue only — peer tests pay credits. */
  var PAYOUT = { credits: 100, usd: 8 };

  /* AI summaries shown on the creator dashboard, keyed by prototype id. */
  var AI_SUMMARY = {
    shelfquiet: {
      likes:    ["The 6-minute chunk feels achievable — 14 of 22 testers used the word 'small' positively.", "'The thread from yesterday' is the line testers quote back to you unprompted.", "Shelf photo onboarding beat manual entry in every session."],
      dislikes: ["9 testers couldn't tell if it tracks the book or replaces reading it.", "Nobody understood what happens when they finish — the loop just ends.", "Pricing page was skipped by 18 of 22. Would-pay is 18% because the value is undated."],
      next:     ["Rewrite the headline around finishing books, not minutes per day.", "Add a 'finished' moment: streak, shelf badge, next-book pick. It's the missing loop.", "Re-test with 25 people who own more than 10 unread books — your current testers own 3."]
    },
    loopcut: {
      likes:    ["Three candidate clips instead of one guess — testers said it made the AI feel trustworthy.", "Zero-timeline editing was called 'the whole point' in 11 sessions.", "Caption accuracy was praised even by testers who said 'not for me'."],
      dislikes: ["Caption typography looks unfinished and undercuts the output.", "30 seconds is wrong for both Slack and LinkedIn — the two places people actually paste it.", "Would-pay drops to 12% for people who record fewer than 3 calls a week."],
      next:     ["Ship two output lengths (10s and 60s) before anything else.", "Target people with recurring calls: sales, research, podcasting. That's where 38% becomes 60%.", "Fix the caption font — it's the cheapest trust win on the board."]
    }
  };

  global.PB = {
    BUILDERS: BUILDERS,
    PROTOTYPES: PROTOTYPES,
    GRAVEYARD: GRAVEYARD,
    FEEDS: FEEDS,
    CATEGORIES: CATEGORIES,
    MY_FIRST: MY_FIRST,
    AI_SUMMARY: AI_SUMMARY,
    PACKS: PACKS,
    BOOST: BOOST,
    PRO: PRO,
    PAYOUT: PAYOUT,
    ME: "niketan"
  };
})(window);
