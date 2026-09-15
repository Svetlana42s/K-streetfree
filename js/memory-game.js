/* ============================================
   ИГРА "МЕМОРИ"
   ============================================ */

function initMemoryGame(config) {
  const grid = document.getElementById(config.gridId);
  const movesEl = document.getElementById(config.movesId);
  const pairsEl = document.getElementById(config.pairsId);
  const timeEl = document.getElementById(config.timeId);
  const overlayStart = document.getElementById(config.overlayStart);
  const overlayWin = document.getElementById(config.overlayWin);
  const overlayLose = document.getElementById(config.overlayLose);
  const winMovesEl = document.getElementById(config.winMovesId);
  const winTimeEl = document.getElementById(config.winTimeId);
  const loseMovesEl = document.getElementById(config.loseMovesId);

  if (!grid) return;

  const SYMBOLS = ['한', '김', '라', '떡', '비', '만', '치', '소'];

  const state = {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    timeLeft: config.duration,
    locked: false,
    timerId: null,
    running: false
  };

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function buildDeck() {
    const deck = [];
    SYMBOLS.forEach(function (sym) {
      deck.push({ symbol: sym, id: sym + '-a' });
      deck.push({ symbol: sym, id: sym + '-b' });
    });
    return shuffle(deck);
  }

  function render() {
    grid.innerHTML = '';
    state.cards.forEach(function (card, index) {
      const el = document.createElement('button');
      el.className = 'memory-card';
      el.setAttribute('data-index', index);
      el.type = 'button';
      el.innerHTML =
        '<span class="memory-card-inner">' +
        '  <span class="memory-card-front">?</span>' +
        '  <span class="memory-card-back">' + card.symbol + '</span>' +
        '</span>';
      el.addEventListener('click', function () { flipCard(index); });
      grid.appendChild(el);
    });
  }

  function flipCard(index) {
    if (state.locked || !state.running) return;
    const card = state.cards[index];
    const el = grid.querySelector('[data-index="' + index + '"]');

    if (card.matched || el.classList.contains('flipped')) return;

    el.classList.add('flipped');
    state.flipped.push(index);

    if (state.flipped.length === 2) {
      state.moves += 1;
      movesEl.textContent = state.moves;
      state.locked = true;

      const a = state.flipped[0];
      const b = state.flipped[1];

      if (state.cards[a].symbol === state.cards[b].symbol) {
        setTimeout(function () {
          const elA = grid.querySelector('[data-index="' + a + '"]');
          const elB = grid.querySelector('[data-index="' + b + '"]');
          if (elA) elA.classList.add('matched');
          if (elB) elB.classList.add('matched');
          state.cards[a].matched = true;
          state.cards[b].matched = true;
          state.matched += 1;
          pairsEl.textContent = state.matched + ' / ' + SYMBOLS.length;
          state.flipped = [];
          state.locked = false;

          if (state.matched === SYMBOLS.length) endGame(true);
        }, 450);
      } else {
        setTimeout(function () {
          const elA = grid.querySelector('[data-index="' + a + '"]');
          const elB = grid.querySelector('[data-index="' + b + '"]');
          if (elA) elA.classList.remove('flipped');
          if (elB) elB.classList.remove('flipped');
          state.flipped = [];
          state.locked = false;
        }, 800);
      }
    }
  }

  function reset() {
    state.cards = buildDeck();
    state.flipped = [];
    state.matched = 0;
    state.moves = 0;
    state.timeLeft = config.duration;
    state.locked = false;
    movesEl.textContent = '0';
    pairsEl.textContent = '0 / ' + SYMBOLS.length;
    timeEl.textContent = state.timeLeft;
    render();
  }

  function startGame() {
    reset();
    overlayStart.classList.add('hidden');
    overlayWin.classList.add('hidden');
    overlayLose.classList.add('hidden');
    state.running = true;

    state.timerId = setInterval(function () {
      state.timeLeft -= 1;
      timeEl.textContent = state.timeLeft;
      if (state.timeLeft <= 0) endGame(false);
    }, 1000);
  }

  function endGame(won) {
    if (!state.running) return;
    state.running = false;
    clearInterval(state.timerId);

    if (won) {
      winMovesEl.textContent = state.moves;
      winTimeEl.textContent = (config.duration - state.timeLeft) + ' сек';
      overlayWin.classList.remove('hidden');
    } else {
      loseMovesEl.textContent = state.moves;
      overlayLose.classList.remove('hidden');
    }
  }

  document.getElementById(config.startBtnId).addEventListener('click', startGame);
  document.getElementById(config.playAgainWinId).addEventListener('click', startGame);
  document.getElementById(config.playAgainLoseId).addEventListener('click', startGame);
}