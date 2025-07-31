console.log("game.js yüklendi.");

const game = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) { return; }
    const ctx = canvas.getContext('2d');

    // --- OYUN AKIŞ DEĞİŞKENLERİ ---
    let playerData = {};
    let gameState = 'idle'; // idle, aiming, shooting, save, result
    let gamePhase = 'player_shot'; // 'player_shot', 'player_save'
    let currentLevel = 1;
    let lives = 3;
    let message = { text: '', visible: false, color: '#FFF' };
    let gameReadyForInput = false;

    // --- SEVİYE ZORLUK AYARLARI ---
    const levelConfig = {
        1: { keeperSpeed: 0.012, aiShotSpeed: 0.025, aiAccuracy: 0.6 },
        2: { keeperSpeed: 0.015, aiShotSpeed: 0.028, aiAccuracy: 0.7 },
        3: { keeperSpeed: 0.018, aiShotSpeed: 0.030, aiAccuracy: 0.75 },
        4: { keeperSpeed: 0.020, aiShotSpeed: 0.032, aiAccuracy: 0.8 },
        5: { keeperSpeed: 0.022, aiShotSpeed: 0.033, aiAccuracy: 0.85 },
        6: { keeperSpeed: 0.025, aiShotSpeed: 0.035, aiAccuracy: 0.9 }
    };
    
    // --- OYUN ELEMENTLERİ ---
    const ball = { x: 0, y: 0, radius: 0, vx: 0, vy: 0, speed: 0 };
    const keeper = { x: 0, y: 0, width: 0, height: 0, state: 'idle', diveTarget: { x: 0, y: 0 }, diveSpeed: 0, idleAnimTime: 0 };
    const goal = { x: 0, width: 0, height: 0 };
    const aimTarget = { x: 0, y: 0, visible: false };

    // --- ANA KURULUM VE SIFIRLAMA FONKSİYONLARI ---

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
        } else if (gamePhase === 'player_save') {
            gameState = 'save';
            ball.x = canvas.width / 2;
            ball.y = canvas.height * 0.25; // Penaltı noktası
            ball.speed = canvas.width * config.aiShotSpeed;
            keeper.diveSpeed = canvas.width * 0.02; // Oyuncu kalecisi daha hızlı
            aiShoot(config.aiAccuracy);
        }
        gameReadyForInput = true;
    };

    // --- ÇİZİM FONKSİYONLARI ---
    
    const drawPitch = () => { /* ... (öncekiyle aynı, tam kod aşağıda) ... */ };
    const drawFieldMarkings = () => { /* ... (öncekiyle aynı, tam kod aşağıda) ... */ };
    const drawGoal = () => { /* ... (öncekiyle aynı, tam kod aşağıda) ... */ };
    const drawBall = () => { /* ... (öncekiyle aynı, tam kod aşağıda) ... */ };
    const drawAim = () => { if (!aimTarget.visible || gameState !== 'aiming') return; /* ... */ };
    const drawKeeper = () => { /* ... (öncekiyle aynı, tam kod aşağıda) ... */ };

    const drawUI = () => {
        ctx.fillStyle = 'white';
        ctx.font = `bold ${canvas.width * 0.03}px Roboto`;
        ctx.textAlign = 'left';
        ctx.fillText(`Level: ${currentLevel}`, 20, 40);
        ctx.textAlign = 'right';
        ctx.fillText(`Kalan Hak: ${lives}`, canvas.width - 20, 40);

        if (message.visible) {
            ctx.fillStyle = message.color;
            ctx.font = `bold ${canvas.width * 0.08}px Roboto`;
            ctx.textAlign = 'center';
            ctx.fillText(message.text, canvas.width / 2, canvas.height / 2);
        }
    };

    // --- OYUN MANTIĞI VE GÜNCELLEMELER ---

    const shoot = () => {
        if (gameState !== 'aiming' || !gameReadyForInput) return;
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
        gameReadyForInput = false;
        decideKeeperDive('player');
    };

    const decideKeeperDive = (who) => {
        let targetX;
        if (who === 'ai') {
            const timeToGoal = (ball.y - goal.height) / ball.vy;
            const finalBallX = ball.x + ball.vx * timeToGoal;
            const errorMargin = goal.width * 0.4 * (Math.random() - 0.5);
            targetX = finalBallX + errorMargin;
        } else { // player
            targetX = aimTarget.x;
        }
        targetX = Math.max(goal.x, Math.min(targetX, goal.x + goal.width - keeper.width));
        keeper.diveTarget.x = targetX;
        keeper.state = 'diving';
    };

    const aiShoot = (accuracy) => {
        // AI rastgele bir hedef seçer
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

        const ballInGoal = ball.y < goal.height && ball.y > 0;
        if (!ballInGoal) return;

        const collides = ball.x > keeper.x && ball.x < keeper.x + keeper.width && ball.y > keeper.y && ball.y < keeper.y + keeper.height;
        const isGoal = ball.x > goal.x && ball.x < goal.x + goal.width;
        
        gameState = 'result';
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
                displayMessage("KURTARDIN!", "#4CAF50");
                winLevel();
            }
        }
    };
    
    const winLevel = () => {
        displayMessage(`LEVEL ${currentLevel} TAMAMLANDI!`, "#FFC107");
        // Ödül seviyesi kontrolü
        if (currentLevel === 2 || currentLevel === 4 || currentLevel === 6) {
            console.log(`ÖDÜL KAZANILDI: LEVEL ${currentLevel}`);
            // TODO: Mailto linki ile ödül ekranı gösterilecek.
        }
        currentLevel++;
        if (currentLevel > 6) {
            displayMessage("OYUN BİTTİ! TEBRİKLER!", "#4CAF50");
            // TODO: Final ekranı göster
        } else {
            gamePhase = 'player_shot';
            setTimeout(setupTurn, 2000);
        }
    };

    const loseLife = () => {
        lives--;
        // TODO: LocalStorage'daki hakkı güncelle
        if (lives > 0) {
            gamePhase = 'player_shot';
            setTimeout(setupTurn, 2000);
        } else {
            displayMessage("OYUN BİTTİ!", "#F44336");
            // TODO: Giriş ekranına dön
        }
    };
    
    const displayMessage = (txt, color) => {
        message.text = txt;
        message.color = color;
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
            if (gameState !== 'aiming' && gameState !== 'save') return;
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
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleClickOrTouch();
            aimTarget.visible = false;
        });
        window.addEventListener('resize', setCanvasDimensions);
    };

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
        drawUI();
        requestAnimationFrame(gameLoop);
    };

    const init = (pData) => {
        playerData = pData;
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions(); // Bu fonksiyon zaten setupTurn'ü çağıracak
        setupEventListeners();
        gameLoop();
        setTimeout(() => { gameReadyForInput = true; }, 200);
    };
    
    window.addEventListener('game:start', (event) => { init(event.detail); });

    // Tam Çizim Fonksiyonları (Hatayı önlemek için)
    const _drawPitch = () => { const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, '#3a8f3a'); gradient.addColorStop(1, '#2a7e2a'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); };
    const _drawFieldMarkings = () => { ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = canvas.width * 0.005; const penaltyAreaWidth = canvas.width * 0.6; const penaltyAreaHeight = canvas.height * 0.4; const penaltyAreaX = (canvas.width - penaltyAreaWidth) / 2; ctx.strokeRect(penaltyAreaX, 0, penaltyAreaWidth, penaltyAreaHeight); const penaltySpotY = canvas.height * 0.25; ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.beginPath(); ctx.arc(canvas.width / 2, penaltySpotY, canvas.width * 0.006, 0, 2 * Math.PI); ctx.fill(); ctx.beginPath(); ctx.arc(canvas.width / 2, penaltySpotY, canvas.width * 0.15, 0.35, Math.PI - 0.35); ctx.stroke(); };
    const _drawGoal = () => { const goalFrontWidth = goal.width; const goalHeight = goal.height; const goalFrontX = goal.x; const goalDepth = goalHeight * 0.5; const postWidth = canvas.width * 0.012; const backPostX = goalFrontX + goalDepth * 0.3; const backPostWidth = goalFrontWidth - (goalDepth * 0.6); ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(goalFrontX, 0); ctx.lineTo(backPostX, 0); ctx.lineTo(backPostX, goalHeight); ctx.lineTo(goalFrontX, goalHeight); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(goalFrontX + goalFrontWidth, 0); ctx.lineTo(backPostX + backPostWidth, 0); ctx.lineTo(backPostX + backPostWidth, goalHeight); ctx.lineTo(goalFrontX + goalFrontWidth, goalHeight); ctx.fill(); ctx.stroke(); const postGradient = ctx.createLinearGradient(goalFrontX, 0, goalFrontX + postWidth, 0); postGradient.addColorStop(0, '#ddd'); postGradient.addColorStop(0.5, '#fff'); postGradient.addColorStop(1, '#ddd'); ctx.fillStyle = postGradient; ctx.fillRect(goalFrontX - postWidth, 0, postWidth, goalHeight); ctx.fillRect(goalFrontX + goalFrontWidth, 0, postWidth, goalHeight); ctx.fillRect(goalFrontX - postWidth, 0, goalFrontWidth + (postWidth * 2), postWidth); };
    const _drawBall = () => { const gradient = ctx.createRadialGradient(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, ball.x, ball.y, ball.radius * 1.5); gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(0.8, '#f0f0f0'); gradient.addColorStop(1, '#cccccc'); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI); ctx.fill(); ctx.closePath(); ctx.fillStyle = '#222222'; const panelSize = ball.radius * 0.3; ctx.beginPath(); ctx.moveTo(ball.x, ball.y - panelSize); ctx.lineTo(ball.x + panelSize * 0.95, ball.y - panelSize * 0.3); ctx.lineTo(ball.x + panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.95, ball.y - panelSize * 0.3); ctx.closePath(); ctx.fill(); };
    const _drawKeeper = () => { ctx.fillStyle = '#0052A2'; ctx.fillRect(keeper.x, keeper.y, keeper.width, keeper.height); ctx.fillStyle = '#FFFFFF'; const stripeWidth = keeper.width * 0.1; ctx.fillRect(keeper.x + keeper.width * 0.2, keeper.y, stripeWidth, keeper.height); ctx.fillRect(keeper.x + keeper.width * 0.45, keeper.y, stripeWidth, keeper.height); ctx.fillRect(keeper.x + keeper.width * 0.7, keeper.y, stripeWidth, keeper.height); };
    
    // Geçici atama
    drawPitch = _drawPitch;
    drawFieldMarkings = _drawFieldMarkings;
    drawGoal = _drawGoal;
    drawBall = _drawBall;
    drawKeeper = _drawKeeper;
};

game();
