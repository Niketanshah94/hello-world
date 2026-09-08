/* ProtoBuzz — clickable prototype.
   Vanilla JS, hash-routed. State lives in localStorage so a demo survives a refresh. */
(function () {
  "use strict";

  var D = window.PB;
  var main = document.getElementById("main");
  var aside = document.getElementById("aside");
  var sheetRoot = document.getElementById("sheet-root");
  var toastRoot = document.getElementById("toast-root");
  var sparkRoot = document.getElementById("spark-root");

  /* ------------------------------------------------------------------ utils */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function n(v) { return v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(v); }
  function byId(id) { return document.getElementById(id); }
  function reduced() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

  var STORE_KEY = "protobuzz.demo.v1";
  function loadState() {
    var base = {
      credits: 15,
      reactions: {},          /* id -> {useful:bool, pay:bool, nope:bool} */
      saved: [],
      follows: ["dev_kaz"],
      tested: {},             /* id -> {understood, use, pay, improve} */
      comments: {},           /* id -> [comment] */
      launched: [],           /* ids of prototypes the user submitted this session */
      earned: 0,              /* credits earned by testing — the only kind that cashes out */
      purchased: 0,           /* credits bought with money */
      boosted: [],            /* prototype ids on the paid tester panel */
      packs: [],              /* prototype ids with a Validation Pack */
      profile: null,          /* who this tester is — asked once, sold as targeting */
      emails: {},             /* prototype id -> emails left at a price (demo, local only) */
      outcomes: {},           /* prototype id -> shipped | pivoted | killed */
      postMortems: {},        /* prototype id -> what the builder learned */
      ledger: [{ label: "Welcome bonus", amount: 15, kind: "earn" }],
      theme: null
    };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        Object.keys(base).forEach(function (k) { if (saved[k] !== undefined) base[k] = saved[k]; });
      }
    } catch (e) { /* private mode, blocked storage — run from defaults */ }
    return base;
  }
  var S = loadState();
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) {}
  }

  /* Prototypes the user launched are stored as ids; their data lives here. */
  var CUSTOM = {};
  try {
    var rawC = localStorage.getItem(STORE_KEY + ".custom");
    if (rawC) CUSTOM = JSON.parse(rawC);
  } catch (e) {}
  function saveCustom() {
    try { localStorage.setItem(STORE_KEY + ".custom", JSON.stringify(CUSTOM)); } catch (e) {}
  }

  function allProtos() {
    var list = D.PROTOTYPES.slice();
    list.push(D.MY_FIRST);
    Object.keys(CUSTOM).forEach(function (k) { list.push(CUSTOM[k]); });
    return list;
  }
  function getProto(id) {
    var found = null;
    allProtos().forEach(function (p) { if (p.id === id) found = p; });
    return found;
  }
  function builder(handle) {
    return D.BUILDERS[handle] || { handle: handle, name: handle, hue: 40, rep: 50, followers: 0, bio: "", built: 0, launched: 0, killed: 0, tests: 0 };
  }
  function reactionsOf(id) {
    if (!S.reactions[id]) S.reactions[id] = { useful: false, pay: false, nope: false };
    return S.reactions[id];
  }
  function commentsOf(p) {
    return (p.comments || []).concat(S.comments[p.id] || []);
  }
  function isSaved(id) { return S.saved.indexOf(id) > -1; }
  function isFollowing(h) { return S.follows.indexOf(h) > -1; }
  function isTested(id) { return !!S.tested[id]; }

  /* ------------------------------------------------------- generated screenshots
     No external images are available, so every "screenshot" is a small SVG mock
     of that product's actual interface, keyed to its archetype and brand hue. */
  function mock(p, cls) {
    var H = p.hue;
    var c1 = "hsl(" + H + " 88% 62%)";
    var c2 = "hsl(" + H + " 62% 44%)";
    var body = "";
    var W = 320, T = 188;

    function r(x, y, w, h, fill, rad) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rad == null ? 3 : rad) + '" fill="' + fill + '"/>';
    }
    var soft = "rgba(255,255,255,.07)", line = "rgba(255,255,255,.16)", faint = "rgba(255,255,255,.1)";

    if (p.archetype === "editor") {
      body += r(0, 30, 52, 158, soft, 0);
      for (var i = 0; i < 4; i++) body += r(9, 42 + i * 15, 34, 6, faint);
      body += r(62, 40, 246, 96, "rgba(255,255,255,.05)", 8);
      body += '<circle cx="185" cy="88" r="18" fill="' + c1 + '" opacity=".92"/>';
      body += '<path d="M180 80l12 8-12 8z" fill="#0B0F10"/>';
      body += r(62, 146, 246, 30, soft, 6);
      body += r(66, 150, 58, 22, c1, 4) + r(128, 150, 34, 22, faint, 4) + r(166, 150, 74, 22, c2, 4) + r(244, 150, 26, 22, faint, 4);
    } else if (p.archetype === "chat") {
      body += r(20, 44, 168, 26, soft, 12);
      body += r(28, 52, 92, 5, line) + r(28, 61, 132, 5, faint);
      body += r(96, 82, 204, 34, c1, 12);
      body += r(106, 91, 150, 5, "rgba(0,0,0,.42)") + r(106, 101, 110, 5, "rgba(0,0,0,.28)");
      body += r(20, 126, 140, 22, soft, 11) + r(28, 134, 84, 5, line);
      body += r(20, 158, 280, 22, "rgba(255,255,255,.05)", 11);
      body += r(30, 166, 96, 6, faint) + '<circle cx="288" cy="169" r="8" fill="' + c1 + '"/>';
    } else if (p.archetype === "camera") {
      body += r(78, 40, 164, 88, "rgba(255,255,255,.05)", 8);
      var br = 'stroke="' + c1 + '" stroke-width="2.4" fill="none" stroke-linecap="round"';
      body += '<path d="M88 58v-8h10M232 58v-8h-10M88 110v8h10M232 110v8h-10" ' + br + '/>';
      body += '<circle cx="160" cy="84" r="15" fill="none" stroke="' + line + '" stroke-width="2"/>';
      body += r(30, 140, 82, 38, soft, 7) + r(119, 140, 82, 38, soft, 7) + r(208, 140, 82, 38, soft, 7);
      body += r(38, 148, 42, 5, c1) + r(38, 159, 62, 5, faint);
      body += r(127, 148, 50, 5, line) + r(127, 159, 58, 5, faint);
      body += r(216, 148, 38, 5, line) + r(216, 159, 62, 5, faint);
    } else if (p.archetype === "doc") {
      body += r(24, 40, 178, 140, "rgba(255,255,255,.05)", 6);
      var y = 52;
      for (var j = 0; j < 8; j++) {
        var w = [140, 156, 118, 148, 132, 160, 108, 144][j];
        var hl = (j === 2 || j === 5);
        body += r(36, y, w, 6, hl ? c1 : faint);
        if (hl) body += r(206, y - 3, 42, 12, "hsl(" + H + " 70% 55% / .28)", 3);
        y += 16;
      }
      body += r(214, 40, 82, 44, soft, 6) + r(222, 50, 42, 6, c1) + r(222, 62, 62, 5, faint) + r(222, 72, 50, 5, faint);
      body += r(214, 148, 82, 32, c2, 6) + r(226, 161, 58, 6, "rgba(0,0,0,.45)");
    } else if (p.archetype === "chart") {
      body += r(24, 40, 128, 40, soft, 6) + r(160, 40, 136, 40, soft, 6);
      body += r(34, 50, 30, 12, c1, 2) + r(34, 68, 62, 5, faint);
      body += r(170, 50, 40, 12, line, 2) + r(170, 68, 74, 5, faint);
      var pts = [176, 160, 168, 138, 146, 150, 128, 118, 132, 104];
      var d = "", dx = 24, step = (296 - 24) / (pts.length - 1);
      pts.forEach(function (v, k) { d += (k ? "L" : "M") + (dx + k * step).toFixed(1) + " " + v + " "; });
      body += '<path d="' + d + 'L296 180 L24 180 Z" fill="' + c1 + '" opacity=".16"/>';
      body += '<path d="' + d + '" fill="none" stroke="' + c1 + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
      body += '<circle cx="296" cy="104" r="4.5" fill="' + c1 + '"/>';
      body += r(24, 180, 272, 1, faint, 0);
    } else if (p.archetype === "timer") {
      body += '<circle cx="94" cy="112" r="46" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="9"/>';
      body += '<circle cx="94" cy="112" r="46" fill="none" stroke="' + c1 + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="204 289" transform="rotate(-90 94 112)"/>';
      body += r(74, 106, 40, 12, line, 2);
      body += r(156, 60, 140, 26, soft, 6) + r(166, 70, 62, 6, c1) + r(272, 68, 14, 10, c2, 2);
      body += r(156, 94, 140, 26, soft, 6) + r(166, 104, 84, 6, faint);
      body += r(156, 128, 140, 26, soft, 6) + r(166, 138, 48, 6, faint);
      body += r(156, 162, 140, 18, "rgba(255,255,255,.05)", 6);
    } else { /* grid */
      body += r(24, 38, 272, 18, soft, 4);
      var cols = [24, 92, 160, 228], rows = [60, 82, 104, 126, 148];
      rows.forEach(function (ry, ri) {
        cols.forEach(function (cx, ci) {
          var hot = (ri === 2 && ci === 2);
          body += r(cx, ry, 64, 18, hot ? "hsl(" + H + " 70% 55% / .3)" : "rgba(255,255,255,.05)", 3);
          body += r(cx + 7, ry + 6, ci === 0 ? 40 : 28, 6, hot ? c1 : faint);
        });
      });
      body += r(24, 166, 272, 16, c2, 4) + r(34, 172, 118, 5, "rgba(0,0,0,.42)");
    }

    /* The 320x188 drawing above is the app window; it sits inside a wider
       branded backdrop so the UI reads at screenshot scale on a large card. */
    var uid = "m" + p.id.replace(/[^a-z0-9]/gi, "");
    var chrome =
      '<rect width="' + W + '" height="' + T + '" fill="#0A1112"/>' +
      '<rect width="' + W + '" height="22" fill="rgba(255,255,255,.06)"/>' +
      '<circle cx="14" cy="11" r="2.6" fill="rgba(255,255,255,.22)"/><circle cx="24" cy="11" r="2.6" fill="rgba(255,255,255,.22)"/><circle cx="34" cy="11" r="2.6" fill="rgba(255,255,255,.22)"/>' +
      '<rect x="48" y="4.5" width="150" height="13" rx="6.5" fill="rgba(255,255,255,.08)"/>';

    return '<svg class="mock ' + (cls || "") + '" viewBox="0 0 512 300" role="img" aria-label="' + esc(p.name) + ' interface preview" preserveAspectRatio="xMidYMid slice">' +
      '<defs>' +
      '<radialGradient id="bg' + uid + '" cx="22%" cy="4%" r="92%">' +
      '<stop offset="0%" stop-color="hsl(' + H + ' 68% 44%)" stop-opacity=".72"/>' +
      '<stop offset="100%" stop-color="#070C0D" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="cp' + uid + '"><rect width="320" height="188" rx="9"/></clipPath>' +
      '</defs>' +
      '<rect width="512" height="300" fill="#070C0D"/>' +
      '<rect width="512" height="300" fill="url(#bg' + uid + ')"/>' +
      '<rect x="100" y="64" width="320" height="188" rx="10" fill="rgba(0,0,0,.42)"/>' +
      '<g transform="translate(96,56)">' +
      '<g clip-path="url(#cp' + uid + ')">' + chrome + body + '</g>' +
      '<rect width="320" height="188" rx="9" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="1"/>' +
      '</g></svg>';
  }

  /* --------------------------------------------------------------- hex badge */
  function scoreColor(v) {
    if (v >= 80) return "var(--mint)";
    if (v >= 65) return "var(--honey)";
    if (v >= 50) return "var(--slate)";
    return "var(--rose)";
  }
  function hex(score, size) {
    var big = size === "lg";
    var w = big ? 84 : 46, h = big ? 92 : 50;
    var col = scoreColor(score);
    return '<span class="hex ' + (big ? "lg" : "") + '" style="width:' + w + 'px;height:' + h + 'px">' +
      '<svg viewBox="0 0 84 92" width="' + w + '" height="' + h + '" aria-hidden="true">' +
      '<path d="M42 2 80 24v44L42 90 4 68V24z" fill="var(--surface)" stroke="' + col + '" stroke-width="' + (big ? 3 : 4) + '" stroke-linejoin="round"/>' +
      '<path d="M42 2 80 24v44L42 90 4 68V24z" fill="' + col + '" opacity=".12"/></svg>' +
      '<span class="hex-val" style="color:' + col + '"><b>' + score + '</b><span>score</span></span></span>';
  }

  function avatar(handle, cls) {
    var b = builder(handle);
    var initials = b.name.split(" ").map(function (x) { return x[0]; }).slice(0, 2).join("");
    return '<span class="avatar ' + (cls || "") + '" style="background:linear-gradient(150deg,hsl(' + b.hue + ' 85% 66%),hsl(' + b.hue + ' 70% 44%))" aria-hidden="true">' + esc(initials) + '</span>';
  }

  /* ------------------------------------------------------------------ icons */
  var ICON = {
    discover: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4-4"/></svg>',
    test:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3v6.2L4.6 18a2.4 2.4 0 0 0 2.1 3.5h10.6a2.4 2.4 0 0 0 2.1-3.5L14.5 9.2V3"/><path d="M8 3h8M7.6 14.5h8.8"/></svg>',
    submit:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5"/><path d="m5.5 11.5 6.5-6.5 6.5 6.5"/></svg>',
    board:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><rect x="4.5" y="11" width="4.5" height="6"/><rect x="9.8" y="6" width="4.5" height="11"/><rect x="15.1" y="13" width="4.5" height="4"/></svg>',
    lab:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.6 20.6 7.4v9.2L12 21.4 3.4 16.6V7.4z"/><circle cx="12" cy="12" r="3.2"/></svg>',
    useful:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V10l4.6-7.2a2 2 0 0 1 3.4 2L13.6 9H19a2.2 2.2 0 0 1 2.1 2.8l-1.9 7A2.4 2.4 0 0 1 16.9 21z"/><path d="M7 10H3.5v11H7"/></svg>',
    pay:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5v19"/><path d="M16.8 6.4c-1-1.2-2.7-1.9-4.6-1.9-2.7 0-4.6 1.3-4.6 3.3 0 4.7 9.6 2.4 9.6 7.4 0 2.1-2.1 3.4-5 3.4-2.2 0-4.1-.8-5.1-2.1"/></svg>',
    nope:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.6 15.4 6.8-6.8"/></svg>',
    comment:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 12.4c0 4.3-3.8 7.8-8.5 7.8-1 0-2-.2-2.9-.5L4 21.3l1.7-4.2a7.4 7.4 0 0 1-2.2-5.2c0-4.3 3.8-7.7 8.5-7.7s8.5 3.5 8.5 7.8Z"/></svg>',
    save:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.4L5.5 20.5v-16a1 1 0 0 1 1-1Z"/></svg>',
    share:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="17.5" cy="5.5" r="2.8"/><circle cx="6" cy="12" r="2.8"/><circle cx="17.5" cy="18.5" r="2.8"/><path d="m8.5 10.6 6.6-3.7M8.5 13.4l6.6 3.7"/></svg>',
    open:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14.5V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 19V8a1.5 1.5 0 0 1 1.5-1.5H10"/></svg>',
    back:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
    close:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:16px;height:16px"><path d="m6.5 6.5 11 11m0-11-11 11"/></svg>'
  };

  /* ------------------------------------------------------------- toast + fx */
  function toast(html, cls) {
    var t = document.createElement("div");
    t.className = "toast " + (cls || "");
    t.innerHTML = html;
    toastRoot.appendChild(t);
    setTimeout(function () {
      t.style.transition = "opacity .3s, transform .3s";
      t.style.opacity = "0"; t.style.transform = "translateY(8px)";
      setTimeout(function () { t.remove(); }, 320);
    }, 2600);
  }
  function sparks(x, y, count) {
    if (reduced()) return;
    for (var i = 0; i < (count || 14); i++) {
      (function (i) {
        var s = document.createElement("i");
        s.className = "spark";
        var ang = (Math.PI * 2 * i) / (count || 14) + Math.random() * 0.5;
        var dist = 60 + Math.random() * 90;
        s.style.left = x + "px"; s.style.top = y + "px";
        s.style.opacity = "1";
        s.style.transition = "transform .82s cubic-bezier(.15,.8,.3,1), opacity .82s ease-out";
        sparkRoot.appendChild(s);
        requestAnimationFrame(function () {
          s.style.transform = "translate(" + Math.cos(ang) * dist + "px," + (Math.sin(ang) * dist + 40) + "px) rotate(" + (Math.random() * 360) + "deg) scale(" + (0.5 + Math.random()) + ")";
          s.style.opacity = "0";
        });
        setTimeout(function () { s.remove(); }, 900);
      })(i);
    }
  }

  function addCredits(amount, label, originEl, kind) {
    kind = kind || (amount >= 0 ? "earn" : "spend");
    S.credits += amount;
    if (kind === "earn" && amount > 0) S.earned += amount;
    if (kind === "buy") S.purchased += amount;
    S.ledger.unshift({ label: label, amount: amount, kind: kind });
    S.ledger = S.ledger.slice(0, 12);
    save();
    paintCredits();
    if (amount > 0 && originEl) {
      var box = originEl.getBoundingClientRect();
      sparks(box.left + box.width / 2, box.top + box.height / 2, 16);
    }
    var pills = document.querySelectorAll(".credit-pill");
    Array.prototype.forEach.call(pills, function (p) {
      p.classList.remove("bump"); void p.offsetWidth; p.classList.add("bump");
    });
  }

  function paintCredits() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-credits]"), function (el) {
      el.textContent = S.credits;
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-credit-bar]"), function (bar) {
      bar.style.width = Math.min(100, (S.credits / 20) * 100) + "%";
    });
    var hint = document.querySelector("[data-credit-hint]");
    if (hint) {
      hint.textContent = S.credits >= 20
        ? "Enough to launch a prototype (20)"
        : (20 - S.credits) + " more to launch a prototype";
    }
  }

  /* -------------------------------------------------------------- components */
  function stagePill(stage) {
    return '<span class="chip chip-stage">' + esc(stage) + '</span>';
  }

  function metricsBlock(p) {
    return '<div class="metrics">' +
      '<div class="metric m-use"><div class="metric-top"><span class="metric-num">' + p.use + '%</span><span class="metric-label">would use</span></div><div class="meter"><i style="width:' + p.use + '%"></i></div></div>' +
      '<div class="metric m-pay"><div class="metric-top"><span class="metric-num">' + p.pay + '%</span><span class="metric-label">would pay</span></div><div class="meter"><i style="width:' + p.pay + '%"></i></div></div>' +
      '<div class="metric m-mail"><div class="metric-top"><span class="metric-num">' + signalOf(p).emails + '</span><span class="metric-label">left an email</span></div><div class="meter"><i style="width:' + Math.min(100, signalOf(p).rate * 4) + '%"></i></div></div>' +
      '</div>';
  }

  function reactionBar(p, opts) {
    var r = reactionsOf(p.id);
    var counts = p.reactions || { useful: 0, pay: 0, nope: 0 };
    var cN = commentsOf(p).length;
    return '<div class="actions">' +
      '<button class="react useful ' + (r.useful ? "on" : "") + '" data-react="useful" data-id="' + p.id + '" aria-pressed="' + r.useful + '">' + ICON.useful + '<span>Useful</span><span class="rc">' + n(counts.useful + (r.useful ? 1 : 0)) + '</span></button>' +
      '<button class="react pay ' + (r.pay ? "on" : "") + '" data-react="pay" data-id="' + p.id + '" aria-pressed="' + r.pay + '">' + ICON.pay + '<span>Would Pay</span><span class="rc">' + n(counts.pay + (r.pay ? 1 : 0)) + '</span></button>' +
      (opts && opts.full ? '<button class="react nope ' + (r.nope ? "on" : "") + '" data-react="nope" data-id="' + p.id + '" aria-pressed="' + r.nope + '">' + ICON.nope + '<span>Not for me</span></button>' : "") +
      '<span class="spacer"></span>' +
      '<button class="react ghost" data-go="#/p/' + p.id + '" title="Comments">' + ICON.comment + '<span class="rc">' + cN + '</span></button>' +
      '<button class="react save ghost ' + (isSaved(p.id) ? "on" : "") + '" data-save="' + p.id + '" aria-pressed="' + isSaved(p.id) + '" aria-label="Save">' + ICON.save + '</button>' +
      '<button class="react ghost" data-share="' + p.id + '" aria-label="Share">' + ICON.share + '</button>' +
      '</div>';
  }

  function card(p) {
    var b = builder(p.creator);
    var tested = isTested(p.id);
    return '<article class="card" data-card="' + p.id + '">' +
      '<div class="card-thumb" data-open="' + p.id + '" role="button" tabindex="0" aria-label="Try ' + esc(p.name) + '">' +
        mock(p) +
        '<div class="thumb-chips"><span class="chip">' + esc(p.category) + '</span>' + stagePill(p.stage) + '</div>' +
        '<div class="thumb-score">' + hex(p.score) + '</div>' +
        '<span class="thumb-try">' + ICON.open + ' Try it</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-title-row"><h3 class="card-name" data-go="#/p/' + p.id + '">' + esc(p.name) + '</h3></div>' +
        '<p class="card-tag">' + esc(p.tagline) + '</p>' +
        '<div class="byline">' + avatar(p.creator) + '<b data-go="#/u/' + p.creator + '">' + esc(b.name) + '</b>' +
          '<span class="dot-sep"></span><span>' + esc(p.posted) + '</span>' +
          '<span class="dot-sep"></span><span>' + p.testers + ' testers</span></div>' +
        metricsBlock(p) +
      '</div>' +
      (tested
        ? '<div class="test-strip"><p>✅ You tested this — earned 5 credits</p><button class="btn btn-ghost" data-go="#/p/' + p.id + '">See results</button></div>'
        : '<div class="test-strip"><p>' + (p.testers < 40 ? "Needs testers — your answers move the score" : "4 questions, about 90 seconds") + '</p><button class="btn btn-primary" data-test="' + p.id + '">Test &amp; earn 3</button></div>') +
      reactionBar(p) +
      '</article>';
  }

  function graveCard(g) {
    var b = builder(g.builder);
    return '<article class="grave">' +
      '<div class="grave-top">' + hex(g.score) +
        '<div style="flex:1;min-width:0">' +
          '<h3 class="grave-name">' + esc(g.name) + '</h3>' +
          '<p class="grave-meta">' + esc(g.category) + ' · ' + esc(g.time) + ' spent · killed by @' + esc(g.builder) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="grave-rows">' +
        '<div class="grave-row"><span class="gl">What they built</span>' + esc(g.built) + '</div>' +
        '<div class="grave-row"><span class="gl">Why they killed it</span>' + esc(g.why) + '</div>' +
        '<div class="grave-row learned"><span class="gl">What they learned</span>' + esc(g.learned) + '</div>' +
      '</div>' +
      '<div class="byline" style="margin-top:14px">' + avatar(g.builder) + '<b data-go="#/u/' + g.builder + '">' + esc(b.name) + '</b>' +
        '<span class="spacer"></span></div>' +
      '</article>';
  }

  /* ------------------------------------------------------------------ feeds */
  function feedList(id) {
    var list = allProtos().filter(function (p) { return !p.killed; });
    if (id === "trending") return list.slice().sort(function (a, b) { return (b.testers * b.score) - (a.testers * a.score); }).slice(0, 8);
    if (id === "needs")    return list.filter(function (p) { return p.testers < 40; }).sort(function (a, b) { return a.testers - b.testers; });
    if (id === "pay")      return list.filter(function (p) { return p.pay >= 35; }).sort(function (a, b) { return b.pay - a.pay; });
    if (id === "gems")     return list.filter(function (p) { return p.score >= 63 && p.views < 5000; }).sort(function (a, b) { return b.score - a.score; });
    return list;
  }

  /* ------------------------------------------------------------------ views */
  var VIEW = {};

  VIEW.discover = function (params) {
    var feed = params.feed || "trending";
    var def = null;
    D.FEEDS.forEach(function (f) { if (f.id === feed) def = f; });

    var tabs = '<div class="feedtabs" role="tablist" aria-label="Feeds">' + D.FEEDS.map(function (f) {
      return '<button class="tab" role="tab" aria-selected="' + (f.id === feed) + '" data-feed="' + f.id + '">' +
        '<span aria-hidden="true">' + f.emoji + '</span> ' + esc(f.label) + '</button>';
    }).join("") + '</div>';

    var head = '<div class="page-head">' +
      '<p class="page-kicker">Discover</p>' +
      '<h1 class="page-title">The internet tests your idea<br>before you build it</h1>' +
      '<p class="page-sub">Real prototypes, tested by people who used them. Not likes — answers.</p>' +
      '</div>';

    var body;
    if (feed === "grave") {
      var o = D.OUTCOMES;
      var mineDead = Object.keys(S.postMortems || {}).map(function (k) {
        var pm = S.postMortems[k];
        return { id: k, name: pm.name, builder: D.ME, time: "31 days", score: pm.score, category: pm.category,
          built: pm.name + " — " + (getProto(k) ? getProto(k).tagline : ""), why: "Killed after " + pm.testers + " testers.", learned: pm.text };
      });
      var outcomePanel = '<div class="panel outcome-stats">' +
        '<div class="ai-head" style="color:var(--text-3)">The only dataset nobody else has</div>' +
        '<p style="font-size:15px;font-weight:600;margin:10px 0 14px">Prototypes that scored 75+ shipped ' +
        Math.round(o.lines[0][1] / o.lines[2][1]) + '× more often than those under 50.</p>' +
        o.lines.map(function (l) {
          return '<div class="stat-row"><div class="stat-val" style="color:var(--text)">' + l[1] + '%</div>' +
            '<div class="stat-body"><div class="stat-name">' + esc(l[0]) + ' — ' + esc(l[2]) + '</div>' +
            '<div class="stat-track"><i style="width:' + l[1] + '%;background:var(--mint)"></i></div></div></div>';
        }).join("") +
        '<p class="muted" style="margin-top:12px">' + esc(o.note) + '</p></div>';

      body = '<div class="feed">' + outcomePanel + mineDead.map(graveCard).join("") + D.GRAVEYARD.map(graveCard).join("") +
        '<div class="panel panel-quiet" style="text-align:center">' +
        '<p class="muted">Killed something yourself? Publishing it is worth <b class="mono">+5 credits</b> — the graveyard is the most-read feed on ProtoBuzz.</p>' +
        '<button class="btn btn-ghost" style="margin-top:12px" data-go="#/lab">Publish a post-mortem</button></div></div>';
    } else {
      var list = feedList(feed);
      body = '<p class="muted" style="margin:2px 0 14px">' + esc(def ? def.blurb : "") + ' · <b>' + list.length + '</b> prototypes</p>' +
        '<div class="feed">' + list.map(card).join("") + '</div>';
    }
    return head + tabs + body;
  };

  VIEW.test = function () {
    var queue = allProtos().filter(function (p) { return !isTested(p.id) && p.creator !== D.ME; })
      .sort(function (a, b) { return a.testers - b.testers; });
    var done = Object.keys(S.tested).length;

    var head = '<div class="page-head">' +
      '<p class="page-kicker">Test · earn</p>' +
      '<h1 class="page-title">Test queue</h1>' +
      '<p class="page-sub">Four questions each, about 90 seconds. Every full test is worth 5 credits — 3 for testing, 2 more when you write the one thing you would improve.</p>' +
      '</div>';

    var stats = '<div class="lab-stats" style="margin-bottom:18px">' +
      '<div class="lab-stat"><b>' + done + '</b><span>tested</span></div>' +
      '<div class="lab-stat"><b class="mono">' + S.credits + '</b><span>credits</span></div>' +
      '<div class="lab-stat"><b>' + (done * 5) + '</b><span>earned</span></div>' +
      '<div class="lab-stat"><b>' + queue.length + '</b><span>in queue</span></div>' +
      '</div>' +
      '<div class="cost-note" style="margin-bottom:18px"><span class="credit-coin" style="color:var(--honey)"></span>' +
      '<span>In a hurry? ' + D.PACKS[0].credits + ' credits for ' + money(D.PACKS[0].price) + ' launches you today — but only testing raises your builder rank.</span>' +
      '<button class="btn btn-outline" style="margin-left:auto;flex:none" data-buy-credits="Skip the queue">Buy</button></div>';

    if (!queue.length) {
      return head + stats + '<div class="empty"><h3>Queue empty</h3><p>You have tested everything in front of you. Come back tomorrow, or launch something of your own.</p><button class="btn btn-primary" style="margin-top:16px" data-go="#/submit">Submit a prototype</button></div>';
    }

    var rows = queue.map(function (p) {
      return '<div class="mini" data-go="#/p/' + p.id + '">' +
        mock(p, "mini-mock") +
        '<div class="mini-body"><div class="mini-name">' + esc(p.name) + '</div>' +
        '<div class="mini-sub">' + esc(p.category) + ' · ' + p.testers + ' testers · needs ' + Math.max(1, 40 - p.testers) + ' more</div></div>' +
        '<div class="mini-right"><button class="btn btn-primary" data-test="' + p.id + '">Test +3</button></div></div>';
    }).join("");

    return head + stats + '<div class="mini-list">' + rows + '</div>';
  };

  VIEW.saved = function () {
    var list = S.saved.map(getProto).filter(Boolean);
    var head = '<button class="back-link" data-back>' + ICON.back + ' Back</button><div class="page-head"><p class="page-kicker">My Lab</p><h1 class="page-title">Saved</h1></div>';
    if (!list.length) return head + '<div class="empty"><h3>Nothing saved yet</h3><p>Tap the bookmark on any prototype to keep it here.</p></div>';
    return head + '<div class="feed">' + list.map(card).join("") + '</div>';
  };

  /* ------------------------------------------------------- prototype page */
  function verdictLine(p) {
    if (p.pay >= 45) return "People would pay. Build it.";
    if (p.use >= 70 && p.pay < 30) return "Loved, not bought. Find the buyer.";
    if (p.understood < 70) return "Misunderstood before it is judged.";
    if (p.testers < 30) return "Too early to call — needs testers.";
    if (p.score < 55) return "Weak signal. Change the idea, not the copy.";
    return "Useful to a real group. Narrow it.";
  }

  VIEW.proto = function (params) {
    var p = getProto(params.id);
    if (!p) return '<div class="empty"><h3>Prototype not found</h3></div>';
    var b = builder(p.creator);
    var mine = p.creator === D.ME;
    var tested = isTested(p.id);
    var cs = commentsOf(p);

    var stat = function (label, val, color, sub) {
      return '<div class="stat-row"><div class="stat-val" style="color:' + color + '">' + val + '%</div>' +
        '<div class="stat-body"><div class="stat-name">' + esc(label) + (sub ? ' <span class="muted">' + esc(sub) + '</span>' : '') + '</div>' +
        '<div class="stat-track"><i style="width:' + val + '%;background:' + color + '"></i></div></div></div>';
    };

    var hero = '<div class="proto-hero">' +
      '<div class="card-thumb" data-open="' + p.id + '" role="button" tabindex="0" aria-label="Open ' + esc(p.name) + '">' +
        mock(p) + '<div class="thumb-chips"><span class="chip">' + esc(p.category) + '</span>' + stagePill(p.stage) + '</div>' +
        '<span class="thumb-try">' + ICON.open + ' Open prototype</span></div>' +
      '<div class="proto-head">' +
        '<h1 class="proto-title">' + esc(p.name) + '</h1>' +
        '<p class="proto-tag">' + esc(p.tagline) + '</p>' +
        '<button class="proto-url" data-open="' + p.id + '">' + ICON.open + esc(p.url) + '</button>' +
      '</div>' +
      '<div class="score-panel">' + hex(p.score, "lg") +
        '<div class="verdict"><div class="verdict-label">Validation score</div>' +
        '<div class="verdict-line">' + esc(verdictLine(p)) + '</div>' +
        '<p class="muted" style="margin-top:6px">' + p.testers + ' verified testers · ' + n(p.views) + ' views · ' + n(p.visits) + ' opened it</p></div>' +
      '</div>' +
      '<div class="stat-rows">' +
        stat("Understood what it does", p.understood, "var(--text-2)") +
        stat("Would use it", p.use, "var(--honey)") +
        stat("Would pay something", p.pay, "var(--mint)", "asking " + priceOf(p)) +
      '</div>' +
      '<div class="signal-strip"><div><b class="mono">' + signalOf(p).emails + ' of ' + p.testers + '</b> left an email at ' + esc(priceOf(p)) + '</div>' +
      '<button class="section-more" data-go="#/report/' + p.id + '">Read the report</button></div>' +
      '</div>';

    var cta = '<div class="sticky-cta">' +
      (mine
        ? '<button class="btn btn-primary btn-lg btn-block" data-go="#/dash/' + p.id + '">Open creator dashboard</button>'
        : tested
          ? '<button class="btn btn-ghost btn-lg" style="flex:1" data-open="' + p.id + '">Open again</button><button class="btn btn-mint btn-lg" data-go="#/test">Test another +3</button>'
          : '<button class="btn btn-ghost btn-lg" data-open="' + p.id + '">' + ICON.open + '</button><button class="btn btn-primary btn-lg" style="flex:1" data-test="' + p.id + '">Test &amp; earn 3 credits</button>') +
      '</div>';

    var about = '<div class="section"><div class="section-head"><h2 class="section-title">What it is</h2></div>' +
      '<div class="panel"><p style="font-size:15px;line-height:1.55">' + esc(p.about) + '</p>' +
      '<div class="divider"></div>' +
      '<div class="ai-head" style="color:var(--text-3)">Creator wants feedback on</div>' +
      '<p style="margin-top:8px;font-size:15.5px;font-weight:600">“' + esc(p.askedFor) + '”</p></div></div>';

    var segSection = '<div class="section"><div class="section-head"><h2 class="section-title">Where the signal is</h2>' +
      '<span class="muted">by who they are</span></div>' + segmentBlock(p, true) + '</div>';

    var creator = '<div class="section"><div class="panel" style="display:flex;gap:13px;align-items:center">' +
      avatar(p.creator, "lg") +
      '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:16px">' + esc(b.name) + '</div>' +
      '<div class="muted mono">@' + esc(b.handle) + ' · ' + n(b.followers) + ' followers · rep ' + b.rep + '</div></div>' +
      (mine ? '<button class="btn btn-ghost" data-go="#/lab">My Lab</button>'
            : '<button class="btn-follow" data-follow="' + b.handle + '" aria-pressed="' + isFollowing(b.handle) + '">' + (isFollowing(b.handle) ? "Following" : "Follow") + '</button>') +
      '</div></div>';

    var commentHtml = cs.map(function (c) {
      var cb = builder(c.by);
      var tagClass = c.verdict === "pay" ? "tag-pay" : c.verdict === "nope" ? "tag-nope" : "tag-use";
      var tagText = c.verdict === "pay" ? "Would pay" : c.verdict === "nope" ? "Not for me" : "Would use";
      return '<div class="comment">' + avatar(c.by) +
        '<div class="comment-body"><div class="comment-top"><b data-go="#/u/' + c.by + '">' + esc(cb.name) + '</b>' +
        '<span class="tag ' + tagClass + '">' + tagText + '</span>' +
        (c.tested ? '<span class="tag tag-verified">✓ tested</span>' : '') +
        '<span>' + esc(c.when) + '</span></div>' +
        '<p class="comment-text">' + esc(c.text) + '</p>' +
        '<div class="comment-foot"><button data-up>▲ ' + (c.up || 0) + ' helpful</button><button>Reply</button></div>' +
        '</div></div>';
    }).join("");

    var composer = '<div class="composer">' + avatar(D.ME) +
      '<div style="flex:1"><textarea id="comment-box" placeholder="' + (tested ? "Add to your feedback…" : "Test it first, then your feedback carries a ✓ verified badge") + '"></textarea>' +
      '<div class="composer-foot"><span class="composer-hint">' + (tested ? "Useful feedback earns +2 credits" : "Untested comments do not earn credits") + '</span>' +
      '<button class="btn btn-primary" data-comment="' + p.id + '">Post</button></div></div></div>';

    var comments = '<div class="section"><div class="section-head"><h2 class="section-title">Feedback</h2>' +
      '<span class="muted">' + cs.length + ' from verified testers</span></div>' +
      '<div class="panel">' + (commentHtml || '<p class="muted">No feedback yet. Be the first tester.</p>') + composer + '</div></div>';

    return '<button class="back-link" data-back>' + ICON.back + ' Back to feed</button>' + hero + cta + about + segSection + creator + comments + reactionBar(p, { full: true });
  };

  /* --------------------------------------------------------------- sheets */
  var sheetState = null;
  var dirty = false;   /* set when a sheet changed data the page behind it shows */

  function openSheet(html, title, headExtra) {
    sheetRoot.hidden = false;
    sheetRoot.innerHTML = '<div class="sheet-scrim" data-close-sheet></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="sheet-head"><h3>' + esc(title) + '</h3>' + (headExtra || "") +
      '<button class="sheet-close" data-close-sheet aria-label="Close">' + ICON.close + '</button></div>' +
      '<div class="sheet-body">' + html + '</div></div>';
    document.body.style.overflow = "hidden";
    document.body.classList.add("sheet-open");
    var focusable = sheetRoot.querySelector("button, textarea");
    if (focusable) focusable.focus();
  }
  function hideSheet() {
    sheetRoot.hidden = true;
    sheetRoot.innerHTML = "";
    sheetState = null;
    document.body.style.overflow = "";
    document.body.classList.remove("sheet-open");
  }
  function closeSheet() {
    hideSheet();
    if (dirty) { dirty = false; render(); }
  }

  /* Step 0 — "open" the prototype. Live sites can't be framed here, so this is
     an honest simulation of the testing session, not a fake browser. */
  function openPrototype(id) {
    var p = getProto(id);
    if (!p) return;
    var body = '<div class="preview-frame">' +
      '<div class="preview-bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">https://' + esc(p.url) + '</span><span class="timer" id="test-timer">0:00</span></div>' +
      mock(p) + '</div>' +
      '<div class="preview-note">' + ICON.open +
      '<span>In the real product this opens ' + esc(p.url) + ' in a new tab and starts your session clock. In this prototype it is simulated, so the flow stays clickable.</span></div>' +
      '<div class="rowgap" style="margin-top:16px">' +
      (isTested(p.id)
        ? '<button class="btn btn-ghost btn-block" data-close-sheet>Done</button>'
        : '<button class="btn btn-primary btn-lg btn-block" data-test="' + p.id + '">I tried it — answer 4 questions</button>') +
      '</div>';
    openSheet(body, p.name);

    var t = 0, el = byId("test-timer");
    var tick = setInterval(function () {
      if (!document.body.contains(el)) return clearInterval(tick);
      t++;
      el.textContent = Math.floor(t / 60) + ":" + String(t % 60).padStart(2, "0");
    }, 1000);
  }

  /* ---------------------------------------------------------- testing flow */
  var QUESTIONS = [
    { key: "understood", q: "Did you understand what it does?", help: "Answer from the first 15 seconds, not after figuring it out.",
      opts: [["Instantly", "y"], ["After a minute", "m"], ["Still not sure", "n"]] },
    { key: "use", q: "Would you use it?", help: "Honestly — this week, for something you actually do.",
      opts: [["Yes, this week", "y"], ["Maybe later", "m"], ["No", "n"]] },
    { key: "pay", q: "What would you pay for it?", bands: true,
      opts: [["Nothing", "none"], ["Under $5 a month", "low"], ["$5–15 a month", "mid"], ["$15+ a month", "high"]] },
    { key: "improve", q: "What is the one thing you would improve?", help: "One sentence. This is the part builders actually read.", text: true }
  ];

  var PAY_WEIGHT = { none: 0, low: 0.35, mid: 0.75, high: 1 };

  var PROFILE_Q = [
    { key: "role", label: "You are a", opts: ["Developer", "Designer", "Founder", "Something else"] },
    { key: "cadence", label: "You ship", opts: ["Weekly", "Monthly", "Rarely"] },
    { key: "paid", label: "Tools like this", opts: ["I have paid for one", "Never paid"] }
  ];


  /* --------------------------------------------------------- signal & segments
     "Would you pay?" is the least reliable question in research, so the platform
     asks for a price band and then for an email at that price. The email is the
     only number a builder can act on, so it is the one the report leads with. */
  function hashOf(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
    return h;
  }

  function priceOf(p) { return D.PRICES[p.id] || "$9/mo"; }

  function signalOf(p) {
    var extra = (S.emails[p.id] || []).length;
    var emails = Math.round(p.testers * (p.pay / 100) * 0.28) + extra;
    var pay = p.pay;
    return {
      price: priceOf(p),
      emails: emails,
      rate: p.testers ? Math.round((emails / p.testers) * 100) : 0,
      bands: [
        { label: "Nothing", pct: Math.max(0, 100 - pay), none: true },
        { label: "Under $5", pct: Math.round(pay * 0.33) },
        { label: "$5–15", pct: Math.round(pay * 0.45) },
        { label: "$15+", pct: Math.round(pay * 0.22) }
      ]
    };
  }

  var SEG_DEFAULT = ["Uses tools like this weekly", "Has paid for one before", "First time seeing this"];
  function segmentsOf(p) {
    if (p.testers < 12) return null;   /* too small a sample to cut honestly */
    var labels = D.SEGMENTS[p.category] || SEG_DEFAULT;
    var spread = hashOf(p.id) % 7;     /* deterministic per prototype */
    var rows = [
      { w: 0.42, du: 14 + spread, dp: 21 + spread },
      { w: 0.34, du: -2, dp: -4 },
      { w: 0.24, du: -22 - spread, dp: -26 - spread }
    ];
    var clamp = function (v) { return Math.max(2, Math.min(99, Math.round(v))); };
    return rows.map(function (r, i) {
      var nSeg = Math.round(p.testers * r.w);
      return {
        label: labels[i],
        n: nSeg,
        use: clamp(p.use + r.du),
        pay: clamp(p.pay + r.dp),
        emails: Math.round(nSeg * (clamp(p.pay + r.dp) / 100) * 0.28)
      };
    });
  }

  /* Reputation is earned, never bought — the rule that keeps both loops alive. */
  function myRep() {
    return Math.min(99, builder(D.ME).rep + Object.keys(S.tested).length * 2);
  }

  function money(v) {
    return "$" + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2));
  }

  function scoreFormula(pr) {
    return Math.round(pr.understood * 0.25 + pr.use * 0.4 + pr.pay * 0.35) + Math.min(8, Math.round(pr.testers / 20));
  }

  function startTest(id) {
    var p = getProto(id);
    if (!p) return;
    sheetState = { id: id, step: 0, answers: {}, stage: S.profile ? "q" : "profile", draftProfile: {} };
    renderTestStep();
  }

  /* Asked once. It is also the thing builders pay to target. */
  function renderProfileStep() {
    var st = sheetState;
    var body = '<p class="q-num">One time only</p>' +
      '<h2 class="q-title">Who is testing?</h2>' +
      '<p class="q-help">Answered once, then never again. Feedback from a named kind of person is worth more than feedback from nobody in particular.</p>' +
      PROFILE_Q.map(function (q) {
        return '<div class="field" style="margin-top:18px"><label>' + esc(q.label) + '</label>' +
          '<div class="pickers">' + q.opts.map(function (o) {
            return '<button class="pick" data-profile="' + q.key + '" data-val="' + esc(o) + '" aria-pressed="' +
              (st.draftProfile[q.key] === o) + '">' + esc(o) + '</button>';
          }).join("") + '</div></div>';
      }).join("") +
      '<button class="btn btn-primary btn-lg btn-block" style="margin-top:20px" data-profile-done>Start testing</button>';
    openSheet(body, "Your tester profile");
  }

  /* The email is the whole point: a name attached to a price. */
  function renderEmailStep() {
    var st = sheetState;
    var p = getProto(st.id);
    var band = QUESTIONS[2].opts.filter(function (o) { return o[1] === st.answers.pay; })[0];
    var body = '<p class="q-num">The part that counts</p>' +
      '<h2 class="q-title">Want it at ' + esc(band ? band[0].toLowerCase() : "that price") + '?</h2>' +
      '<p class="q-help">Leave an email and ' + esc(builder(p.creator).name.split(" ")[0]) +
      ' can tell you when it ships. Saying you would pay costs nothing; this does not — which is why it is the number the report leads with.</p>' +
      '<input class="input" id="signal-email" type="email" inputmode="email" placeholder="you@example.com" />' +
      '<p class="muted" style="margin-top:8px">Demo: the address stays in this browser and is never sent anywhere.</p>' +
      '<div class="rowgap" style="margin-top:16px">' +
      '<button class="btn btn-primary btn-lg" style="flex:1" data-email-send>Send it</button>' +
      '<button class="btn btn-ghost" data-email-skip>No thanks</button></div>';
    openSheet(body, "Testing " + p.name);
  }

  function renderTestStep() {
    var st = sheetState;
    if (st.stage === "profile") return renderProfileStep();
    if (st.stage === "email") return renderEmailStep();
    var p = getProto(st.id);
    var q = QUESTIONS[st.step];
    var dots = '<div class="progress-dots" aria-hidden="true">' +
      QUESTIONS.map(function (_, i) { return '<i class="' + (i <= st.step ? "done" : "") + '"></i>'; }).join("") + '</div>';

    var help = q.bands
      ? "Pick the band you would actually put on a card. " + esc(p.name) + " is asking " + esc(priceOf(p)) + "."
      : q.help;
    var body = '<p class="q-num">Question ' + (st.step + 1) + " of 4 · " + esc(p.name) + '</p>' +
      '<h2 class="q-title">' + esc(q.q) + '</h2>' +
      '<p class="q-help">' + esc(help) + '</p>';

    if (q.text) {
      body += '<textarea class="q-textarea" id="improve-box" placeholder="e.g. Show the generated formula — trust comes from the escape hatch.">' + esc(st.answers.improve || "") + '</textarea>' +
        '<div class="rowgap" style="margin-top:16px;align-items:center">' +
        '<button class="btn btn-primary btn-lg" style="flex:1" data-finish>Submit feedback</button>' +
        '<button class="btn btn-ghost" data-finish data-skip>Skip (+3 only)</button></div>' +
        '<p class="muted" style="margin-top:12px">Testing pays 3. A written improvement pays 2 more, and gets a ✓ verified badge on your comment.</p>';
    } else {
      body += '<div class="q-options">' + q.opts.map(function (o, i) {
        return '<button class="q-opt ' + (st.answers[q.key] === o[1] ? "sel" : "") + '" data-answer="' + o[1] + '">' +
          '<span class="k">' + (i + 1) + '</span>' + esc(o[0]) + '</button>';
      }).join("") + '</div>';
    }
    openSheet(body, "Testing " + p.name, dots);
  }

  function finishTest(skip) {
    var st = sheetState;
    var p = getProto(st.id);
    var box = byId("improve-box");
    var improve = box ? box.value.trim() : "";
    if (skip) improve = "";

    S.tested[p.id] = { understood: st.answers.understood, use: st.answers.use, pay: st.answers.pay, improve: improve };

    /* Testing moves the prototype's real numbers — that is the whole point.
       The score keeps its authored baseline via an offset, so one honest test
       nudges it instead of snapping it to a formula. */
    var beforeScore = p.score;
    if (p.scoreOffset == null) p.scoreOffset = p.score - scoreFormula(p);
    var t = p.testers + 1;
    function blend(pct, w) { return Math.round(((pct / 100) * p.testers + w) / t * 100); }
    function w3(v) { return v === "y" ? 1 : v === "m" ? 0.5 : 0; }
    p.understood = blend(p.understood, w3(st.answers.understood));
    p.use = blend(p.use, w3(st.answers.use));
    p.pay = blend(p.pay, PAY_WEIGHT[st.answers.pay] || 0);
    p.testers = t;
    p.score = Math.max(1, Math.min(99, scoreFormula(p) + p.scoreOffset));
    var delta = p.score - beforeScore;

    if (st.answers.email) {
      if (!S.emails[p.id]) S.emails[p.id] = [];
      S.emails[p.id].push({ at: priceOf(p), band: st.answers.pay });
    }

    var earned = 3;
    if (improve) {
      earned = 5;
      var verdict = (st.answers.pay === "high" || st.answers.pay === "mid") ? "pay" : st.answers.use === "n" ? "nope" : "use";
      if (!S.comments[p.id]) S.comments[p.id] = [];
      S.comments[p.id].push({ by: D.ME, verdict: verdict, tested: true, when: "just now", text: improve, up: 0 });
    }
    save();
    if (CUSTOM[p.id]) { CUSTOM[p.id] = p; saveCustom(); }

    var body = '<div class="reward">' +
      '<span class="reward-hex"><svg viewBox="0 0 84 92" width="104" height="114" aria-hidden="true">' +
      '<path d="M42 2 80 24v44L42 90 4 68V24z" fill="var(--honey)"/></svg>' +
      '<span class="n">+' + earned + '</span></span>' +
      '<h3>' + earned + ' credits earned</h3>' +
      '<p>' + (improve ? "Your improvement is now on " + esc(p.name) + " with a ✓ verified tester badge." : "Test logged. Writing one sentence would have earned 2 more.") + '</p>' +
      '<div class="reward-ledger">' +
      '<div class="ledger-row"><span>Tested ' + esc(p.name) + '</span><b class="plus">+3</b></div>' +
      (improve ? '<div class="ledger-row"><span>Useful feedback</span><b class="plus">+2</b></div>' : '') +
      (st.answers.email ? '<div class="ledger-row"><span>Left an email at ' + esc(priceOf(p)) + '</span><b class="plus">signal</b></div>' : '') +
      '<div class="ledger-row"><span><b>Balance</b></span><b>' + (S.credits + earned) + '</b></div>' +
      '</div>' +
      '<div class="panel panel-quiet" style="text-align:left;margin-top:6px">' +
      '<p class="muted">' + (delta === 0
        ? 'Your answers are counted. ' + esc(p.name) + ' holds at '
        : (delta > 0 ? 'You pushed ' : 'You pulled ') + esc(p.name) + ' ' + Math.abs(delta) + ' point' + (Math.abs(delta) === 1 ? '' : 's') + ' ' + (delta > 0 ? 'up' : 'down') + ', to ') +
        '<b class="mono" style="color:' + scoreColor(p.score) + '">' + p.score + '/100</b> across ' + p.testers + ' testers.</p></div>' +
      '<div class="rowgap" style="margin-top:18px">' +
      '<button class="btn btn-primary btn-block" data-test-next>Test another prototype</button>' +
      '<button class="btn btn-ghost btn-block" data-close-sheet>Back to ' + esc(p.name) + '</button>' +
      (S.credits + earned >= 20 ? '<button class="btn btn-mint btn-block" data-go="#/submit" data-close-after>You can launch your own now (20 credits)</button>' : '') +
      '</div></div>';

    dirty = true;
    openSheet(body, "Test complete");
    addCredits(earned, "Tested " + p.name, sheetRoot.querySelector(".reward-hex"));
  }

  /* ---------------------------------------------------------- submit flow */
  var draft = { url: "", name: "", built: "", feedback: "", category: "", stage: "", step: 1 };

  VIEW.submit = function () {
    var afford = S.credits >= 20;
    var steps = '<div class="steps">' +
      [1, 2, 3].map(function (i) {
        var labels = { 1: "Paste URL", 2: "Describe it", 3: "Launch" };
        return '<span class="step ' + (draft.step === i ? "on" : draft.step > i ? "done" : "") + '"><i>' + (draft.step > i ? "✓" : i) + '</i>' + labels[i] + '</span>' +
          (i < 3 ? '<span class="step-line"></span>' : '');
      }).join("") + '</div>';

    var head = '<div class="page-head"><p class="page-kicker">Submit</p>' +
      '<h1 class="page-title">Launch a prototype</h1>' +
      '<p class="page-sub">Paste a URL and answer three questions. Testers arrive within an hour.</p></div>';

    var cost = '<div class="cost-note ' + (afford ? "" : "blocked") + '">' +
      '<span class="credit-coin" style="color:' + (afford ? "var(--honey)" : "var(--rose)") + '"></span>' +
      (afford
        ? '<span>Launching costs <b>20 credits</b>. You have <b data-credits>' + S.credits + '</b> — enough to launch now.</span>'
        : (function () {
          var need = Math.ceil((20 - S.credits) / 5);
          return '<span>Launching costs <b>20 credits</b>. You have <b data-credits>' + S.credits + '</b>. Test ' + need + ' more prototype' + (need === 1 ? '' : 's') + ' to get there.</span>';
        })()) +
      (afford ? '' : '<button class="btn btn-outline" style="margin-left:auto;flex:none" data-buy-credits="Short on credits">Buy ' + money(D.PACKS[0].price) + '</button>') +
      '</div>';

    var body;
    if (draft.step === 1) {
      body = '<div class="panel"><div class="field">' +
        '<label for="f-url">Prototype URL</label>' +
        '<input class="input url-input" id="f-url" type="url" inputmode="url" placeholder="https://shelfquiet.app/try" value="' + esc(draft.url) + '" />' +
        '<p class="hint">Anything a tester can open: a live demo, a Figma link, a Replit, a landing page.</p></div>' +
        '<div class="field"><label for="f-name">Prototype name</label>' +
        '<input class="input" id="f-name" placeholder="Shelfquiet" value="' + esc(draft.name) + '" /></div>' +
        '<button class="btn btn-primary btn-lg btn-block" data-draft-next="1">Continue</button></div>';
    } else if (draft.step === 2) {
      body = '<div class="panel">' +
        '<div class="field"><label for="f-built">What did you build?</label>' +
        '<textarea id="f-built" placeholder="One line a stranger would understand.">' + esc(draft.built) + '</textarea></div>' +
        '<div class="field"><label for="f-feedback">What do you want feedback on?</label>' +
        '<textarea id="f-feedback" placeholder="The one question you cannot answer yourself.">' + esc(draft.feedback) + '</textarea></div>' +
        '<div class="field"><label>Category</label><div class="pickers" id="f-cat">' +
        D.CATEGORIES.map(function (c) { return '<button class="pick" data-cat="' + esc(c) + '" aria-pressed="' + (draft.category === c) + '">' + esc(c) + '</button>'; }).join("") +
        '</div></div>' +
        '<div class="field"><label>Stage</label><div class="pickers" id="f-stage">' +
        ["Concept", "Prototype", "MVP", "Live"].map(function (s) { return '<button class="pick" data-stage="' + s + '" aria-pressed="' + (draft.stage === s) + '">' + s + '</button>'; }).join("") +
        '</div></div>' +
        '<div class="rowgap"><button class="btn btn-ghost" data-draft-back>Back</button>' +
        '<button class="btn btn-primary btn-lg" style="flex:1" data-draft-next="2">Continue</button></div></div>';
    } else {
      var preview = {
        id: "draft", name: draft.name || "Untitled", hue: 44, archetype: "grid",
        tagline: draft.built || "—", creator: D.ME, category: draft.category || "Consumer",
        stage: draft.stage || "Prototype", url: (draft.url || "example.com").replace(/^https?:\/\//, ""),
        score: 0, testers: 0, understood: 0, use: 0, pay: 0, posted: "just now", views: 0, visits: 0
      };
      body = '<div class="panel"><p class="ai-head" style="color:var(--text-3)">This is what testers will see</p>' +
        '<div style="margin-top:12px;border:1px solid var(--line);border-radius:var(--r-lg);overflow:hidden">' +
        '<div style="position:relative">' + mock(preview) +
        '<div class="thumb-chips"><span class="chip">' + esc(preview.category) + '</span>' + stagePill(preview.stage) + '</div></div>' +
        '<div class="card-body"><h3 class="card-name">' + esc(preview.name) + '</h3>' +
        '<p class="card-tag">' + esc(preview.tagline) + '</p>' +
        '<div class="byline">' + avatar(D.ME) + '<b>Niketan</b><span class="dot-sep"></span><span class="mono">' + esc(preview.url) + '</span></div></div></div>' +
        '<div class="divider"></div>' +
        '<p class="muted">Feedback question testers will answer:</p>' +
        '<p style="font-weight:600;margin-top:6px">“' + esc(draft.feedback || "—") + '”</p>' +
        '<div class="divider"></div>' + cost +
        (afford
          ? '<button class="btn btn-primary btn-lg btn-block" data-launch>Launch prototype · −20 credits</button>'
          : '<button class="btn btn-primary btn-lg btn-block" data-buy-credits="Launch ' + esc(draft.name || "your prototype") + '">Buy 20 credits · ' + money(D.PACKS[0].price) + '</button>' +
            '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-go="#/test">Or test ' + Math.ceil((20 - S.credits) / 5) + ' prototypes — free</button>') +
        '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-draft-back>Back</button></div>';
    }
    return head + steps + (draft.step === 3 ? "" : cost) + body;
  };

  function launchPrototype() {
    var id = (draft.name || "prototype").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "prototype";
    if (getProto(id)) id = id + "-" + Math.floor(Math.random() * 900 + 100);
    var p = {
      id: id, name: draft.name || "Untitled", hue: 44, archetype: "grid",
      tagline: draft.built, creator: D.ME, category: draft.category || "Consumer",
      stage: draft.stage || "Prototype", url: (draft.url || "example.com").replace(/^https?:\/\//, ""),
      score: 0, testers: 0, understood: 0, use: 0, pay: 0,
      askedFor: draft.feedback, about: draft.built,
      posted: "just now", views: 0, visits: 0, feeds: ["needs"],
      reactions: { useful: 0, pay: 0, nope: 0 }, comments: [], fresh: true
    };
    CUSTOM[id] = p;
    saveCustom();
    S.launched.push(id);
    addCredits(-20, "Launched " + p.name, null);
    draft = { url: "", name: "", built: "", feedback: "", category: "", stage: "", step: 1 };
    go("#/dash/" + id);
    toast('<span>🚀</span> <b>' + esc(p.name) + '</b> is live — testers are on the way');
    setTimeout(function () {
      /* First testers land while you watch — the payoff of the credits loop. */
      simulateIncomingTests(id);
    }, 1400);
  }

  function simulateIncomingTests(id) {
    var p = getProto(id);
    if (!p) return;
    var waves = [
      { t: 0,    testers: 3,  understood: 100, use: 67, pay: 33, views: 46,  visits: 12 },
      { t: 2600, testers: 7,  understood: 86,  use: 71, pay: 29, views: 112, visits: 31 },
      { t: 5600, testers: 12, understood: 83,  use: 67, pay: 25, views: 208, visits: 58 }
    ];
    waves.forEach(function (w) {
      setTimeout(function () {
        var live = getProto(id);
        if (!live) return;
        live.testers = w.testers; live.understood = w.understood; live.use = w.use; live.pay = w.pay;
        live.views = w.views; live.visits = w.visits;
        live.score = Math.round(live.understood * 0.25 + live.use * 0.4 + live.pay * 0.35);
        if (w === waves[1]) {
          live.comments.push({ by: "dev_kaz", verdict: "use", tested: true, when: "just now", text: "Understood it immediately. The pitch promises a habit but the product ends after one session — what happens on day two?", up: 3 });
        }
        if (w === waves[2]) {
          live.comments.push({ by: "lin", verdict: "pay", tested: true, when: "just now", text: "I would pay if it remembered where I stopped. Right now it feels like a demo, not a routine.", up: 2 });
        }
        CUSTOM[id] = live; saveCustom();
        if (location.hash.indexOf(id) > -1) render();
        if (w === waves[0]) toast('<span>🧪</span> First 3 testers just finished');
      }, w.t);
    });
  }

  /* ------------------------------------------------------ creator dashboard */
  VIEW.dash = function (params) {
    var p = getProto(params.id);
    if (!p) return '<div class="empty"><h3>Prototype not found</h3></div>';
    var tests = Math.max(p.testers, 0);
    var wouldUse = Math.round(tests * p.use / 100);
    var wouldPay = Math.round(tests * p.pay / 100);
    var steps = [
      { label: "Views", v: p.views, c: "var(--slate)" },
      { label: "Opened it", v: p.visits, c: "var(--text-2)" },
      { label: "Tested", v: tests, c: "var(--honey-soft)" },
      { label: "Would use", v: wouldUse, c: "var(--honey)" },
      { label: "Would pay", v: wouldPay, c: "var(--mint)" }
    ];
    var max = Math.max(1, steps[0].v);

    var funnel = '<div class="funnel">' + steps.map(function (s, i) {
      var w = Math.max(4, (s.v / max) * 100);
      var wide = w >= 18;
      var drop = i > 0 && steps[i - 1].v > 0 ? Math.round((s.v / steps[i - 1].v) * 100) + "%" : "";
      return '<div class="fn-row"><div class="fn-label">' + s.label + '</div>' +
        '<div class="fn-bar"><i style="width:' + w + '%;background:' + s.c + '">' + (wide ? n(s.v) : "") + '</i>' +
        (wide ? '' : '<span class="fn-out mono" style="left:calc(' + w + '% + 9px)">' + n(s.v) + '</span>') +
        (drop ? '<span class="fn-drop" style="position:absolute;right:10px;top:10px">' + drop + ' of previous</span>' : '') +
        '</div></div>';
    }).join("") + '</div>';

    var ai = D.AI_SUMMARY[p.id];
    if (!ai && p.fresh) {
      ai = tests >= 7 ? {
        likes: ["Every tester so far understood it from the URL alone — that is rare and worth protecting.", "The one-line pitch is doing the work; nobody asked what it was."],
        dislikes: ["Two testers described it as a demo, not a routine. The second session is undefined.", "Would-pay is sitting at " + p.pay + "% because there is no moment where value compounds."],
        next: ["Define day two: what does a returning tester see?", "Re-test at 25 testers before changing pricing — the sample is still small."]
      } : null;
    }

    var aiHtml = ai
      ? '<div class="ai-summary">' +
        '<div class="ai-head"><span aria-hidden="true">✦</span> AI summary of ' + tests + ' tester sessions</div>' +
        '<div class="ai-block good"><h4>What testers like</h4><ul>' + ai.likes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
        '<div class="ai-block bad"><h4>What they dislike</h4><ul>' + ai.dislikes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
        '<div class="ai-block next"><h4>What to improve next</h4><ul>' + ai.next.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
        '</div>'
      : '<div class="panel panel-quiet"><p class="muted">The AI summary unlocks at 7 tested sessions. You are at <b class="mono">' + tests + '</b>. Testers usually arrive within the hour — or spend credits to jump the queue.</p></div>';

    var boosted = S.boosted.indexOf(p.id) > -1;
    var boostCard = '<div class="section"><div class="panel boost-card">' +
      '<div class="boost-top"><div><div class="verdict-label">' + (boosted ? "Boost running" : "Not enough testers?") + '</div>' +
      '<div class="verdict-line">' + (boosted
        ? D.BOOST.testers + ' paid testers are working through it'
        : D.BOOST.testers + ' targeted testers in ' + D.BOOST.hours + ' hours') + '</div>' +
      '<p class="muted" style="margin-top:6px">' + (boosted
        ? 'Results land as they finish. Peer testers keep arriving alongside them.'
        : esc(D.BOOST.blurb) + ' ' + money(D.BOOST.price) + ' — about ' + money(0.4) + ' of it reaches each tester.') + '</p></div>' +
      '<span class="boost-price mono">' + (boosted ? "LIVE" : money(D.BOOST.price)) + '</span></div>' +
      '<p class="muted" style="margin-top:10px"><b>' + esc(D.BOOST.guarantee) + '</b></p>' +
      (boosted ? '' : '<div class="rowgap" style="margin-top:14px">' +
        '<button class="btn btn-mint" style="flex:1" data-boost="' + p.id + '">Boost · ' + money(D.BOOST.price) + '</button>' +
        '<button class="btn btn-primary" style="flex:1" data-pack="' + p.id + '">Validation Pack · ' + money(D.PACK.price) + '</button></div>') +
      '</div></div>';

    return '<button class="back-link" data-back>' + ICON.back + ' Back</button>' +
      '<div class="page-head"><p class="page-kicker">Creator dashboard</p>' +
      '<h1 class="page-title">' + esc(p.name) + '</h1>' +
      '<p class="page-sub">' + esc(p.tagline) + '</p></div>' +
      '<div class="panel" style="display:flex;gap:16px;align-items:center;margin-bottom:14px">' + hex(p.score, "lg") +
      '<div><div class="verdict-label">Validation score</div><div class="verdict-line">' + esc(tests < 5 ? "Too early to call — needs testers." : verdictLine(p)) + '</div>' +
      '<p class="muted" style="margin-top:6px">' + tests + ' verified testers · ' + esc(p.stage) + ' · ' + esc(p.category) + '</p></div></div>' +
      '<div class="signal-strip" style="margin-bottom:14px"><div><b class="mono">' + signalOf(p).emails + ' of ' + tests + '</b> left an email at ' + esc(priceOf(p)) + '</div>' +
      '<button class="section-more" data-go="#/report/' + p.id + '">Open validation report</button></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">Funnel</h2><span class="muted">last 7 days</span></div>' +
      '<div class="panel">' + funnel + '</div></div>' +
      '<div class="section"><div class="section-head"><h2 class="section-title">What the tests say</h2></div>' + aiHtml + '</div>' +
      boostCard +
      '<div class="section"><div class="section-head"><h2 class="section-title">Verified feedback</h2>' +
      '<button class="section-more" data-go="#/p/' + p.id + '">Open public page</button></div>' +
      '<div class="panel">' + (commentsOf(p).length
        ? commentsOf(p).map(function (c) {
            var cb = builder(c.by);
            var tagClass = c.verdict === "pay" ? "tag-pay" : c.verdict === "nope" ? "tag-nope" : "tag-use";
            return '<div class="comment">' + avatar(c.by) + '<div class="comment-body"><div class="comment-top"><b>' + esc(cb.name) + '</b>' +
              '<span class="tag ' + tagClass + '">' + (c.verdict === "pay" ? "Would pay" : c.verdict === "nope" ? "Not for me" : "Would use") + '</span>' +
              '<span class="tag tag-verified">✓ tested</span><span>' + esc(c.when) + '</span></div>' +
              '<p class="comment-text">' + esc(c.text) + '</p></div></div>';
          }).join("")
        : '<p class="muted">No written feedback yet.</p>') + '</div></div>';
  };

  /* ------------------------------------------------------------ leaderboard */
  VIEW.board = function () {
    var list = allProtos();
    var builders = Object.keys(D.BUILDERS).map(function (h) { return D.BUILDERS[h]; });

    function board(emoji, title, rows) {
      return '<section class="board"><div class="board-head"><span class="board-emoji" aria-hidden="true">' + emoji + '</span><h3>' + esc(title) + '</h3></div>' +
        rows.map(function (r, i) {
          return '<div class="board-row ' + (i === 0 ? "top" : "") + '" data-go="' + r.href + '">' +
            '<span class="br-rank">' + (i + 1) + '</span>' +
            (r.avatar ? avatar(r.avatar) : '') +
            '<span class="br-main"><span class="br-name">' + esc(r.name) + '</span><span class="br-sub">' + esc(r.sub) + '</span></span>' +
            '<span class="br-val ' + (r.tone || "") + '">' + esc(r.val) + '</span></div>';
        }).join("") + '</section>';
    }
    function pRows(sorted, valFn, subFn, tone) {
      return sorted.slice(0, 5).map(function (p) {
        return { name: p.name, sub: subFn(p), val: valFn(p), href: "#/p/" + p.id, tone: tone };
      });
    }
    var byHot = list.slice().sort(function (a, b) { return b.score * b.testers - a.score * a.testers; });
    var byTested = list.slice().sort(function (a, b) { return b.testers - a.testers; });
    var byPay = list.slice().sort(function (a, b) { return b.pay - a.pay; });
    var byRising = list.slice().sort(function (a, b) { return (b.testers / Math.max(1, b.views)) - (a.testers / Math.max(1, a.views)); });
    var byBuilder = builders.slice().sort(function (a, b) { return b.rep - a.rep; });
    var byTester = builders.slice().sort(function (a, b) { return b.tests - a.tests; });

    var boards =
      board("🔥", "Hottest prototype", pRows(byHot, function (p) { return p.score; }, function (p) { return "@" + p.creator + " · " + p.testers + " testers"; }, "honey")) +
      board("🧪", "Most tested", pRows(byTested, function (p) { return String(p.testers); }, function (p) { return p.category; })) +
      board("💰", "Most would pay", pRows(byPay, function (p) { return p.pay + "%"; }, function (p) { return "@" + p.creator; }, "mint")) +
      board("📈", "Fastest rising", pRows(byRising, function (p) { return Math.round(p.testers / Math.max(1, p.views) * 1000) / 10 + "%"; }, function (p) { return "tests per view · " + p.posted; })) +
      board("🛠", "Best builder", byBuilder.slice(0, 5).map(function (b) {
        return { name: b.name, sub: "@" + b.handle + " · " + b.launched + " launched, " + b.killed + " killed", val: String(b.rep), href: "#/u/" + b.handle, avatar: b.handle, tone: "honey" };
      })) +
      board("🔬", "Best tester", byTester.slice(0, 5).map(function (b) {
        return { name: b.name, sub: "@" + b.handle + " · " + b.tests + " prototypes tested", val: String(b.tests), href: "#/u/" + b.handle, avatar: b.handle };
      }));

    return '<div class="page-head"><p class="page-kicker">Leaderboard</p>' +
      '<h1 class="page-title">This week on ProtoBuzz</h1>' +
      '<p class="page-sub">Ranked by what was tested, not what was upvoted. Testers rank as high as builders — that is deliberate.</p></div>' +
      '<div class="boards">' + boards + '</div>';
  };

  /* ------------------------------------------------------------------ my lab */
  VIEW.lab = function (params) {
    var handle = params.handle || D.ME;
    var b = builder(handle);
    var me = handle === D.ME;
    var tab = params.tab || "experiments";

    var mine = allProtos().filter(function (p) { return p.creator === handle; });
    var graves = D.GRAVEYARD.filter(function (g) { return g.builder === handle; });
    var testedList = me ? Object.keys(S.tested).map(getProto).filter(Boolean) : [];

    var head = '<div class="lab-head">' +
      '<div class="lab-top">' + avatar(handle, "xl") +
        '<div class="lab-id"><div class="lab-name">' + esc(me ? "My Lab" : b.name) + '</div>' +
        '<div class="lab-handle">@' + esc(b.handle) + (me ? "" : " · " + n(b.followers) + " followers") + '</div></div>' +
        (me ? '<button class="btn btn-primary" data-go="#/submit">Launch</button>'
            : '<button class="btn-follow" data-follow="' + b.handle + '" aria-pressed="' + isFollowing(b.handle) + '">' + (isFollowing(b.handle) ? "Following" : "Follow") + '</button>') +
      '</div>' +
      '<p class="lab-bio">' + esc(b.bio) + '</p>' +
      '<div class="lab-stats">' +
        '<div class="lab-stat"><b>' + (me ? mine.length : b.built) + '</b><span>built</span></div>' +
        '<div class="lab-stat"><b>' + b.launched + '</b><span>launched</span></div>' +
        '<div class="lab-stat"><b>' + (me ? graves.length : b.killed) + '</b><span>killed</span></div>' +
        '<div class="lab-stat"><b>' + (me ? Object.keys(S.tested).length : b.tests) + '</b><span>tested</span></div>' +
      '</div>' +
      (function () {
        var rep = me ? myRep() : b.rep;
        return '<div class="rep-bar"><span class="rep-label">Builder reputation</span>' +
          '<span class="rep-track"><i style="width:' + rep + '%"></i></span>' +
          '<span class="rep-label mono">' + rep + '</span></div>';
      })() +
      (me ? '<div class="rep-bar"><span class="rep-label">Credits</span>' +
        '<span class="rep-track"><i data-credit-bar style="width:' + Math.min(100, S.credits / 20 * 100) + '%;background:var(--honey)"></i></span>' +
        '<span class="rep-label mono" data-credits>' + S.credits + '</span></div>' +
        '<p class="muted" style="margin-top:10px;position:relative">Reputation ' + myRep() + ' — earned from ' + Object.keys(S.tested).length + ' test' + (Object.keys(S.tested).length === 1 ? "" : "s") + '. Bought credits never move it.</p>' : "") +
      '</div>';

    var tabs = '<div class="seg" role="tablist">' +
      [["experiments", "Experiments"], ["launched", "Launched"], ["killed", "Killed"], me ? ["tested", "Tested"] : null, me ? ["saved", "Saved"] : null]
        .filter(Boolean).map(function (t) {
          return '<button role="tab" aria-selected="' + (tab === t[0]) + '" data-labtab="' + t[0] + '">' + t[1] + '</button>';
        }).join("") + '</div>';

    function miniRow(p, note) {
      return '<div class="mini" data-go="#/p/' + p.id + '">' + mock(p) +
        '<div class="mini-body"><div class="mini-name">' + esc(p.name) + '</div>' +
        '<div class="mini-sub">' + esc(note || (p.category + " · " + p.testers + " testers · " + p.stage)) + '</div></div>' +
        '<div class="mini-right">' + hex(p.score) + '</div></div>';
    }

    var body = "";
    if (tab === "killed") {
      body = graves.length
        ? '<div class="feed">' + graves.map(graveCard).join("") + '</div>'
        : '<div class="empty"><h3>Nothing killed yet</h3><p>' + (me ? "When you kill an experiment, publishing the post-mortem earns +5 credits and is the most-read feed here." : "This builder has not published a post-mortem.") + '</p></div>';
    } else if (tab === "tested") {
      body = testedList.length
        ? '<div class="mini-list">' + testedList.map(function (p) {
            var t = S.tested[p.id];
            return miniRow(p, "You said: " + (t.use === "y" ? "would use" : t.use === "m" ? "maybe" : "not for me") + (t.pay === "y" ? " · would pay" : "") + (t.improve ? " · left feedback" : ""));
          }).join("") + '</div>'
        : '<div class="empty"><h3>No tests yet</h3><p>Testing pays 3 credits, and 2 more for a written improvement.</p><button class="btn btn-primary" style="margin-top:14px" data-go="#/test">Open the test queue</button></div>';
    } else if (tab === "saved") {
      var sl = S.saved.map(getProto).filter(Boolean);
      body = sl.length ? '<div class="mini-list">' + sl.map(function (p) { return miniRow(p); }).join("") + '</div>'
                       : '<div class="empty"><h3>Nothing saved</h3><p>Bookmark prototypes to keep them here.</p></div>';
    } else if (tab === "launched") {
      var launched = mine.filter(function (p) { return p.stage === "Live" || p.stage === "MVP"; });
      body = launched.length ? '<div class="mini-list">' + launched.map(function (p) { return miniRow(p); }).join("") + '</div>'
                             : '<div class="empty"><h3>Nothing launched yet</h3><p>' + (me ? "An experiment becomes a launch when it earns a validation score above 70 with 25+ testers." : "No shipped products yet.") + '</p></div>';
    } else {
      var due = mine.filter(outcomeDue).map(outcomeCard).join("");
      body = mine.length
        ? due + '<div class="mini-list">' + mine.map(function (p) {
            return '<div class="mini" data-go="' + (p.creator === D.ME ? "#/dash/" + p.id : "#/p/" + p.id) + '">' + mock(p) +
              '<div class="mini-body"><div class="mini-name">' + esc(p.name) + '</div>' +
              '<div class="mini-sub">' + esc(p.stage) + ' · ' + p.testers + ' testers · ' + p.use + '% would use' +
              (S.outcomes[p.id] ? ' · <b style="color:' + (S.outcomes[p.id] === "shipped" ? "var(--mint)" : S.outcomes[p.id] === "killed" ? "var(--rose)" : "var(--honey)") + '">' + S.outcomes[p.id] + '</b>' : '') + '</div>' +
              (me ? '<button class="btn btn-ghost" style="margin-top:8px;padding:6px 12px;font-size:12.5px" data-boost="' + p.id + '">' +
                (S.boosted.indexOf(p.id) > -1 ? "Boost running" : "Boost · " + money(D.BOOST.price)) + '</button>' : '') +
              '</div><div class="mini-right">' + hex(p.score) + '</div></div>';
          }).join("") + '</div>'
        : '<div class="empty"><h3>No experiments yet</h3><p>Launch one for 20 credits and get tested tonight.</p><button class="btn btn-primary" style="margin-top:14px" data-go="#/submit">Submit a prototype</button></div>';
    }

    var wallet = me ? '<div class="section"><div class="section-head"><h2 class="section-title">Wallet</h2>' +
      '<button class="section-more" data-go="#/pricing">Pricing</button></div>' +
      '<div class="panel"><div class="wallet-split">' +
      '<div class="wallet-col"><span class="verdict-label">Earned by testing</span><b class="mono">' + S.earned + '</b>' +
      '<span class="muted">cashes out</span></div>' +
      '<div class="wallet-col"><span class="verdict-label">Bought</span><b class="mono">' + S.purchased + '</b>' +
      '<span class="muted">spend only</span></div></div>' +
      '<div class="stat-track" style="margin-top:14px"><i style="width:' + Math.min(100, S.earned / D.PAYOUT.credits * 100) + '%;background:var(--mint)"></i></div>' +
      '<p class="muted" style="margin-top:8px">' + D.PAYOUT.credits + ' tested credits = ' + money(D.PAYOUT.usd) + ' payout, funded by Boost purchases. Bought credits are not cashable — that is what stops anyone buying credits to sell them back.</p>' +
      '<div class="rowgap" style="margin-top:12px">' +
      '<button class="btn btn-ghost" style="flex:1" data-cashout>Cash out</button>' +
      '<button class="btn btn-primary" style="flex:1" data-buy-credits="Add credits">Buy credits</button></div></div></div>' : "";

    var ledger = me ? '<div class="section"><div class="section-head"><h2 class="section-title">Credit ledger</h2>' +
      '<span class="muted mono">balance ' + S.credits + '</span></div><div class="panel">' +
      S.ledger.map(function (l) {
        var val = l.usd != null ? money(l.usd) : (l.amount >= 0 ? "+" : "") + l.amount;
        var tone = l.usd != null ? "" : l.amount >= 0 ? "plus" : "minus";
        return '<div class="ledger-row"><span>' + esc(l.label) +
          (l.kind === "buy" ? ' <span class="tag tag-verified">paid</span>' : '') +
          '</span><b class="' + tone + '">' + val + '</b></div>';
      }).join("") + '</div></div>' : "";

    return (me ? "" : '<button class="back-link" data-back>' + ICON.back + ' Back</button>') + head + tabs + body + wallet + ledger;
  };


  /* ------------------------------------------------------------ buying credits
     Simulated checkout only: no card details are collected and nothing is
     charged. A real build would hand off to a hosted payment page (Stripe
     Checkout / Payment Element) so card data never touches this app. */
  var buyState = { packId: "starter", step: "pick", reason: "" };

  function packById(id) {
    var found = D.PACKS[0];
    D.PACKS.forEach(function (p) { if (p.id === id) found = p; });
    return found;
  }

  function openBuyCredits(reason) {
    buyState = { packId: buyState.packId || "starter", step: "pick", reason: reason || "" };
    renderBuyStep();
  }

  function renderBuyStep() {
    if (buyState.step === "pick") return renderBuyPick();
    if (buyState.step === "checkout") return renderBuyCheckout();
    return renderBuyDone();
  }

  function renderBuyPick() {
    var need = Math.max(0, 20 - S.credits);
    var tests = Math.ceil(need / 5);

    var paths = '<div class="two-paths">' +
      '<div class="path"><b>Earn it</b>' +
      '<span>' + (need > 0 ? tests + " test" + (tests === 1 ? "" : "s") + " · about " + (tests * 2) + " min" : "You already have enough") + '</span>' +
      '<span class="path-win">+' + (tests * 2) + ' reputation</span>' +
      '<button class="btn btn-ghost btn-block" data-close-sheet data-go="#/test">Go test</button></div>' +
      '<div class="path on"><b>Buy it</b><span>Instant, no queue</span>' +
      '<span class="path-lose">Reputation unchanged</span>' +
      '<span class="muted" style="font-size:12px">Money buys time here, never rank.</span></div>' +
      '</div>';

    var packs = '<div class="packs">' + D.PACKS.map(function (p) {
      return '<button class="pack ' + (buyState.packId === p.id ? "sel" : "") + '" data-pack="' + p.id + '">' +
        (p.best ? '<span class="pack-flag">Best value</span>' : '') +
        '<span class="pack-credits"><span class="credit-coin" aria-hidden="true"></span>' + p.credits + '</span>' +
        '<span class="pack-body"><b>' + esc(p.label) + '</b>' +
        '<span class="muted">' + p.launches + ' launch' + (p.launches === 1 ? "" : "es") + ' · ' + money(p.per) + ' a credit</span></span>' +
        '<span class="pack-price">' + money(p.price) + '</span></button>';
    }).join("") + '</div>';

    openSheet(
      (buyState.reason ? '<p class="q-num">' + esc(buyState.reason) + '</p>' : '') +
      '<h2 class="q-title">Two ways to launch</h2>' +
      '<p class="q-help">Both get your prototype into the peer queue. Only one of them moves your builder rank.</p>' +
      paths + packs +
      '<button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-buy-next>Continue · ' + money(packById(buyState.packId).price) + '</button>' +
      '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-close-sheet data-go="#/pricing">See Boost and Pro</button>',
      "Add credits");
  }

  function renderBuyCheckout() {
    var p = packById(buyState.packId);
    openSheet(
      '<div class="demo-banner">' + ICON.nope +
      '<span><b>Demo checkout.</b> Nothing is charged and no card details are collected. A real build would open a hosted payment page here.</span></div>' +
      '<div class="receipt">' +
      '<div class="ledger-row"><span>' + esc(p.label) + ' pack · ' + p.credits + ' credits</span><b>' + money(p.price) + '</b></div>' +
      '<div class="ledger-row"><span class="muted">Tax</span><b class="muted">Calculated at checkout</b></div>' +
      '<div class="ledger-row"><span><b>Total</b></span><b>' + money(p.price) + '</b></div>' +
      '</div>' +
      '<div class="payline"><span class="payline-card" aria-hidden="true"></span>' +
      '<span>Card ending 4242 <span class="muted">(demo)</span></span><span class="tag tag-verified">Simulated</span></div>' +
      '<button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-buy-pay>Pay ' + money(p.price) + '</button>' +
      '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-buy-back>Back</button>' +
      '<p class="muted" style="margin-top:14px;text-align:center">' + p.credits + ' credits · never expire · refundable while unspent</p>',
      "Checkout");
  }

  function renderBuyDone() {
    var p = packById(buyState.packId);
    openSheet(
      '<div class="reward">' +
      '<span class="reward-hex"><svg viewBox="0 0 84 92" width="104" height="114" aria-hidden="true">' +
      '<path d="M42 2 80 24v44L42 90 4 68V24z" fill="var(--honey)"/></svg>' +
      '<span class="n">+' + p.credits + '</span></span>' +
      '<h3>' + p.credits + ' credits added</h3>' +
      '<p>Balance ' + (S.credits) + '. You can launch ' + Math.floor(S.credits / 20) + ' prototype' + (Math.floor(S.credits / 20) === 1 ? "" : "s") + ' right now.</p>' +
      '<div class="panel panel-quiet" style="text-align:left;margin-top:18px">' +
      '<div class="ai-head" style="color:var(--text-3)">What this bought</div>' +
      '<ul class="buy-facts">' +
      '<li><b>A place in the peer queue.</b> Builders test your prototype and are paid in credits, not cash.</li>' +
      '<li><b>Not a ranking.</b> Trending and your builder rank still come from testing others — bought credits leave reputation at ' + myRep() + '.</li>' +
      '<li><b>Need testers we pay?</b> That is Boost: ' + D.BOOST.testers + ' targeted testers in ' + D.BOOST.hours + 'h for ' + money(D.BOOST.price) + '.</li>' +
      '</ul></div>' +
      '<div class="rowgap" style="margin-top:18px">' +
      '<button class="btn btn-primary btn-block" data-close-sheet data-go="#/submit">Launch a prototype</button>' +
      '<button class="btn btn-ghost btn-block" data-close-sheet>Done</button>' +
      '</div></div>',
      "Payment complete");
  }

  function completePurchase() {
    var p = packById(buyState.packId);
    openSheet('<div class="reward"><div class="spinner" aria-hidden="true"></div>' +
      '<h3 style="margin-top:18px">Processing ' + money(p.price) + '</h3>' +
      '<p>Simulated — no payment is being taken.</p></div>', "Checkout");
    setTimeout(function () {
      addCredits(p.credits, "Bought " + p.credits + " credits (" + money(p.price) + ")", null, "buy");
      dirty = true;
      buyState.step = "done";
      renderBuyDone();
      toast('<span>💳</span> <b class="mono">+' + p.credits + '</b> credits · ' + money(p.price) + ' (demo)', "credit");
    }, 950);
  }

  /* ------------------------------------------------------------------- boost */
  function openBoost(id) {
    var p = getProto(id);
    var already = S.boosted.indexOf(id) > -1;
    if (already) {
      openSheet('<div class="reward"><h3>Boost is running</h3><p>' + D.BOOST.testers +
        ' targeted testers are working through ' + esc(p.name) + '. Results land within ' + D.BOOST.hours + ' hours.</p>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:18px" data-close-sheet>Done</button></div>', "Boost");
      return;
    }
    openSheet(
      '<div class="demo-banner">' + ICON.nope + '<span><b>Demo checkout.</b> Nothing is charged.</span></div>' +
      '<h2 class="q-title">' + D.BOOST.testers + ' testers we pay</h2>' +
      '<p class="q-help">' + esc(D.BOOST.blurb) + ' Peer credits get you into the queue; Boost buys guaranteed testers, so the money reaches the people doing the work.</p>' +
      '<div class="panel panel-quiet" style="margin-top:16px">' +
      '<div class="ai-head" style="color:var(--text-3)">Target</div>' +
      '<div class="pickers" style="margin-top:10px">' + D.BOOST.filters.map(function (f, i) {
        return '<span class="pick" aria-pressed="' + (i === 0) + '">' + esc(f) + '</span>';
      }).join("") + '</div></div>' +
      '<div class="receipt" style="margin-top:16px">' +
      '<div class="ledger-row"><span>Boost · ' + D.BOOST.testers + ' targeted testers</span><b>' + money(D.BOOST.price) + '</b></div>' +
      '<div class="ledger-row"><span class="muted">Paid to testers</span><b class="muted">' + money(D.BOOST.testers * 0.4) + '</b></div>' +
      '<div class="ledger-row"><span class="muted">Delivered within</span><b class="muted">' + D.BOOST.hours + ' hours</b></div>' +
      '</div>' +
      '<button class="btn btn-mint btn-lg btn-block" style="margin-top:16px" data-boost-pay="' + id + '">Pay ' + money(D.BOOST.price) + ' · start in an hour</button>' +
      '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-close-sheet>Not now</button>' +
      '<p class="muted" style="margin-top:14px;text-align:center">Capped at today\'s real tester supply. When the panel is full, Boost sells out rather than promising testers who do not exist.</p>',
      "Boost " + p.name);
  }

  function payBoost(id) {
    S.boosted.push(id);
    S.ledger.unshift({ label: "Boost · " + D.BOOST.testers + " paid testers", amount: 0, kind: "buy", usd: D.BOOST.price });
    save();
    dirty = true;
    closeSheet();
    toast('<span>🚀</span> Boost live · ' + D.BOOST.testers + ' paid testers queued (demo)');
    var p = getProto(id);
    if (p && CUSTOM[id]) simulateIncomingTests(id);
  }



  /* --------------------------------------------------------- validation pack */
  function openPack(id) {
    var p = getProto(id);
    openSheet(
      '<div class="demo-banner">' + ICON.nope + '<span><b>Demo checkout.</b> Nothing is charged.</span></div>' +
      '<h2 class="q-title">Validation Pack</h2>' +
      '<p class="q-help">' + esc(D.PACK.guarantee) + '</p>' +
      '<div class="panel panel-quiet" style="margin-top:16px"><ul class="buy-facts" style="margin-top:0">' +
      D.PACK.includes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="receipt" style="margin-top:16px">' +
      '<div class="ledger-row"><span>Validation Pack · ' + esc(p.name) + '</span><b>' + money(D.PACK.price) + '</b></div>' +
      '<div class="ledger-row"><span class="muted">Paid to testers</span><b class="muted">' + money(D.PACK.testers * 0.4) + '</b></div>' +
      '<div class="ledger-row"><span class="muted">Delivered within</span><b class="muted">' + D.PACK.hours + ' hours</b></div>' +
      '</div>' +
      '<button class="btn btn-mint btn-lg btn-block" style="margin-top:16px" data-pack-pay="' + id + '">Pay ' + money(D.PACK.price) + '</button>' +
      '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-close-sheet>Not now</button>',
      "Validation Pack");
  }

  function payPack(id) {
    if (S.packs.indexOf(id) === -1) S.packs.push(id);
    if (S.boosted.indexOf(id) === -1) S.boosted.push(id);
    S.ledger.unshift({ label: "Validation Pack · " + D.PACK.testers + " testers", amount: 0, kind: "buy", usd: D.PACK.price });
    save();
    dirty = true;
    closeSheet();
    go("#/report/" + id);
    toast('<span>📄</span> Pack live · report unlocked, ' + D.PACK.testers + ' testers queued (demo)');
  }

  /* ------------------------------------------------------- 30-day outcome loop
     The question nobody else asks, and the only data that compounds. */
  function outcomeDue(p) {
    return p.creator === D.ME && (p.ageDays || 0) >= 30 && !S.outcomes[p.id];
  }

  function setOutcome(id, outcome) {
    S.outcomes[id] = outcome;
    save();
    if (outcome === "killed") {
      openSheet(
        '<p class="q-num">Post-mortem</p><h2 class="q-title">What did you learn?</h2>' +
        '<p class="q-help">One honest paragraph. The graveyard is the most-read feed on ProtoBuzz, and publishing pays 5 credits.</p>' +
        '<textarea class="q-textarea" id="pm-box" placeholder="e.g. 6 minutes a day was the wrong unit — people wanted to finish a book, not spend minutes."></textarea>' +
        '<button class="btn btn-primary btn-lg btn-block" style="margin-top:16px" data-pm="' + id + '">Publish post-mortem · +5</button>' +
        '<button class="btn btn-ghost btn-block" style="margin-top:10px" data-close-sheet>Keep it private</button>',
        "Killed it");
      return;
    }
    render();
    toast(outcome === "shipped"
      ? '<span>🚢</span> Marked shipped — that goes into the outcome data'
      : '<span>🔀</span> Marked pivoted — the old score stays on the record');
  }

  function publishPostMortem(id) {
    var box = byId("pm-box");
    var text = box ? box.value.trim() : "";
    if (!text) { if (box) box.focus(); return; }
    var p = getProto(id);
    S.outcomes[id] = "killed";
    S.postMortems = S.postMortems || {};
    S.postMortems[id] = { name: p.name, text: text, score: p.score, testers: p.testers, category: p.category };
    save();
    dirty = true;
    addCredits(5, "Published post-mortem", null);
    closeSheet();
    go("#/discover?feed=grave");
    toast('<span>💀</span> Post-mortem published · <b class="mono">+5</b> credits', "credit");
  }

  function outcomeCard(p) {
    return '<div class="panel outcome-card">' +
      '<div class="verdict-label">30 days later</div>' +
      '<div class="verdict-line" style="margin-top:4px">' + esc(p.name) + ' launched ' + p.ageDays + ' days ago. What happened?</div>' +
      '<p class="muted" style="margin-top:6px">Answering builds the only dataset nobody else has: which validation scores actually became products.</p>' +
      '<div class="rowgap" style="margin-top:14px">' +
      '<button class="btn btn-mint" data-outcome="shipped" data-id2="' + p.id + '">Shipped it</button>' +
      '<button class="btn btn-ghost" data-outcome="pivoted" data-id2="' + p.id + '">Pivoted</button>' +
      '<button class="btn btn-ghost" data-outcome="killed" data-id2="' + p.id + '">Killed it</button>' +
      '</div></div>';
  }

  /* ------------------------------------------------------- validation report
     The artifact a builder actually buys and forwards to a cofounder. Public and
     shareable by design; the email addresses behind the count are the paid part. */
  function meterRow(label, value, color, sub) {
    return '<div class="stat-row"><div class="stat-val" style="color:' + color + '">' + value + '%</div>' +
      '<div class="stat-body"><div class="stat-name">' + esc(label) + (sub ? ' <span class="muted">' + esc(sub) + '</span>' : '') + '</div>' +
      '<div class="stat-track"><i style="width:' + value + '%;background:' + color + '"></i></div></div></div>';
  }

  function priceLadder(sig) {
    var top = Math.max.apply(null, sig.bands.map(function (b) { return b.pct; })) || 1;
    return '<div class="ladder">' + sig.bands.map(function (b) {
      var w = Math.max(2, Math.round((b.pct / top) * 100));
      return '<div class="ladder-row"><span class="ladder-label">' + esc(b.label) + '</span>' +
        '<span class="ladder-bar"><i style="width:' + w + '%;background:' + (b.none ? "var(--slate)" : "var(--mint)") + '"></i></span>' +
        '<span class="ladder-val mono">' + b.pct + '%</span></div>';
    }).join("") + '</div>';
  }

  function segmentBlock(p, locked) {
    var segs = segmentsOf(p);
    if (!segs) {
      return '<div class="panel panel-quiet"><p class="muted">Segments need at least 12 tested sessions. ' +
        esc(p.name) + ' has ' + p.testers + '.</p></div>';
    }
    return '<div class="panel"><div class="seg-legend">' +
      '<span><i style="background:var(--honey)"></i>Would use</span>' +
      '<span><i style="background:var(--mint)"></i>Would pay</span></div>' +
      segs.map(function (g) {
        return '<div class="segrow"><div class="segrow-top"><b>' + esc(g.label) + '</b>' +
          '<span class="muted mono">' + g.n + ' testers</span></div>' +
          '<div class="segbars">' +
          '<span class="segbar"><i style="width:' + g.use + '%;background:var(--honey)"></i></span>' +
          '<span class="segval mono" style="color:var(--honey)">' + g.use + '%</span>' +
          '</div>' +
          '<div class="segbars">' +
          '<span class="segbar"><i style="width:' + g.pay + '%;background:var(--mint)"></i></span>' +
          '<span class="segval mono" style="color:var(--mint)">' + g.pay + '%</span>' +
          '</div>' +
          (locked ? '' : '<p class="muted" style="margin-top:7px">' + g.emails + ' left an email</p>') +
          '</div>';
      }).join("") + '</div>';
  }

  VIEW.report = function (params) {
    var p = getProto(params.id);
    if (!p) return '<div class="empty"><h3>Report not found</h3></div>';
    var sig = signalOf(p);
    var mine = p.creator === D.ME;
    var unlocked = S.packs.indexOf(p.id) > -1;
    var ai = D.AI_SUMMARY[p.id];
    var quotes = commentsOf(p).slice(0, 3);
    var segs = segmentsOf(p);
    var best = segs ? segs[0] : null;

    var head = '<div class="report-head">' +
      '<div class="report-brand"><span class="brand-mark" aria-hidden="true">' +
      '<svg viewBox="0 0 24 26"><path d="M12 1 22.4 7v12L12 25 1.6 19V7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M6.6 15.4c1.6-3.4 3.2-3.4 4.8 0s3.2 3.4 4.8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>' +
      '<span>Validation Report</span></div>' +
      '<h1 class="page-title" style="margin-top:10px">' + esc(p.name) + '</h1>' +
      '<p class="page-sub">' + esc(p.tagline) + '</p>' +
      '<p class="muted mono" style="margin-top:10px">' + p.testers + ' verified testers · asking ' + esc(sig.price) + ' · ' + esc(p.stage) + '</p>' +
      '</div>';

    var verdict = '<div class="panel" style="display:flex;gap:16px;align-items:center;margin-bottom:14px">' + hex(p.score, "lg") +
      '<div><div class="verdict-label">Validation score</div>' +
      '<div class="verdict-line">' + esc(verdictLine(p)) + '</div>' +
      (best ? '<p class="muted" style="margin-top:6px">Strongest with <b>' + esc(best.label.toLowerCase()) + '</b> — ' + best.pay + '% of them would pay.</p>' : '') +
      '</div></div>';

    /* The headline is a number someone acted on, not one they agreed with. */
    var hero = '<div class="signal-card">' +
      '<div class="signal-num mono">' + sig.emails + '<span> of ' + p.testers + '</span></div>' +
      '<p class="signal-line">testers left an email at <b>' + esc(sig.price) + '</b></p>' +
      '<p class="muted" style="margin-top:8px">' + p.pay + '% <em>said</em> they would pay. ' + sig.rate +
      '% actually handed over an address. The gap between those two numbers is the finding.</p>' +
      (mine
        ? (unlocked
            ? '<div class="email-list">' + Array.apply(null, Array(Math.min(4, sig.emails))).map(function (_, i) {
                return '<span class="email-chip mono">tester' + (i + 1) + '@' + ["gmail.com", "hey.com", "outlook.com", "fastmail.com"][i % 4] + '</span>';
              }).join("") + (sig.emails > 4 ? '<span class="email-chip mono">+' + (sig.emails - 4) + ' more</span>' : '') + '</div>'
            : '<div class="locked-row">' + ICON.save + '<span>' + sig.emails + ' addresses are yours with the Validation Pack</span>' +
              '<button class="btn btn-mint" data-pack="' + p.id + '">' + money(D.PACK.price) + '</button></div>')
        : '<p class="muted" style="margin-top:10px">Addresses go to the builder only.</p>') +
      '</div>';

    var evidence = '<div class="section"><div class="section-head"><h2 class="section-title">What they would pay</h2>' +
      '<span class="muted">asking ' + esc(sig.price) + '</span></div>' +
      '<div class="panel">' + priceLadder(sig) + '</div></div>';

    var stats = '<div class="section"><div class="section-head"><h2 class="section-title">The three questions</h2></div>' +
      '<div class="panel"><div class="stat-rows" style="padding:0">' +
      meterRow("Understood what it does", p.understood, "var(--text-2)") +
      meterRow("Would use it", p.use, "var(--honey)") +
      meterRow("Would pay something", p.pay, "var(--mint)") +
      '</div></div></div>';

    var segments = '<div class="section"><div class="section-head"><h2 class="section-title">Where the signal is</h2>' +
      '<span class="muted">by who they are</span></div>' + segmentBlock(p, !mine || !unlocked) + '</div>';

    var voices = quotes.length ? '<div class="section"><div class="section-head"><h2 class="section-title">In their words</h2></div>' +
      '<div class="panel">' + quotes.map(function (c) {
        var tagClass = c.verdict === "pay" ? "tag-pay" : c.verdict === "nope" ? "tag-nope" : "tag-use";
        return '<blockquote class="quote"><p>“' + esc(c.text) + '”</p>' +
          '<footer><span class="tag ' + tagClass + '">' + (c.verdict === "pay" ? "Would pay" : c.verdict === "nope" ? "Not for me" : "Would use") + '</span>' +
          '<span class="muted">' + esc(builder(c.by).name) + ', verified tester</span></footer></blockquote>';
      }).join("") + '</div></div>' : "";

    var next = ai ? '<div class="section"><div class="section-head"><h2 class="section-title">What to do next</h2></div>' +
      '<div class="ai-summary"><div class="ai-block next" style="margin-top:0"><ul>' +
      ai.next.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div></div></div>' : "";

    var foot = '<div class="report-foot">' +
      '<p class="muted">Generated by ProtoBuzz from ' + p.testers + ' verified test sessions. Every tester opened the prototype before answering.</p>' +
      '<div class="rowgap" style="margin-top:12px">' +
      '<button class="btn btn-ghost" data-share="' + p.id + '">Share report</button>' +
      '<button class="btn btn-ghost" data-export>Export PDF</button>' +
      (mine ? '<button class="btn btn-primary" data-go="#/dash/' + p.id + '">Back to dashboard</button>' : '') +
      '</div></div>';

    return '<button class="back-link" data-back>' + ICON.back + ' Back</button>' +
      '<article class="report">' + head + verdict + hero + evidence + stats + segments + voices + next + foot + '</article>';
  };

  /* ----------------------------------------------------------------- pricing */
  VIEW.pricing = function () {
    var packs = '<div class="plan-grid">' + D.PACKS.map(function (p) {
      return '<div class="plan ' + (p.best ? "plan-hi" : "") + '">' +
        (p.best ? '<span class="pack-flag">Best value</span>' : '') +
        '<div class="plan-price">' + money(p.price) + '</div>' +
        '<div class="plan-name">' + p.credits + ' credits</div>' +
        '<p class="muted">' + p.launches + ' launch' + (p.launches === 1 ? "" : "es") + ' · ' + money(p.per) + ' a credit</p>' +
        '<button class="btn ' + (p.best ? "btn-primary" : "btn-ghost") + ' btn-block" style="margin-top:12px" data-buy="' + p.id + '">Buy</button></div>';
    }).join("") + '</div>';

    var rules = [
      ["Money buys time, not rank", "Bought credits launch a prototype. Only testing raises your builder reputation and your place in Trending — so the people who feed the platform stay ahead of the people who only pay."],
      ["Two queues, two currencies", "Credit packs put you in the peer queue, where builders test each other for credits. Boost buys the paid panel, where testers are paid cash. Selling credits never quietly drains the tester side."],
      ["Paid demand is capped by real supply", "Boost sells only as many tests as the panel can deliver that day. Sold out is an honest answer; a promise of 25 testers who do not exist is not."],
      ["Feedback is paid on usefulness, not volume", "The +2 lands when the builder marks your improvement useful. Twelve tests a day maximum, and a session clock, so farming credits is slower than earning them honestly."],
      ["The free path never closes", "Welcome credits, and every launch is reachable by testing four prototypes. Kill that and the feed dies, and the feed is the reason anyone visits."]
    ];

    return '<div class="page-head"><p class="page-kicker">Pricing</p>' +
      '<h1 class="page-title">Credits, Boost, Pro</h1>' +
      '<p class="page-sub">Testing is free forever. Money buys guaranteed testers and the report you can forward to someone else — and it pays the testers who are not here for credits.</p></div>' +

      '<div class="section"><div class="section-head"><h2 class="section-title">Credits</h2>' +
      '<span class="muted">1 launch = 20 credits</span></div>' + packs +
      '<p class="muted" style="margin-top:10px">Or earn them: +3 a test, +2 for feedback a builder marks useful, +5 for a post-mortem.</p></div>' +

      '<div class="section"><div class="section-head"><h2 class="section-title">Testers, guaranteed</h2>' +
      '<span class="muted">we pay them, so we can promise them</span></div>' +
      '<div class="plan-grid" style="grid-template-columns:1fr">' +
      '<div class="panel plan-wide"><div class="plan-price">' + money(D.BOOST.price) + '</div>' +
      '<div class="plan-name">Boost · ' + D.BOOST.testers + ' targeted testers in ' + D.BOOST.hours + ' hours</div>' +
      '<p class="guarantee">' + esc(D.BOOST.guarantee) + '</p>' +
      '<p class="muted" style="margin-top:8px">' + esc(D.BOOST.blurb) + ' About ' + money(0.4) + ' a test reaches the tester, which is what keeps the panel staffed on the days peers are slow.</p>' +
      '<div class="pill-row" style="margin-top:12px">' + D.BOOST.filters.map(function (f) { return '<span class="pill">' + esc(f) + '</span>'; }).join("") + '</div>' +
      '<button class="btn btn-mint btn-block" style="margin-top:14px" data-go="#/lab">Boost a prototype</button></div>' +
      '<div class="panel plan-wide plan-hi"><span class="pack-flag">Most bought</span>' +
      '<div class="plan-price">' + money(D.PACK.price) + '</div>' +
      '<div class="plan-name">Validation Pack · ' + D.PACK.testers + ' testers and the report</div>' +
      '<p class="guarantee">' + esc(D.PACK.guarantee) + '</p>' +
      '<div class="ai-block next" style="margin-top:12px"><ul>' +
      D.PACK.includes.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<button class="btn btn-primary btn-block" data-go="#/lab">Buy for a prototype</button></div>' +
      '</div></div>' +

      '<div class="section"><div class="section-head"><h2 class="section-title">Pro</h2>' +
      '<span class="muted">for builders who ship weekly</span></div>' +
      '<div class="panel plan-wide"><div class="plan-price">' + money(D.PRO.price) + '<span class="plan-per">/month</span></div>' +
      '<div class="ai-block next" style="margin-top:12px"><ul>' + D.PRO.perks.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul></div>' +
      '<button class="btn btn-primary btn-block" style="margin-top:6px" data-pro>Start Pro</button></div></div>' +

      '<div class="section"><div class="section-head"><h2 class="section-title">How the economy stays balanced</h2></div>' +
      '<div class="panel">' + rules.map(function (r, i) {
        return '<div class="rule"><span class="rule-n mono">' + (i + 1) + '</span>' +
          '<div><h4>' + esc(r[0]) + '</h4><p class="muted">' + esc(r[1]) + '</p></div></div>';
      }).join("") + '</div></div>';
  };

  /* ------------------------------------------------------------- right rail */
  function renderAside() {
    if (!aside) return;
    var hier = [
      ["Tested", 100, "var(--honey)"],
      ["Would use", 78, "var(--honey-soft)"],
      ["Would pay", 58, "var(--mint)"],
      ["Useful", 38, "var(--slate)"],
      ["Like", 14, "var(--line-strong)"]
    ];
    var suggest = ["hana", "lin", "zo"].filter(function (h) { return !isFollowing(h); }).slice(0, 3);
    if (!suggest.length) suggest = ["hana"];

    aside.innerHTML =
      '<div class="aside-card"><div class="aside-title">What counts here</div>' +
      '<div class="hier">' + hier.map(function (h, i) {
        return '<div class="hier-row ' + (i === 0 ? "top" : "") + '"><span style="width:76px">' + h[0] + '</span>' +
          '<span class="bar" style="width:' + h[1] + 'px;background:' + h[2] + '"></span></div>';
      }).join("") + '</div>' +
      '<p class="muted" style="margin-top:12px">A like costs nothing, so it tells you nothing. We rank on what someone did after using it.</p></div>' +

      '<div class="aside-card"><div class="aside-title">Earn &amp; spend</div>' +
      '<div class="ledger-row"><span>Test a prototype</span><b class="plus">+3</b></div>' +
      '<div class="ledger-row"><span>Useful feedback</span><b class="plus">+2</b></div>' +
      '<div class="ledger-row"><span>Publish a post-mortem</span><b class="plus">+5</b></div>' +
      '<div class="ledger-row"><span>Submit a prototype</span><b class="minus">−20</b></div>' +
      '<div class="ledger-row"><span>Buy ' + D.PACKS[0].credits + ' credits</span><b>' + money(D.PACKS[0].price) + '</b></div>' +
      '<div class="rowgap" style="margin-top:12px">' +
      '<button class="btn btn-outline" style="flex:1" data-go="#/test">Earn</button>' +
      '<button class="btn btn-primary" style="flex:1" data-buy-credits="Add credits">Buy</button></div>' +
      '<p class="muted" style="margin-top:10px">Money buys time, never rank — only testing moves your reputation. <span data-go="#/pricing" style="color:var(--honey);cursor:pointer">How pricing works</span></p></div>' +

      '<div class="aside-card"><div class="aside-title">Builders to follow</div>' +
      suggest.map(function (h) {
        var b = builder(h);
        return '<div class="follow-row">' + avatar(h) +
          '<span class="fr-main"><span class="fr-name" data-go="#/u/' + h + '">' + esc(b.name) + '</span>' +
          '<span class="fr-sub">' + b.launched + ' launched · ' + b.tests + ' tests</span></span>' +
          '<button class="btn-follow" data-follow="' + h + '" aria-pressed="' + isFollowing(h) + '">' + (isFollowing(h) ? "Following" : "Follow") + '</button></div>';
      }).join("") + '</div>';
  }

  /* ---------------------------------------------------------------- routing */
  var NAV = [
    { href: "#/discover",    label: "Discover",    icon: "discover" },
    { href: "#/test",        label: "Test",        icon: "test", badge: true },
    { href: "#/submit",      label: "Submit",      icon: "submit", primary: true },
    { href: "#/leaderboard", label: "Leaderboard", icon: "board" },
    { href: "#/lab",         label: "My Lab",      icon: "lab" }
  ];

  function parseRoute() {
    var h = location.hash.replace(/^#/, "") || "/discover";
    var qi = h.indexOf("?");
    var query = {};
    if (qi > -1) {
      h.slice(qi + 1).split("&").forEach(function (kv) {
        var parts = kv.split("=");
        query[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || "");
      });
      h = h.slice(0, qi);
    }
    var seg = h.split("/").filter(Boolean);
    return { seg: seg, query: query, hash: h };
  }

  function currentNav(seg) {
    var s = seg[0];
    if (s === "test") return "#/test";
    if (s === "submit") return "#/submit";
    if (s === "leaderboard") return "#/leaderboard";
    if (s === "lab" || s === "saved") return "#/lab";
    return "#/discover";
  }

  function renderNav(active) {
    var queue = allProtos().filter(function (p) { return !isTested(p.id) && p.creator !== D.ME && p.testers < 40; }).length;
    var rail = byId("rail-nav");
    if (rail) {
      rail.innerHTML = NAV.map(function (item) {
        return '<li><a class="rail-link" href="' + item.href + '"' + (active === item.href ? ' aria-current="page"' : '') + '>' +
          ICON[item.icon] + '<span>' + item.label + '</span>' +
          (item.badge && queue ? '<span class="nav-badge">' + queue + '</span>' : '') + '</a></li>';
      }).join("");
    }
    var bn = byId("bottomnav");
    if (bn) {
      bn.innerHTML = NAV.map(function (item) {
        return '<a class="bn-item ' + (item.primary ? "bn-primary" : "") + '" href="' + item.href + '"' + (active === item.href ? ' aria-current="page"' : '') + '>' +
          ICON[item.icon] + '<span>' + item.label + '</span></a>';
      }).join("");
    }
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  var lastHash = null;
  function render() {
    var r = parseRoute();
    var seg = r.seg;
    var html;
    if (seg[0] === "p" && seg[1]) html = VIEW.proto({ id: seg[1] });
    else if (seg[0] === "u" && seg[1]) html = VIEW.lab({ handle: seg[1], tab: r.query.tab });
    else if (seg[0] === "dash" && seg[1]) html = VIEW.dash({ id: seg[1] });
    else if (seg[0] === "test") html = VIEW.test();
    else if (seg[0] === "submit") html = VIEW.submit();
    else if (seg[0] === "leaderboard") html = VIEW.board();
    else if (seg[0] === "pricing") html = VIEW.pricing();
    else if (seg[0] === "report" && seg[1]) html = VIEW.report({ id: seg[1] });
    else if (seg[0] === "lab") html = VIEW.lab({ tab: r.query.tab });
    else if (seg[0] === "saved") html = VIEW.saved();
    else html = VIEW.discover({ feed: r.query.feed });

    main.innerHTML = html;
    renderNav(currentNav(seg));
    renderAside();
    paintCredits();
    if (lastHash !== r.hash + JSON.stringify(r.query)) {
      lastHash = r.hash + JSON.stringify(r.query);
      window.scrollTo(0, 0);
    }
  }

  /* ----------------------------------------------------------- interactions */
  function toggleReaction(btn) {
    var id = btn.getAttribute("data-id");
    var kind = btn.getAttribute("data-react");
    var r = reactionsOf(id);
    var p = getProto(id);
    r[kind] = !r[kind];
    if (kind === "useful" && r.useful) r.nope = false;
    if (kind === "nope" && r.nope) r.useful = false;
    save();

    /* Update every copy of this reaction bar in place so the animation survives. */
    Array.prototype.forEach.call(document.querySelectorAll('[data-react][data-id="' + id + '"]'), function (el) {
      var k = el.getAttribute("data-react");
      var on = r[k];
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", String(on));
      var count = el.querySelector(".rc");
      if (count && p && p.reactions[k] != null) count.textContent = n(p.reactions[k] + (on ? 1 : 0));
      if (el === btn && on) { el.classList.remove("on"); void el.offsetWidth; el.classList.add("on"); }
    });

    if (r[kind]) {
      var box = btn.getBoundingClientRect();
      if (kind === "pay") { sparks(box.left + box.width / 2, box.top, 10); toast('<span>💰</span> Marked <b>Would Pay</b> — the strongest signal on ProtoBuzz'); }
      else if (kind === "useful") toast('<span>👍</span> Marked Useful');
      else toast('<span>🙅</span> Marked Not for me — that counts too');
    }
  }

  function postComment(id) {
    var box = byId("comment-box");
    if (!box) return;
    var text = box.value.trim();
    if (!text) { box.focus(); return; }
    var tested = isTested(id);
    if (!S.comments[id]) S.comments[id] = [];
    S.comments[id].push({
      by: D.ME,
      verdict: tested && S.tested[id].pay === "y" ? "pay" : tested && S.tested[id].use === "n" ? "nope" : "use",
      tested: tested, when: "just now", text: text, up: 0
    });
    save();
    if (tested) addCredits(2, "Useful feedback", box);
    render();
    toast(tested ? '<span>✍️</span> Feedback posted · <b>+2 credits</b>' : '<span>✍️</span> Comment posted — test it to earn credits', tested ? "credit" : "");
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    function closest(sel) { return t.closest ? t.closest(sel) : null; }

    var el;
    if ((el = closest("[data-buy]"))) { buyState.packId = el.getAttribute("data-buy"); openBuyCredits(""); return; }
    if ((el = closest("[data-buy-credits]"))) { openBuyCredits(el.getAttribute("data-buy-credits")); return; }
    if ((el = closest("[data-pack]"))) { buyState.packId = el.getAttribute("data-pack"); renderBuyPick(); return; }
    if ((el = closest("[data-buy-next]"))) { buyState.step = "checkout"; renderBuyCheckout(); return; }
    if ((el = closest("[data-buy-back]"))) { buyState.step = "pick"; renderBuyPick(); return; }
    if ((el = closest("[data-buy-pay]"))) { completePurchase(); return; }
    if ((el = closest("[data-boost]"))) { openBoost(el.getAttribute("data-boost")); return; }
    if ((el = closest("[data-pack]"))) { openPack(el.getAttribute("data-pack")); return; }
    if ((el = closest("[data-pack-pay]"))) { payPack(el.getAttribute("data-pack-pay")); return; }
    if ((el = closest("[data-outcome]"))) { setOutcome(el.getAttribute("data-id2"), el.getAttribute("data-outcome")); return; }
    if ((el = closest("[data-pm]"))) { publishPostMortem(el.getAttribute("data-pm")); return; }
    if ((el = closest("[data-export]"))) { toast('<span>📄</span> PDF export is stubbed in this prototype'); return; }
    if ((el = closest("[data-boost-pay]"))) { payBoost(el.getAttribute("data-boost-pay")); return; }
    if ((el = closest("[data-pro]"))) { toast('<span>✨</span> Pro is a demo here — no subscription is started'); return; }
    if ((el = closest("[data-cashout]"))) {
      toast(S.earned >= D.PAYOUT.credits
        ? '<span>💸</span> Payout requested · ' + money(D.PAYOUT.usd) + ' (demo)'
        : '<span>💸</span> ' + (D.PAYOUT.credits - S.earned) + ' more tested credits to cash out');
      return;
    }
    if ((el = closest("[data-close-sheet]")) && !el.hasAttribute("data-go")) { closeSheet(); return; }
    if ((el = closest("[data-close-sheet][data-go]"))) { closeSheet(); go(el.getAttribute("data-go")); return; }
    if ((el = closest("[data-test]"))) { closeSheet(); startTest(el.getAttribute("data-test")); return; }
    if ((el = closest("[data-open]"))) { openPrototype(el.getAttribute("data-open")); return; }
    if ((el = closest("[data-answer]"))) {
      var q = QUESTIONS[sheetState.step];
      var val = el.getAttribute("data-answer");
      sheetState.answers[q.key] = val;
      el.classList.add("sel");
      setTimeout(function () {
        /* A paying band earns the one question worth asking: your email. */
        if (q.key === "pay" && val !== "none") sheetState.stage = "email";
        else sheetState.step++;
        renderTestStep();
      }, 170);
      return;
    }
    if ((el = closest("[data-profile]"))) {
      sheetState.draftProfile[el.getAttribute("data-profile")] = el.getAttribute("data-val");
      renderProfileStep();
      return;
    }
    if ((el = closest("[data-profile-done]"))) {
      var dp = sheetState.draftProfile;
      S.profile = {
        role: dp.role || "Something else",
        cadence: dp.cadence || "Monthly",
        paid: dp.paid || "Never paid"
      };
      save();
      sheetState.stage = "q";
      renderTestStep();
      return;
    }
    if ((el = closest("[data-email-send]"))) {
      var box = byId("signal-email");
      var val2 = box ? box.value.trim() : "";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val2)) {
        if (box) box.focus();
        toast('<span>⚠️</span> That does not look like an email');
        return;
      }
      sheetState.answers.email = true;
      sheetState.stage = "q";
      sheetState.step++;
      renderTestStep();
      return;
    }
    if ((el = closest("[data-email-skip]"))) {
      sheetState.stage = "q";
      sheetState.step++;
      renderTestStep();
      return;
    }
    if ((el = closest("[data-finish]"))) { finishTest(el.hasAttribute("data-skip")); return; }
    if ((el = closest("[data-test-next]"))) { closeSheet(); go("#/test"); return; }
    if ((el = closest("[data-react]"))) { toggleReaction(el); return; }
    if ((el = closest("[data-save]"))) {
      var sid = el.getAttribute("data-save");
      var i = S.saved.indexOf(sid);
      if (i > -1) S.saved.splice(i, 1); else S.saved.push(sid);
      save();
      var on = i === -1;
      el.classList.toggle("on", on);
      el.setAttribute("aria-pressed", String(on));
      toast(on ? '<span>🔖</span> Saved to My Lab' : '<span>🔖</span> Removed from saved');
      return;
    }
    if ((el = closest("[data-share]"))) {
      var url = location.origin + location.pathname + "#/p/" + el.getAttribute("data-share");
      try {
        if (navigator.clipboard) navigator.clipboard.writeText(url);
      } catch (err) {}
      toast('<span>🔗</span> Link copied');
      return;
    }
    if ((el = closest("[data-follow]"))) {
      var h = el.getAttribute("data-follow");
      var fi = S.follows.indexOf(h);
      if (fi > -1) S.follows.splice(fi, 1); else S.follows.push(h);
      save();
      var following = fi === -1;
      Array.prototype.forEach.call(document.querySelectorAll('[data-follow="' + h + '"]'), function (b) {
        b.setAttribute("aria-pressed", String(following));
        b.textContent = following ? "Following" : "Follow";
      });
      if (following) toast('<span>🐝</span> Following @' + esc(h));
      return;
    }
    if ((el = closest("[data-comment]"))) { postComment(el.getAttribute("data-comment")); return; }
    if ((el = closest("[data-up]"))) {
      var m = el.textContent.match(/(\d+)/);
      if (m) el.textContent = "▲ " + (parseInt(m[1], 10) + 1) + " helpful";
      el.style.color = "var(--honey)";
      return;
    }
    if ((el = closest("[data-feed]"))) { go("#/discover?feed=" + el.getAttribute("data-feed")); return; }
    if ((el = closest("[data-labtab]"))) {
      var seg = parseRoute().seg;
      var base = seg[0] === "u" && seg[1] ? "#/u/" + seg[1] : "#/lab";
      go(base + "?tab=" + el.getAttribute("data-labtab"));
      return;
    }
    if ((el = closest("[data-cat]"))) {
      draft.category = el.getAttribute("data-cat");
      Array.prototype.forEach.call(document.querySelectorAll("[data-cat]"), function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === draft.category));
      });
      return;
    }
    if ((el = closest("[data-stage]"))) {
      draft.stage = el.getAttribute("data-stage");
      Array.prototype.forEach.call(document.querySelectorAll("[data-stage]"), function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-stage") === draft.stage));
      });
      return;
    }
    if ((el = closest("[data-draft-next]"))) {
      var step = el.getAttribute("data-draft-next");
      if (step === "1") {
        var u = byId("f-url"), nm = byId("f-name");
        draft.url = u.value.trim(); draft.name = nm.value.trim();
        if (!draft.url) { u.focus(); toast('<span>⚠️</span> Paste the URL testers should open'); return; }
        if (!draft.name) { nm.focus(); toast('<span>⚠️</span> Give it a name'); return; }
        draft.step = 2;
      } else {
        draft.built = byId("f-built").value.trim();
        draft.feedback = byId("f-feedback").value.trim();
        if (!draft.built) { byId("f-built").focus(); toast('<span>⚠️</span> One line on what you built'); return; }
        if (!draft.feedback) { byId("f-feedback").focus(); toast('<span>⚠️</span> What do you want feedback on?'); return; }
        if (!draft.category) draft.category = "Consumer";
        if (!draft.stage) draft.stage = "Prototype";
        draft.step = 3;
      }
      render();
      return;
    }
    if ((el = closest("[data-draft-back]"))) {
      if (draft.step === 2) { draft.url = byId("f-url") ? byId("f-url").value : draft.url; }
      draft.step = Math.max(1, draft.step - 1);
      render();
      return;
    }
    if ((el = closest("[data-launch]"))) { launchPrototype(); return; }
    if ((el = closest("[data-back]"))) {
      if (history.length > 1) history.back(); else go("#/discover");
      return;
    }
    if ((el = closest("[data-go]"))) {
      if (el.hasAttribute("data-close-after")) closeSheet();
      go(el.getAttribute("data-go"));
      return;
    }
  });

  /* Enter/Space on the card thumbnails, which act as buttons. */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !sheetRoot.hidden) { closeSheet(); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.hasAttribute && e.target.hasAttribute("data-open")) {
      e.preventDefault();
      openPrototype(e.target.getAttribute("data-open"));
      return;
    }
    /* 1-3 answer the current test question. */
    if (sheetState && !sheetRoot.hidden && /^[1-3]$/.test(e.key)) {
      var opts = sheetRoot.querySelectorAll("[data-answer]");
      var idx = parseInt(e.key, 10) - 1;
      if (opts[idx]) opts[idx].click();
    }
  });

  /* ------------------------------------------------------------------ theme */
  function applyTheme(mode) {
    if (mode) document.documentElement.setAttribute("data-theme", mode);
    else document.documentElement.removeAttribute("data-theme");
  }
  Array.prototype.forEach.call(document.querySelectorAll("[data-theme-toggle]"), function (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var dark = document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") && !window.matchMedia("(prefers-color-scheme: light)").matches);
      S.theme = dark ? "light" : "dark";
      applyTheme(S.theme);
      save();
      toast('<span>' + (S.theme === "light" ? "☀️" : "🌙") + '</span> ' + (S.theme === "light" ? "Light" : "Dark") + ' theme');
    });
  });
  applyTheme(S.theme);

  window.addEventListener("hashchange", function () {
    if (!sheetRoot.hidden) { hideSheet(); dirty = false; }
    render();
  });
  render();
  paintCredits();

  /* A first-run nudge that names the demo journey without blocking anything. */
  if (!Object.keys(S.tested).length && !S.launched.length) {
    setTimeout(function () {
      toast('<span>🐝</span> You have <b class="mono">' + S.credits + '</b> credits — test one prototype to afford your own launch');
    }, 900);
  }
})();
