const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let bird = {
    x: 50,
    y: 150,
    width: 30,
    height: 30,
    gravity: 0.5,
    lift: -10,
    velocity: 0
};

let pipes = [];
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 2;

function drawBird() {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    pipes.forEach(pipe => {
        ctx.fillStyle = 'green';
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
    });
}

function updateBird() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height || bird.y < 0) {
        gameOver();
    }
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;

        if (pipe.x + pipeWidth < 0) {
            pipes.shift();
        }

        // Collision detection with top and bottom pipes
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
        ) {
            gameOver();
        }
    });

    // Add new pipes at regular intervals
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        const gapY = Math.random() * (canvas.height - pipeGap);
        pipes.push({
            x: canvas.width,
            top: gapY,
            bottom: gapY + pipeGap
        });
    }
}

function gameOver() {
    alert('Game Over!');
    resetGame();
}

function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();

    updateBird();
    updatePipes();

    requestAnimationFrame(gameLoop);
}

// Event listener for spacebar press to make the bird jump
document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        bird.velocity = bird.lift;
    }
});

// Initialize the canvas size based on window dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Start the game loop
gameLoop();
