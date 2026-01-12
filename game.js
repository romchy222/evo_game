(() => {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');

  // UI refs
  const $ep = document.getElementById('ep');
  const $epRate = document.getElementById('epRate');
  const $infl = document.getElementById('infl');
  const $epoch = document.getElementById('epoch');
  const $epochProg = document.getElementById('epochProg');
  const $epochFill = document.getElementById('epochFill');
  const $targetHint = document.getElementById('targetHint');
  const $gp = document.getElementById('gp');
  const $essence = document.getElementById('essence');
  const $modifierHint = document.getElementById('modifierHint');
  const $pathHint = document.getElementById('pathHint');
  const $offlineHint = document.getElementById('offlineHint');
  const $ringSummary = document.getElementById('ringSummary');
  const $ringList = document.getElementById('ringList');

  const $toggle = document.getElementById('toggle');
  const $reset = document.getElementById('reset');
  const $prestige = document.getElementById('prestige');
  const $timeBoost = document.getElementById('timeBoost');

  const $selName = document.getElementById('selName');
  const $selX = document.getElementById('selX');
  const $selD = document.getElementById('selD');
  const $selSpeed = document.getElementById('selSpeed');
  const $selLvl = document.getElementById('selLvl');
  const $upSpeed = document.getElementById('upSpeed');
  const $upDelta = document.getElementById('upDelta');
  const $reduceInflation = document.getElementById('reduceInflation');
  const $buySynergy = document.getElementById('buySynergy');
  const $costHint = document.getElementById('costHint');

  const $buyGeneX = document.getElementById('buyGeneX');
  const $buyGeneInfl = document.getElementById('buyGeneInfl');
  const $buyGeneRing = document.getElementById('buyGeneRing');
  const $buyGeneAuto = document.getElementById('buyGeneAuto');

  const $pathSpeed = document.getElementById('pathSpeed');
  const $pathPower = document.getElementById('pathPower');
  const $pathStability = document.getElementById('pathStability');

  const $buySkin = document.getElementById('buySkin');
  const $buyBurst = document.getElementById('buyBurst');

  const $achList = document.getElementById('achList');
  const $recHint = document.getElementById('recHint');
  const $statsGrid = document.getElementById('statsGrid');
  const $toggleAutoBuy = document.getElementById('toggleAutoBuy');
  const $toggleAutoPrestige = document.getElementById('toggleAutoPrestige');
  const $toggleSound = document.getElementById('toggleSound');
  const $toggleFloat = document.getElementById('toggleFloat');
  const $toggleCompact = document.getElementById('toggleCompact');
  const $autoPriSpeed = document.getElementById('autoPriSpeed');
  const $autoPriDelta = document.getElementById('autoPriDelta');
  const $autoPriInfl = document.getElementById('autoPriInfl');
  const $autoPriSyn = document.getElementById('autoPriSyn');
  const $challengeList = document.getElementById('challengeList');
  const $startChallenge = document.getElementById('startChallenge');
  const $cancelChallenge = document.getElementById('cancelChallenge');
  const $challengeHint = document.getElementById('challengeHint');
  const tabButtons = Array.from(document.querySelectorAll('.tabBtn'));
  const panes = Array.from(document.querySelectorAll('.pane'));
  let lastRingSummaryRender = 0;
  let lastRingListRender = 0;
  let lastStatsRender = 0;
  let lastChallengeRender = 0;
  let audioCtx = null;
  let audioArmed = false;
  let lastTickAt = 0;
  let lastAutoAt = 0;
  const fx = [];
  let lastCenter = { x: 0, y: 0 };
  let offlineSimulating = false;

  // --- Config ---
  const cfg = {
    baseRings: 10,
    K: 22,
    r: 0.00065,       // базовый рост инфляции (мягче для старта с 1 кольца)
    c: 0.008,         // рост инфляции от мощности
    S: 5200,
    baseTarget: 1e4,
    G: 12,
    prestigeInflReset: 0.28,
    prestigeBonusGrowth: 1.12,
    ringGap: 16,
    ringThickness: 10,
    bgGlow: 0.06,
    offlineEfficiency: 0.35,
    offlineStepsCap: 5000,
    essenceClosureStep: 120,
    timeBoostCost: 2,
    timeBoostDuration: 30,
    skinCost: 8,
    pathEpochRequired: 3,
    maxFx: 80,
    upgradesToUnlock: 5,
  };

  // --- State ---
  const state = {
    running: true,
    EP: 0,
    I: 1,
    epoch: 0,
    prestigeBonus: 1,
    rings: [],
    selected: 0,
    gp: 0,
    essence: 0,
    synergy: 0,
    inflCuts: 0,
    path: null,
    pathRank: 0,
    modifier: null,
    timeBoostUntil: 0,
    skinOwned: false,
    auto: { buy: false, prestige: false },
    autoPriority: 'speed',
    options: { sound: true, floatNumbers: true, numberFormat: 'sci' },
    challenge: { selected: null, active: null, completed: {} },
    epochInflationStart: 1,
    unlockedRings: 1,
    stats: {
      closures: 0,
      essenceTicker: 0,
      offlineCycles: 0,
      lastSave: Date.now(),
      lastFrame: performance.now(),
      idealTracker: new Set(),
      lastClosureTs: 0,
      runStarted: Date.now(),
      totalEP: 0,
      totalPrestiges: 0,
      totalPlaySeconds: 0,
      rateLastTs: Date.now(),
      rateLastTotalEP: 0,
      epPerSec: 0,
    },
    gene: { xBoost: 0, infl: 0, extraRing: 0, auto: 0 },
    achievements: {},
  };

  const achievementDefs = [
    { id: 'x100', name: 'x\u2081 > 100', desc: 'Первое кольцо до 100', reward: { essence: 1, bonus: 'speed' } },
    { id: 'infl1e6', name: 'Инфляция 1e6', desc: 'Пережить взрыв инфляции', reward: { essence: 2 } },
    { id: 'epoch10fast', name: '10 эпох за 24ч', desc: 'Спидран эпох', reward: { essence: 3 } },
    { id: 'ideal', name: 'Идеальный цикл', desc: 'Все кольца замкнуты за 1с', reward: { essence: 1, bonus: 'prestige' } },
    { id: 'gp5', name: 'Генная инженерия', desc: 'Заработать 5 GP', reward: { essence: 1 } },
  ];

  const challengeDefs = [
    {
      id: 'fragile',
      title: 'Хрупкий мир',
      desc: '+100% рост инфляции, награда за завершение',
      apply: { inflMul: 2.0 },
      reward: { essence: 3 },
    },
    {
      id: 'fewRings',
      title: 'Мало колец',
      desc: '-3 активных кольца, но +50% EP',
      apply: { ringsDelta: -3, gainMul: 1.5 },
      reward: { essence: 2 },
    },
    {
      id: 'noSynergy',
      title: 'Без синергии',
      desc: 'Синергия отключена, +30% скорость',
      apply: { forbidSynergy: true, speedMul: 1.3 },
      reward: { essence: 2 },
    },
  ];

  const modifiers = [
    { id: 'inflUp', desc: '+50% инфляции', inflMul: 1.5 },
    { id: 'lessRings', desc: '-2 кольца, но +200% к ним', ringsDelta: -2, ringPower: 3 },
    { id: 'speedy', desc: '+20% скорость, -10% Δ', speedMul: 1.2, dMul: 0.9 },
    { id: 'rich', desc: '+30% EP, +10% инфляция', gainMul: 1.3, inflMul: 1.1 },
    { id: 'calm', desc: 'Инфляция -25%', inflMul: 0.75 },
  ];

  // --- Helpers ---
  function resize() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function fmt(n) {
    if (!Number.isFinite(n)) return '—';
    if (n < 1e6) return n.toFixed(n < 100 ? 2 : 0);
    const e = Math.floor(Math.log10(n));
    const m = n / Math.pow(10, e);
    if (state.options.numberFormat === 'sci') return `${m.toFixed(2)}e${e}`;
    const suffixes = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
    const tier = Math.floor(e / 3);
    if (tier <= 0) return n.toFixed(0);
    const suff = suffixes[tier - 1] || `e${e}`;
    const scaled = n / Math.pow(10, tier * 3);
    return `${scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0)}${suff}`;
  }

  function armAudio() {
    if (audioArmed) return;
    audioArmed = true;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch {
      audioArmed = false;
    }
  }

  function playTone(freq, durationSec, type, volume) {
    if (!state.options.sound) return;
    if (!audioArmed || !audioCtx) return;
    if (offlineSimulating) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.02, durationSec));
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + Math.max(0.03, durationSec) + 0.02);
  }

  function soundClick() {
    playTone(260, 0.05, 'square', 0.02);
  }

  function soundTick() {
    const t = performance.now();
    if (t - lastTickAt < 65) return;
    lastTickAt = t;
    playTone(720, 0.03, 'triangle', 0.012);
  }

  function addFloat(text, color = 'rgba(255,255,255,0.9)') {
    if (!state.options.floatNumbers) return;
    if (offlineSimulating) return;
    if (fx.length > cfg.maxFx) fx.splice(0, fx.length - cfg.maxFx);
    fx.push({
      x: lastCenter.x + (Math.random() - 0.5) * 80,
      y: lastCenter.y + (Math.random() - 0.5) * 30,
      vy: -18 - Math.random() * 10,
      ttl: 1.1,
      t: 0,
      text,
      color,
    });
  }

  function updateFx(dt) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i];
      p.t += dt;
      p.y += p.vy * dt;
      if (p.t >= p.ttl) fx.splice(i, 1);
    }
  }

  function targetForEpoch(e) {
    const pathBonus = state.path === 'stability' ? 0.9 : 1;
    return cfg.baseTarget * Math.pow(cfg.G, e) * pathBonus;
  }

  function productM(activeCount) {
    let m = 1;
    for (let i = 0; i < activeCount; i++) m *= state.rings[i].x;
    return m;
  }

  function desiredRings() {
    return cfg.baseRings + state.gene.extraRing;
  }

  function unlockStartCount() {
    return Math.max(1, 1 + state.gene.extraRing);
  }

  function unlockedCount() {
    return Math.max(1, Math.min(desiredRings(), state.unlockedRings));
  }

  function activeRingCount() {
    const penalty = effectiveModifier()?.ringsDelta || 0;
    return Math.max(1, Math.min(desiredRings(), unlockedCount()) + penalty);
  }

  function canPrestige() {
    return state.EP >= targetForEpoch(state.epoch);
  }

  function ringCostSpeed(r) {
    return 35 * Math.pow(1.58, r.lvl) * Math.pow(1.10, r.idx);
  }

  function ringCostDelta(r) {
    return 90 * Math.pow(1.72, r.dLvl) * Math.pow(1.08, r.idx);
  }

  function save() {
    state.stats.lastSave = Date.now();
    const payload = { ...state, stats: { ...state.stats, idealTracker: [] } };
    localStorage.setItem('evo_rings_save', JSON.stringify(payload));
  }

  function load() {
    const raw = localStorage.getItem('evo_rings_save');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.assign(state, data);
      state.stats.idealTracker = new Set();
      if (!state.stats.runStarted) state.stats.runStarted = Date.now();
      if (!state.auto) state.auto = { buy: false, prestige: false };
      if (!state.options) state.options = { sound: true, floatNumbers: true, numberFormat: 'sci' };
      if (!state.autoPriority) state.autoPriority = 'speed';
      if (!state.challenge) state.challenge = { selected: null, active: null, completed: {} };
      if (!state.challenge.completed) state.challenge.completed = {};
      if (!state.unlockedRings) state.unlockedRings = 1;
      if (!state.stats.rateLastTs) state.stats.rateLastTs = Date.now();
      if (typeof state.stats.rateLastTotalEP !== 'number') state.stats.rateLastTotalEP = state.stats.totalEP || 0;
      if (!state.stats.epPerSec) state.stats.epPerSec = 0;
      if (typeof state.options.sound !== 'boolean') state.options.sound = true;
      if (typeof state.options.floatNumbers !== 'boolean') state.options.floatNumbers = true;
      if (!state.options.numberFormat) state.options.numberFormat = 'sci';
      if (!state.stats.totalEP) state.stats.totalEP = 0;
      if (!state.stats.totalPrestiges) state.stats.totalPrestiges = 0;
      if (!state.stats.totalPlaySeconds) state.stats.totalPlaySeconds = 0;
      state.stats.rateLastTotalEP = state.stats.totalEP;
      state.stats.rateLastTs = Date.now();
      ensureRings();
    } catch (err) {
      console.warn('save load failed', err);
    }
  }

  function ensureRings() {
    const need = desiredRings();
    while (state.rings.length < need) {
      const idx = state.rings.length;
      state.rings.push({
        idx,
        x: 1,
        d: 0.08 + idx * 0.06,
        speed: 8 + (cfg.baseRings - idx) * 1.25,
        progress: 0,
        rot: 0,
        lvl: 0,
        dLvl: 0,
      });
    }
    state.rings.length = need;
    if (!state.unlockedRings || state.unlockedRings < 1) state.unlockedRings = unlockStartCount();
    state.unlockedRings = Math.max(unlockStartCount(), Math.min(desiredRings(), state.unlockedRings));
  }

  function pickModifier() {
    state.modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
  }

  function activeChallengeDef() {
    if (!state.challenge.active) return null;
    return challengeDefs.find((c) => c.id === state.challenge.active) || null;
  }

  function selectedChallengeDef() {
    if (!state.challenge.selected) return null;
    return challengeDefs.find((c) => c.id === state.challenge.selected) || null;
  }

  function effectiveModifier() {
    const base = state.modifier || {};
    const ch = activeChallengeDef()?.apply || {};
    return { ...base, ...ch };
  }

  function renderChallenges() {
    if (!$challengeList) return;
    $challengeList.innerHTML = '';
    for (const c of challengeDefs) {
      const div = document.createElement('div');
      const isSelected = state.challenge.selected === c.id;
      const isActive = state.challenge.active === c.id;
      div.className = `challengeItem ${isSelected ? 'active' : ''}`;
      div.innerHTML = `
        <div>
          <div class="t">${c.title}${isActive ? ' (active)' : ''}</div>
          <div class="d">${c.desc}</div>
        </div>
        <div class="r">+${c.reward.essence} Essence</div>
      `;
      div.addEventListener('click', () => {
        state.challenge.selected = c.id;
        renderChallenges();
        updateUI();
      });
      $challengeList.appendChild(div);
    }
  }

  function grantAchievement(a) {
    if (state.achievements[a.id]) return;
    state.achievements[a.id] = true;
    state.essence += a.reward?.essence || 0;
    if (a.reward?.bonus === 'speed') state.prestigeBonus *= 1.01;
    if (a.reward?.bonus === 'prestige') state.prestigeBonus *= 1.02;
    renderAchievements();
  }

  function checkAchievements(now) {
    const active = activeRingCount();
    const defs = achievementDefs;
    for (const a of defs) {
      if (state.achievements[a.id]) continue;
      if (a.id === 'x100' && state.rings[0].x >= 100) grantAchievement(a);
      if (a.id === 'infl1e6' && state.I >= 1e6) grantAchievement(a);
      if (a.id === 'gp5' && state.gp >= 5) grantAchievement(a);
      if (a.id === 'epoch10fast' && state.epoch >= 10 && (Date.now() - state.stats.runStarted) < 86400000) grantAchievement(a);
      if (a.id === 'ideal' && state.stats.idealTracker.size >= active) grantAchievement(a);
    }
    if (state.stats.idealTracker.size >= active && state.stats.lastClosureTs && now - state.stats.lastClosureTs <= 1000) {
      state.essence += 1;
      state.stats.idealTracker.clear();
    }
  }

  function updateSelectedUI() {
    const r0 = state.rings[state.selected];
    if (!r0) return;
    const total = desiredRings();
    const unlocked = unlockedCount();
    const active = activeRingCount();
    const locked = state.selected >= unlocked;
    const disabled = !locked && state.selected >= active;

    $selName.textContent = `#${r0.idx + 1}`;
    $selX.textContent = fmt(r0.x);
    $selD.textContent = fmt(r0.d);
    $selSpeed.textContent = r0.speed.toFixed(2);
    $selLvl.textContent = `${r0.lvl} / Δ:${r0.dLvl}`;
    const cs = ringCostSpeed(r0);
    const cd = ringCostDelta(r0);
    const syn = effectiveModifier()?.forbidSynergy ? 'недоступна' : `${fmt(synergyCost())} EP`;
    $costHint.textContent = `Стоимость: скорость ${fmt(cs)} EP • Δ ${fmt(cd)} EP • инфляция ${fmt(inflationCutCost())} EP • синергия ${syn}`;

    const lockHint = locked
      ? ` (заблокировано: сделай ${cfg.upgradesToUnlock} апгрейдов на кольце #${unlocked})`
      : disabled
        ? ' (временно отключено модификатором)'
        : '';
    if ($recHint) $recHint.textContent = locked ? `Открытие: улучшай кольцо #${unlocked} (${cfg.upgradesToUnlock} апгрейдов), чтобы открыть #${unlocked + 1}.` : $recHint.textContent;

    const lockButtons = locked || disabled;
    if ($upSpeed) $upSpeed.disabled = lockButtons || state.EP < cs;
    if ($upDelta) $upDelta.disabled = lockButtons || state.EP < cd;
    if ($reduceInflation) $reduceInflation.disabled = lockButtons || state.EP < inflationCutCost();
    if ($buySynergy) $buySynergy.disabled = lockButtons || state.EP < synergyCost() || !!effectiveModifier()?.forbidSynergy;

    if (locked || disabled) {
      $costHint.textContent = `Кольцо #${state.selected + 1}${lockHint}`;
    }
    updateRecommendation();
  }

  function updateRecommendation() {
    if (!$recHint) return;
    const r0 = state.rings[state.selected];
    if (!r0) { $recHint.textContent = ''; return; }
    if (state.selected >= unlockedCount()) {
      $recHint.textContent = `Чтобы открыть кольцо #${state.selected + 1}: сделай ${cfg.upgradesToUnlock} апгрейдов на кольце #${unlockedCount()}.`;
      return;
    }
    const options = [
      { id: 'speed', label: 'Скорость', cost: ringCostSpeed(r0), value: (r0.speed * 0.15) / Math.max(1, ringCostSpeed(r0)) },
      { id: 'delta', label: 'Δ', cost: ringCostDelta(r0), value: (r0.d * 0.18) / Math.max(1, ringCostDelta(r0)) },
      { id: 'infl', label: 'Срез инфляции', cost: inflationCutCost(), value: (0.02) / Math.max(1, inflationCutCost()) },
      { id: 'syn', label: 'Синергия', cost: synergyCost(), value: (0.03) / Math.max(1, synergyCost()) },
    ];
    options.sort((a, b) => b.value - a.value);
    const best = options[0];
    const afford = state.EP >= best.cost ? 'можно купить' : 'дорого';
    $recHint.textContent = `Рекомендация: ${best.label} (${afford}) • стоимость ${fmt(best.cost)} EP`;
  }

  function renderRingSummary() {
    const now = Date.now();
    if (now - lastRingSummaryRender < 150) return;
    lastRingSummaryRender = now;
    $ringSummary.innerHTML = '';
    const active = activeRingCount();
    for (let i = 0; i < active; i++) {
      const pill = document.createElement('div');
      pill.className = 'pill';
      pill.textContent = `x${i+1} ${fmt(state.rings[i].x)}`;
      const sm = document.createElement('span');
      sm.className = 'sm';
      sm.textContent = `Δ ${fmt(state.rings[i].d)}`;
      pill.appendChild(sm);
      $ringSummary.appendChild(pill);
    }
  }

  function renderRingList() {
    const now = Date.now();
    if (now - lastRingListRender < 150) return;
    $ringList.innerHTML = '';
    const total = desiredRings();
    const unlocked = unlockedCount();
    const active = activeRingCount();
    const last = state.rings[Math.max(0, unlocked - 1)];
    const unlockProg = last ? ((last.lvl || 0) + (last.dLvl || 0)) : 0;
    for (let i = 0; i < total; i++) {
      const r = state.rings[i];
      const card = document.createElement('div');
      const locked = i >= unlocked;
      const disabled = !locked && i >= active;
      card.className = `ringCard ${i === state.selected ? 'active' : ''} ${locked ? 'locked' : ''} ${disabled ? 'disabled' : ''}`;
      card.dataset.idx = i;
      const sub = locked
        ? `Заблокировано: апгрейды на #${unlocked} (${Math.min(cfg.upgradesToUnlock, unlockProg)}/${cfg.upgradesToUnlock})`
        : disabled
          ? `Отключено модификатором`
          : `x=${fmt(r.x)} | Δ=${fmt(r.d)}`;
      card.innerHTML = `
        <div>
          <div class="title">Кольцо #${i+1}</div>
          <div class="small">${sub}</div>
        </div>
        <div class="small">Lvl ${r.lvl} • Speed ${r.speed.toFixed(1)}%/с</div>
      `;
      card.addEventListener('click', () => {
        state.selected = i;
        updateSelectedUI();
        renderRingList();
      });
      $ringList.appendChild(card);
    }
    lastRingListRender = now;
  }

  function setPane(name) {
    tabButtons.forEach((b) => {
      const active = b.dataset.pane === name;
      b.classList.toggle('active', active);
    });
    panes.forEach((p) => p.classList.toggle('active', p.classList.contains(`pane-${name}`)));
  }

  function synergyCost() {
    return 650 * Math.pow(2.15, state.synergy);
  }

  function inflationCutCost() {
    return 420 * Math.pow(2.35, state.inflCuts);
  }

  function geneCost(base, lvl) {
    return Math.floor(base * Math.pow(1.8, lvl));
  }

  function applyPath(name) {
    if (state.path) return;
    if (state.epoch < cfg.pathEpochRequired) return;
    state.path = name;
    state.pathRank = 1;
  }

  function maybeUnlockNextRing() {
    const total = desiredRings();
    const unlocked = unlockedCount();
    if (unlocked >= total) return;
    const last = state.rings[unlocked - 1];
    if (!last) return;
    const upgrades = (last.lvl || 0) + (last.dLvl || 0);
    if (upgrades < cfg.upgradesToUnlock) return;
    state.unlockedRings = Math.min(total, unlocked + 1);
    addFloat(`Открыто кольцо #${state.unlockedRings}`, 'rgba(255,255,255,0.95)');
    renderRingList();
  }

  function onRingClosed(ring, now) {
    const mod = effectiveModifier();
    state.stats.closures += 1;
    state.stats.essenceTicker += 1;
    state.stats.lastClosureTs = now;
    state.stats.idealTracker.add(ring.idx);

    if (state.stats.essenceTicker >= cfg.essenceClosureStep) {
      state.essence += 1;
      state.stats.essenceTicker = 0;
    }

    const dMul = (mod?.dMul || 1);
    const powerMul = (mod?.ringPower || 1);
    const pathMul = state.path === 'power' ? 1.15 : 1;
    const geneMul = 1 + state.gene.xBoost * 0.05;
    ring.x += ring.d * dMul * pathMul * geneMul * powerMul / (1 + ring.x / cfg.K);

    const active = activeRingCount();
    const M = productM(active);
    const gainMul = (mod?.gainMul || 1) * (state.path === 'power' ? 1.1 : 1) * powerMul;
    const ringCountBonus = 1 + Math.max(0, active - 1) * 0.06;
    const gain = ((M * state.prestigeBonus * gainMul) + 1) * ringCountBonus / state.I;
    state.EP += gain;
    state.stats.totalEP += gain;
    addFloat(`+${fmt(gain)} EP`, 'rgba(180,220,255,0.95)');
    soundTick();

    const inflBase = cfg.c * (M / (M + cfg.S));
    const inflRings = 0.75 + 0.08 * Math.min(10, active);
    const inflMul = (mod?.inflMul || 1) * (1 - 0.1 * state.gene.infl) * (state.path === 'stability' ? 0.8 : 1) * inflRings;
    state.I *= (1 + inflBase * inflMul);

    if (state.synergy > 0 && !mod?.forbidSynergy) {
      const s = 0.03 * state.synergy;
      if (ring.idx < active - 1) {
        state.rings[ring.idx + 1].x += ring.x * s * 0.05;
      } else {
        for (let i = 0; i < active - 1; i++) state.rings[i].x += ring.x * s * 0.01;
      }
    }

    checkAchievements(now);
  }

  function update(dt, now) {
    const active = activeRingCount();
    const mod = effectiveModifier();
    const speedMul = (mod?.speedMul || 1) * (state.path === 'speed' ? 1.15 + 0.02 * state.pathRank : 1);

    let inflLinear = cfg.r * (1 - 0.1 * state.gene.infl);
    if (state.path === 'stability') inflLinear *= 0.7;
    if (mod?.inflMul) inflLinear *= mod.inflMul;
    inflLinear *= 0.70 + 0.06 * Math.min(10, active);
    state.I *= (1 + inflLinear * dt);

    for (let i = 0; i < active; i++) {
      const ring = state.rings[i];
      ring.progress += ring.speed * speedMul * dt;
      ring.rot += (ring.speed * 0.004) * dt * Math.PI * 2;
      if (ring.progress >= 100) {
        ring.progress -= 100;
        onRingClosed(ring, now);
      }
    }

    state.stats.totalPlaySeconds += dt;
    if (state.auto.buy && state.gene.auto > 0) autoSpend();
    if (state.auto.prestige && canPrestige()) prestige();
  }

  function autoSpend() {
    const now = performance.now();
    if (now - lastAutoAt < 260) return;
    lastAutoAt = now;

    const active = activeRingCount();
    const mod = effectiveModifier();

    function buySpeed() {
      let best = null;
      for (let i = 0; i < active; i++) {
        const r = state.rings[i];
        const cost = ringCostSpeed(r);
        if (state.EP < cost) continue;
        if (!best || cost < best.cost) best = { r, cost };
      }
      if (!best) return false;
      state.EP -= best.cost;
      best.r.lvl += 1;
      best.r.speed *= 1.15;
      maybeUnlockNextRing();
      return true;
    }

    function buyDelta() {
      let best = null;
      for (let i = 0; i < active; i++) {
        const r = state.rings[i];
        const cost = ringCostDelta(r);
        if (state.EP < cost) continue;
        if (!best || cost < best.cost) best = { r, cost };
      }
      if (!best) return false;
      state.EP -= best.cost;
      best.r.dLvl += 1;
      best.r.d *= 1.18;
      maybeUnlockNextRing();
      return true;
    }

    function buyInfl() {
      const cost = inflationCutCost();
      if (state.EP < cost) return false;
      state.EP -= cost;
      state.inflCuts += 1;
      state.I *= 0.985;
      return true;
    }

    function buySyn() {
      if (mod?.forbidSynergy) return false;
      const cost = synergyCost();
      if (state.EP < cost) return false;
      state.EP -= cost;
      state.synergy += 1;
      return true;
    }

    const attempts = Math.max(1, Math.min(3, state.gene.auto));
    const order = (() => {
      switch (state.autoPriority) {
        case 'delta': return ['delta', 'speed', 'infl', 'syn'];
        case 'infl': return ['infl', 'speed', 'delta', 'syn'];
        case 'syn': return ['syn', 'speed', 'delta', 'infl'];
        default: return ['speed', 'delta', 'syn', 'infl'];
      }
    })();

    for (let k = 0; k < attempts; k++) {
      let bought = false;
      for (const t of order) {
        if (t === 'speed') bought = buySpeed();
        else if (t === 'delta') bought = buyDelta();
        else if (t === 'infl') bought = buyInfl();
        else if (t === 'syn') bought = buySyn();
        if (bought) break;
      }
      if (!bought) break;
    }
  }

  function draw(now, dt) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2, cy = h / 2;
    lastCenter = { x: cx, y: cy };
    ctx.clearRect(0, 0, w, h);

    // background
    ctx.save();
    const hue = (state.epoch * 37) % 360;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.6);
    grad.addColorStop(0, `hsla(${hue},70%,25%,0.5)`);
    grad.addColorStop(1, '#0b0f1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = cfg.bgGlow;
    for (let k = 0; k < 7; k++) {
      const r = Math.min(w, h) * (0.08 + k * 0.07);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // core pulse
    ctx.save();
    const pulse = 0.045 + Math.sin(now / 400) * 0.003;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fill();
    ctx.restore();

    const baseR = Math.min(w, h) * 0.08;
    const active = activeRingCount();

    for (let i = 0; i < active; i++) {
      const r = state.rings[i];
      const rr = baseR + i * cfg.ringGap;
      const frac = Math.max(0, Math.min(1, r.progress / 100));
      const start = r.rot;
      const end = start + frac * Math.PI * 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = cfg.ringThickness;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, rr, start, end);
      const sel = (i === state.selected);
      const col = state.skinOwned ? `hsla(${hue + i * 14},80%,70%,${sel ? 0.95 : 0.6})` : (sel ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)');
      ctx.strokeStyle = col;
      ctx.lineWidth = cfg.ringThickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      const mx = cx + Math.cos(end) * rr;
      const my = cy + Math.sin(end) * rr;
      ctx.beginPath();
      ctx.arc(mx, my, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      ctx.restore();
    }

    // overlay numbers
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '12px "Segoe UI", system-ui';
    const lines = [];
    for (let i = 0; i < active; i++) lines.push(`x${i+1}=${fmt(state.rings[i].x)}`);
    const col1 = lines.slice(0, Math.ceil(lines.length / 2));
    const col2 = lines.slice(Math.ceil(lines.length / 2));
    const y0 = cy - 46;
    col1.forEach((t, j) => ctx.fillText(t, cx - 140, y0 + j * 16));
    col2.forEach((t, j) => ctx.fillText(t, cx + 40, y0 + j * 16));

    if (fx.length) {
      ctx.save();
      ctx.font = '12px "Segoe UI", system-ui';
      ctx.textAlign = 'center';
      for (const p of fx) {
        const a = Math.max(0, 1 - p.t / p.ttl);
        ctx.globalAlpha = 0.9 * a;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  function updateUI() {
    $ep.textContent = fmt(state.EP);
    if ($epRate) $epRate.textContent = fmt(state.stats.epPerSec);
    $infl.textContent = fmt(state.I);
    $epoch.textContent = String(state.epoch);
    $gp.textContent = fmt(state.gp);
    $essence.textContent = fmt(state.essence);
    renderRingSummary();
    renderRingList();

    // EP/sec (по накопленному totalEP, сглаживание)
    const now = Date.now();
    const dtRate = Math.max(0.001, (now - state.stats.rateLastTs) / 1000);
    if (dtRate >= 0.5) {
      const delta = Math.max(0, state.stats.totalEP - state.stats.rateLastTotalEP);
      const inst = delta / dtRate;
      state.stats.epPerSec = state.stats.epPerSec * 0.65 + inst * 0.35;
      state.stats.rateLastTs = now;
      state.stats.rateLastTotalEP = state.stats.totalEP;
      if ($epRate) $epRate.textContent = fmt(state.stats.epPerSec);
    }

    const t = targetForEpoch(state.epoch);
    const p = Math.max(0, Math.min(1, state.EP / t));
    $epochProg.textContent = `${(p * 100).toFixed(2)}%`;
    $epochFill.style.width = `${(p * 100).toFixed(2)}%`;
    $targetHint.textContent = `Target: ${fmt(t)} EP • Prestige bonus: ${fmt(state.prestigeBonus)}x`;
    const baseMod = state.modifier ? state.modifier.desc : 'нет';
    const ch = activeChallengeDef();
    $modifierHint.textContent = `Мировой модификатор: ${baseMod}${ch ? ` • Испытание: ${ch.title}` : ''}`;
    $pathHint.textContent = state.path ? `Путь: ${state.path} (ранг ${state.pathRank})` : `Путь не выбран (доступно после эпохи ${cfg.pathEpochRequired})`;
    $prestige.disabled = !canPrestige();
    $timeBoost.disabled = state.essence < cfg.timeBoostCost || state.timeBoostUntil > Date.now();
    $buyBurst.disabled = $timeBoost.disabled;
    $buySkin.disabled = state.skinOwned || state.essence < cfg.skinCost;
    const selLocked = state.selected >= unlockedCount();
    const selDisabled = !selLocked && state.selected >= activeRingCount();
    const lockButtons = selLocked || selDisabled;
    const r0 = state.rings[state.selected];
    const cs = r0 ? ringCostSpeed(r0) : Infinity;
    const cd = r0 ? ringCostDelta(r0) : Infinity;
    if ($upSpeed) $upSpeed.disabled = lockButtons || state.EP < cs;
    if ($upDelta) $upDelta.disabled = lockButtons || state.EP < cd;
    $reduceInflation.disabled = lockButtons || state.EP < inflationCutCost();
    $buySynergy.disabled = lockButtons || state.EP < synergyCost() || !!effectiveModifier()?.forbidSynergy;
    $buyGeneX.disabled = state.gp < geneCost(4, state.gene.xBoost);
    $buyGeneInfl.disabled = state.gp < geneCost(4, state.gene.infl);
    $buyGeneRing.disabled = state.gp < geneCost(6, state.gene.extraRing);
    $buyGeneAuto.disabled = state.gp < geneCost(6, state.gene.auto);
    $pathSpeed.disabled = !!state.path || state.epoch < cfg.pathEpochRequired;
    $pathPower.disabled = $pathSpeed.disabled;
    $pathStability.disabled = $pathSpeed.disabled;

    if ($toggleAutoBuy) $toggleAutoBuy.textContent = `Автопокупка: ${state.auto.buy ? 'вкл' : 'выкл'}`;
    if ($toggleAutoPrestige) $toggleAutoPrestige.textContent = `Автопрестиж: ${state.auto.prestige ? 'вкл' : 'выкл'}`;
    if ($toggleSound) $toggleSound.textContent = `Звук: ${state.options.sound ? 'вкл' : 'выкл'}`;
    if ($toggleFloat) $toggleFloat.textContent = `Всплывающие числа: ${state.options.floatNumbers ? 'вкл' : 'выкл'}`;
    if ($toggleCompact) $toggleCompact.textContent = `Формат чисел: ${state.options.numberFormat}`;
    if ($autoPriSpeed) $autoPriSpeed.classList.toggle('active', state.autoPriority === 'speed');
    if ($autoPriDelta) $autoPriDelta.classList.toggle('active', state.autoPriority === 'delta');
    if ($autoPriInfl) $autoPriInfl.classList.toggle('active', state.autoPriority === 'infl');
    if ($autoPriSyn) $autoPriSyn.classList.toggle('active', state.autoPriority === 'syn');

    if ($challengeHint) {
      const sel = selectedChallengeDef();
      const active = activeChallengeDef();
      if (!sel && !active) $challengeHint.textContent = 'Выберите испытание из списка.';
      else if (active) $challengeHint.textContent = `Активно: ${active.title} • награда: +${active.reward.essence} Essence`;
      else if (sel) $challengeHint.textContent = `Выбрано: ${sel.title} • награда: +${sel.reward.essence} Essence`;
    }
    if ($startChallenge) $startChallenge.disabled = !state.challenge.selected || !!state.challenge.active;
    if ($cancelChallenge) $cancelChallenge.disabled = !state.challenge.active;

    updateRecommendation();
    if ($challengeList) {
      const tNow = Date.now();
      if (tNow - lastChallengeRender > 500) { renderChallenges(); lastChallengeRender = tNow; }
    }

    renderStats();
  }

  function renderStats() {
    if (!$statsGrid) return;
    const now = Date.now();
    if (now - lastStatsRender < 400) return;
    lastStatsRender = now;
    const items = [
      ['Сессия', `${Math.floor(state.stats.totalPlaySeconds)}s`],
      ['Всего замыканий', fmt(state.stats.closures)],
      ['Всего EP (накоп.)', fmt(state.stats.totalEP)],
      ['EP/сек', fmt(state.stats.epPerSec)],
      ['Текущая эпоха', String(state.epoch)],
      ['Престижей всего', String(state.stats.totalPrestiges)],
      ['Оффлайн циклов', fmt(state.stats.offlineCycles)],
      ['Синергия', String(state.synergy)],
      ['Срезов инфляции', String(state.inflCuts)],
      ['Путь', state.path ? `${state.path} (ранг ${state.pathRank})` : 'нет'],
      ['Колец активно', String(activeRingCount())],
      ['Испытание', activeChallengeDef() ? activeChallengeDef().title : 'нет'],
    ];
    $statsGrid.innerHTML = items.map(([k, v]) => `<div><span class="k">${k}</span>: ${v}</div>`).join('');
  }

  function renderAchievements() {
    $achList.innerHTML = '';
    achievementDefs.forEach((a) => {
      const div = document.createElement('div');
      div.className = `ach ${state.achievements[a.id] ? 'done' : ''}`;
      div.innerHTML = `<strong>${a.name}</strong>${a.desc}<br/>Награда: ${a.reward?.essence || 0} Essence`;
      $achList.appendChild(div);
    });
  }

  function applyOfflineProgress() {
    if (!state.stats.lastSave) state.stats.lastSave = Date.now();
    const now = Date.now();
    const dt = Math.max(0, (now - state.stats.lastSave) / 1000);
    if (dt < 1) return;
    const eff = cfg.offlineEfficiency;
    const steps = Math.min(cfg.offlineStepsCap, Math.floor(dt * eff));
    offlineSimulating = true;
    for (let i = 0; i < steps; i++) {
      const fakeNow = state.stats.lastSave + i * (1000 / eff);
      update(0.02, fakeNow);
    }
    offlineSimulating = false;
    state.stats.offlineCycles = steps;
    $offlineHint.textContent = `Оффлайн: обработано ${steps} циклов`;
    state.stats.lastSave = Date.now();
    state.epochInflationStart = state.I;
  }

  function resetAll() {
    state.EP = 0; state.I = 1; state.epoch = 0; state.prestigeBonus = 1;
    state.modifier = null;
    state.synergy = 0; state.inflCuts = 0;
    state.timeBoostUntil = 0;
    state.challenge.active = null;
    state.challenge.selected = null;
    state.epochInflationStart = 1;
    state.unlockedRings = unlockStartCount();
    state.stats.essenceTicker = 0;
    state.stats.closures = 0;
    state.stats.idealTracker.clear();
    state.stats.lastClosureTs = 0;
    state.stats.runStarted = Date.now();
    ensureRings();
    for (const r of state.rings) {
      r.x = 1; r.d = 0.08 + r.idx * 0.06; r.speed = 8 + (cfg.baseRings - r.idx) * 1.25;
      r.progress = 0; r.rot = 0; r.lvl = 0; r.dLvl = 0;
    }
    updateSelectedUI();
  }

  function prestige() {
    if (!canPrestige()) return;

    // бонус за стабильность эпохи (меньше разгон инфляции => больше Essence)
    const inflRatio = state.I / Math.max(1e-9, state.epochInflationStart || 1);
    let stabilityEssence = 0;
    if (inflRatio < 1.25) stabilityEssence = 2;
    else if (inflRatio < 1.65) stabilityEssence = 1;
    if (stabilityEssence) state.essence += stabilityEssence;

    // награда за испытание
    const ch = activeChallengeDef();
    if (ch && !state.challenge.completed[ch.id]) {
      state.essence += ch.reward.essence;
      state.challenge.completed[ch.id] = true;
      addFloat(`Challenge +${ch.reward.essence} Essence`, 'rgba(255,210,160,0.95)');
    }
    state.challenge.active = null;

    state.epoch += 1;
    state.stats.totalPrestiges += 1;
    state.prestigeBonus *= cfg.prestigeBonusGrowth;
    const gpGain = 1 + Math.floor(state.epoch / 2);
    state.gp += gpGain;
    pickModifier();
    state.EP = 0;
    state.I = Math.max(1, state.I * cfg.prestigeInflReset);
    state.epochInflationStart = state.I;
    state.unlockedRings = unlockStartCount();
    state.stats.idealTracker.clear();
    state.stats.essenceTicker = 0;
    state.timeBoostUntil = 0;
    ensureRings();
    for (const r of state.rings) {
      r.x = 1;
      r.progress = 0;
    }
    if (state.selected >= unlockedCount()) state.selected = 0;
    if (state.path) state.pathRank += 1;
    updateSelectedUI();
  }

  // --- Input ---
  canvas.addEventListener('click', (ev) => {
    armAudio();
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = mx - cx, dy = my - cy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const baseR = Math.min(rect.width, rect.height) * 0.08;
    let best = -1;
    let bestDiff = 1e9;
    const active = activeRingCount();
    for (let i = 0; i < active; i++) {
      const rr = baseR + i * cfg.ringGap;
      const diff = Math.abs(dist - rr);
      if (diff < bestDiff) { bestDiff = diff; best = i; }
    }
    if (best >= 0 && bestDiff <= cfg.ringThickness * 1.2) {
      state.selected = best;
      updateSelectedUI();
    }
  });

  $toggle.addEventListener('click', () => {
    armAudio();
    soundClick();
    state.running = !state.running;
    $toggle.textContent = state.running ? 'Пауза' : 'Пуск';
  });

  $reset.addEventListener('click', () => {
    armAudio();
    soundClick();
    resetAll();
    save();
  });

  $upSpeed.addEventListener('click', () => {
    armAudio();
    soundClick();
    const r0 = state.rings[state.selected];
    const cost = ringCostSpeed(r0);
    if (state.EP < cost) return;
    state.EP -= cost;
    r0.lvl += 1;
    r0.speed *= 1.15;
    maybeUnlockNextRing();
    updateSelectedUI();
  });

  $upDelta.addEventListener('click', () => {
    armAudio();
    soundClick();
    const r0 = state.rings[state.selected];
    const cost = ringCostDelta(r0);
    if (state.EP < cost) return;
    state.EP -= cost;
    r0.dLvl += 1;
    r0.d *= 1.18;
    maybeUnlockNextRing();
    updateSelectedUI();
  });

  $reduceInflation.addEventListener('click', () => {
    armAudio();
    soundClick();
    const cost = inflationCutCost();
    if (state.EP < cost) return;
    state.EP -= cost;
    state.inflCuts += 1;
    state.I *= 0.98;
    updateSelectedUI();
  });

  $buySynergy.addEventListener('click', () => {
    armAudio();
    soundClick();
    const cost = synergyCost();
    if (state.EP < cost) return;
    if (effectiveModifier()?.forbidSynergy) return;
    state.EP -= cost;
    state.synergy += 1;
    updateSelectedUI();
  });

  $prestige.addEventListener('click', () => {
    armAudio();
    soundClick();
    prestige();
  });

  $buyGeneX.addEventListener('click', () => {
    armAudio();
    soundClick();
    const cost = geneCost(4, state.gene.xBoost);
    if (state.gp < cost) return;
    state.gp -= cost;
    state.gene.xBoost += 1;
  });
  $buyGeneInfl.addEventListener('click', () => {
    armAudio();
    soundClick();
    const cost = geneCost(4, state.gene.infl);
    if (state.gp < cost) return;
    state.gp -= cost;
    state.gene.infl += 1;
  });
  $buyGeneRing.addEventListener('click', () => {
    armAudio();
    soundClick();
    const cost = geneCost(6, state.gene.extraRing);
    if (state.gp < cost) return;
    state.gp -= cost;
    state.gene.extraRing += 1;
    ensureRings();
  });
  $buyGeneAuto.addEventListener('click', () => {
    armAudio();
    soundClick();
    const cost = geneCost(6, state.gene.auto);
    if (state.gp < cost) return;
    state.gp -= cost;
    state.gene.auto += 1;
  });

  $pathSpeed.addEventListener('click', () => { armAudio(); soundClick(); applyPath('speed'); });
  $pathPower.addEventListener('click', () => { armAudio(); soundClick(); applyPath('power'); });
  $pathStability.addEventListener('click', () => { armAudio(); soundClick(); applyPath('stability'); });

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => { armAudio(); soundClick(); setPane(btn.dataset.pane); });
  });

  $timeBoost.addEventListener('click', () => {
    armAudio();
    soundClick();
    if (state.essence < cfg.timeBoostCost) return;
    state.essence -= cfg.timeBoostCost;
    state.timeBoostUntil = Date.now() + cfg.timeBoostDuration * 1000;
  });

  $buyBurst.addEventListener('click', () => {
    armAudio();
    soundClick();
    if (state.essence < cfg.timeBoostCost) return;
    state.essence -= cfg.timeBoostCost;
    state.timeBoostUntil = Date.now() + cfg.timeBoostDuration * 1000;
  });

  $buySkin.addEventListener('click', () => {
    armAudio();
    soundClick();
    if (state.skinOwned || state.essence < cfg.skinCost) return;
    state.essence -= cfg.skinCost;
    state.skinOwned = true;
  });

  if ($toggleAutoBuy) {
    $toggleAutoBuy.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.auto.buy = !state.auto.buy;
    });
  }
  if ($toggleAutoPrestige) {
    $toggleAutoPrestige.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.auto.prestige = !state.auto.prestige;
    });
  }
  if ($toggleSound) {
    $toggleSound.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.options.sound = !state.options.sound;
    });
  }
  if ($toggleFloat) {
    $toggleFloat.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.options.floatNumbers = !state.options.floatNumbers;
    });
  }
  if ($toggleCompact) {
    $toggleCompact.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.options.numberFormat = state.options.numberFormat === 'sci' ? 'short' : 'sci';
    });
  }

  if ($autoPriSpeed) $autoPriSpeed.addEventListener('click', () => { armAudio(); soundClick(); state.autoPriority = 'speed'; });
  if ($autoPriDelta) $autoPriDelta.addEventListener('click', () => { armAudio(); soundClick(); state.autoPriority = 'delta'; });
  if ($autoPriInfl) $autoPriInfl.addEventListener('click', () => { armAudio(); soundClick(); state.autoPriority = 'infl'; });
  if ($autoPriSyn) $autoPriSyn.addEventListener('click', () => { armAudio(); soundClick(); state.autoPriority = 'syn'; });

  if ($startChallenge) {
    $startChallenge.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.challenge.selected) return;
      if (state.challenge.active) return;
      state.challenge.active = state.challenge.selected;
      state.epochInflationStart = state.I;
      renderChallenges();
      updateUI();
    });
  }
  if ($cancelChallenge) {
    $cancelChallenge.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.challenge.active = null;
      renderChallenges();
      updateUI();
    });
  }

  // --- Loop ---
  let last = performance.now();
  let saveTimer = 0;
  function frame(now) {
    const rawDt = Math.min(0.05, (now - last) / 1000);
    last = now;
    let dt = rawDt;
    if (state.timeBoostUntil > Date.now()) dt *= 2;

    if (state.running) update(dt, now);
    updateFx(rawDt);
    draw(now, dt);
    updateUI();

    saveTimer += rawDt;
    if (saveTimer > 3) { save(); saveTimer = 0; }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('beforeunload', () => save());

  // init
  load();
  ensureRings();
  applyOfflineProgress();
  renderAchievements();
  renderChallenges();
  updateSelectedUI();
  setPane('main');
  resize();
  requestAnimationFrame(frame);
})();
