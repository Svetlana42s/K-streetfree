/* ============================================
   ИГРА "ПОЙМАЙ КИМЧИ"
   ============================================ */

function initCatchGame(config) {
  const canvas = document.getElementById(config.canvasId);
  const field = document.getElementById(config.fieldId);
  if (!canvas || !field) return;

  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById(config.scoreId);
  const timeEl = document.getElementById(config.timeId);
  const livesEl = document.getElementById(config.livesId);
  const overlayStart = document.getElementById(config.overlayStart);
  const overlayWin = document.getElementById(config.overlayWin);
  const overlayLose = document.getElementById(config.overlayLose);
  const winScoreEl = document.getElementById(config.winScoreId);
  const loseScoreEl = document.getElementById(config.loseScoreId);

  const state = {
    running: false,
    score: 0,
    timeLeft: config.duration,
    lives: 3,
    items: [],
    particles: [],
    basket: { x: 0, y: 0, width: 110, height: 70 },
    lastSpawn: 0,
    spawnInterval: 750,
    rafId: null,
    timerId: null,
    lastTime: 0
  };

  const itemTypes = [
    { emoji: '🥬', points: 1,  type: 'good', weight: 3 },
    { emoji: '🍜', points: 1,  type: 'good', weight: 2 },
    { emoji: '🍙', points: 1,  type: 'good', weight: 2 },
    { emoji: '🥟', points: 1,  type: 'good', weight: 2 },
    { emoji: '🍢', points: 1,  type: 'good', weight: 2 },
    { emoji: '🧋', points: 1,  type: 'good', weight: 2 },
    { emoji: '💣', points: -1, type: 'bomb', weight: 1 }
  ];

  function resizeCanvas() {
    const rect = field.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.basket.width = Math.min(110, rect.width * 0.25);
    state.basket.height = state.basket.width * 0.6;
    state.basket.x = rect.width / 2 - state.basket.width / 2;
    state.basket.y = rect.height - state.basket.height - 10;
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function weightedRandom() {
    const total = itemTypes.reduce(function (s, t) { return s + t.weight; }, 0);
    let r = Math.random() * total;
    for (let i = 0; i < itemTypes.length; i++) {
      if (r < itemTypes[i].weight) return itemTypes[i];
      r -= itemTypes[i].weight;
    }
    return itemTypes[0];
  }

  function spawnItem() {
    const rect = field.getBoundingClientRect();
    const t = weightedRandom();
    const size = 38 + Math.random() * 14;
    state.items.push({
      x: Math.random() * (rect.width - size),
      y: -size,
      size: size,
      speed: 130 + Math.random() * 100 + (config.duration - state.timeLeft) * 4,
      emoji: t.emoji,
      type: t.type,
      points: t.points,
      rotationSpeed: (Math.random() - 0.5) * 2,
      rotationCurrent: 0
    });
  }

  function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 180;
      state.particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1,
        size: 3 + Math.random() * 4,
        color: color
      });
    }
  }

  function checkCatch(item) {
    const b = state.basket;
    return (
      item.y + item.size > b.y &&
      item.y < b.y + b.height &&
      item.x + item.size > b.x &&
      item.x < b.x + b.width
    );
  }

  function onItemCaught(item) {
    if (item.type === 'bomb') {
      state.lives -= 1;
      updateLivesUI();
      createParticles(item.x + item.size / 2, item.y + item.size / 2, '#ff2e2e', 20);
      if (state.lives <= 0) endGame(false);
    } else {
      state.score += item.points;
      scoreEl.textContent = state.score;
      createParticles(item.x + item.size / 2, item.y + item.size / 2, '#ff2ea6', 12);
      if (state.score >= config.targetScore) endGame(true);
    }
  }

  function updateLivesUI() {
    const lives = livesEl.querySelectorAll('.hud-life');
    lives.forEach(function (el, i) {
      el.classList.toggle('lost', i >= state.lives);
    });
  }

  function drawBackground() {
    const rect = field.getBoundingClientRect();
    ctx.fillStyle = '#05060e';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = 'rgba(255, 46, 166, 0.08)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < rect.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
  }

  function drawBasket() {
    const b = state.basket;
    ctx.shadowColor = '#ff2ea6';
    ctx.shadowBlur = 25;
    ctx.fillStyle = '#ff2ea6';

    const r = 14;
    const x = b.x, y = b.y, w = b.width, h = b.height;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(b.x + 6, b.y + 6, b.width - 12, b.height - 12);

    ctx.font = Math.floor(b.height * 0.7) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🥢', b.x + b.width / 2, b.y + b.height / 2);
  }

  function drawItems() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    state.items.forEach(function (item) {
      ctx.save();
      ctx.translate(item.x + item.size / 2, item.y + item.size / 2);
      ctx.rotate(item.rotationCurrent);
      if (item.type === 'good') {
        ctx.shadowColor = '#ffd400';
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowColor = '#ff2e2e';
        ctx.shadowBlur = 20;
      }
      ctx.font = item.size + 'px sans-serif';
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();
    });
    ctx.shadowBlur = 0;
  }

  function drawParticles() {
    state.particles.forEach(function (p) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function loop(timestamp) {
    if (!state.running) return;
    const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
    state.lastTime = timestamp;

    if (timestamp - state.lastSpawn > state.spawnInterval) {
      spawnItem();
      state.lastSpawn = timestamp;
    }

    const rect = field.getBoundingClientRect();
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      item.y += item.speed * dt;
      item.rotationCurrent += item.rotationSpeed * dt;

      if (checkCatch(item)) {
        onItemCaught(item);
        state.items.splice(i, 1);
        continue;
      }

      if (item.y > rect.height) {
        if (item.type === 'good') {
          createParticles(item.x + item.size / 2, rect.height - 20, '#666', 6);
        }
        state.items.splice(i, 1);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 250 * dt;
      p.life -= dt;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    drawBackground();
    drawItems();
    drawBasket();
    drawParticles();

    state.rafId = requestAnimationFrame(loop);
  }

  function moveBasketTo(clientX) {
    const rect = field.getBoundingClientRect();
    let x = clientX - rect.left - state.basket.width / 2;
    x = Math.max(0, Math.min(x, rect.width - state.basket.width));
    state.basket.x = x;
  }

  field.addEventListener('mousemove', function (e) {
    if (!state.running) return;
    moveBasketTo(e.clientX);
  });

  field.addEventListener('touchmove', function (e) {
    if (!state.running) return;
    e.preventDefault();
    moveBasketTo(e.touches[0].clientX);
  }, { passive: false });

  field.addEventListener('touchstart', function (e) {
    if (!state.running) return;
    moveBasketTo(e.touches[0].clientX);
  });

  function reset() {
    state.score = 0;
    state.timeLeft = config.duration;
    state.lives = 3;
    state.items = [];
    state.particles = [];
    scoreEl.textContent = '0';
    timeEl.textContent = String(config.duration);
    updateLivesUI();
    resizeCanvas();
  }

  function startGame() {
    reset();
    overlayStart.classList.add('hidden');
    overlayWin.classList.add('hidden');
    overlayLose.classList.add('hidden');
    state.running = true;
    state.lastTime = performance.now();
    state.lastSpawn = performance.now();

    state.timerId = setInterval(function () {
      state.timeLeft -= 1;
      timeEl.textContent = state.timeLeft;
      if (state.timeLeft <= 0) endGame(state.score >= config.targetScore);
    }, 1000);

    state.rafId = requestAnimationFrame(loop);
  }

  function endGame(won) {
    if (!state.running) return;
    state.running = false;
    clearInterval(state.timerId);
    cancelAnimationFrame(state.rafId);

    if (won) {
      winScoreEl.textContent = state.score;
      overlayWin.classList.remove('hidden');
    } else {
      loseScoreEl.textContent = state.score;
      overlayLose.classList.remove('hidden');
    }
  }

  document.getElementById(config.startBtnId).addEventListener('click', startGame);
  document.getElementById(config.playAgainWinId).addEventListener('click', startGame);
  document.getElementById(config.playAgainLoseId).addEventListener('click', startGame);
}