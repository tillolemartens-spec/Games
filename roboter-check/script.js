const symbols = ['🚀', '👾', '💎', '⚡', '🛸', '🕹️'];
let targetSymbol = '';
let tilesData = [];

function initCaptcha() {
  const grid = document.getElementById('captchaGrid');
  const result = document.getElementById('captchaResult');
  grid.innerHTML = '';
  result.textContent = 'Status: Ausstehend...';
  result.style.color = '#f8fafc';

  targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  document.getElementById('captchaPrompt').textContent =
    `Wähle alle Kacheln mit dem passenden Symbol: ${targetSymbol}`;

  const decoys = symbols.filter(s => s !== targetSymbol);
  tilesData = [];

  // 3 Treffer + 6 Ablenkungen mischen
  for (let i = 0; i < 9; i++) {
    const sym = i < 3 ? targetSymbol : decoys[i % decoys.length];
    tilesData.push({ sym, selected: false });
  }
  tilesData.sort(() => Math.random() - 0.5);

  tilesData.forEach((tile, idx) => {
    const div = document.createElement('div');
    div.className = 'captcha-tile';
    div.textContent = tile.sym;
    div.addEventListener('click', () => {
      tile.selected = !tile.selected;
      div.classList.toggle('selected');
    });
    grid.appendChild(div);
  });
}

document.getElementById('btnVerifyCaptcha').addEventListener('click', () => {
  const result = document.getElementById('captchaResult');
  const isValid = tilesData.every(t =>
    (t.sym === targetSymbol && t.selected) || (t.sym !== targetSymbol && !t.selected)
  );

  if (isValid) {
    result.textContent = 'Status: Mensch erkannt! Zugriff gewährt.';
    result.style.color = '#10b981';
  } else {
    result.textContent = 'Status: Falsch! Bist du ein Bot? Versuch es nochmal.';
    result.style.color = '#ef4444';
  }
});

document.getElementById('btnNewCaptcha').addEventListener('click', initCaptcha);

initCaptcha();
