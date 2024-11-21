const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 600;

let gravity = 0.5;
let bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    velocity: 0,
    lift: -10
};

let pipes = [];
let score = 0;
let pipeGap = 150;
let lastPipeTime = 0;
let timeSinceLastPipe = 0;

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
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
    alert(`Game Over! Your score is ${score}`);
    resetGame();
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    timeSinceLastPipe = 0;
}

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        bird.velocity = bird.lift;
    }
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

gameLoop();
