const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pauseMenu = document.getElementById("pauseMenu");

canvas.width = 240;
canvas.height = 320;
document.body.style.width = "240px";
document.body.style.height = "320px";
document.body.style.overflow = "hidden";

let player, bullets, enemies, powerUps, lives, score, level;
let highScore = 0;
let gameInterval, doubleFire = false, shield = false;
let paused = false;
let shootTimer = 0;
let enemiesDestroyed = 0;
let boss = null;

function startGame() {
  document.getElementById("menu").classList.remove("active");
  canvas.style.display = "block";
  resetGame();
  gameInterval = setInterval(updateGame, 50);
}

function resetGame() {
  player = { x: 100, y: 260, width: 40, height: 40 };
  bullets = [];
  enemies = [];
  powerUps = [];
  lives = 3;
  score = 0;
  level = 1;
  doubleFire = false;
  shield = false;
  paused = false;
  shootTimer = 0;
  enemiesDestroyed = 0;
  boss = null;
  pauseMenu.style.display = "none";
}

function updateGame() {
  if (paused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background stars
  ctx.fillStyle = "white";
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(Math.random() * 240, Math.random() * 320, 2, 2);
  }

  // Auto-shoot
  shootTimer++;
  if (shootTimer > 10) {
    bullets.push({ x: player.x + player.width / 2 - 2, y: player.y });
    if (doubleFire) {
      bullets.push({ x: player.x + 5, y: player.y });
      bullets.push({ x: player.x + player.width - 5, y: player.y });
    }
    shootTimer = 0;
  }

  // Player ship
  ctx.fillStyle = shield ? "lime" : "cyan";
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y);
  ctx.lineTo(player.x, player.y + player.height);
  ctx.lineTo(player.x + player.width, player.y + player.height);
  ctx.closePath();
  ctx.fill();

  // Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 6;
    ctx.fillRect(b.x, b.y, 5, 15);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Boss logic
  if (level % 5 === 0 && !boss) {
    boss = { x: 60, y: 20, width: 120, height: 40, hp: 50 + level * 5 };
  }
  if (boss) {
    ctx.fillStyle = "purple";
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);

    // Boss movement (slow horizontal)
    boss.x += Math.sin(Date.now() / 500) * 2;

    // Bullet collision with boss
    bullets.forEach((b, j) => {
      if (b.x > boss.x && b.x < boss.x + boss.width &&
          b.y > boss.y && b.y < boss.y + boss.height) {
        bullets.splice(j, 1);
        boss.hp--;
        if (boss.hp <= 0) {
          score += 200;
          boss = null;
          level++;
        }
      }
    });

    // Collision with player
    if (boss.x < player.x + player.width && boss.x + boss.width > player.x &&
        boss.y < player.y + player.height && boss.y + boss.height > player.y) {
      if (shield) {
        shield = false;
      } else {
        lives--;
        if (lives <= 0) endGame();
      }
    }
  }

  // Regular enemies (only if not boss level)
  if (!boss && Math.random() < 0.03 + level * 0.002) {
    enemies.push({ x: Math.random() * 200, y: 0, size: 15 + level });
  }
  ctx.fillStyle = "red";
  enemies.forEach((e, i) => {
    e.y += 1 + level * 0.2;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();

    // Bullet collision
    bullets.forEach((b, j) => {
      if (b.x < e.x + e.size && b.x > e.x - e.size &&
          b.y < e.y + e.size && b.y > e.y - e.size) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
        enemiesDestroyed++;
        if (enemiesDestroyed >= 15 && level < 20) {
          level++;
          enemiesDestroyed = 0;
        }
      }
    });

    // Player collision
    if (e.x < player.x + player.width && e.x > player.x &&
        e.y + e.size > player.y && e.y < player.y + player.height) {
      enemies.splice(i, 1);
      if (shield) {
        shield = false;
      } else {
        lives--;
        if (lives <= 0) endGame();
      }
    }

    if (e.y > 320) enemies.splice(i, 1);
  });

  // PowerUps
  if (Math.random() < 0.01) {
    let type = Math.random() < 0.5 ? "shield" : "double";
    powerUps.push({ x: Math.random() * 200, y: 0, size: 12, type });
  }
  ctx.fillStyle = "green";
  powerUps.forEach((p, i) => {
    p.y += 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    if (p.x < player.x + player.width && p.x > player.x &&
        p.y > player.y && p.y < player.y + player.height) {
      if (p.type === "shield") shield = true;
      if (p.type === "double") doubleFire = true;
      powerUps.splice(i, 1);
    }
    if (p.y > 320) powerUps.splice(i, 1);
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.font = "bold 14px Arial";
  ctx.fillText("Score: " + score, 10, 20);
  ctx.fillText("Lives: " + lives, 170, 20);
  ctx.fillText("High: " + highScore, 90, 20);
  ctx.fillText("Level: " + level, 10, 40);
  if (boss) ctx.fillText("Boss HP: " + boss.hp, 120, 40);
}

function endGame() {
  clearInterval(gameInterval);
  if (score > highScore) {
    highScore = score;
    document.getElementById("highscoreValue").innerText = highScore;
  }
  alert("Game Over! Score: " + score + " | Level: " + level);
  backToMenu();
}

function openPage(id) {
  document.getElementById("menu").classList.remove("active");
  document.getElementById(id).classList.add("active");
}

function backToMenu() {
  canvas.style.display = "none";
  pauseMenu.style.display = "none";
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("menu").classList.add("active");
}

function resumeGame() {
  paused = false;
  pauseMenu.style.display = "none";
}

function quitGame() {
  clearInterval(gameInterval);
  backToMenu();
}

// Controls with T9 keypad
document.addEventListener("keydown", e => {
  switch (e.key) {
    case "2": player.y = Math.max(0, player.y - 10); break;
    case "8": player.y = Math.min(280, player.y + 10); break;
    case "4": player.x = Math.max(0, player.x - 10); break;
    case "6": player.x = Math.min(200, player.x + 10); break;
    case "0":
      paused = true;
      pauseMenu.style.display = "block";
      break;
  }
});
