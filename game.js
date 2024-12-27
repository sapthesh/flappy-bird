document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    // Load images
    const birdImage = new Image();
    birdImage.src = 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/refs/heads/master/sprites/bluebird-downflap.png';

    const pipeImage = new Image();
    pipeImage.src = 'https://raw.githubusercontent.com/samuelcust/flappy-bird-assets/refs/heads/master/sprites/pipe-green.png';

    // Game variables
    let bird = {
        x: 50,
        y: 150,
        width: 30,
        height: 30,
        gravity: 0.4,
        lift: -10,
        velocity: 0
    };

    let pipes = [];
    const pipeWidth = 70;
    const pipeGap = 250;
    const minGap = 200;
    const maxGap = 250;
    const pipeSpeed = 2;

    let coins = [];
    const coinSize = 20;
    const coinScore = 10;

    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameActive = false;
    let gameStarted = false; // Flag to track if the game has started

    // Display high score on the start screen
    document.getElementById('high-score').innerText = `High Score: ${highScore}`;

    // Hide the game over overlay on page load
    document.getElementById('game-over-overlay').style.display = 'none';

    // Drawing functions
    function drawBird() {
        ctx.drawImage(birdImage, bird.x, bird.y, bird.width, bird.height);
    }

    function drawPipes() {
        pipes.forEach(pipe => {
            ctx.save();
            ctx.translate(pipe.x, 0);
            ctx.scale(1, -1);
            ctx.drawImage(pipeImage, 0, -pipe.top, pipeWidth, pipe.top);
            ctx.restore();
            ctx.drawImage(pipeImage, pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);
        });
    }

    function drawCoins() {
        ctx.fillStyle = 'gold';
        coins.forEach(coin => {
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coinSize, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawScore() {
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
    }

    // Update functions
    function updateBird() {
        if (gameStarted) { // Only update bird if the game has started
            bird.velocity += bird.gravity;
            bird.y += bird.velocity;

            if (bird.y + bird.height > canvas.height || bird.y < 0) {
                gameOver();
            }
        }
    }

    function updatePipes() {
        if (gameStarted) { // Only update pipes if the game has started
            pipes.forEach(pipe => {
                pipe.x -= pipeSpeed;

                if (pipe.x + pipeWidth < 0) {
                    pipes.shift();
                }

                if (
                    bird.x < pipe.x + pipeWidth &&
                    bird.x + bird.width > pipe.x &&
                    (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
                ) {
                    gameOver();
                }
            });

            if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
                const gapY = Math.floor(Math.random() * (maxGap - minGap)) + minGap;
                pipes.push({
                    x: canvas.width,
                    top: gapY,
                    bottom: gapY + pipeGap,
                    passed: false
                });
            }

            pipes.forEach(pipe => {
                if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
                    score++;
                    pipe.passed = true;
                    document.getElementById('score').innerText = `Score: ${score}`;
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                        document.getElementById ('high-score').innerText = `High Score: ${highScore}`;
                    }
                }
            });
        }
    }

    function isCoinPositionValid(coinY) {
        for (let pipe of pipes) {
            if (coinY < pipe.top || coinY > pipe.bottom) {
                return false;
            }
        }
        return true;
    }

    function updateCoins() {
        if (gameStarted) { // Only update coins if the game has started
            coins.forEach((coin, index) => {
                if (
                    bird.x < coin.x + coinSize &&
                    bird.x + bird.width > coin.x &&
                    bird.y < coin.y + coinSize &&
                    bird.y + bird.height > coin.y
                ) {
                    score += coinScore;
                    document.getElementById('score').innerText = `Score: ${score}`;
                    coins.splice(index, 1);
                }
            });

            if (Math.random() < 0.02) {
                const gapY = Math.floor(Math.random() * (canvas.height - 100)) + 50;
                if (isCoinPositionValid(gapY)) {
                    coins.push({
                        x: canvas.width,
                        y: gapY,
                    });
                }
            }

            coins.forEach(coin => {
                coin.x -= pipeSpeed;
            });

            coins = coins.filter(coin => coin.x + coinSize > 0);
        }
    }

    function gameOver() {
        gameActive = false;
        gameStarted = false; // Reset game started flag
        document.getElementById('game-over-overlay').style.display = 'flex';
    }

    function resetGame() {
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        coins = [];
        score = 0;
        document.getElementById('score').innerText = `Score: ${score}`;
        document.getElementById('game-over-overlay').style.display = 'none';
        gameActive = true;
        gameStarted = false; // Reset game started flag
    }

    function initGame() {
        console.log("Game Initialized");
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        resetGame();
        drawBird(); // Draw the bird immediately
        drawPipes(); // Draw the pipes immediately
    }

    function gameLoop() {
        if (!gameActive) return;

        console.log("Game Loop Running");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBird();
        drawPipes();
        drawCoins();
        drawScore();

        updateBird();
        updatePipes();
        updateCoins();

        requestAnimationFrame(gameLoop);
    }

    // Event listeners
    document.addEventListener('keydown', event => {
        if (event.code === 'Space') {
            if (!gameStarted && gameActive) {
                gameStarted = true; // Set game started flag
                bird.velocity = bird.lift; // Make the bird jump
                gameLoop(); // Start the game loop
            } else if (gameStarted) {
                bird.velocity = bird.lift; // Make the bird jump
            }
        }
    });

    // Touch controls for mobile
    canvas.addEventListener('touchstart', event => {
        event.preventDefault(); // Prevent scrolling
        if (!gameStarted && gameActive) {
            gameStarted = true; // Set game started flag
            bird.velocity = bird.lift; // Make the bird jump
            gameLoop(); // Start the game loop
        } else if (gameStarted) {
            bird.velocity = bird.lift; // Make the bird jump
        }
    });

    document.getElementById('start-button').addEventListener('click', initGame);
    document.getElementById('restart-game-button').addEventListener('click', resetGame);

    // Resize Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});