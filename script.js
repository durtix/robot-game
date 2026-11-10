const game = document.getElementById('game');
const robot = document.getElementById('robot');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const gameoverEl = document.getElementById('gameover');
const finalScoreEl = document.getElementById('finalScore');

let x = 280;
let y = 340;
const speed = 15;
const robotSize = 40;
let score = 0;
let lives = 3;
let running = true;

// --- Funções de movimento e disparo ---
function moveRobot(dx, dy) {
  if (!running) return;
  x = Math.max(0, Math.min(game.clientWidth  - robotSize, x + dx));
  y = Math.max(0, Math.min(game.clientHeight - robotSize, y + dy));
  robot.style.left = x + 'px';
  robot.style.top  = y + 'px';
}

function shootBubble() {
  if (!running) return;
  const bolha = document.createElement('div');
  bolha.className = 'bolha';
  bolha.textContent = '🫧';
  const bx = x + 5;
  let by = y - 10;
  bolha.style.left = bx + 'px';
  bolha.style.top  = by + 'px';
  game.appendChild(bolha);

  const obj = { el: bolha, x: bx, y: by, alive: true };
  bolhas.push(obj);
}

// --- Teclado (PC) ---
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp')    moveRobot(0, -speed);
  if (e.key === 'ArrowDown')  moveRobot(0, speed);
  if (e.key === 'ArrowLeft')  moveRobot(-speed, 0);
  if (e.key === 'ArrowRight') moveRobot(speed, 0);
  if (e.code === 'Space') { e.preventDefault(); shootBubble(); }
});

// --- Botões (Telemóvel) ---
document.getElementById('btn-up').addEventListener('click', () => moveRobot(0, -speed));
document.getElementById('btn-down').addEventListener('click', () => moveRobot(0, speed));
document.getElementById('btn-left').addEventListener('click', () => moveRobot(-speed, 0));
document.getElementById('btn-right').addEventListener('click', () => moveRobot(speed, 0));
document.getElementById('btn-shoot').addEventListener('click', shootBubble);

// Evita que o telemóvel faça zoom ou scroll ao premir os botões
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); btn.click(); }, {passive: false});
});

// --- Lógica das Bolhas ---
const bolhas = [];
setInterval(() => {
  if (!running) return;
  for (let i = bolhas.length - 1; i >= 0; i--) {
    const b = bolhas[i];
    if (!b.alive) continue;
    b.y -= 8;
    b.el.style.top = b.y + 'px';
    if (b.y < -30) { b.el.remove(); bolhas.splice(i, 1); }
  }
}, 30);

// --- Lógica das Bolachas e Bombas ---
const items = [];
function spawnItem(tipo) {
  const el = document.createElement('div');
  el.className = tipo;
  el.textContent = tipo === 'bolacha' ? '🍪' : '💣';
  const startX = Math.random() * (game.clientWidth - 30);
  el.style.left = startX + 'px';
  el.style.top = '-30px';
  game.appendChild(el);
  items.push({ el, x: startX, y: -30, tipo });
}

setInterval(() => {
  if (!running) return;
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.y += 3;
    it.el.style.top = it.y + 'px';

    // Colisão com o robot
    const colideRobot = it.x < x + robotSize && it.x + 30 > x && it.y < y + robotSize && it.y + 30 > y;
    if (colideRobot) {
      if (it.tipo === 'bolacha') {
        score++; scoreEl.textContent = 'Pontos: ' + score;
      } else {
        lives--; atualizaVidas();
        if (lives <= 0) gameOver();
      }
      it.el.remove(); items.splice(i, 1); continue;
    }

    // Colisão com as bolhas
    if (it.tipo === 'bomba') {
      for (let j = bolhas.length - 1; j >= 0; j--) {
        const b = bolhas[j];
        if (!b.alive) continue;
        if (it.x < b.x + 30 && it.x + 30 > b.x && it.y < b.y + 30 && it.y + 30 > b.y) {
          it.el.classList.add('explode');
          const elRef = it.el; setTimeout(() => elRef.remove(), 300);
          items.splice(i, 1); b.el.remove(); bolhas.splice(j, 1);
          score += 2; scoreEl.textContent = 'Pontos: ' + score;
          break;
        }
      }
      continue;
    }
    if (it.y > game.clientHeight) { it.el.remove(); items.splice(i, 1); }
  }
}, 30);

// Gerar objetos
setInterval(() => { if (running) spawnItem('bolacha'); }, 1200);
setInterval(() => { if (running) spawnItem('bomba'); }, 1800);

// Vidas e Game Over
function atualizaVidas() { livesEl.textContent = 'Vidas: ' + '❤️'.repeat(lives); }
function gameOver() { running = false; finalScoreEl.textContent = score; gameoverEl.classList.remove('hidden'); }