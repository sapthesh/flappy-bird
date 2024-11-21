const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gravity = 0.5;
let bird = {
    x: 50,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    velocity: 0,
    lift: -10,
    images: [
        new Image(),
        new Image()
    ]
};
bird.images[0].src = 'bird1.png'; // Replace with path to your first bird image
bird.images[1].src = 'path/to/bird2.png'; // Replace with path to your second bird image

let pipes = [];
let score = 0;
let pipeGap = 150;
let lastPipeTime = 0;
let timeSinceLastPipe = 0;
let currentBirdImageIndex = 0;

function drawBird() {
    ctx.drawImage(bird.images[currentBirdImageIndex], bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, canvas.height - pipe.bottomHeight, pipe.width, pipe.bottomHeight);
    });
}

function updateBird() {
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // Prevent bird from going off-screen
    if (bird.y + bird.height > canvas.height) {
        bird.y = canvas.height - bird.height;
        bird.velocity = 0;
    } else if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    // Animate bird between images
    currentBirdImageIndex = (currentBirdImageIndex + 1) % bird.images.length;
}

function updatePipes() {
    timeSinceLastPipe += 1;

    if (timeSinceLastPipe > 100 && Math.random() > 0.95) {
        let topHeight = Math.floor(Math.random() * (canvas.height / 2));
        let bottomHeight = canvas.height - topHeight - pipeGap;
        pipes.push({
            x: canvas.width,
            width: 50,
            topHeight: topHeight,
            bottomHeight: bottomHeight
        });
        lastPipeTime = Date.now();
        timeSinceLastPipe = 0;
    }

    pipes.forEach((pipe, index) => {
        pipe.x -= 2;

        if (bird.x + bird.width >= pipe.x && bird.x <= pipe.x + pipe.width &&
            (bird.y <= pipe.topHeight || bird.y + bird.height >= canvas.height - pipe.bottomHeight)) {
            gameOver();
        }

        if (pipe.x + pipe.width < 0) {
            pipes.splice(index, 1);
            score++;
        }
    });
}

function drawScore() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameOver() {
    const gameOverScreen = document.createElement('div');
    gameOverScreen.classList.add('game-over-screen');
    gameOverScreen.innerHTML = `
        <h1>Game Over!</h1>
        <p>Your score is ${score}</p>
        <button onclick="resetGame()">Play Again</button>
    `;
    document.body.appendChild(gameOverScreen);

    document.querySelector('.start-screen').remove();
}

function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    timeSinceLastPipe = 0;
    currentBirdImageIndex = 0;

    document.querySelector('.game-over-screen').remove();
    gameLoop();
}

document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !document.querySelector('.game-over-screen')) {
        bird.velocity = bird.lift;
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    updateBird();
    updatePipes();
    drawScore();

    requestAnimationFrame(gameLoop);
}

// Start screen
const startScreen = document.createElement('div');
startScreen.classList.add('start-screen');
startScreen.innerHTML = `
    <h1>Flappy Bird</h1>
    <button onclick="startGame()">Start Game</button>
`;
document.body.appendChild(startScreen);

function startGame() {
    document.querySelector('.start-screen').remove();
    gameLoop();
}
