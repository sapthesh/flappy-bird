document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

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
    const pipeWidth = 70; // Adjusted pipe width
    const pipeGap = 250; // Define pipe gap here
    const minGap = 200; // Minimum gap between pipes
    const maxGap = 250; // Maximum gap between pipes
    const pipeSpeed = 2;

    let coins = [];
    const coinSize = 20; // Size of the coin
    const coinScore = 10; // Points for each coin

    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameActive = false; // Flag to track if the game is active

    // Display high score on the start screen
    document.getElementById('high-score').innerText = `High Score: ${highScore}`;

    // Hide the game over overlay on page load
    document.getElementById('game-over-overlay').style.display = 'none';

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

    function drawCoins() {
        ctx.fillStyle = 'gold'; // Color for the coins
        coins.forEach(coin => {
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coinSize, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function drawScore() {
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30); // Display score on the canvas
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
                pipes.shift(); // Remove off-screen pipes
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
            const gapY = Math.floor(Math.random() * (maxGap - minGap)) + minGap;
            pipes.push({
                x: canvas.width,
                top: gapY,
                bottom: gapY + pipeGap,
                passed: false // Initialize passed property
            });
        }

        // Increase score when passing a pipe
        pipes.forEach(pipe => {
            if (pipe.x + pipeWidth < bird.x && !pipe.passed) {
                score++;
                pipe.passed = true; // Mark this pipe as passed
                document.getElementById('score').innerText = `Score: ${score}`;
                if (score > highScore) {
                    highScore = score;
                    localStorage.setItem('highScore', highScore);
                    document.getElementById('high-score').innerText = `High Score: ${highScore}`;
                }
            }
        });
    }

    function isCoinPositionValid(coinY) {
        // Check if the coin's Y position overlaps with any pipes
        for (let pipe of pipes) {
            if (coinY < pipe.top || coinY > pipe.bottom) {
                return false; // Coin is in a pipe's area
            }
        }
        return true; // Coin position is valid
    }

    function updateCoins() {
        coins.forEach((coin, index) => {
            // Check for collision with the bird
            if (
                bird.x < coin.x + coinSize &&
                bird.x + bird.width > coin.x &&
                bird.y < coin.y + coinSize &&
                bird.y + bird.height > coin.y
            ) {
                score += coinScore; // Increase score
                document.getElementById('score').innerText = `Score : ${score}`;
                coins.splice(index, 1); // Remove collected coin
            }
        });

        // Add new coins at random intervals
        if (Math.random() < 0.02) { // Adjust probability for coin generation
            const gapY = Math.floor(Math.random() * (canvas.height - 100)) + 50; // Random Y position
            if (isCoinPositionValid(gapY)) { // Check if the position is valid
                coins.push({
                    x: canvas.width,
                    y: gapY,
                });
            }
        }

        // Move coins to the left
        coins.forEach(coin => {
            coin.x -= pipeSpeed;
        });

        // Remove off-screen coins
        coins = coins.filter(coin => coin.x + coinSize > 0);
    }

    function gameOver() {
        gameActive = false; // Set gameActive to false
        document.getElementById('game-over-overlay').style.display = 'flex';
    }

    function resetGame() {
        bird.y = 150;
        bird.velocity = 0;
        pipes = [];
        coins = []; // Reset coins
        score = 0;
        document.getElementById('score').innerText = `Score: ${score}`;
        document.getElementById('game-over-overlay').style.display = 'none';
        gameActive = true; // Set gameActive to true
        gameLoop(); // Start the game loop again after resetting the game state
    }

    function initGame() {
        console.log("Game Initialized"); // Debugging line
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        resetGame();
        gameLoop();
    }

    function gameLoop() {
        if (!gameActive) return; // Stop the game loop if the game is not active

        console.log("Game Loop Running"); // Debugging line
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBird();
        drawPipes();
        drawCoins(); // Draw coins on the canvas
        drawScore(); // Call to draw the score on the canvas

        updateBird();
        updatePipes();
        updateCoins(); // Update coins

        requestAnimationFrame(gameLoop);
    }

    // Event listener for spacebar press to make the bird jump
    document.addEventListener('keydown', event => {
        if (event.code === 'Space' && gameActive) { // Only allow jumping if the game is active
            bird.velocity = bird.lift;
        }
    });

    // Event listener for start button click
    document.getElementById('start-button').addEventListener('click', initGame);

    // Event listener for restart button click
    document.getElementById('restart-game-button').addEventListener('click', resetGame);

    // Resize Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas on resize
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});