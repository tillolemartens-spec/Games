const g1Canvas = document.getElementById('g1Canvas');
const g1Ctx = g1Canvas.getContext('2d');
const LB_KEY = 'arcade_blitz_lb_v1';

let state = 'idle'; // idle, waiting, ready, result
let requiredKey = null;
let startTime = 0;
let lastReactionTime = null;
let bestTime = null;
let waitTimeout = null;

let leaderboard = JSON.parse(localStorage.getItem(LB_KEY)) || [];

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
  clearTimeout(waitTimeout);
  state = 'waiting';
  document.getElementById('btnSaveScore').disabled = true;
  drawG1('BEREIT? WARTEN...', '#1e1b4b');

  const delay = 1500 + Math.random() * 2500;
  waitTimeout = setTimeout(() => {
    state = 'ready';
    startTime = performance.now();
    if (Math.random() > 0.5) {
      requiredKey = 'A';
      drawG1('JETZT KNOPF A (BLAU)!', '#1d4ed8');
    } else {
      requiredKey = 'B';
      drawG1('JETZT KNOPF B (LILA)!', '#581c87');
    }
  }, delay);
}

function handlePress(key) {
  if (state === 'idle' || state === 'result') return;

  if (state === 'waiting') {
    clearTimeout(waitTimeout);
    state = 'result';
    drawG1('ZU FRÜH! (Fehlstart)', '#450a0a');
    return;
  }

  if (state === 'ready') {
    state = 'result';
    if (key === requiredKey) {
      const diff = Math.round(performance.now() - startTime);
      lastReactionTime = diff;
      document.getElementById('reactLast').textContent = diff;
      if (!bestTime || diff < bestTime) {
        bestTime = diff;
        document.getElementById('reactBest').textContent = diff;
      }
      document.getElementById('btnSaveScore').disabled = false;
      drawG1(`Treffer! ${diff} ms`, '#065f46');
    } else {
      drawG1('FALSCHER KNOPF!', '#450a0a');
    }
  }
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (leaderboard.length === 0) {
    list.innerHTML = '<li>Noch keine Einträge</li>';
    return;
  }
  list.innerHTML = leaderboard
    .map((entry, i) => `<li>#${i + 1} ${entry.name} – ${entry.time} ms</li>`)
    .join('');
}

document.getElementById('btnSaveScore').addEventListener('click', () => {
  if (!lastReactionTime) return;
  const nameInput = document.getElementById('playerNameInput');
  const name = nameInput.value.trim() || 'Anonym';
  leaderboard.push({ name, time: lastReactionTime });
  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem(LB_KEY, JSON.stringify(leaderboard));
  document.getElementById('btnSaveScore').disabled = true;
  renderLeaderboard();
});

document.getElementById('btnStartG1').addEventListener('click', startReactionRound);
document.getElementById('btnReactA').addEventListener('click', () => handlePress('A'));
document.getElementById('btnReactB').addEventListener('click', () => handlePress('B'));

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'a') handlePress('A');
  if (e.key.toLowerCase() === 'b') handlePress('B');
});

drawG1('Klicke auf "Runde starten"', '#171033');
renderLeaderboard();
