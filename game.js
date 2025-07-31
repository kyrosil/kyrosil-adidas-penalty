console.log("game.js yüklendi.");

const game = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas elementi bulunamadı!");
        return;
    }
    const ctx = canvas.getContext('2d');

    // --- Oyun Akış Değişkenleri ---
    let playerData = {};
    let gameState = 'idle';
    let gamePhase = 'player_shot';
    let currentLevel = 1;
    let lives = 3;
    let message = { text: '', visible: false, color: '#FFF', size: 0.08 };
    let gameReadyForInput = false;
    const PENALTY_SPOT_Y_RATIO = 0.6;

    // --- Seviye Zorluk Ayarları ---
    const levelConfig = {
        1: { keeperSpeed: 0.012, aiShotSpeed: 0.028 },
        2: { keeperSpeed: 0.015, aiShotSpeed: 0.030 },
        3: { keeperSpeed: 0.018, aiShotSpeed: 0.032 },
        4: { keeperSpeed: 0.020, aiShotSpeed: 0.034 },
        5: { keeperSpeed: 0.022, aiShotSpeed: 0.035 },
        6: { keeperSpeed: 0.025, aiShotSpeed: 0.036 }
    };

    // --- Oyun Elementleri ---
    const ball = { x: 0, y: 0, radius: 0, vx: 0, vy: 0, speed: 0 };
    const keeper = { x: 0, y: 0, width: 0, height: 0, state: 'idle', diveTarget: { x: 0, y: 0 }, diveSpeed: 0, idleAnimTime: 0 };
    const goal = { x: 0, width: 0, height: 0 };
    const aimTarget = { x: 0, y: 0, visible: false };

    // --- ANA KURULUM VE SIFIRLAMA ---
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
    };

    const setupTurn = () => {
        const config = levelConfig[currentLevel];
        message.visible = false;
        ball.radius = canvas.width * 0.025;
        ball.vx = 0;
        ball.vy = 0;
        goal.width = canvas.width * 0.35;
        goal.height = goal.width * 0.45;
        goal.x = (canvas.width - goal.width) / 2;
        keeper.width = canvas.width * 0.1;
        keeper.height = canvas.width * 0.04;
        keeper.y = goal.height - keeper.height;
        keeper.state = 'idle';

        if (gamePhase === 'player_shot') {
            gameState = 'aiming';
            ball.x = canvas.width / 2;
            ball.y = canvas.height * 0.8;
            ball.speed = canvas.width * 0.03;
            keeper.diveSpeed = canvas.width * config.keeperSpeed;
            displayMessage(`LEVEL ${currentLevel}: ŞUTUNU ÇEK!`, '#FFFFFF', 0.05);
        } else if (gamePhase === 'player_save') {
            gameState = 'save';
            ball.x = canvas.width / 2;
            ball.y = canvas.height * PENALTY_SPOT_Y_RATIO;
            ball.speed = canvas.width * config.aiShotSpeed;
            keeper.diveSpeed = canvas.width * 0.02;
            displayMessage("SIRA SENDE: KURTARIŞ YAP!", '#FFFFFF', 0.05);
            setTimeout(() => aiShoot(), 1500);
        }
        gameReadyForInput = false;
        setTimeout(() => {
            gameReadyForInput = true;
        }, 500);
    };

    // --- TÜM ÇİZİM FONKSİYONLARI ---
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
        const penaltySpotY = canvas.height * PENALTY_SPOT_Y_RATIO;
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
        gradient.addColorStop(0, '#ffffff'); grad.addColorStop(0.8, '#f0f0f0'); grad.addColorStop(1, '#cccccc');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI); ctx.fill(); ctx.closePath();
        ctx.fillStyle = '#222222';
        const panelSize = ball.radius * 0.3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y - panelSize); ctx.lineTo(ball.x + panelSize * 0.95, ball.y - panelSize * 0.3); ctx.lineTo(ball.x + panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.95, ball.y - panelSize * 0.3);
        ctx.closePath(); ctx.fill();
    };

    const drawAim = () => {
        if (!aimTarget.visible || (gameState !== 'aiming' && gameState !== 'save')) return;
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

    const drawUI = () => {
        ctx.fillStyle = 'white';
        ctx.font = `bold ${canvas.width * 0.03}px Roboto`;
        ctx.textAlign = 'left';
        ctx.fillText(`Level: ${currentLevel}`, 20, 40);
        ctx.textAlign = 'right';
        ctx.fillText(`Kalan Hak: ${lives}`, canvas.width - 20, 40);
        if (message.visible) {
            ctx.fillStyle = message.color;
            ctx.font = `bold ${canvas.width * message.size}px Roboto`;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 10;
            ctx.fillText(message.text, canvas.width / 2, canvas.height / 2);
            ctx.shadowBlur = 0;
        }
    };

    // --- OYUN MANTIĞI VE GÜNCELLEMELER ---
    const shoot = () => {
        if (gameState !== 'aiming' || !gameReadyForInput) return;
        message.visible = false;
        gameReadyForInput = false;
        const dx = aimTarget.x - ball.x;
        const dy = aimTarget.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        ball.vx = (dx / distance) * ball.speed;
        ball.vy = (dy / distance) * ball.speed;
        gameState = 'shooting';
        aimTarget.visible = false;
        decideKeeperDive('ai');
    };

    const playerDive = () => {
        if (gameState !== 'save' || !gameReadyForInput) return;
        message.visible = false;
        gameReadyForInput = false;
        decideKeeperDive('player');
    };

    const decideKeeperDive = (who) => {
        let targetX;
        if (who === 'ai') {
            const timeToGoal = Math.abs((ball.y - goal.height) / ball.vy);
            const finalBallX = ball.x + ball.vx * timeToGoal;
            const errorMargin = goal.width * 0.4 * (Math.random() - 0.5);
            targetX = finalBallX + errorMargin;
        } else {
            targetX = aimTarget.x;
        }
        targetX = Math.max(goal.x, Math.min(targetX, goal.x + goal.width - keeper.width));
        keeper.diveTarget.x = targetX;
        keeper.state = 'diving';
    };

    const aiShoot = () => {
        const targetX = goal.x + (goal.width * (0.1 + Math.random() * 0.8));
        const targetY = goal.height * (Math.random() * 0.8);
        const dx = targetX - ball.x;
        const dy = targetY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        ball.vx = (dx / distance) * ball.speed;
        ball.vy = (dy / distance) * ball.speed;
        gameState = 'shooting';
    };

    const updateKeeper = () => {
        if (keeper.state === 'idle' && gamePhase === 'player_shot') {
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

    const checkResult = () => {
        if (gameState !== 'shooting') return;

        const ballPastGoalLine = ball.y < goal.height;
        if (!ballPastGoalLine) {
            // Eğer top ekranın çok dışına çıkarsa, 'aut' olarak kabul et ve hakkı düşür
            if (ball.y < -ball.radius * 5 || ball.x < -ball.radius * 5 || ball.x > canvas.width + ball.radius * 5) {
                displayMessage("AUT!", "#F44336");
                loseLife();
                gameState = 'result'; // Oyunu durdur
            }
            return;
        }

        gameState = 'result';
        const collides = ball.x > keeper.x && ball.x < keeper.x + keeper.width && ball.y > keeper.y && ball.y < keeper.y + keeper.height;
        const isGoal = ball.x > goal.x && ball.x < goal.x + goal.width;

        if (gamePhase === 'player_shot') {
            if (isGoal && !collides) {
                displayMessage("GOOOL!", "#4CAF50");
                gamePhase = 'player_save';
                setTimeout(setupTurn, 1500);
            } else {
                displayMessage(collides ? "KURTARIŞ!" : "AUT!", "#F44336");
                loseLife();
            }
        } else if (gamePhase === 'player_save') {
            if (isGoal && !collides) {
                displayMessage("GOL YEDİN!", "#F44336");
                loseLife();
            } else {
                displayMessage(collides ? "KURTARDIN!" : "AUT!", "#4CAF50");
                winLevel();
            }
        }
    };

    const winLevel = () => {
        displayMessage(`LEVEL ${currentLevel} TAMAMLANDI!`, "#FFC107");
        if ([2, 4, 6].includes(currentLevel)) {
            console.log(`ÖDÜL KAZANILDI: LEVEL ${currentLevel}`);
        }
        currentLevel++;
        if (currentLevel > 6) {
            displayMessage("OYUN BİTTİ! TEBRİKLER!", "#4CAF50");
            gameState = 'finished';
        } else {
            gamePhase = 'player_shot';
            setTimeout(setupTurn, 2000);
        }
    };

    const loseLife = () => {
        lives--;
        // LocalStorage güncellemesi eklenecek
        if (lives > 0) {
            gamePhase = 'player_shot';
            setTimeout(setupTurn, 2000);
        } else {
            displayMessage("OYUN BİTTİ!", "#F44336");
            gameState = 'finished';
        }
    };

    const displayMessage = (txt, color, size = 0.08) => {
        message.text = txt;
        message.color = color;
        message.size = size;
        message.visible = true;
    };

    const updateBallPosition = () => {
        if (gameState === 'shooting') {
            ball.x += ball.vx;
            ball.y += ball.vy;
            ball.radius *= 0.995;
            checkResult();
        }
    };

    const setupEventListeners = () => {
        const updateAimPosition = (e) => {
            if (!gameReadyForInput || (gameState !== 'aiming' && gameState !== 'save')) return;
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            aimTarget.x = clientX - rect.left;
            aimTarget.y = clientY - rect.top;
            aimTarget.visible = true;
        };

        const handleClickOrTouch = (e) => {
            if (gameState === 'aiming') {
                shoot();
            } else if (gameState === 'save') {
                playerDive();
            }
        };

        canvas.addEventListener('mousemove', updateAimPosition);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateAimPosition(e); });
        canvas.addEventListener('mouseleave', () => { aimTarget.visible = false; });
        canvas.addEventListener('click', handleClickOrTouch);
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleClickOrTouch(); aimTarget.visible = false; });
        window.addEventListener('resize', () => {
            setCanvasDimensions();
            setupTurn();
        });
    };

    // --- OYUN DÖNGÜSÜ ---
    const gameLoop = () => {
        if (gameState !== 'finished') {
            updateKeeper();
            updateBallPosition();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPitch();
        drawFieldMarkings();
        drawGoal();
        drawKeeper();
        drawBall();
        drawAim();
        drawUI();

        requestAnimationFrame(gameLoop);
    };

    // --- OYUN BAŞLATMA ---
    const init = (pData) => {
        playerData = pData;
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions();
        setupTurn();
        setupEventListeners();
        gameLoop();
    };
    
    window.addEventListener('game:start', (event) => { init(event.detail); });
};

game();
