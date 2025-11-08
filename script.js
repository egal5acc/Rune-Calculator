// script.js — UI only (Tabs, orbs, parse/format helpers, placeholder calculations)

document.addEventListener('DOMContentLoaded', () => {

  /* --- create decorative orbs inside each accent container --- */
  function populateOrbs(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const o = document.createElement('div');
      o.className = 'orb';
      // randomish positions for organic look
      o.style.left = (6 + i * 30 + (i * 7)) + '%';
      o.style.top = (8 + i * 18) + '%';
      container.appendChild(o);
    }
  }
  populateOrbs('.xp-orbs'); populateOrbs('.boost-orbs'); populateOrbs('.time-orbs');

  /* --- tab switching --- */
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      // tabs active class
      tabs.forEach(t => {
        const active = (t === btn);
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      // panels show/hide
      panels.forEach(p => {
        const show = (p.id === target);
        p.classList.toggle('active', show);
        if (show) p.removeAttribute('hidden'); else p.setAttribute('hidden','true');
      });
      // style primary buttons to match tab accent
      document.querySelectorAll('.btn.primary').forEach(b => {
        b.style.background = (target === 'xp')
          ? 'linear-gradient(90deg,#5a1511,#a86b2a)'
          : (target === 'boost')
            ? 'linear-gradient(90deg,#421a4b,#7c4cff)'
            : 'linear-gradient(90deg,#12321b,#79dd7a)';
      });
    });
  });

  /* --- parsing / formatting helpers (supports k,m,b,t,qd,qn,sx,sp) --- */
  function parseShortNumber(s) {
    if (s === undefined || s === null) return NaN;
    if (typeof s === 'number') return s;
    s = String(s).toLowerCase().trim().replace(/,/g,'');
    if (s === '') return NaN;
    const map = { k:1e3, m:1e6, b:1e9, t:1e12, qd:1e15, qn:1e18, sx:1e21, sp:1e24 };
    const m = s.match(/^([\d.]+)\s*([a-z]{0,2})$/i);
    if (!m) return NaN;
    const v = parseFloat(m[1]); const suf = m[2] || '';
    return v * (map[suf] || 1);
  }

  function formatShortNumber(n) {
    if (!isFinite(n)) return String(n);
    const units = [
      {v:1e24,s:'sp'},{v:1e21,s:'sx'},{v:1e18,s:'qn'},{v:1e15,s:'qd'},
      {v:1e12,s:'t'},{v:1e9,s:'b'},{v:1e6,s:'m'},{v:1e3,s:'k'}
    ];
    for (const u of units) {
      if (n >= u.v) return (n / u.v).toFixed(2).replace(/\.00$/,'') + u.s;
    }
    return Math.round(n).toLocaleString();
  }

  /* --- XP panel buttons (placeholder behavior) --- */
  const xpCalc = document.getElementById('xp-calc');
  const xpReset = document.getElementById('xp-reset');
  const xpResEl = document.getElementById('xp-result');

  if (xpCalc) {
    xpCalc.addEventListener('click', () => {
      const curLevel = parseInt(document.getElementById('xp-current-level').value);
      const tarLevel = parseInt(document.getElementById('xp-target-level').value);
      const runeType = document.getElementById('xp-rune-type').value;
      const curXP = parseShortNumber(document.getElementById('xp-current-xp').value);
      const perLevel = parseShortNumber(document.getElementById('xp-per-level').value);

      if (!curLevel || !tarLevel || tarLevel <= curLevel) {
        xpResEl.textContent = '❌ Bitte gültige Levels eingeben (Ziel > Aktuell).';
        return;
      }
      if (!perLevel || Number.isNaN(perLevel)) {
        xpResEl.textContent = '❌ Bitte XP pro Level angeben (z.B. 50m).';
        return;
      }

      // placeholder linear calculation — replace when Formel vorliegt
      const levels = tarLevel - curLevel;
      const total = perLevel * levels - (isFinite(curXP) ? curXP : 0);

      xpResEl.innerHTML = `Du brauchst <strong>${formatShortNumber(Math.max(0, total))}</strong> XP, (Rune: ${runeType || '–'}) — (Platzhalter).`;
    });
  }
  if (xpReset) xpReset.addEventListener('click', () => {
    document.getElementById('form-xp').reset(); xpResEl.textContent = '';
  });

  /* --- Boost panel placeholders --- */
  const boostCalc = document.getElementById('boost-calc');
  const boostReset = document.getElementById('boost-reset');
  const boostRes = document.getElementById('boost-result');

  if (boostCalc) boostCalc.addEventListener('click', () => {
    const type = document.getElementById('boost-rune-type').value;
    const level = parseFloat(document.getElementById('boost-level').value);
    if (!type || !level) { boostRes.textContent = '❌ Bitte Rune-Typ und Level eingeben.'; return; }
    boostRes.innerHTML = `Rune: <strong>${type}</strong>, Level: <strong>${level}</strong> — Boost-Formel noch offen.`;
  });
  if (boostReset) boostReset.addEventListener('click', () => {
    document.getElementById('form-boost').reset(); boostRes.textContent = '';
  });

  /* --- Time panel placeholders (separate Speed + Clone) --- */
  const timeCalc = document.getElementById('time-calc');
  const timeReset = document.getElementById('time-reset');
  const timeRes = document.getElementById('time-result');

  if (timeCalc) timeCalc.addEventListener('click', () => {
    const speed = document.getElementById('time-speed').value;
    const clone = document.getElementById('time-clone').value;
    const xpTarget = parseShortNumber(document.getElementById('time-xp-target').value);
    if (!speed || !clone) { timeRes.textContent = '❌ Bitte Rune Speed und Clone angeben.'; return; }

    // placeholder message; real formula plugged later
    if (isFinite(xpTarget)) {
      timeRes.innerHTML = `Geschätzt: <strong>${Math.max(0, Math.round(xpTarget / 1000))}</strong> Stunden (Platzhalter).`;
    } else {
      timeRes.innerHTML = `Rune Speed: <strong>${speed}</strong>, Clone: <strong>${clone}</strong> — Formel fehlt noch.`;
    }
  });
  if (timeReset) timeReset.addEventListener('click', () => {
    document.getElementById('form-time').reset(); timeRes.textContent = '';
  });

});
