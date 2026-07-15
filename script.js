const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pauseMenu = document.getElementById("pauseMenu");

// Strict 240x320 screen
canvas.width = 240;
canvas.height = 320;

let player, bullets, enemies, powerUps, lives, score;
let highScore = 0;
let gameInterval, difficulty = "easy", doubleFire = false, shield = false;
let paused = false;

function startGame() {
  difficulty = document.getElementById("difficulty").value;
  document.getElementById("menu").classList.remove("active");
  canvas.style.display = "block";
  resetGame();
  gameInterval = setInterval(updateGame, 50);
}

function resetGame() {
  player = { x: 100, y: 260, width: 40, height: 40 }; // bigger ship
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

  // Background starfield
  ctx.fillStyle = "white";
  for (let i = 0; i < 20; i++) {
    ctx.fillRect(Math.random() * 240, Math.random() * 320, 1, 1);
  }

  // Player spaceship (modern triangle)
  ctx.fillStyle = shield ? "lime" : "cyan";
  ctx.beginPath();
  ctx.moveTo(player.x + player.width / 2, player.y); // tip
  ctx.lineTo(player.x, player.y + player.height);    // left
  ctx.lineTo(player.x + player.width, player.y + player.height); // right
  ctx.closePath();
  ctx.fill();

  // Bullets
  ctx.fillStyle = "yellow";
  bullets.forEach((b, i) => {
    b.y -= 6;
    ctx.fillRect(b.x, b.y, 4, 12);
    if (b.y < 0) bullets.splice(i, 1);
  });

  // Enemies (larger asteroids)
  if (Math.random() < 0.05) {
    enemies.push({ x: Math.random() * 200, y: 0, size: 20 });
  }
  ctx.fillStyle = "red";
  enemies.forEach((e, i) => {
    e.y += (difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3);
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
    ctx.fill();

    // Collision with bullets
    bullets.forEach((b, j) => {
      if (b.x < e.x + e.size && b.x > e.x - e.size &&
          b.y < e.y + e.size && b.y > e.y - e.size) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score += 10;
      }
    });

    // Collision with player
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
  ctx.font = "12px Arial";
  ctx.fillText("Score: " + score, 10, 15);
  ctx.fillText("Lives: " + lives, 180, 15);
  ctx.fillText("High: " + highScore, 100, 15);
}

function endGame() {
  clearInterval(gameInterval);
  if (score > highScore) {
    highScore = score;
    document.getElementById("highscoreValue").innerText = highScore;
  }
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
    case "8": player.y = Math.min(280, player.y + 10); break;
    case "4": player.x = Math.max(0, player.x - 10); break;
    case "6": player.x = Math.min(200, player.x + 10); break;
    case "5":
      bullets.push({ x: player.x + player.width / 2 - 2, y: player.y });
      if (doubleFire) {
        bullets.push({ x: player.x + 5, y: player.y });
        bullets.push({ x: player.x + player.width - 5, y: player.y });
      }
      break;
    case "0":
      paused = true;
      pauseMenu.style.display = "block";
      break;
  }
});
