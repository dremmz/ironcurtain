const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameSpeed = 4;
let gravity = 0.5;
let score = 0;
let gameStarted = false;

const playerImg = new Image();
const frameImg = new Image();
const carpetImg = new Image();
const groundImg = new Image();

playerImg.src = "character_sprite.png";
frameImg.src = "frame.png";
carpetImg.src = "carpet.png";
groundImg.src = "ground.png";

const bgSky = "#88ccf2";
let groundOffset = 0;

const player = {
  x: 50,
  y: 300,
  width: 40,
  height: 40,
  vy: 0,
  jumping: false,
  frame: 0,
  frameTick: 0
};

const obstacles = [];
function spawnObstacle() {
  const type = Math.random() > 0.5 ? "frame" : "carpet";
  const obstacle = {
    x: canvas.width,
    y: type === "frame" ? 320 : 180,
    width: 40,
    height: 40,
    type: type
  };
  obstacles.push(obstacle);
}

function drawPlayer() {
  if (playerImg.complete && playerImg.naturalWidth !== 0) {
    player.frameTick++;
    if (player.frameTick % 6 === 0) player.frame = (player.frame + 1) % 4;
    ctx.drawImage(playerImg, player.frame * 40, 0, 40, 40, player.x, player.y, player.width, player.height);
  }
}

function drawObstacles() {
  for (let obs of obstacles) {
    const img = obs.type === "frame" ? frameImg : carpetImg;
    if (img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(img, obs.x, obs.y, obs.width, obs.height);
    }
  }
}

function drawGround() {
  if (groundImg.complete && groundImg.naturalWidth !== 0) {
    groundOffset -= gameSpeed;
    if (groundOffset <= -canvas.width) groundOffset = 0;
    for (let i = 0; i <= canvas.width / 40 + 1; i++) {
      ctx.drawImage(groundImg, (i * 40 + groundOffset), 360, 40, 40);
    }
  }
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function showTitleScreen() {
  ctx.fillStyle = bgSky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.font = "40px monospace";
  ctx.fillText("BONAFIDE RUN", canvas.width / 2 - 160, canvas.height / 2 - 20);
  ctx.font = "20px monospace";
  ctx.fillText("PRESS SPACE OR TAP TO START", canvas.width / 2 - 160, canvas.height / 2 + 20);
}

function update() {
  ctx.fillStyle = bgSky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGround();
  player.y += player.vy;
  player.vy += gravity;
  if (player.y > 300) {
    player.y = 300;
    player.vy = 0;
    player.jumping = false;
  }
  for (let i = obstacles.length - 1; i >= 0; i--) {
    let obs = obstacles[i];
    obs.x -= gameSpeed;
    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score++;
    }
    if (checkCollision(player, obs)) {
      alert("game over — final score: " + score);
      document.location.reload();
    }
  }
  drawPlayer();
  drawObstacles();
  ctx.fillStyle = "black";
  ctx.font = "16px monospace";
  ctx.fillText("score: " + score, 10, 20);
  requestAnimationFrame(update);
}

function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    setInterval(spawnObstacle, 1800);
    update();
  }
}

document.addEventListener("keydown", function (e) {
  if (!gameStarted && e.code === "Space") startGame();
  if (e.code === "Space" && !player.jumping) {
    player.vy = -10;
    player.jumping = true;
  }
});

document.addEventListener("touchstart", function () {
  if (!gameStarted) startGame();
  if (!player.jumping) {
    player.vy = -10;
    player.jumping = true;
  }
});

const assets = [playerImg, frameImg, carpetImg, groundImg];
let loadedAssets = 0;
assets.forEach((img, index) => {
  img.onload = () => {
    loadedAssets++;
    if (loadedAssets === assets.length) {
      showTitleScreen();
    }
  };
  img.onerror = () => {
    console.warn("Failed to load:", img.src);
    loadedAssets++;
    if (loadedAssets === assets.length) {
      showTitleScreen();
    }
  };
});

setTimeout(() => {
  if (!gameStarted) {
    console.warn("Forcing title screen fallback");
    showTitleScreen();
  }
}, 3000);
