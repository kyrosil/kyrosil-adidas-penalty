console.log("game.js yüklendi.");

const game = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas elementi bulunamadı!");
        return;
    }

    const ctx = canvas.getContext('2d');

    // --- Oyun Değişkenleri ---
    let playerData = {};
    let gameState = 'aiming'; // 'aiming', 'shooting', 'result'
    let gameReadyForInput = false;

    const ball = {
        x: 0, y: 0, radius: 0,
        vx: 0, vy: 0, speed: 0
    };

    const keeper = {
        x: 0, y: 0,
        width: 0, height: 0,
        state: 'idle', // 'idle', 'diving'
        diveTarget: { x: 0, y: 0 },
        diveSpeed: 0,
        idleAnimTime: 0
    };

    const goal = {
        x: 0, width: 0, height: 0
    };

    const aimTarget = {
        x: 0, y: 0, visible: false
    };

    const setCanvasDimensions = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        let canvasWidth = Math.min(screenWidth * 0.9, 800);
        let canvasHeight = canvasWidth * (9 / 16);
        if (canvasHeight > screenHeight * 0.95) {
            canvasHeight = screenHeight * 0.95;
            canvasWidth = canvasHeight * (16 / 9);
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        resetGame();
    };

    const resetGame = () => {
        ball.radius = canvas.width * 0.025;
        ball.x = canvas.width / 2;
        ball.y = canvas.height * 0.8;
        ball.vx = 0;
        ball.vy = 0;
        ball.speed = canvas.width * 0.03;
        
        goal.width = canvas.width * 0.35;
        goal.height = goal.width * 0.45;
        goal.x = (canvas.width - goal.width) / 2;
        
        keeper.width = canvas.width * 0.1;
        keeper.height = canvas.width * 0.04;
        keeper.y = goal.height - keeper.height;
        keeper.diveSpeed = canvas.width * 0.015;
        keeper.state = 'idle';
        
        gameState = 'aiming';
        gameReadyForInput = true;
    };

    // --- Çizim Fonksiyonları ---

    const drawPitch = () => {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#3a8f3a');
        gradient.addColorStop(1, '#2a7e2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawFieldMarkings = () => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = canvas.width * 0.005;
        const penaltyAreaWidth = canvas.width * 0.6;
        const penaltyAreaHeight = canvas.height * 0.4;
        const penaltyAreaX = (canvas.width - penaltyAreaWidth) / 2;
        ctx.strokeRect(penaltyAreaX, 0, penaltyAreaWidth, penaltyAreaHeight);
        const penaltySpotY = canvas.height * 0.25;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, penaltySpotY, canvas.width * 0.006, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, penaltySpotY, canvas.width * 0.15, 0.35, Math.PI - 0.35);
        ctx.stroke();
    };

    const drawGoal = () => {
        const goalFrontWidth = goal.width;
        const goalHeight = goal.height;
        const goalFrontX = goal.x;
        const goalDepth = goalHeight * 0.5;
        const postWidth = canvas.width * 0.012;
        const backPostX = goalFrontX + goalDepth * 0.3;
        const backPostWidth = goalFrontWidth - (goalDepth * 0.6);
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(goalFrontX, 0); ctx.lineTo(backPostX, 0); ctx.lineTo(backPostX, goalHeight); ctx.lineTo(goalFrontX, goalHeight);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(goalFrontX + goalFrontWidth, 0); ctx.lineTo(backPostX + backPostWidth, 0); ctx.lineTo(backPostX + backPostWidth, goalHeight); ctx.lineTo(goalFrontX + goalFrontWidth, goalHeight);
        ctx.fill(); ctx.stroke();
        const postGradient = ctx.createLinearGradient(goalFrontX, 0, goalFrontX + postWidth, 0);
        postGradient.addColorStop(0, '#ddd'); postGradient.addColorStop(0.5, '#fff'); postGradient.addColorStop(1, '#ddd');
        ctx.fillStyle = postGradient;
        ctx.fillRect(goalFrontX - postWidth, 0, postWidth, goalHeight);
        ctx.fillRect(goalFrontX + goalFrontWidth, 0, postWidth, goalHeight);
        ctx.fillRect(goalFrontX - postWidth, 0, goalFrontWidth + (postWidth * 2), postWidth);
    };

    const drawBall = () => {
        const gradient = ctx.createRadialGradient(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, ball.x, ball.y, ball.radius * 1.5);
        gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(0.8, '#f0f0f0'); gradient.addColorStop(1, '#cccccc');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI); ctx.fill(); ctx.closePath();
        ctx.fillStyle = '#222222';
        const panelSize = ball.radius * 0.3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y - panelSize); ctx.lineTo(ball.x + panelSize * 0.95, ball.y - panelSize * 0.3); ctx.lineTo(ball.x + panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.95, ball.y - panelSize * 0.3);
        ctx.closePath(); ctx.fill();
    };

    const drawAim = () => {
        if (!aimTarget.visible || gameState !== 'aiming') return;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(aimTarget.x, aimTarget.y, 15, 0, 2 * Math.PI);
        ctx.moveTo(aimTarget.x - 10, aimTarget.y);
        ctx.lineTo(aimTarget.x + 10, aimTarget.y);
        ctx.moveTo(aimTarget.x, aimTarget.y - 10);
        ctx.lineTo(aimTarget.x, aimTarget.y + 10);
        ctx.stroke();
    };

    const drawKeeper = () => {
        ctx.fillStyle = '#0052A2';
        ctx.fillRect(keeper.x, keeper.y, keeper.width, keeper.height);
        ctx.fillStyle = '#FFFFFF';
        const stripeWidth = keeper.width * 0.1;
        ctx.fillRect(keeper.x + keeper.width * 0.2, keeper.y, stripeWidth, keeper.height);
        ctx.fillRect(keeper.x + keeper.width * 0.45, keeper.y, stripeWidth, keeper.height);
        ctx.fillRect(keeper.x + keeper.width * 0.7, keeper.y, stripeWidth, keeper.height);
    };

    // --- Oyun Mantığı ve Güncellemeler ---
    
    const shoot = () => {
        if (gameState !== 'aiming' || !gameReadyForInput) return;
        const dx = aimTarget.x - ball.x;
        const dy = aimTarget.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        ball.vx = (dx / distance) * ball.speed;
        ball.vy = (dy / distance) * ball.speed;
        gameState = 'shooting';
        aimTarget.visible = false;
        decideKeeperDive();
    };

    const decideKeeperDive = () => {
        const timeToGoal = (ball.y - goal.height) / ball.vy;
        const finalBallX = ball.x + ball.vx * timeToGoal;
        const errorMargin = goal.width * 0.3 * (Math.random() - 0.5);
        let targetX = finalBallX + errorMargin;
        targetX = Math.max(goal.x, Math.min(targetX, goal.x + goal.width - keeper.width));
        keeper.diveTarget.x = targetX;
        keeper.diveTarget.y = keeper.y;
        keeper.state = 'diving';
    };

    const updateKeeper = () => {
        if (keeper.state === 'idle') {
            keeper.idleAnimTime += 0.02;
            const movementRange = (goal.width - keeper.width) / 2;
            keeper.x = goal.x + movementRange + (Math.sin(keeper.idleAnimTime) * movementRange);
        } else if (keeper.state === 'diving') {
            const dx = keeper.diveTarget.x - keeper.x;
            if (Math.abs(dx) > keeper.diveSpeed) {
                keeper.x += Math.sign(dx) * keeper.diveSpeed;
            }
        }
    };
    
    const checkCollision = () => {
        if (gameState !== 'shooting') return;

        const collides = ball.x > keeper.x && ball.x < keeper.x + keeper.width && ball.y > keeper.y && ball.y < keeper.y + keeper.height;

        if (collides) {
            console.log("KURTARIŞ!");
            gameState = 'result';
            setTimeout(resetGame, 1500);
        } else if (ball.y < goal.height) {
            if (ball.x > goal.x && ball.x < goal.x + goal.width) {
                console.log("GOOOOL!");
            } else {
                console.log("AUT!");
            }
            gameState = 'result';
            setTimeout(resetGame, 1500);
        }
    };

    const updateBallPosition = () => {
        if (gameState === 'shooting') {
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.radius *= 0.995;
            checkCollision();
        }
    };
    
    const setupEventListeners = () => {
        const updateAimPosition = (e) => {
            if (gameState !== 'aiming') return;
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            aimTarget.x = clientX - rect.left;
            aimTarget.y = clientY - rect.top;
            aimTarget.visible = true;
        };
        canvas.addEventListener('mousemove', updateAimPosition);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateAimPosition(e); });
        canvas.addEventListener('mouseleave', () => { if (gameState === 'aiming') aimTarget.visible = false; });
        canvas.addEventListener('click', shoot);
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); shoot(); aimTarget.visible = false; });
        window.addEventListener('resize', setCanvasDimensions);
    };

    // --- Oyun Döngüsü ---
    const gameLoop = () => {
        updateKeeper();
        updateBallPosition();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPitch();
        drawFieldMarkings();
        drawGoal();
        drawKeeper();
        drawBall();
        drawAim();

        requestAnimationFrame(gameLoop);
    };

    // --- Oyun Başlatma ---
    const init = (pData) => {
        playerData = pData;
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions();
        setupEventListeners();
        gameLoop();
        setTimeout(() => {
            gameReadyForInput = true;
        }, 200);
    };
    
    window.addEventListener('game:start', (event) => {
        init(event.detail);
    });
};

game();
