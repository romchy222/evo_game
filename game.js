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
  const $eventHint = document.getElementById('eventHint');
  const $overdriveHint = document.getElementById('overdriveHint');
  const $pathHint = document.getElementById('pathHint');
  const $offlineHint = document.getElementById('offlineHint');
  const $ringSummary = document.getElementById('ringSummary');
  const $ringList = document.getElementById('ringList');

  const $toggle = document.getElementById('toggle');
  const $reset = document.getElementById('reset');
  const $prestige = document.getElementById('prestige');
  const $timeBoost = document.getElementById('timeBoost');
  const $overdrive = document.getElementById('overdrive');
  const $orbitUp = document.getElementById('orbitUp');
  const $orbitDown = document.getElementById('orbitDown');

  const $selName = document.getElementById('selName');
  const $selX = document.getElementById('selX');
  const $selD = document.getElementById('selD');
  const $selSpeed = document.getElementById('selSpeed');
  const $selLvl = document.getElementById('selLvl');
  const $selType = document.getElementById('selType');
  const $costHint = document.getElementById('costHint');
  const $epShopList = document.getElementById('epShopList');

  const $gpShopList = document.getElementById('gpShopList');

  const $pathSpeed = document.getElementById('pathSpeed');
  const $pathPower = document.getElementById('pathPower');
  const $pathStability = document.getElementById('pathStability');

  const $essenceShopList = document.getElementById('essenceShopList');

  const $achList = document.getElementById('achList');
  const $recHint = document.getElementById('recHint');
  const $statsGrid = document.getElementById('statsGrid');
  const $contractList = document.getElementById('contractList');
  const $toggleAutoBuy = document.getElementById('toggleAutoBuy');
  const $toggleAutoPrestige = document.getElementById('toggleAutoPrestige');
  const $toggleSound = document.getElementById('toggleSound');
  const $toggleFloat = document.getElementById('toggleFloat');
  const $toggleCompact = document.getElementById('toggleCompact');
  const $cycleStar = document.getElementById('cycleStar');
  const $cycleOrbit = document.getElementById('cycleOrbit');
  const $cycleBg = document.getElementById('cycleBg');
  const $toggleOrbitTrails = document.getElementById('toggleOrbitTrails');
  const $styleHint = document.getElementById('styleHint');
  const $devToggle = document.getElementById('devToggle');
  const $devGrantEP = document.getElementById('devGrantEP');
  const $devGrantGP = document.getElementById('devGrantGP');
  const $devGrantEssence = document.getElementById('devGrantEssence');
  const $devFastForward = document.getElementById('devFastForward');
  const $devReset = document.getElementById('devReset');
  const $devHint = document.getElementById('devHint');
  const $exportSave = document.getElementById('exportSave');
  const $importSave = document.getElementById('importSave');
  const $wipeSave = document.getElementById('wipeSave');
  const $saveData = document.getElementById('saveData');
  const $saveHint = document.getElementById('saveHint');
  const $toast = document.getElementById('toast');
  const $autoPriSpeed = document.getElementById('autoPriSpeed');
  const $autoPriDelta = document.getElementById('autoPriDelta');
  const $autoPriInfl = document.getElementById('autoPriInfl');
  const $autoPriSyn = document.getElementById('autoPriSyn');
  const $challengeList = document.getElementById('challengeList');
  const $startChallenge = document.getElementById('startChallenge');
  const $cancelChallenge = document.getElementById('cancelChallenge');
  const $challengeHint = document.getElementById('challengeHint');
  const $expeditionStatus = document.getElementById('expeditionStatus');
  const $startExpedition = document.getElementById('startExpedition');
  const $claimExpedition = document.getElementById('claimExpedition');
  const $expeditionReward = document.getElementById('expeditionReward');
  const $artifactHint = document.getElementById('artifactHint');
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
  let toastTimer = null;
  let autoPaused = false;

  // --- Config ---
  const cfg = {
    baseRings: 10,
    K: 22,
    r: 0.00065,       // базовый рост инфляции (мягче для старта с 1 орбиты)
    c: 0.008,         // рост инфляции от мощности
    S: 5200,
    progression: {
      epochTargets: [1e4, 6e4, 3e5, 1.6e6, 8e6],
      growth: 11.5,
    },
    prestigeInflReset: 0.28,
    prestigeBonusGrowth: 1.12,
    ringGap: 16,
    ringThickness: 10,
    bgGlow: 0.06,
    essenceClosureStep: 120,
    timeBoostDuration: 30,
    pathEpochRequired: 3,
    maxFx: 80,
    upgradesToUnlock: 5,
    softcap: {
      epGain: 1e8,
      epDiv: 1.35,
    },
    orbitTypes: [
      { id: 'planet', name: 'Добывающая планета', speedMul: 1, gainMul: 1.06, inflMul: 1.02, color: '#7bd4ff' },
      { id: 'station', name: 'Перерабатывающая станция', speedMul: 0.95, gainMul: 1.12, inflMul: 1.06, color: '#ffd36f' },
      { id: 'satellite', name: 'Исследовательский спутник', speedMul: 1.1, gainMul: 0.98, inflMul: 0.92, color: '#c6a6ff' },
    ],
    orbitSynergies: [
      { combo: ['planet', 'station'], gainMul: 1.06 },
      { combo: ['station', 'satellite'], speedMul: 1.05 },
      { combo: ['planet', 'satellite'], inflMul: 0.97 },
    ],
    cosmetics: {
      stars: ['#ffd27d', '#7fd7ff', '#ff9fd0', '#a4ffca', '#f1f5ff'],
      orbits: ['#a8c7ff', '#f5c3ff', '#a8ffd7', '#ffe6a8'],
      backgrounds: [
        { id: 'dawn', colors: ['#0b0f1a', '#1b1f38', '#2c3661'] },
        { id: 'nebula', colors: ['#0b0f1a', '#1b1636', '#3c2a5c'] },
        { id: 'aurora', colors: ['#0b0f1a', '#142a2e', '#245c4a'] },
        { id: 'sunrise', colors: ['#0b0f1a', '#2f1f2e', '#4a2d3e'] },
      ],
    },
    overdrive: {
      duration: 10,
      cooldown: 18,
      heatGain: 1,
      heatMax: 5,
      penaltyDuration: 12,
      penaltyMul: 0.7,
    },
    events: [
      { id: 'flare', name: 'Солнечная вспышка', duration: 20, speedMul: 1.2, inflMul: 1.12 },
      { id: 'asteroid', name: 'Астероидное поле', duration: 25, gainMul: 1.18, speedMul: 0.9 },
      { id: 'anomaly', name: 'Грави-аномалия', duration: 18, inflMul: 0.85, gainMul: 0.95 },
    ],
    expeditions: {
      minSeconds: 120,
      maxSeconds: 600,
      rewards: [
        { ep: 4000, gp: 0, essence: 1 },
        { ep: 8000, gp: 1, essence: 0 },
        { ep: 15000, gp: 1, essence: 1 },
      ],
    },
    contracts: {
      refreshSeconds: 480,
      slots: 3,
    },
    offline: {
      efficiency: 0.35,
      stepsCap: 5000,
      rewardCapSeconds: 6 * 3600,
    },
    rewards: {
      prestigeBaseGP: 1,
      prestigeGpStep: 2,
      stabilityEssence: [2, 1],
      stabilityThresholds: [1.25, 1.65],
    },
    pricing: {
      ringSpeed: { base: 35, growth: 1.58, indexGrowth: 1.10 },
      ringDelta: { base: 90, growth: 1.72, indexGrowth: 1.08 },
      inflCut: { base: 420, growth: 2.35 },
      synergy: { base: 650, growth: 2.15 },
      orbitSlot: { base: 1200, growth: 2.1 },
      orbitShift: { base: 900, growth: 2.0 },
      gene: { base: 4, growth: 1.8 },
      boosters: { time: 2, skin: 8 },
    },
    dev: {
      grantEP: 1e6,
      grantGP: 10,
      grantEssence: 5,
      fastForwardSeconds: 600,
    },
  };
  const SAVE_VERSION = 3;
  const SAVE_KEY = 'evo_rings_save_v3';
  const LEGACY_SAVE_KEYS = ['evo_rings_save_v1', 'evo_rings_save'];
  const SAVE_BACKUP_KEY = 'evo_rings_save_backup';
  const DEV_KEY = 'evo_rings_dev';

  function createEventBus() {
    const handlers = {};
    return {
      on(event, fn) {
        if (!handlers[event]) handlers[event] = [];
        handlers[event].push(fn);
      },
      emit(event, payload) {
        (handlers[event] || []).forEach((fn) => fn(payload));
      },
    };
  }
  const bus = createEventBus();

  // --- State ---
  const state = {
    running: true,
    EP: 0,
    I: 1,
    epoch: 0,
    prestigeBonus: 1,
    bonus: {
      epGain: 1,
      speed: 1,
      infl: 1,
      cost: 1,
      essence: 1,
    },
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
    stabilityShieldUntil: 0,
    skinOwned: false,
    system: {
      starColorIdx: 0,
      orbitColorIdx: 0,
      bgIdx: 0,
      orbitTrails: true,
    },
    overdrive: {
      activeUntil: 0,
      cooldownUntil: 0,
      heat: 0,
      penaltyUntil: 0,
    },
    systemEvent: {
      active: null,
      endsAt: 0,
      nextAt: Date.now() + 60000,
    },
    expedition: {
      active: false,
      returnsAt: 0,
      reward: null,
      artifacts: {},
    },
    contracts: [],
    contractsNextAt: Date.now() + cfg.contracts.refreshSeconds * 1000,
    auto: { buy: false, prestige: false },
    autoPriority: 'speed',
    options: { sound: true, floatNumbers: true, numberFormat: 'sci' },
    dev: { enabled: false, logEconomy: false },
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
      totalUpgrades: 0,
      totalGpSpent: 0,
      totalEpSpent: 0,
      totalEssenceSpent: 0,
      challengesCompleted: 0,
      longestSessionSeconds: 0,
      fastestPrestigeSeconds: 0,
      overdriveUses: 0,
      expeditions: 0,
      contractsCompleted: 0,
      rateLastTs: Date.now(),
      rateLastTotalEP: 0,
      epPerSec: 0,
    },
    gene: { xBoost: 0, infl: 0, extraRing: 0, auto: 0, core: 0, stability: 0 },
    achievements: {},
  };

  const achievementDefs = [
    { id: 'ep1k', name: 'Энергия I', desc: 'Накопить 1K EP', category: 'economy', reward: { essence: 1 } },
    { id: 'ep1m', name: 'Энергия II', desc: 'Накопить 1M EP', category: 'economy', reward: { essence: 2 } },
    { id: 'ep1b', name: 'Энергия III', desc: 'Накопить 1B EP', category: 'economy', reward: { essence: 3 } },
    { id: 'closures100', name: 'Замыкания I', desc: '100 замыканий', category: 'progress', reward: { gp: 1 } },
    { id: 'closures1k', name: 'Замыкания II', desc: '1 000 замыканий', category: 'progress', reward: { gp: 2 } },
    { id: 'closures10k', name: 'Замыкания III', desc: '10 000 замыканий', category: 'progress', reward: { gp: 3 } },
    { id: 'prestige1', name: 'Новая эпоха', desc: 'Сделать престиж', category: 'progress', reward: { essence: 1 } },
    { id: 'prestige5', name: 'Пять эпох', desc: '5 престижей', category: 'progress', reward: { gp: 2 } },
    { id: 'prestige20', name: 'Двадцать эпох', desc: '20 престижей', category: 'progress', reward: { gp: 4 } },
    { id: 'epoch3', name: 'Третья эпоха', desc: 'Достичь эпохи 3', category: 'progress', reward: { essence: 1 } },
    { id: 'epoch10', name: 'Десятая эпоха', desc: 'Достичь эпохи 10', category: 'progress', reward: { essence: 2 } },
    { id: 'epoch25', name: 'Двадцать пятая эпоха', desc: 'Достичь эпохи 25', category: 'progress', reward: { essence: 3 } },
    { id: 'gp5', name: 'Генная инженерия', desc: 'Заработать 5 GP', category: 'economy', reward: { essence: 1 } },
    { id: 'gp20', name: 'Геном-мастер', desc: 'Заработать 20 GP', category: 'economy', reward: { gp: 2 } },
    { id: 'gp50', name: 'Геном-архитектор', desc: 'Заработать 50 GP', category: 'economy', reward: { gp: 4 } },
    { id: 'essence1', name: 'Искра', desc: 'Получить 1 Essence', category: 'economy', reward: { epBoost: 1.02 } },
    { id: 'essence10', name: 'Сгусток', desc: 'Получить 10 Essence', category: 'economy', reward: { epBoost: 1.03 } },
    { id: 'essence25', name: 'Ядро', desc: 'Получить 25 Essence', category: 'economy', reward: { epBoost: 1.04 } },
    { id: 'ring5', name: 'Круги I', desc: 'Открыть 5 орбит', category: 'progress', reward: { gp: 1 } },
    { id: 'ring10', name: 'Круги II', desc: 'Открыть 10 орбит', category: 'progress', reward: { gp: 2 } },
    { id: 'ringAll', name: 'Полный спектр', desc: 'Открыть все орбиты', category: 'progress', reward: { essence: 2 } },
    { id: 'pathChosen', name: 'Выбор пути', desc: 'Выбрать эволюционный путь', category: 'explore', reward: { essence: 1 } },
    { id: 'challenge1', name: 'Испытатель', desc: 'Завершить испытание', category: 'skill', reward: { essence: 2 } },
    { id: 'challenge3', name: 'Ветеран', desc: 'Завершить 3 испытания', category: 'skill', reward: { essence: 3 } },
    { id: 'infl1e6', name: 'Взрыв', desc: 'Инфляция 1e6', category: 'skill', reward: { gp: 1 } },
    { id: 'infl1e9', name: 'Сверхновая', desc: 'Инфляция 1e9', category: 'skill', reward: { gp: 2 } },
    { id: 'ideal', name: 'Идеальный цикл', desc: 'Все орбиты замкнуты за 1с', category: 'skill', reward: { essence: 2 } },
    { id: 'fastPrestige', name: 'Спринтер', desc: 'Престиж за 10 минут', category: 'skill', reward: { epBoost: 1.03 } },
    { id: 'silent', name: 'Тишина', desc: 'Выключить звук', category: 'secret', reward: { essence: 1 } },
    { id: 'collector', name: 'Коллекционер', desc: '10 покупок в магазинах', category: 'explore', reward: { gp: 1 } },
    { id: 'spender', name: 'Транжира', desc: 'Потратить 1M EP', category: 'economy', reward: { epBoost: 1.02 } },
    { id: 'overdrive3', name: 'Перегруз', desc: 'Использовать Overdrive 3 раза', category: 'skill', reward: { essence: 1 } },
    { id: 'exp1', name: 'Дальний путь', desc: 'Завершить экспедицию', category: 'explore', reward: { gp: 1 } },
    { id: 'contracts3', name: 'Контрактник', desc: 'Выполнить 3 контракта', category: 'progress', reward: { essence: 2 } },
    { id: 'style1', name: 'Дизайнер', desc: 'Изменить стиль системы', category: 'explore', reward: { epBoost: 1.01 } },
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
      title: 'Мало орбит',
      desc: '-3 активных орбиты, но +50% EP',
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
    { id: 'lessRings', desc: '-2 орбиты, но +200% к ним', ringsDelta: -2, ringPower: 3 },
    { id: 'speedy', desc: '+20% скорость, -10% Δ', speedMul: 1.2, dMul: 0.9 },
    { id: 'rich', desc: '+30% EP, +10% инфляция', gainMul: 1.3, inflMul: 1.1 },
    { id: 'calm', desc: 'Инфляция -25%', inflMul: 0.75 },
  ];

  const epShopItems = [
    {
      id: 'speed',
      title: '+Скорость',
      desc: '+15% скорости орбиты',
      cost: (r) => ringCostSpeed(r),
      canBuy: (r) => !!r,
      apply: (r) => {
        const cost = ringCostSpeed(r);
        if (state.EP < cost) return false;
        state.EP -= cost;
        state.stats.totalEpSpent += cost;
        r.lvl += 1;
        r.speed *= 1.15;
        state.stats.totalUpgrades += 1;
        maybeUnlockNextRing();
        bus.emit('upgrade', { type: 'speed', ring: r.idx, cost });
        return true;
      },
    },
    {
      id: 'delta',
      title: '+Δ',
      desc: '+18% прироста x',
      cost: (r) => ringCostDelta(r),
      canBuy: (r) => !!r,
      apply: (r) => {
        const cost = ringCostDelta(r);
        if (state.EP < cost) return false;
        state.EP -= cost;
        state.stats.totalEpSpent += cost;
        r.dLvl += 1;
        r.d *= 1.18;
        state.stats.totalUpgrades += 1;
        maybeUnlockNextRing();
        bus.emit('upgrade', { type: 'delta', ring: r.idx, cost });
        return true;
      },
    },
    {
      id: 'inflCut',
      title: 'Инфляция -2%',
      desc: 'Снижает мировую инфляцию',
      cost: () => inflationCutCost(),
      canBuy: () => true,
      apply: () => {
        const cost = inflationCutCost();
        if (state.EP < cost) return false;
        state.EP -= cost;
        state.stats.totalEpSpent += cost;
        state.inflCuts += 1;
        state.I *= 0.98;
        state.stats.totalUpgrades += 1;
        bus.emit('upgrade', { type: 'inflCut', cost });
        return true;
      },
    },
    {
      id: 'synergy',
      title: 'Синергия',
      desc: 'Усиливает связку орбит',
      cost: () => synergyCost(),
      canBuy: () => !effectiveModifier()?.forbidSynergy,
      apply: () => {
        const cost = synergyCost();
        if (state.EP < cost) return false;
        if (effectiveModifier()?.forbidSynergy) return false;
        state.EP -= cost;
        state.stats.totalEpSpent += cost;
        state.synergy += 1;
        state.stats.totalUpgrades += 1;
        bus.emit('upgrade', { type: 'synergy', cost });
        return true;
      },
    },
    {
      id: 'orbitSlot',
      title: '+Объект на орбите',
      desc: 'Дополнительный объект с бонусом',
      cost: (r) => orbitSlotCost(r),
      canBuy: (r) => r && r.slots < 3,
      apply: (r) => {
        const cost = orbitSlotCost(r);
        if (state.EP < cost) return false;
        if (r.slots >= 3) return false;
        state.EP -= cost;
        state.stats.totalEpSpent += cost;
        r.slots += 1;
        r.occupants.push({ type: r.orbitType });
        state.stats.totalUpgrades += 1;
        bus.emit('upgrade', { type: 'orbitSlot', ring: r.idx, cost });
        return true;
      },
    },
    {
      id: 'orbitShift',
      title: 'Сменить тип',
      desc: 'Переключить объект орбиты',
      cost: (r) => orbitShiftCost(r),
      canBuy: (r) => !!r,
      apply: (r) => {
        const cost = orbitShiftCost(r);
        if (state.EP < cost) return false;
        state.EP -= cost;
        state.stats.totalEpSpent += cost;
        const idx = cfg.orbitTypes.findIndex((t) => t.id === r.orbitType);
        const next = cfg.orbitTypes[(idx + 1) % cfg.orbitTypes.length];
        r.orbitType = next.id;
        r.occupants = r.occupants.map(() => ({ type: r.orbitType }));
        r.typeShifts = (r.typeShifts || 0) + 1;
        state.stats.totalUpgrades += 1;
        bus.emit('upgrade', { type: 'orbitShift', ring: r.idx, cost });
        return true;
      },
    },
  ];

  const gpShopItems = [
    {
      id: 'geneX',
      title: '+5% ко всем x',
      desc: 'Перманентно',
      level: () => state.gene.xBoost,
      cost: () => geneCost(cfg.pricing.gene.base, state.gene.xBoost),
      apply: () => {
        const cost = geneCost(cfg.pricing.gene.base, state.gene.xBoost);
        if (state.gp < cost) return false;
        state.gp -= cost;
        state.stats.totalGpSpent += cost;
        state.gene.xBoost += 1;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'geneX', cost, currency: 'gp' });
        return true;
      },
    },
    {
      id: 'geneInfl',
      title: '-10% рост инфляции',
      desc: 'Перманентно',
      level: () => state.gene.infl,
      cost: () => geneCost(cfg.pricing.gene.base, state.gene.infl),
      apply: () => {
        const cost = geneCost(cfg.pricing.gene.base, state.gene.infl);
        if (state.gp < cost) return false;
        state.gp -= cost;
        state.stats.totalGpSpent += cost;
        state.gene.infl += 1;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'geneInfl', cost, currency: 'gp' });
        return true;
      },
    },
    {
      id: 'geneRing',
      title: '+1 орбита с начала',
      desc: 'Перманентно',
      level: () => state.gene.extraRing,
      cost: () => geneCost(cfg.pricing.gene.base + 2, state.gene.extraRing),
      apply: () => {
        const cost = geneCost(cfg.pricing.gene.base + 2, state.gene.extraRing);
        if (state.gp < cost) return false;
        state.gp -= cost;
        state.stats.totalGpSpent += cost;
        state.gene.extraRing += 1;
        ensureRings();
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'geneRing', cost, currency: 'gp' });
        return true;
      },
    },
    {
      id: 'geneAuto',
      title: 'Авто-апгрейды',
      desc: 'Повышает авто-покупки',
      level: () => state.gene.auto,
      cost: () => geneCost(cfg.pricing.gene.base + 2, state.gene.auto),
      apply: () => {
        const cost = geneCost(cfg.pricing.gene.base + 2, state.gene.auto);
        if (state.gp < cost) return false;
        state.gp -= cost;
        state.stats.totalGpSpent += cost;
        state.gene.auto += 1;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'geneAuto', cost, currency: 'gp' });
        return true;
      },
    },
    {
      id: 'geneCore',
      title: '+5% EP',
      desc: 'Усиление ядра',
      level: () => state.gene.core,
      cost: () => geneCost(cfg.pricing.gene.base + 4, state.gene.core),
      apply: () => {
        const cost = geneCost(cfg.pricing.gene.base + 4, state.gene.core);
        if (state.gp < cost) return false;
        state.gp -= cost;
        state.stats.totalGpSpent += cost;
        state.gene.core += 1;
        state.bonus.epGain *= 1.05;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'geneCore', cost, currency: 'gp' });
        return true;
      },
    },
    {
      id: 'geneStability',
      title: 'Стабильность мира',
      desc: '-5% к инфляции',
      level: () => state.gene.stability,
      cost: () => geneCost(cfg.pricing.gene.base + 4, state.gene.stability),
      apply: () => {
        const cost = geneCost(cfg.pricing.gene.base + 4, state.gene.stability);
        if (state.gp < cost) return false;
        state.gp -= cost;
        state.stats.totalGpSpent += cost;
        state.gene.stability += 1;
        state.bonus.infl *= 0.95;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'geneStability', cost, currency: 'gp' });
        return true;
      },
    },
  ];

  const essenceShopItems = [
    {
      id: 'skin',
      title: 'Скин/эффект',
      desc: 'Косметика',
      cost: () => cfg.pricing.boosters.skin,
      canBuy: () => !state.skinOwned,
      apply: () => {
        const cost = cfg.pricing.boosters.skin;
        if (state.skinOwned || state.essence < cost) return false;
        state.essence -= cost;
        state.stats.totalEssenceSpent += cost;
        state.skinOwned = true;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'skin', cost, currency: 'essence' });
        return true;
      },
    },
    {
      id: 'burst',
      title: 'Импульс времени x2',
      desc: '30 секунд',
      cost: () => cfg.pricing.boosters.time,
      canBuy: () => state.timeBoostUntil <= Date.now(),
      apply: () => {
        const cost = cfg.pricing.boosters.time;
        if (state.essence < cost) return false;
        state.essence -= cost;
        state.stats.totalEssenceSpent += cost;
        state.timeBoostUntil = Date.now() + cfg.timeBoostDuration * 1000;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'burst', cost, currency: 'essence' });
        return true;
      },
    },
    {
      id: 'stabilizer',
      title: 'Стабилизатор',
      desc: 'Снижает инфляцию 45с',
      cost: () => Math.ceil(cfg.pricing.boosters.time * 1.5),
      canBuy: () => !state.stabilityShieldUntil || state.stabilityShieldUntil <= Date.now(),
      apply: () => {
        const cost = Math.ceil(cfg.pricing.boosters.time * 1.5);
        if (state.essence < cost) return false;
        state.essence -= cost;
        state.stats.totalEssenceSpent += cost;
        state.stabilityShieldUntil = Date.now() + 45000;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'stabilizer', cost, currency: 'essence' });
        return true;
      },
    },
    {
      id: 'essenceCharm',
      title: 'Эссенция+',
      desc: '+10% к редкому дропу',
      cost: () => Math.ceil(cfg.pricing.boosters.skin * 1.4),
      canBuy: () => !state.bonus.essence || state.bonus.essence < 1.5,
      apply: () => {
        const cost = Math.ceil(cfg.pricing.boosters.skin * 1.4);
        if (state.essence < cost) return false;
        state.essence -= cost;
        state.stats.totalEssenceSpent += cost;
        state.bonus.essence *= 1.1;
        state.stats.totalUpgrades += 1;
        bus.emit('purchase', { type: 'essenceCharm', cost, currency: 'essence' });
        return true;
      },
    },
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

  function costCurve({ base, growth, indexGrowth = 1 }, level, idx = 0, costMul = 1) {
    return base * Math.pow(growth, level) * Math.pow(indexGrowth, idx) * costMul;
  }

  function applySoftcap(value, cap, div) {
    if (value <= cap) return value;
    const over = value / cap;
    return cap * Math.pow(over, 1 / div);
  }

  function logEconomy(event, payload) {
    if (!state.dev.logEconomy) return;
    console.info(`[eco] ${event}`, payload);
  }

  function orbitTypeDef(id) {
    return cfg.orbitTypes.find((t) => t.id === id) || cfg.orbitTypes[0];
  }

  function activeEventDef() {
    if (!state.systemEvent.active) return null;
    return cfg.events.find((e) => e.id === state.systemEvent.active) || null;
  }

  function orbitSynergy(ringIndex) {
    const ring = state.rings[ringIndex];
    if (!ring) return { gainMul: 1, speedMul: 1, inflMul: 1 };
    const left = state.rings[ringIndex - 1];
    const right = state.rings[ringIndex + 1];
    const types = [left?.orbitType, ring.orbitType, right?.orbitType].filter(Boolean);
    const mod = { gainMul: 1, speedMul: 1, inflMul: 1 };
    cfg.orbitSynergies.forEach((syn) => {
      if (types.includes(syn.combo[0]) && types.includes(syn.combo[1])) {
        if (syn.gainMul) mod.gainMul *= syn.gainMul;
        if (syn.speedMul) mod.speedMul *= syn.speedMul;
        if (syn.inflMul) mod.inflMul *= syn.inflMul;
      }
    });
    return mod;
  }

  function orbitObjectModifier(ring) {
    const extra = Math.max(0, (ring.occupants?.length || 1) - 1);
    const gainMul = 1 + extra * 0.08;
    const inflMul = 1 + extra * 0.05;
    return { gainMul, inflMul };
  }

  function currentPalette() {
    const bg = cfg.cosmetics.backgrounds[state.system.bgIdx % cfg.cosmetics.backgrounds.length];
    return {
      star: cfg.cosmetics.stars[state.system.starColorIdx % cfg.cosmetics.stars.length],
      orbit: cfg.cosmetics.orbits[state.system.orbitColorIdx % cfg.cosmetics.orbits.length],
      bg,
    };
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

  function showToast(message) {
    if (!$toast) return;
    $toast.textContent = message;
    $toast.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      $toast.classList.remove('show');
    }, 2200);
  }

  function encodeSave(payload) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }

  function decodeSave(value) {
    const json = decodeURIComponent(escape(atob(value)));
    return JSON.parse(json);
  }

  function runEconomyChecks() {
    const checks = [];
    const speedCost = ringCostSpeed({ lvl: 0, idx: 0 });
    const speedCost2 = ringCostSpeed({ lvl: 1, idx: 0 });
    checks.push(speedCost2 > speedCost);
    const inflCost = inflationCutCost();
    const synCost = synergyCost();
    checks.push(inflCost > 0 && synCost > 0);
    const gain = applySoftcap(1e10, cfg.softcap.epGain, cfg.softcap.epDiv);
    checks.push(gain <= 1e10 && gain >= cfg.softcap.epGain);
    if (checks.every(Boolean)) {
      console.info('[eco] checks: ok');
    } else {
      console.warn('[eco] checks: failed', checks);
    }
  }

  function updateFx(dt) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i];
      p.t += dt;
      p.y += p.vy * dt;
      if (p.t >= p.ttl) fx.splice(i, 1);
    }
  }

  function updateOverdrive(dt) {
    if (state.overdrive.activeUntil > Date.now()) {
      state.overdrive.heat += cfg.overdrive.heatGain * dt;
      if (state.overdrive.heat >= cfg.overdrive.heatMax) {
        state.overdrive.activeUntil = 0;
        state.overdrive.penaltyUntil = Date.now() + cfg.overdrive.penaltyDuration * 1000;
        state.overdrive.cooldownUntil = Date.now() + cfg.overdrive.cooldown * 1000;
        showToast('Перегрев системы!');
        bus.emit('overdriveOverheat', {});
      }
    } else if (state.overdrive.heat > 0) {
      state.overdrive.heat = Math.max(0, state.overdrive.heat - dt * 0.6);
    }
  }

  function updateSystemEvent(now) {
    if (state.systemEvent.active && now >= state.systemEvent.endsAt) {
      state.systemEvent.active = null;
      state.systemEvent.endsAt = 0;
      state.systemEvent.nextAt = now + 60000 + Math.random() * 45000;
      bus.emit('eventEnded', {});
    }
    if (!state.systemEvent.active && now >= state.systemEvent.nextAt) {
      const pick = cfg.events[Math.floor(Math.random() * cfg.events.length)];
      state.systemEvent.active = pick.id;
      state.systemEvent.endsAt = now + pick.duration * 1000;
      bus.emit('eventStarted', { id: pick.id });
    }
  }

  function updateExpedition(now) {
    if (state.expedition.active && now >= state.expedition.returnsAt) {
      state.expedition.active = false;
      showToast('Экспедиция вернулась!');
      bus.emit('expeditionReturned', { reward: state.expedition.reward });
    }
  }

  function updateContracts() {
    const now = Date.now();
    if (!state.contracts.length || now >= state.contractsNextAt) {
      state.contracts = generateContracts();
      state.contractsNextAt = now + cfg.contracts.refreshSeconds * 1000;
    }
    state.contracts.forEach((c) => {
      if (c.done) return;
      if (c.type === 'closures') c.progress = state.stats.closures;
      if (c.type === 'overdrive') c.progress = state.stats.overdriveUses || 0;
      if (c.type === 'expedition') c.progress = state.stats.expeditions || 0;
      if (c.progress >= c.target) {
        c.done = true;
        grantContractReward(c);
      }
    });
  }

  function generateContracts() {
    const pool = [
      { type: 'closures', target: 120, reward: { ep: 2500 } },
      { type: 'closures', target: 300, reward: { ep: 6000 } },
      { type: 'overdrive', target: 3, reward: { essence: 1 } },
      { type: 'expedition', target: 2, reward: { gp: 1 } },
    ];
    const picks = [];
    while (picks.length < cfg.contracts.slots) {
      picks.push({ ...pool[Math.floor(Math.random() * pool.length)], progress: 0, done: false });
    }
    return picks;
  }

  function grantContractReward(contract) {
    if (contract.reward.ep) state.EP += contract.reward.ep;
    if (contract.reward.gp) state.gp += contract.reward.gp;
    if (contract.reward.essence) state.essence += contract.reward.essence * state.bonus.essence;
    state.stats.contractsCompleted += 1;
    showToast('Контракт выполнен!');
    bus.emit('contractCompleted', { contract });
  }

  function targetForEpoch(e) {
    const pathBonus = state.path === 'stability' ? 0.9 : 1;
    const { epochTargets, growth } = cfg.progression;
    if (e < epochTargets.length) return epochTargets[e] * pathBonus;
    const last = epochTargets[epochTargets.length - 1];
    const extra = e - (epochTargets.length - 1);
    return last * Math.pow(growth, extra) * pathBonus;
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
    return costCurve(cfg.pricing.ringSpeed, r.lvl, r.idx, state.bonus.cost);
  }

  function ringCostDelta(r) {
    return costCurve(cfg.pricing.ringDelta, r.dLvl, r.idx, state.bonus.cost);
  }

  function orbitSlotCost(r) {
    return costCurve(cfg.pricing.orbitSlot, Math.max(0, r.slots - 1), r.idx, state.bonus.cost);
  }

  function orbitShiftCost(r) {
    return costCurve(cfg.pricing.orbitShift, r.typeShifts || 0, r.idx, state.bonus.cost);
  }

  function getSavePayload() {
    state.stats.lastSave = Date.now();
    return { ...state, stats: { ...state.stats, idealTracker: [] }, _v: SAVE_VERSION };
  }

  function save() {
    const payload = getSavePayload();
    const raw = JSON.stringify(payload);
    localStorage.setItem(SAVE_KEY, raw);
    localStorage.setItem(SAVE_BACKUP_KEY, raw);
  }

  function normalizeState() {
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
    if (!state.stats.fastestPrestigeSeconds) state.stats.fastestPrestigeSeconds = 0;
    if (!state.stats.overdriveUses) state.stats.overdriveUses = 0;
    if (!state.stats.expeditions) state.stats.expeditions = 0;
    if (!state.stats.contractsCompleted) state.stats.contractsCompleted = 0;
    if (!state.bonus) state.bonus = { epGain: 1, speed: 1, infl: 1, cost: 1, essence: 1 };
    if (typeof state.bonus.essence !== 'number') state.bonus.essence = 1;
    if (!state.system) state.system = { starColorIdx: 0, orbitColorIdx: 0, bgIdx: 0, orbitTrails: true };
    if (!state.overdrive) state.overdrive = { activeUntil: 0, cooldownUntil: 0, heat: 0, penaltyUntil: 0 };
    if (!state.systemEvent) state.systemEvent = { active: null, endsAt: 0, nextAt: Date.now() + 60000 };
    if (!state.expedition) state.expedition = { active: false, returnsAt: 0, reward: null, artifacts: {} };
    if (!state.contracts) state.contracts = [];
    if (!state.contractsNextAt) state.contractsNextAt = Date.now() + cfg.contracts.refreshSeconds * 1000;
    if (!state.dev) state.dev = { enabled: false, logEconomy: false };
    const devFlag = localStorage.getItem(DEV_KEY);
    if (devFlag) state.dev.enabled = devFlag === '1';
    if (state.achievements) {
      Object.keys(state.achievements).forEach((key) => {
        if (state.achievements[key] === true) state.achievements[key] = { earnedAt: Date.now() };
      });
    }
    state.stats.rateLastTotalEP = state.stats.totalEP;
    state.stats.rateLastTs = Date.now();
    ensureRings();
  }

  function applySaveData(data) {
    const migrated = migrateSave(data || {});
    const { _v, ...rest } = migrated;
    Object.assign(state, rest);
    normalizeState();
  }

  function migrateSave(data) {
    const version = Number.isFinite(data._v) ? data._v : 1;
    if (version >= SAVE_VERSION) return { ...data, _v: SAVE_VERSION };
    const next = { ...data };
    if (version < 2) {
      next.bonus = next.bonus || { epGain: 1, speed: 1, infl: 1, cost: 1, essence: 1 };
      next.dev = next.dev || { enabled: false, logEconomy: false };
      next.stats = {
        ...next.stats,
        totalUpgrades: next.stats?.totalUpgrades || 0,
        totalGpSpent: next.stats?.totalGpSpent || 0,
        totalEpSpent: next.stats?.totalEpSpent || 0,
        totalEssenceSpent: next.stats?.totalEssenceSpent || 0,
        challengesCompleted: next.stats?.challengesCompleted || 0,
        longestSessionSeconds: next.stats?.longestSessionSeconds || 0,
        fastestPrestigeSeconds: next.stats?.fastestPrestigeSeconds || 0,
      };
      next.gene = { xBoost: 0, infl: 0, extraRing: 0, auto: 0, core: 0, stability: 0, ...next.gene };
      if (!next.stabilityShieldUntil) next.stabilityShieldUntil = 0;
    }
    if (version < 3) {
      next.system = next.system || { starColorIdx: 0, orbitColorIdx: 0, bgIdx: 0, orbitTrails: true };
      next.overdrive = next.overdrive || { activeUntil: 0, cooldownUntil: 0, heat: 0, penaltyUntil: 0 };
      next.systemEvent = next.systemEvent || { active: null, endsAt: 0, nextAt: Date.now() + 60000 };
      next.expedition = next.expedition || { active: false, returnsAt: 0, reward: null, artifacts: {} };
      next.contracts = next.contracts || [];
      if (!next.contractsNextAt) next.contractsNextAt = Date.now() + cfg.contracts.refreshSeconds * 1000;
      next.stats = {
        ...next.stats,
        overdriveUses: next.stats?.overdriveUses || 0,
        expeditions: next.stats?.expeditions || 0,
        contractsCompleted: next.stats?.contractsCompleted || 0,
      };
    }
    return { ...next, _v: SAVE_VERSION };
  }

  function load() {
    const raw = localStorage.getItem(SAVE_KEY);
    const legacyRaw = LEGACY_SAVE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    const payload = raw || legacyRaw;
    if (!payload) return;
    try {
      const data = JSON.parse(payload);
      localStorage.setItem(SAVE_BACKUP_KEY, payload);
      applySaveData(data);
      if (legacyRaw && !raw) {
        save();
        LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
      }
    } catch (err) {
      console.warn('save load failed', err);
      const backup = localStorage.getItem(SAVE_BACKUP_KEY);
      if (backup) {
        try {
          applySaveData(JSON.parse(backup));
          showToast('Сейв восстановлен из резервной копии.');
        } catch {
          localStorage.removeItem(SAVE_KEY);
          localStorage.removeItem(SAVE_BACKUP_KEY);
        }
      }
    }
  }

  function ensureRings() {
    const need = desiredRings();
    while (state.rings.length < need) {
      const idx = state.rings.length;
      const typeDef = cfg.orbitTypes[idx % cfg.orbitTypes.length];
      state.rings.push({
        idx,
        x: 1,
        d: 0.08 + idx * 0.06,
        speed: 8 + (cfg.baseRings - idx) * 1.25,
        progress: 0,
        rot: 0,
        lvl: 0,
        dLvl: 0,
        orbitType: typeDef.id,
        slots: 1,
        typeShifts: 0,
        occupants: [{ type: typeDef.id }],
      });
    }
    state.rings.length = need;
    state.rings.forEach((r, i) => {
      const typeDef = cfg.orbitTypes[i % cfg.orbitTypes.length];
      if (!r.orbitType) r.orbitType = typeDef.id;
      if (!r.slots) r.slots = 1;
      if (!r.typeShifts) r.typeShifts = 0;
      if (!r.occupants) r.occupants = [{ type: r.orbitType }];
      if (!r.occupants.length) r.occupants = [{ type: r.orbitType }];
    });
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
    state.achievements[a.id] = { earnedAt: Date.now() };
    if (a.reward?.essence) state.essence += a.reward.essence * state.bonus.essence;
    if (a.reward?.gp) state.gp += a.reward.gp;
    if (a.reward?.epBoost) state.bonus.epGain *= a.reward.epBoost;
    if (a.reward?.speedBoost) state.bonus.speed *= a.reward.speedBoost;
    if (a.reward?.costCut) state.bonus.cost *= a.reward.costCut;
    renderAchievements();
    showToast(`Ачивка: ${a.name}`);
  }

  function checkAchievements(now) {
    const active = activeRingCount();
    const defs = achievementDefs;
    for (const a of defs) {
      if (state.achievements[a.id]) continue;
      if (a.id === 'ep1k' && state.stats.totalEP >= 1e3) grantAchievement(a);
      if (a.id === 'ep1m' && state.stats.totalEP >= 1e6) grantAchievement(a);
      if (a.id === 'ep1b' && state.stats.totalEP >= 1e9) grantAchievement(a);
      if (a.id === 'closures100' && state.stats.closures >= 100) grantAchievement(a);
      if (a.id === 'closures1k' && state.stats.closures >= 1000) grantAchievement(a);
      if (a.id === 'closures10k' && state.stats.closures >= 10000) grantAchievement(a);
      if (a.id === 'prestige1' && state.stats.totalPrestiges >= 1) grantAchievement(a);
      if (a.id === 'prestige5' && state.stats.totalPrestiges >= 5) grantAchievement(a);
      if (a.id === 'prestige20' && state.stats.totalPrestiges >= 20) grantAchievement(a);
      if (a.id === 'epoch3' && state.epoch >= 3) grantAchievement(a);
      if (a.id === 'epoch10' && state.epoch >= 10) grantAchievement(a);
      if (a.id === 'epoch25' && state.epoch >= 25) grantAchievement(a);
      if (a.id === 'gp5' && state.gp >= 5) grantAchievement(a);
      if (a.id === 'gp20' && state.gp >= 20) grantAchievement(a);
      if (a.id === 'gp50' && state.gp >= 50) grantAchievement(a);
      if (a.id === 'essence1' && state.essence >= 1) grantAchievement(a);
      if (a.id === 'essence10' && state.essence >= 10) grantAchievement(a);
      if (a.id === 'essence25' && state.essence >= 25) grantAchievement(a);
      if (a.id === 'ring5' && unlockedCount() >= 5) grantAchievement(a);
      if (a.id === 'ring10' && unlockedCount() >= 10) grantAchievement(a);
      if (a.id === 'ringAll' && unlockedCount() >= desiredRings()) grantAchievement(a);
      if (a.id === 'pathChosen' && state.path) grantAchievement(a);
      if (a.id === 'challenge1' && state.stats.challengesCompleted >= 1) grantAchievement(a);
      if (a.id === 'challenge3' && state.stats.challengesCompleted >= 3) grantAchievement(a);
      if (a.id === 'infl1e6' && state.I >= 1e6) grantAchievement(a);
      if (a.id === 'infl1e9' && state.I >= 1e9) grantAchievement(a);
      if (a.id === 'ideal' && state.stats.idealTracker.size >= active) grantAchievement(a);
      if (a.id === 'fastPrestige' && state.stats.fastestPrestigeSeconds > 0 && state.stats.fastestPrestigeSeconds <= 600) grantAchievement(a);
      if (a.id === 'silent' && !state.options.sound) grantAchievement(a);
      if (a.id === 'collector' && state.stats.totalUpgrades >= 10) grantAchievement(a);
      if (a.id === 'spender' && state.stats.totalEpSpent >= 1e6) grantAchievement(a);
      if (a.id === 'overdrive3' && state.stats.overdriveUses >= 3) grantAchievement(a);
      if (a.id === 'exp1' && state.stats.expeditions >= 1) grantAchievement(a);
      if (a.id === 'contracts3' && state.stats.contractsCompleted >= 3) grantAchievement(a);
      if (a.id === 'style1' && (state.system.starColorIdx + state.system.orbitColorIdx + state.system.bgIdx) > 0) grantAchievement(a);
    }
    if (state.stats.idealTracker.size >= active && state.stats.lastClosureTs && now - state.stats.lastClosureTs <= 1000) {
      state.essence += 1 * state.bonus.essence;
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
    if ($selType) $selType.textContent = orbitTypeDef(r0.orbitType).name;
    const cs = ringCostSpeed(r0);
    const cd = ringCostDelta(r0);
    const syn = effectiveModifier()?.forbidSynergy ? 'недоступна' : `${fmt(synergyCost())} EP`;
    $costHint.textContent = `Стоимость: скорость ${fmt(cs)} EP • Δ ${fmt(cd)} EP • инфляция ${fmt(inflationCutCost())} EP • синергия ${syn} • доп. объект ${fmt(orbitSlotCost(r0))} EP • смена типа ${fmt(orbitShiftCost(r0))} EP`;

    const lockHint = locked
      ? ` (заблокировано: сделай ${cfg.upgradesToUnlock} апгрейдов на орбите #${unlocked})`
      : disabled
        ? ' (временно отключено модификатором)'
        : '';
    if ($recHint) $recHint.textContent = locked ? `Открытие: улучшай орбиту #${unlocked} (${cfg.upgradesToUnlock} апгрейдов), чтобы открыть #${unlocked + 1}.` : $recHint.textContent;

    if (locked || disabled) {
      $costHint.textContent = `Орбита #${state.selected + 1}${lockHint}`;
    }
    updateRecommendation();
    renderShops();
  }

  function updateRecommendation() {
    if (!$recHint) return;
    const r0 = state.rings[state.selected];
    if (!r0) { $recHint.textContent = ''; return; }
    if (state.selected >= unlockedCount()) {
      $recHint.textContent = `Чтобы открыть орбиту #${state.selected + 1}: сделай ${cfg.upgradesToUnlock} апгрейдов на орбите #${unlockedCount()}.`;
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
        ? `Заблокировано: апгрейды на орбите #${unlocked} (${Math.min(cfg.upgradesToUnlock, unlockProg)}/${cfg.upgradesToUnlock})`
        : disabled
          ? `Отключено модификатором`
          : `x=${fmt(r.x)} | Δ=${fmt(r.d)}`;
      card.innerHTML = `
        <div>
          <div class="title">Орбита #${i+1}</div>
          <div class="small">${orbitTypeDef(r.orbitType).name}</div>
          <div class="small">${sub}</div>
        </div>
        <div class="small">Lvl ${r.lvl} • Speed ${r.speed.toFixed(1)}%/с • Объектов ${r.occupants?.length || 1}</div>
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

  function renderShopButtons(container, items, ctx) {
    if (!container) return;
    container.innerHTML = '';
    items.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'shopBtn';
      const cost = item.cost(ctx);
      const affordable = typeof cost === 'number' ? cost : Infinity;
      const canBuy = item.canBuy ? item.canBuy(ctx) : true;
      btn.disabled = !canBuy;
      const levelText = item.level ? `Уровень: ${item.level(ctx)}` : null;
      btn.innerHTML = `
        <div class="title">${item.title}</div>
        <div class="meta">${item.desc}</div>
        ${levelText ? `<div class="meta">${levelText}</div>` : ''}
        <div class="meta">Цена: ${fmt(affordable)} ${item.currency || ''}</div>
      `;
      btn.addEventListener('click', () => {
        armAudio();
        soundClick();
        const ok = item.apply(ctx);
        if (ok) {
          updateSelectedUI();
          updateUI();
          renderShops();
          save();
        }
      });
      container.appendChild(btn);
    });
  }

  function renderShops() {
    const r0 = state.rings[state.selected];
    const locked = state.selected >= unlockedCount();
    const disabled = !locked && state.selected >= activeRingCount();
    const lockAll = locked || disabled;
    renderShopButtons($epShopList, epShopItems.map((item) => ({
      ...item,
      currency: 'EP',
      cost: item.cost,
      canBuy: (ctx) => !lockAll && item.canBuy(ctx) && state.EP >= item.cost(ctx),
    })), r0);
    renderShopButtons($gpShopList, gpShopItems.map((item) => ({
      ...item,
      currency: 'GP',
      cost: item.cost,
      canBuy: () => state.gp >= item.cost(),
    })), null);
    renderShopButtons($essenceShopList, essenceShopItems.map((item) => ({
      ...item,
      currency: 'Essence',
      cost: item.cost,
      canBuy: () => item.canBuy() && state.essence >= item.cost(),
    })), null);
  }

  function setPane(name) {
    tabButtons.forEach((b) => {
      const active = b.dataset.pane === name;
      b.classList.toggle('active', active);
    });
    panes.forEach((p) => p.classList.toggle('active', p.classList.contains(`pane-${name}`)));
  }

  function synergyCost() {
    return costCurve(cfg.pricing.synergy, state.synergy, 0, state.bonus.cost);
  }

  function inflationCutCost() {
    return costCurve(cfg.pricing.inflCut, state.inflCuts, 0, state.bonus.cost);
  }

  function geneCost(base, lvl) {
    return Math.floor(costCurve({ base, growth: cfg.pricing.gene.growth }, lvl, 0, 1));
  }

  function applyPath(name) {
    if (state.path) return;
    if (state.epoch < cfg.pathEpochRequired) return;
    state.path = name;
    state.pathRank = 1;
    bus.emit('path', { path: name });
    checkAchievements(Date.now());
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
    addFloat(`Открыта орбита #${state.unlockedRings}`, 'rgba(255,255,255,0.95)');
    renderRingList();
  }

  function swapOrbits(a, b) {
    if (a < 0 || b < 0) return;
    if (a >= state.rings.length || b >= state.rings.length) return;
    const tmp = state.rings[a];
    state.rings[a] = state.rings[b];
    state.rings[b] = tmp;
    state.rings.forEach((r, idx) => { r.idx = idx; });
    state.selected = b;
    renderRingList();
    updateSelectedUI();
  }

  function onRingClosed(ring, now) {
    const mod = effectiveModifier();
    const typeDef = orbitTypeDef(ring.orbitType);
    const synergy = orbitSynergy(ring.idx);
    const objectMod = orbitObjectModifier(ring);
    const eventDef = activeEventDef();
    state.stats.closures += 1;
    state.stats.essenceTicker += 1;
    state.stats.lastClosureTs = now;
    state.stats.idealTracker.add(ring.idx);

    if (state.stats.essenceTicker >= cfg.essenceClosureStep) {
      state.essence += 1 * state.bonus.essence;
      state.stats.essenceTicker = 0;
    }

    const dMul = (mod?.dMul || 1);
    const powerMul = (mod?.ringPower || 1);
    const pathMul = state.path === 'power' ? 1.15 : 1;
    const geneMul = 1 + state.gene.xBoost * 0.05;
    ring.x += ring.d * dMul * pathMul * geneMul * powerMul / (1 + ring.x / cfg.K);

    const active = activeRingCount();
    const M = productM(active);
    const eventGain = eventDef?.gainMul || 1;
    const overdriveGain = state.overdrive.activeUntil > Date.now() ? 2 : 1;
    const penaltyGain = state.overdrive.penaltyUntil > Date.now() ? cfg.overdrive.penaltyMul : 1;
    const gainMul = (mod?.gainMul || 1)
      * (state.path === 'power' ? 1.1 : 1)
      * powerMul
      * typeDef.gainMul
      * synergy.gainMul
      * objectMod.gainMul
      * eventGain
      * overdriveGain
      * penaltyGain;
    const ringCountBonus = 1 + Math.max(0, active - 1) * 0.06;
    const rawGain = ((M * state.prestigeBonus * gainMul) + 1) * ringCountBonus / state.I;
    const boostedGain = rawGain * state.bonus.epGain;
    const gain = applySoftcap(boostedGain, cfg.softcap.epGain, cfg.softcap.epDiv);
    state.EP += gain;
    state.stats.totalEP += gain;
    addFloat(`+${fmt(gain)} EP`, 'rgba(180,220,255,0.95)');
    logEconomy('gain', { rawGain, boostedGain, gain });
    soundTick();

    const inflBase = cfg.c * (M / (M + cfg.S));
    const inflRings = 0.75 + 0.08 * Math.min(10, active);
    const shieldMul = state.stabilityShieldUntil > Date.now() ? 0.7 : 1;
    const eventInfl = eventDef?.inflMul || 1;
    const inflMul = (mod?.inflMul || 1)
      * (1 - 0.1 * state.gene.infl)
      * (state.path === 'stability' ? 0.8 : 1)
      * inflRings
      * state.bonus.infl
      * shieldMul
      * typeDef.inflMul
      * synergy.inflMul
      * objectMod.inflMul
      * eventInfl;
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
    bus.emit('orbitCompleted', { orbit: ring.idx, gain });
  }

  function update(dt, now) {
    const active = activeRingCount();
    const mod = effectiveModifier();
    const eventDef = activeEventDef();
    const speedMul = (mod?.speedMul || 1)
      * (state.path === 'speed' ? 1.15 + 0.02 * state.pathRank : 1)
      * state.bonus.speed
      * (eventDef?.speedMul || 1);

    let inflLinear = cfg.r * (1 - 0.1 * state.gene.infl);
    if (state.path === 'stability') inflLinear *= 0.7;
    if (mod?.inflMul) inflLinear *= mod.inflMul;
    inflLinear *= 0.70 + 0.06 * Math.min(10, active);
    inflLinear *= state.bonus.infl;
    if (state.stabilityShieldUntil > Date.now()) inflLinear *= 0.7;
    state.I *= (1 + inflLinear * dt);

    for (let i = 0; i < active; i++) {
      const ring = state.rings[i];
      const typeDef = orbitTypeDef(ring.orbitType);
      const synergy = orbitSynergy(i);
      const overdriveSpeed = state.overdrive.activeUntil > Date.now() ? 1.25 : 1;
      const penaltySpeed = state.overdrive.penaltyUntil > Date.now() ? cfg.overdrive.penaltyMul : 1;
      const localSpeed = ring.speed * speedMul * typeDef.speedMul * synergy.speedMul * overdriveSpeed * penaltySpeed;
      ring.progress += localSpeed * dt;
      ring.rot += (localSpeed * 0.004) * dt * Math.PI * 2;
      if (ring.progress >= 100) {
        ring.progress -= 100;
        onRingClosed(ring, now);
      }
    }

    state.stats.totalPlaySeconds += dt;
    if (state.stats.totalPlaySeconds > state.stats.longestSessionSeconds) {
      state.stats.longestSessionSeconds = state.stats.totalPlaySeconds;
    }
    if (state.auto.buy && state.gene.auto > 0) autoSpend();
    if (state.auto.prestige && canPrestige()) prestige();

    updateOverdrive(dt);
    updateSystemEvent(now);
    updateExpedition(now);
    updateContracts();
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
      state.stats.totalEpSpent += best.cost;
      best.r.lvl += 1;
      best.r.speed *= 1.15;
      state.stats.totalUpgrades += 1;
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
      state.stats.totalEpSpent += best.cost;
      best.r.dLvl += 1;
      best.r.d *= 1.18;
      state.stats.totalUpgrades += 1;
      maybeUnlockNextRing();
      return true;
    }

    function buyInfl() {
      const cost = inflationCutCost();
      if (state.EP < cost) return false;
      state.EP -= cost;
      state.stats.totalEpSpent += cost;
      state.inflCuts += 1;
      state.I *= 0.98;
      state.stats.totalUpgrades += 1;
      return true;
    }

    function buySyn() {
      if (mod?.forbidSynergy) return false;
      const cost = synergyCost();
      if (state.EP < cost) return false;
      state.EP -= cost;
      state.stats.totalEpSpent += cost;
      state.synergy += 1;
      state.stats.totalUpgrades += 1;
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
    const palette = currentPalette();
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.6);
    grad.addColorStop(0, palette.bg.colors[2]);
    grad.addColorStop(0.6, palette.bg.colors[1]);
    grad.addColorStop(1, palette.bg.colors[0]);
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
    ctx.fillStyle = `${palette.star}55`;
    ctx.shadowColor = palette.star;
    ctx.shadowBlur = 24;
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
      ctx.strokeStyle = state.system.orbitTrails ? `${palette.orbit}55` : `${palette.orbit}25`;
      ctx.lineWidth = cfg.ringThickness;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, rr, start, end);
      const sel = (i === state.selected);
      const typeDef = orbitTypeDef(r.orbitType);
      const col = state.skinOwned ? `${typeDef.color}${sel ? 'ff' : 'aa'}` : (sel ? `${typeDef.color}ff` : `${typeDef.color}bb`);
      ctx.strokeStyle = col;
      ctx.lineWidth = cfg.ringThickness;
      ctx.lineCap = 'round';
      ctx.stroke();

      const mx = cx + Math.cos(end) * rr;
      const my = cy + Math.sin(end) * rr;
      ctx.beginPath();
      ctx.arc(mx, my, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
      if (r.occupants?.length > 1) {
        ctx.beginPath();
        ctx.arc(mx + 6, my - 2, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `${col}bb`;
        ctx.fill();
      }
      ctx.restore();
    }

    // overlay numbers
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '12px "Segoe UI", system-ui';
    const lines = [];
    for (let i = 0; i < active; i++) lines.push(`${orbitTypeDef(state.rings[i].orbitType).name.split(' ')[0]} x${i+1}=${fmt(state.rings[i].x)}`);
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
    const shield = state.stabilityShieldUntil > Date.now() ? ' • Стабилизатор активен' : '';
    $modifierHint.textContent = `Мировой модификатор: ${baseMod}${ch ? ` • Испытание: ${ch.title}` : ''}${shield}`;
    if ($eventHint) {
      const eventDef = activeEventDef();
      $eventHint.textContent = eventDef ? `Событие: ${eventDef.name}` : 'Событие: нет';
    }
    if ($overdriveHint) {
      if (state.overdrive.penaltyUntil > Date.now()) $overdriveHint.textContent = 'Overdrive: перегрев';
      else if (state.overdrive.activeUntil > Date.now()) $overdriveHint.textContent = 'Overdrive: активен';
      else if (state.overdrive.cooldownUntil > Date.now()) $overdriveHint.textContent = 'Overdrive: перезарядка';
      else $overdriveHint.textContent = 'Overdrive: готов';
    }
    $pathHint.textContent = state.path ? `Путь: ${state.path} (ранг ${state.pathRank})` : `Путь не выбран (доступно после эпохи ${cfg.pathEpochRequired})`;
    $prestige.disabled = !canPrestige();
    $timeBoost.disabled = state.essence < cfg.pricing.boosters.time || state.timeBoostUntil > Date.now();
    if ($overdrive) $overdrive.disabled = state.overdrive.cooldownUntil > Date.now() || state.overdrive.activeUntil > Date.now();
    if ($orbitUp) $orbitUp.disabled = state.selected <= 0;
    if ($orbitDown) $orbitDown.disabled = state.selected >= state.rings.length - 1;
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
    $pathSpeed.disabled = !!state.path || state.epoch < cfg.pathEpochRequired;
    $pathPower.disabled = $pathSpeed.disabled;
    $pathStability.disabled = $pathSpeed.disabled;

    if ($toggleAutoBuy) $toggleAutoBuy.textContent = `Автопокупка: ${state.auto.buy ? 'вкл' : 'выкл'}`;
    if ($toggleAutoPrestige) $toggleAutoPrestige.textContent = `Автопрестиж: ${state.auto.prestige ? 'вкл' : 'выкл'}`;
    if ($toggle) $toggle.textContent = state.running ? 'Пауза' : 'Пуск';
    if ($toggleSound) $toggleSound.textContent = `Звук: ${state.options.sound ? 'вкл' : 'выкл'}`;
    if ($toggleFloat) $toggleFloat.textContent = `Всплывающие числа: ${state.options.floatNumbers ? 'вкл' : 'выкл'}`;
    if ($toggleCompact) $toggleCompact.textContent = `Формат чисел: ${state.options.numberFormat}`;
    if ($saveHint) $saveHint.textContent = `Последний автосейв: ${timeAgo(state.stats.lastSave)} • версия ${SAVE_VERSION}`;
    if ($devToggle) $devToggle.textContent = `Dev: ${state.dev.enabled ? 'вкл' : 'выкл'}`;
    if ($devHint) $devHint.textContent = state.dev.enabled ? 'Dev режим активен.' : 'Dev-панель скрыта по умолчанию.';
    if ($devGrantEP) $devGrantEP.disabled = !state.dev.enabled;
    if ($devGrantGP) $devGrantGP.disabled = !state.dev.enabled;
    if ($devGrantEssence) $devGrantEssence.disabled = !state.dev.enabled;
    if ($devFastForward) $devFastForward.disabled = !state.dev.enabled;
    if ($devReset) $devReset.disabled = !state.dev.enabled;
    if ($autoPriSpeed) $autoPriSpeed.classList.toggle('active', state.autoPriority === 'speed');
    if ($autoPriDelta) $autoPriDelta.classList.toggle('active', state.autoPriority === 'delta');
    if ($autoPriInfl) $autoPriInfl.classList.toggle('active', state.autoPriority === 'infl');
    if ($autoPriSyn) $autoPriSyn.classList.toggle('active', state.autoPriority === 'syn');
    if ($toggleOrbitTrails) $toggleOrbitTrails.textContent = `Шлейфы: ${state.system.orbitTrails ? 'вкл' : 'выкл'}`;
    if ($styleHint) {
      const palette = currentPalette();
      $styleHint.textContent = `Стиль: ${palette.bg.id} • звезда ${palette.star} • орбиты ${palette.orbit}`;
    }

    if ($expeditionStatus) {
      if (state.expedition.active) {
        const left = Math.max(0, Math.floor((state.expedition.returnsAt - Date.now()) / 1000));
        $expeditionStatus.textContent = `Корабль в пути • ${left}s`;
      } else if (state.expedition.reward) {
        $expeditionStatus.textContent = 'Экспедиция завершена.';
      } else {
        $expeditionStatus.textContent = 'Корабль готов.';
      }
    }
    if ($expeditionReward) {
      const reward = state.expedition.reward;
      $expeditionReward.textContent = reward
        ? `Награда: ${reward.ep ? `+${fmt(reward.ep)} EP` : ''} ${reward.gp ? `+${reward.gp} GP` : ''} ${reward.essence ? `+${reward.essence} Essence` : ''}`.trim()
        : 'Награда: —';
    }
    if ($artifactHint) {
      const count = Object.keys(state.expedition.artifacts || {}).length;
      $artifactHint.textContent = `Коллекция: ${count} артефактов`;
    }
    if ($startExpedition) $startExpedition.disabled = state.expedition.active || !!state.expedition.reward;
    if ($claimExpedition) $claimExpedition.disabled = !state.expedition.reward || state.expedition.active;

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
    renderShops();
    if ($challengeList) {
      const tNow = Date.now();
      if (tNow - lastChallengeRender > 500) { renderChallenges(); lastChallengeRender = tNow; }
    }

    renderStats();
    checkAchievements(Date.now());
    renderContracts();
  }

  function renderStats() {
    if (!$statsGrid) return;
    const now = Date.now();
    if (now - lastStatsRender < 400) return;
    lastStatsRender = now;
    const items = [
      ['Сессия', `${Math.floor(state.stats.totalPlaySeconds)}s`],
      ['Лучшая эпоха', state.stats.fastestPrestigeSeconds ? `${Math.floor(state.stats.fastestPrestigeSeconds)}s` : '—'],
      ['Всего замыканий', fmt(state.stats.closures)],
      ['Всего EP (накоп.)', fmt(state.stats.totalEP)],
      ['EP/сек', fmt(state.stats.epPerSec)],
      ['Текущая эпоха', String(state.epoch)],
      ['Престижей всего', String(state.stats.totalPrestiges)],
      ['Апгрейдов всего', String(state.stats.totalUpgrades)],
      ['Потрачено EP', fmt(state.stats.totalEpSpent)],
      ['Потрачено GP', fmt(state.stats.totalGpSpent)],
      ['Потрачено Essence', fmt(state.stats.totalEssenceSpent)],
      ['Overdrive использований', String(state.stats.overdriveUses)],
      ['Экспедиций', String(state.stats.expeditions)],
      ['Контрактов', String(state.stats.contractsCompleted)],
      ['Оффлайн циклов', fmt(state.stats.offlineCycles)],
      ['Синергия', String(state.synergy)],
      ['Срезов инфляции', String(state.inflCuts)],
      ['Путь', state.path ? `${state.path} (ранг ${state.pathRank})` : 'нет'],
      ['Орбит активно', String(activeRingCount())],
      ['Испытание', activeChallengeDef() ? activeChallengeDef().title : 'нет'],
    ];
    $statsGrid.innerHTML = items.map(([k, v]) => `<div><span class="k">${k}</span>: ${v}</div>`).join('');
  }

  function renderContracts() {
    if (!$contractList) return;
    if (!state.contracts.length) return;
    $contractList.innerHTML = '';
    state.contracts.forEach((c) => {
      const div = document.createElement('div');
      div.className = `contractItem ${c.done ? 'done' : ''}`;
      const rewardText = `${c.reward.ep ? `+${fmt(c.reward.ep)} EP` : ''} ${c.reward.gp ? `+${c.reward.gp} GP` : ''} ${c.reward.essence ? `+${c.reward.essence} Essence` : ''}`.trim();
      div.innerHTML = `
        <div>
          <div class="t">${c.type === 'closures' ? 'Замыкания' : c.type === 'overdrive' ? 'Overdrive' : 'Экспедиции'} (${c.progress}/${c.target})</div>
          <div class="d">Награда: ${rewardText || '—'}</div>
        </div>
        <div class="r">${c.done ? 'Готово' : 'В процессе'}</div>
      `;
      $contractList.appendChild(div);
    });
  }

  function renderAchievements() {
    $achList.innerHTML = '';
    achievementDefs.forEach((a) => {
      const div = document.createElement('div');
      const done = !!state.achievements[a.id];
      div.className = `ach ${done ? 'done' : ''}`;
      const rewards = [];
      if (a.reward?.essence) rewards.push(`+${a.reward.essence} Essence`);
      if (a.reward?.gp) rewards.push(`+${a.reward.gp} GP`);
      if (a.reward?.epBoost) rewards.push(`EP x${a.reward.epBoost.toFixed(2)}`);
      if (a.reward?.speedBoost) rewards.push(`Speed x${a.reward.speedBoost.toFixed(2)}`);
      if (a.reward?.costCut) rewards.push(`Costs x${a.reward.costCut.toFixed(2)}`);
      div.innerHTML = `<strong>${a.name}</strong>${a.desc}<br/><span class="k">${a.category}</span><br/>Награда: ${rewards.join(' • ') || '—'}`;
      $achList.appendChild(div);
    });
  }

  function timeAgo(ts) {
    if (!ts) return '—';
    const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (diff < 60) return `${diff}с назад`;
    const min = Math.floor(diff / 60);
    if (min < 60) return `${min}м назад`;
    const h = Math.floor(min / 60);
    return `${h}ч назад`;
  }

  function applyOfflineProgress() {
    if (!state.stats.lastSave) state.stats.lastSave = Date.now();
    const now = Date.now();
    const dt = Math.max(0, (now - state.stats.lastSave) / 1000);
    if (dt < 1) return;
    const capped = Math.min(dt, cfg.offline.rewardCapSeconds);
    const eff = cfg.offline.efficiency;
    const steps = Math.min(cfg.offline.stepsCap, Math.floor(capped * eff));
    offlineSimulating = true;
    for (let i = 0; i < steps; i++) {
      const fakeNow = state.stats.lastSave + i * (1000 / eff);
      update(0.02, fakeNow);
    }
    offlineSimulating = false;
    state.stats.offlineCycles = steps;
    $offlineHint.textContent = `Оффлайн: обработано ${steps} циклов`;
    if (steps > 0) showToast(`Оффлайн прогресс: +${steps} циклов`);
    state.stats.lastSave = Date.now();
    state.epochInflationStart = state.I;
  }

  function resetAll() {
    state.EP = 0; state.I = 1; state.epoch = 0; state.prestigeBonus = 1;
    state.modifier = null;
    state.synergy = 0; state.inflCuts = 0;
    state.timeBoostUntil = 0;
    state.stabilityShieldUntil = 0;
    state.system = { starColorIdx: 0, orbitColorIdx: 0, bgIdx: 0, orbitTrails: true };
    state.systemEvent = { active: null, endsAt: 0, nextAt: Date.now() + 60000 };
    state.overdrive = { activeUntil: 0, cooldownUntil: 0, heat: 0, penaltyUntil: 0 };
    state.expedition = { active: false, returnsAt: 0, reward: null, artifacts: {} };
    state.contracts = [];
    state.contractsNextAt = Date.now() + cfg.contracts.refreshSeconds * 1000;
    state.bonus = { epGain: 1, speed: 1, infl: 1, cost: 1, essence: 1 };
    state.gene = { xBoost: 0, infl: 0, extraRing: 0, auto: 0, core: 0, stability: 0 };
    state.challenge.active = null;
    state.challenge.selected = null;
    state.epochInflationStart = 1;
    state.unlockedRings = unlockStartCount();
    state.stats.essenceTicker = 0;
    state.stats.closures = 0;
    state.stats.totalEP = 0;
    state.stats.totalPrestiges = 0;
    state.stats.totalUpgrades = 0;
    state.stats.totalGpSpent = 0;
    state.stats.totalEpSpent = 0;
    state.stats.totalEssenceSpent = 0;
    state.stats.challengesCompleted = 0;
    state.stats.fastestPrestigeSeconds = 0;
    state.stats.overdriveUses = 0;
    state.stats.expeditions = 0;
    state.stats.contractsCompleted = 0;
    state.stats.idealTracker.clear();
    state.stats.lastClosureTs = 0;
    state.stats.runStarted = Date.now();
    state.achievements = {};
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
    if (inflRatio < cfg.rewards.stabilityThresholds[0]) stabilityEssence = cfg.rewards.stabilityEssence[0];
    else if (inflRatio < cfg.rewards.stabilityThresholds[1]) stabilityEssence = cfg.rewards.stabilityEssence[1];
    if (stabilityEssence) state.essence += stabilityEssence;

    // награда за испытание
    const ch = activeChallengeDef();
    if (ch && !state.challenge.completed[ch.id]) {
      state.essence += ch.reward.essence;
      state.challenge.completed[ch.id] = true;
      state.stats.challengesCompleted += 1;
      addFloat(`Challenge +${ch.reward.essence} Essence`, 'rgba(255,210,160,0.95)');
    }
    state.challenge.active = null;

    state.epoch += 1;
    state.stats.totalPrestiges += 1;
    const runSeconds = Math.max(1, (Date.now() - state.stats.runStarted) / 1000);
    if (!state.stats.fastestPrestigeSeconds || runSeconds < state.stats.fastestPrestigeSeconds) {
      state.stats.fastestPrestigeSeconds = runSeconds;
    }
    state.stats.runStarted = Date.now();
    state.prestigeBonus *= cfg.prestigeBonusGrowth;
    const gpGain = cfg.rewards.prestigeBaseGP + Math.floor(state.epoch / cfg.rewards.prestigeGpStep);
    state.gp += gpGain;
    state.system.starColorIdx = (state.system.starColorIdx + 1) % cfg.cosmetics.stars.length;
    state.system.orbitColorIdx = (state.system.orbitColorIdx + 1) % cfg.cosmetics.orbits.length;
    state.system.bgIdx = (state.system.bgIdx + 1) % cfg.cosmetics.backgrounds.length;
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
    checkAchievements(Date.now());
    bus.emit('prestige', { epoch: state.epoch, gpGain });
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

  if ($overdrive) {
    $overdrive.addEventListener('click', () => {
      armAudio();
      soundClick();
      const now = Date.now();
      if (state.overdrive.cooldownUntil > now || state.overdrive.activeUntil > now) return;
      state.overdrive.activeUntil = now + cfg.overdrive.duration * 1000;
      state.overdrive.cooldownUntil = now + cfg.overdrive.cooldown * 1000;
      state.overdrive.heat = Math.min(cfg.overdrive.heatMax, state.overdrive.heat + 1);
      state.stats.overdriveUses += 1;
      showToast('Overdrive активирован!');
      bus.emit('overdriveActivated', {});
    });
  }

  if ($orbitUp) {
    $orbitUp.addEventListener('click', () => {
      armAudio();
      soundClick();
      swapOrbits(state.selected, state.selected - 1);
    });
  }
  if ($orbitDown) {
    $orbitDown.addEventListener('click', () => {
      armAudio();
      soundClick();
      swapOrbits(state.selected, state.selected + 1);
    });
  }

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


  $pathSpeed.addEventListener('click', () => { armAudio(); soundClick(); applyPath('speed'); });
  $pathPower.addEventListener('click', () => { armAudio(); soundClick(); applyPath('power'); });
  $pathStability.addEventListener('click', () => { armAudio(); soundClick(); applyPath('stability'); });

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => { armAudio(); soundClick(); setPane(btn.dataset.pane); });
  });

  $timeBoost.addEventListener('click', () => {
    armAudio();
    soundClick();
    if (state.essence < cfg.pricing.boosters.time) return;
    state.essence -= cfg.pricing.boosters.time;
    state.stats.totalEssenceSpent += cfg.pricing.boosters.time;
    state.timeBoostUntil = Date.now() + cfg.timeBoostDuration * 1000;
    state.stats.totalUpgrades += 1;
    bus.emit('purchase', { type: 'burst', cost: cfg.pricing.boosters.time, currency: 'essence' });
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
      checkAchievements(Date.now());
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

  if ($cycleStar) {
    $cycleStar.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.system.starColorIdx = (state.system.starColorIdx + 1) % cfg.cosmetics.stars.length;
      checkAchievements(Date.now());
    });
  }
  if ($cycleOrbit) {
    $cycleOrbit.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.system.orbitColorIdx = (state.system.orbitColorIdx + 1) % cfg.cosmetics.orbits.length;
      checkAchievements(Date.now());
    });
  }
  if ($cycleBg) {
    $cycleBg.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.system.bgIdx = (state.system.bgIdx + 1) % cfg.cosmetics.backgrounds.length;
      checkAchievements(Date.now());
    });
  }
  if ($toggleOrbitTrails) {
    $toggleOrbitTrails.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.system.orbitTrails = !state.system.orbitTrails;
    });
  }

  if ($startExpedition) {
    $startExpedition.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (state.expedition.active || state.expedition.reward) return;
      const duration = cfg.expeditions.minSeconds + Math.random() * (cfg.expeditions.maxSeconds - cfg.expeditions.minSeconds);
      const reward = cfg.expeditions.rewards[Math.floor(Math.random() * cfg.expeditions.rewards.length)];
      state.expedition.active = true;
      state.expedition.returnsAt = Date.now() + duration * 1000;
      state.expedition.reward = reward;
      showToast('Экспедиция отправлена.');
      bus.emit('expeditionStarted', { duration, reward });
    });
  }
  if ($claimExpedition) {
    $claimExpedition.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.expedition.reward || state.expedition.active) return;
      const reward = state.expedition.reward;
      state.EP += reward.ep || 0;
      state.gp += reward.gp || 0;
      if (reward.essence) state.essence += reward.essence * state.bonus.essence;
      state.stats.expeditions += 1;
      const artifactId = `A${Math.floor(Math.random() * 12) + 1}`;
      state.expedition.artifacts[artifactId] = (state.expedition.artifacts[artifactId] || 0) + 1;
      state.expedition.reward = null;
      showToast('Награды получены.');
      bus.emit('expeditionClaimed', { reward, artifactId });
    });
  }

  if ($devToggle) {
    $devToggle.addEventListener('click', () => {
      armAudio();
      soundClick();
      state.dev.enabled = !state.dev.enabled;
      localStorage.setItem(DEV_KEY, state.dev.enabled ? '1' : '0');
      showToast(state.dev.enabled ? 'Dev-режим включён.' : 'Dev-режим выключен.');
    });
  }
  if ($devGrantEP) {
    $devGrantEP.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.dev.enabled) return;
      state.EP += cfg.dev.grantEP;
      state.stats.totalEP += cfg.dev.grantEP;
      showToast(`Dev: +${fmt(cfg.dev.grantEP)} EP`);
    });
  }
  if ($devGrantGP) {
    $devGrantGP.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.dev.enabled) return;
      state.gp += cfg.dev.grantGP;
      showToast(`Dev: +${cfg.dev.grantGP} GP`);
    });
  }
  if ($devGrantEssence) {
    $devGrantEssence.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.dev.enabled) return;
      state.essence += cfg.dev.grantEssence;
      showToast(`Dev: +${cfg.dev.grantEssence} Essence`);
    });
  }
  if ($devFastForward) {
    $devFastForward.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.dev.enabled) return;
      const steps = Math.floor(cfg.dev.fastForwardSeconds * cfg.offline.efficiency);
      offlineSimulating = true;
      for (let i = 0; i < steps; i++) {
        update(0.02, performance.now());
      }
      offlineSimulating = false;
      showToast('Dev: +10 минут прогресса');
    });
  }
  if ($devReset) {
    $devReset.addEventListener('click', () => {
      armAudio();
      soundClick();
      if (!state.dev.enabled) return;
      const ok = window.confirm('Полный сброс прогресса?');
      if (!ok) return;
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_BACKUP_KEY);
      LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
      window.location.reload();
    });
  }

  if ($exportSave) {
    $exportSave.addEventListener('click', async () => {
      armAudio();
      soundClick();
      const payload = getSavePayload();
      const encoded = encodeSave(payload);
      if ($saveData) $saveData.value = encoded;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(encoded);
          showToast('Сейв экспортирован и скопирован.');
          return;
        } catch {
          showToast('Сейв экспортирован.');
          return;
        }
      }
      showToast('Сейв экспортирован.');
    });
  }

  if ($importSave) {
    $importSave.addEventListener('click', () => {
      armAudio();
      soundClick();
      const value = $saveData?.value.trim();
      if (!value) {
        showToast('Вставьте код сейва.');
        return;
      }
      try {
        const data = decodeSave(value);
        applySaveData(data);
        save();
        updateSelectedUI();
        renderAchievements();
        renderChallenges();
        showToast('Сейв импортирован.');
      } catch (err) {
        console.warn('import failed', err);
        showToast('Ошибка импорта сейва.');
      }
    });
  }

  if ($wipeSave) {
    $wipeSave.addEventListener('click', () => {
      armAudio();
      soundClick();
      const ok = window.confirm('Удалить сейв? Это полностью сбросит прогресс.');
      if (!ok) return;
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(SAVE_BACKUP_KEY);
      LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
      showToast('Сейв удалён. Перезапуск...');
      window.setTimeout(() => window.location.reload(), 400);
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
  window.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.running) {
        state.running = false;
        autoPaused = true;
      }
    } else if (autoPaused) {
      state.running = true;
      autoPaused = false;
    }
  });
  window.addEventListener('beforeunload', () => save());

  // init
  load();
  ensureRings();
  applyOfflineProgress();
  if (state.dev.enabled) runEconomyChecks();
  renderAchievements();
  renderChallenges();
  updateSelectedUI();
  setPane('main');
  resize();
  requestAnimationFrame(frame);
})();
