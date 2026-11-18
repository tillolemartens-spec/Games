// ==========================================
// NAVIGATION
// ==========================================
const screens = ['menuScreen', 'game1Screen', 'game2Screen', 'game3Screen'];

function showScreen(id) {
  screens.forEach(s => document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function showMenu() {
  mRunning = false;
  clearTimeout(reactTimeout);
  showScreen('menuScreen');
}

document.getElementById('btnLaunchGame1').addEventListener('click', () => {
  showScreen('game1Screen');
  startReactionRound();
});

document.getElementById('btnLaunchGame2').addEventListener('click', () => {
  showScreen('game2Screen');
  initMeteorGame();
});

document.getElementById('btnLaunchGame3').addEventListener('click', () => {
  showScreen('game3Screen');
  generateCaptcha();
});

// ==========================================
// COMMUNITY FEEDBACK SYSTEM
// ==========================================
const FEEDBACK_KEY = 'arcade_feedback_v1';
let feedbacks = JSON.parse(localStorage.getItem(FEEDBACK_KEY)) || [
  { id: 1, text: 'Bitte mehr Spiele hinzufügen!', vote: 'up' }
];

function renderFeedback() {
  const list = document.getElementById('feedbackList');
  list.innerHTML = '';
  feedbacks.forEach(f => {
    const li = document.createElement('li');
    const icon = f.vote === 'up' ? '👍' : '👎';
    li.textContent = `${icon} ${f.text}`;
    list.appendChild(li);
  });
}

document.getElementById('btnSendFeedback').addEventListener('click', () => {
  const input = document.getElementById('feedbackText');
  const vote = document.getElementById('feedbackSentiment').value;
  const val = input.value.trim();
  if (!val) return alert('Bitte gib einen Text ein!');
  feedbacks.unshift({ id: Date.now(), text: val, vote });
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
  input.value = '';
  renderFeedback();
});
renderFeedback();

// ==========================================
// SPIEL 1: BLITZ-REAKTION & RANGLISTE
// ==========================================
const g1Canvas = document.getElementById('game1Canvas');
const g1Ctx = g1Canvas.getContext('2d');
const LB_KEY = 'arcade_react_lb_v1';
let leaderboard = JSON.parse(localStorage.getItem(LB_KEY)) || [];
let reactState = 'idle';
let reactRequiredKey = 'A';
let reactStartTime = 0;
let lastReactionTime = null;
let bestReactionTime = null;
let reactTimeout = null;

function drawG1(text, bg) {
  g1Ctx.fillStyle = bg;
  g1Ctx.fillRect(0, 0, g1Canvas.width, g1Canvas.height);
  g1Ctx.fillStyle = '#ffffff';
  g1Ctx.font = 'bold 20px Outfit, sans-serif';
  g1Ctx.textAlign = 'center';
  g1Ctx.textBaseline = 'middle';
  g1Ctx.fillText(text, g1Canvas.width / 2, g1Canvas.height / 2);
}

function startReactionRound() {
  clearTimeout(reactTimeout);
  reactState = 'waiting';
  drawG1('BEREIT? WARTEN...', '#1e1b4b');
  const delay = 1500 + Math.random() * 2500;
  reactTimeout = setTimeout(() => {
    reactState = 'ready';
    reactRequiredKey = Math.random() > 0.5 ? 'A' : 'B';
    reactStartTime = performance.now();
    if (reactRequiredKey === 'A') {
      drawG1('JETZT KNOPF A (BLAU)!', '#1d4ed8');
    } else {
      drawG1('JETZT KNOPF B (LILA)!', '#581c87');
    }
  }, delay);
}

function handleReactionPress(key) {
  if (reactState === 'waiting') {
    clearTimeout(reactTimeout);
    reactState = 'result';
    drawG1('ZU FRÜH! (Klick für Neustart)', '#450a0a');
  } else if (reactState === 'ready') {
    if (key === reactRequiredKey) {
      const diff = Math.round(performance.now() - reactStartTime);
      lastReactionTime = diff;
      if (!bestReactionTime || diff < bestReactionTime) bestReactionTime = diff;
      document.getElementById('reactLast').textContent = diff;
      document.getElementById('reactBest').textContent = bestReactionTime;
      document.getElementById('btnSaveScore').disabled = false;
      reactState = 'result';
      drawG1(`Treffer! ${diff} ms`, '#065f46');
    } else {
      reactState = 'result';
      drawG1('FALSCHER KNOPF!', '#450a0a');
    }
  } else if (reactState === 'result') {
    startReactionRound();
  }
}

document.getElementById('btnReactA').addEventListener('click', () => handleReactionPress('A'));
document.getElementById('btnReactB').addEventListener('click', () => handleReactionPress('B'));
g1Canvas.addEventListener('click', () => { if (reactState === 'result') startReactionRound(); });

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!leaderboard.length) {
    list.innerHTML = '<li>Noch keine Einträge</li>';
    return;
  }
  list.innerHTML = leaderboard
    .map((entry, i) => `<li>#${i + 1} ${entry.name} – ${entry.time} ms</li>`)
    .join('');
}

document.getElementById('btnSaveScore').addEventListener('click', () => {
  if (!lastReactionTime) return;
  const name = document.getElementById('playerNameInput').value.trim() || 'Anonym';
  leaderboard.push({ name, time: lastReactionTime });
  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem(LB_KEY, JSON.stringify(leaderboard));
  document.getElementById('btnSaveScore').disabled = true;
  renderLeaderboard();
});
renderLeaderboard();

// ==========================================
// SPIEL 2: METEOR-ABWEHR
// ==========================================
const g2Canvas = document.getElementById('game2Canvas');
const g2Ctx = g2Canvas.getContext('2d');
let mRunning = false;
let playerX = 180;
let mScore = 0;
let bullets = [];
let meteors = [];
let weaponType = 'single';

document.querySelectorAll('.weapon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.weapon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    weaponType = btn.getAttribute('data-weapon');
  });
});

function initMeteorGame() {
  playerX = 180;
  mScore = 0;
  bullets = [];
  meteors = [];
  mRunning = true;
  document.getElementById('mScore').textContent = mScore;
  document.getElementById('mStatus').textContent = 'Verteidige die Basis!';
  requestAnimationFrame(meteorLoop);
}

function fireWeapon() {
  if (!mRunning) { initMeteorGame(); return; }
  if (weaponType === 'single') {
    bullets.push({ x: playerX, y: 330, dmg: 1 });
  } else if (weaponType === 'double') {
    bullets.push({ x: playerX - 10, y: 330, dmg: 1 }, { x: playerX + 10, y: 330, dmg: 1 });
  } else {
    bullets.push({ x: playerX, y: 330, dmg: 3, laser: true });
  }
}

document.getElementById('btnLeft').addEventListener('click', () => { playerX = Math.max(20, playerX - 24); });
document.getElementById('btnRight').addEventListener('click', () => { playerX = Math.min(340, playerX + 24); });
document.getElementById('btnFire').addEventListener('click', fireWeapon);

function meteorLoop() {
  if (!mRunning) return;
  g2Ctx.fillStyle = '#05030d';
  g2Ctx.fillRect(0, 0, 360, 360);

  if (Math.random() < 0.03) {
    meteors.push({ x: 20 + Math.random() * 320, y: 0, hp: 2 });
  }

  // Spieler
  g2Ctx.fillStyle = '#06b6d4';
  g2Ctx.fillRect(playerX - 15, 335, 30, 12);

  // Schüsse
  bullets.forEach((b, bi) => {
    b.y -= 6;
    g2Ctx.fillStyle = b.laser ? '#ec4899' : '#facc15';
    g2Ctx.fillRect(b.x - 2, b.y, 4, b.laser ? 16 : 8);
    if (b.y < 0) bullets.splice(bi, 1);
  });

  // Meteore
  meteors.forEach((m, mi) => {
    m.y += 1.8;
    g2Ctx.fillStyle = '#f97316';
    g2Ctx.beginPath();
    g2Ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
    g2Ctx.fill();

    bullets.forEach((b, bi) => {
      if (Math.hypot(b.x - m.x, b.y - m.y) < 16) {
        m.hp -= b.dmg;
        bullets.splice(bi, 1);
        if (m.hp <= 0) {
          meteors.splice(mi, 1);
          mScore += 10;
          document.getElementById('mScore').textContent = mScore;
        }
      }
    });

    if (m.y > 350) {
      mRunning = false;
      document.getElementById('mStatus').textContent = 'GAME OVER! Drücke Feuer für Neustart.';
    }
  });

  if (mRunning) requestAnimationFrame(meteorLoop);
}

// ==========================================
// SPIEL 3: ROBOTER-CHECK (CAPTCHA)
// ==========================================
const symbols = ['🚀', '👾', '⚡', '🛸'];
let targetSymbol = '🚀';
let gridSymbols = [];

function generateCaptcha() {
  targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  document.getElementById('captchaPrompt').textContent = `Wähle alle Kacheln mit: ${targetSymbol}`;
  document.getElementById('captchaStatus').textContent = 'Status: Ausstehend';
  const grid = document.getElementById('captchaGrid');
  grid.innerHTML = '';
  gridSymbols = [];

  for (let i = 0; i < 9; i++) {
    const sym = Math.random() > 0.55 ? targetSymbol : symbols.filter(s => s !== targetSymbol)[i % 3];
    gridSymbols.push(sym);
    const tile = document.createElement('div');
    tile.className = 'captcha-tile';
    tile.textContent = sym;
    tile.addEventListener('click', () => tile.classList.toggle('selected'));
    grid.appendChild(tile);
  }
}

document.getElementById('btnVerifyCaptcha').addEventListener('click', () => {
  const tiles = document.querySelectorAll('.captcha-tile');
  let valid = true;
  tiles.forEach((tile, idx) => {
    const isTarget = gridSymbols[idx] === targetSymbol;
    const isSelected = tile.classList.contains('selected');
    if (isTarget !== isSelected) valid = false;
  });

  const status = document.getElementById('captchaStatus');
  if (valid) {
    status.textContent = 'Mensch erkannt! Nächste Runde...';
    status.style.color = '#10b981';
    setTimeout(generateCaptcha, 1200);
  } else {
    status.textContent = 'Falsch! Bist du ein Bot? Versuch es nochmal.';
    status.style.color = '#ef4444';
  }
});
