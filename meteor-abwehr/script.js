const g2Canvas = document.getElementById('g2Canvas');
const g2Ctx = g2Canvas.getContext('2d');

let shipX = 180;
let bullets = [];
let meteors = [];
let score = 0;
let ammo = 6;
let weapon = 'single';
let gameRunning = false;
let lastReload = Date.now();

document.querySelectorAll('.weapon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.weapon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    weapon = btn.getAttribute('data-weapon');
  });
});

function startGame() {
  shipX = 180;
  bullets = [];
  meteors = [];
  score = 0;
  ammo = 6;
  gameRunning = true;
  document.getElementById('mScore').textContent = score;
  document.getElementById('mStatus').textContent = 'Verteidige deine Basis!';
  requestAnimationFrame(gameLoop);
}

function fire() {
  if (!gameRunning) {
    startGame();
    return;
  }
  if (weapon === 'single' && ammo >= 1) {
    ammo -= 1;
    bullets.push({ x: shipX, y: 330, dmg: 1 });
  } else if (weapon === 'double' && ammo >= 2) {
    ammo -= 2;
    bullets.push({ x: shipX - 10, y: 330, dmg: 2 });
    bullets.push({ x: shipX + 10, y: 330, dmg: 2 });
  }
}

function gameLoop() {
  if (!gameRunning) return;

  // Munition aufladen
  if (Date.now() - lastReload > 700 && ammo < 6) {
    ammo++;
    lastReload = Date.now();
  }
  document.getElementById('mAmmo').textContent = `${ammo} / 6`;

  // Hintergrund
  g2Ctx.fillStyle = '#05030d';
  g2Ctx.fillRect(0, 0, 360, 360);

  // Meteore spawnen
  if (Math.random() < 0.03) {
    meteors.push({
      x: 20 + Math.random() * 320,
      y: -15,
      hp: Math.random() > 0.7 ? 2 : 1
    });
  }

  // Raumschiff zeichnen
  g2Ctx.fillStyle = '#06b6d4';
  g2Ctx.fillRect(shipX - 15, 330, 30, 14);

  // Schüsse bewegen & zeichnen
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.y -= 6;
    g2Ctx.fillStyle = b.dmg === 2 ? '#ec4899' : '#facc15';
    g2Ctx.fillRect(b.x - 2, b.y, 4, 12);
    if (b.y < 0) bullets.splice(i, 1);
  }

  // Meteore bewegen & Kollision prüfen
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.y += 1.8;

    g2Ctx.fillStyle = m.hp > 1 ? '#be123c' : '#f97316';
    g2Ctx.beginPath();
    g2Ctx.arc(m.x, m.y, 14, 0, Math.PI * 2);
    g2Ctx.fill();

    // Treffer durch Laser
    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (Math.hypot(m.x - b.x, m.y - b.y) < 16) {
        m.hp -= b.dmg;
        bullets.splice(j, 1);
        if (m.hp <= 0) {
          meteors.splice(i, 1);
          score += 10;
          document.getElementById('mScore').textContent = score;
        }
        break;
      }
    }

    // Basis getroffen -> Game Over
    if (m.y > 350) {
      gameRunning = false;
      document.getElementById('mStatus').textContent = `GAME OVER! Endstand: ${score} Punkte`;
    }
  }

  if (gameRunning) requestAnimationFrame(gameLoop);
}

document.getElementById('btnLeft').addEventListener('click', () => {
  shipX = Math.max(20, shipX - 24);
});
document.getElementById('btnRight').addEventListener('click', () => {
  shipX = Math.min(340, shipX + 24);
});
document.getElementById('btnFire').addEventListener('click', fire);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') shipX = Math.max(20, shipX - 24);
  if (e.key === 'ArrowRight') shipX = Math.min(340, shipX + 24);
  if (e.code === 'Space') {
    e.preventDefault();
    fire();
  }
});
