const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

const playerWidth = 40;
const playerHeight = 40;
let playerX = (canvas.width - playerWidth) / 2;
let playerY = canvas.height - playerHeight - 10;
let playerSpeed = 5;

const bullets = [];
const enemies = [];
const powerUps = [];
const enemyTypes = [
    { width: 40, height: 40, speed: 2, color: '#00FF00', points: 10 },
    { width: 60, height: 60, speed: 1, color: '#FF00FF', points: 20 },
    { width: 20, height: 20, speed: 4, color: '#0000FF', points: 30 },
];
let bulletSpeed = 5;
let maxBullets = 1;  // 一度に発射できる弾の数
let score = 0;
let playerLives = 3;
let powerUpMessage = '';  // 取得したパワーアップのメッセージ
let powerUpMessageTimeout;

let rightPressed = false;
let leftPressed = false;
let spacePressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if(e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if(e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if(e.key === ' ' || e.key === 'Spacebar') {
        spacePressed = false;
    }
}

function drawPlayer() {
    ctx.beginPath();
    ctx.rect(playerX, playerY, playerWidth, playerHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.rect(bullet.x, bullet.y, 5, 10);
        ctx.fillStyle = '#FF0000';
        ctx.fill();
        ctx.closePath();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.rect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.beginPath();
        ctx.rect(powerUp.x, powerUp.y, 20, 20);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
        ctx.closePath();
    });
}

function drawLives() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Lives: ' + playerLives, canvas.width - 80, 20);
}

function movePlayer() {
    if(rightPressed && playerX < canvas.width - playerWidth) {
        playerX += playerSpeed;
    } else if(leftPressed && playerX > 0) {
        playerX -= playerSpeed;
    }
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if(bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;
        if(enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });
}

function movePowerUps() {
    powerUps.forEach((powerUp, index) => {
        powerUp.y += 2;
        if(powerUp.y > canvas.height) {
            powerUps.splice(index, 1);
        }
    });
}

function fireBullet() {
    if(spacePressed && bullets.length < maxBullets) {
        bullets.push({ x: playerX + playerWidth / 2 - 2.5, y: playerY });
        spacePressed = false;
    }
}

function spawnEnemy() {
    const typeIndex = Math.floor(Math.random() * enemyTypes.length);
    const enemyType = enemyTypes[typeIndex];
    const x = Math.random() * (canvas.width - enemyType.width);
    enemies.push({ x: x, y: 0, ...enemyType });
}

function spawnPowerUp(x, y) {
    powerUps.push({ x: x, y: y });
}

function collisionDetection() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if(bullet.x > enemy.x && bullet.x < enemy.x + enemy.width && bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);
                score += enemy.points;
                if(Math.random() < 0.3) {  // 30%の確率でパワーアップを生成
                    spawnPowerUp(enemy.x + enemy.width / 2 - 10, enemy.y + enemy.height / 2 - 10);
                }
            }
        });
    });

    enemies.forEach((enemy, enemyIndex) => {
        if(enemy.x < playerX + playerWidth && enemy.x + enemy.width > playerX && enemy.y < playerY + playerHeight && enemy.y + enemy.height > playerY) {
            enemies.splice(enemyIndex, 1);
            playerLives--;
            if(playerLives <= 0) {
                document.location.reload();
            }
        }
    });

    powerUps.forEach((powerUp, index) => {
        if(powerUp.x < playerX + playerWidth && powerUp.x + 20 > playerX && powerUp.y < playerY + playerHeight && powerUp.y + 20 > playerY) {
            powerUps.splice(index, 1);
            activatePowerUp();
        }
    });
}

function activatePowerUp() {
    const powerUpType = Math.floor(Math.random() * 3); // 0: 弾のスピード, 1: プレイヤーの速度, 2: 弾の数
    switch(powerUpType) {
        case 0:
            bulletSpeed += 2;
            powerUpMessage = '弾のスピードアップ!';
            break;
        case 0.1:
            playerSpeed += 2;
            powerUpMessage = 'プレイヤーのスピードアップ!';
            break;
        case 2:
            maxBullets += 1;
            powerUpMessage = '弾の数が増えた!';
            break;
    }

    clearTimeout(powerUpMessageTimeout);
    powerUpMessageTimeout = setTimeout(() => {
        powerUpMessage = '';
    }, 2000);
}

function drawScore() {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Score: ' + score, 8, 20);
}

function drawPowerUpMessage() {
    if (powerUpMessage) {
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(powerUpMessage, canvas.width / 2 - ctx.measureText(powerUpMessage).width / 2, canvas.height / 2);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawPowerUps();
    drawScore();
    drawLives();
    drawPowerUpMessage();
    movePlayer();
    moveBullets();
    moveEnemies();
    movePowerUps();
    fireBullet();
    collisionDetection();

    requestAnimationFrame(draw);
}

setInterval(spawnEnemy, 1000);
draw();
