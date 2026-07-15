const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pauseMenu = document.getElementById("pauseMenu");

let player, bullets, enemies, powerUps, lives, score, highScore = 0;
let gameInterval, difficulty = "easy", doubleFire = false, shield = false;
let paused = false;

function startGame() {
  document.getElementById("menu").classList.remove("active");
  canvas.style.display = "block";
  resetGame();
  gameInterval = setInterval(updateGame, 50);
}

function resetGame() {
  player = { x: 110, y: 280, width: 20, height: 20 };
  bullets = [];
  enemies = [];
  powerUps = [];
  lives = 3;
  score = 0;
  doubleFire = false;
  shield = false;
  paused = false;
  pauseMenu.style.display = "none";
}

function updateGame() {
  if (paused) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player
  ctx.fillStyle = shield ? "lime" : "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 5;
    ctx.fillRect(b.x, b.y, 4, 10);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Enemies
  if (Math.random() < 0.05) {
    enemies.push({ x: Math.random() * 220, y: 0, width: 20, height: 20 });
  }
  ctx.fillStyle = "red";
  enemies.forEach((e, i) => {
    e.y += (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3);
    ctx.fillRect(e.x, e.y, e.width, e.height);

    // Collision with bullets
    bullets.forEach((b, j) => {
      if (b.x < e.x + e.width && b.x + 4 > e.x &&
          b.y < e.y + e.height && b.y + 10 > e.y) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
      }
    });

    // Collision with player
    if (e.x < player.x + player.width && e.x + e.width > player.x &&
        e.y < player.y + player.height && e.y + e.height > player.y) {
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
    powerUps.push({ x: Math.random() * 220, y: 0, width: 15, height: 15, type });
  }
  ctx.fillStyle = "green";
  powerUps.forEach((p, i) => {
    p.y += 2;
    ctx.fillRect(p.x, p.y, p.width, p.height);

    if (p.x < player.x + player.width && p.x + p.width > player.x &&
        p.y < player.y + player.height && p.y + p.height > player.y) {
      if (p.type === "shield") shield = true;
      if (p.type === "double") doubleFire = true;
      powerUps.splice(i, 1);
    }
    if (p.y > 320) powerUps.splice(i, 1);
  });

  // HUD
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 10, 10);
  ctx.fillText("Lives: " + lives, 180, 10);
  ctx.fillText("High: " + highScore, 100, 10);
}

function endGame() {
  clearInterval(gameInterval);
  if (score > highScore) highScore = score;
  alert("Game Over! Score: " + score);
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
    case "8": player.y = Math.min(300, player.y + 10); break;
    case "4": player.x = Math.max(0, player.x - 10); break;
    case "6": player.x = Math.min(220, player.x + 10); break;
    case "5":
      bullets.push({ x: player.x + 8, y: player.y });
      if (doubleFire) bullets.push({ x: player.x - 8, y: player.y });
      break;
    case "0":
      paused = true;
      pauseMenu.style.display = "block";
      break;
  }
});
