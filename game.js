console.log("game.js yüklendi.");

const game = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) { return; }
    const ctx = canvas.getContext('2d');

    // --- Oyun Akış Değişkenleri ---
    let playerData = {};
    let gameState = 'idle';
    let gamePhase = 'player_shot';
    let currentLevel = 1;
    let lives = 3;
    let message = { text: '', visible: false, color: '#FFF' };
    let gameReadyForInput = false;

    // --- Seviye Zorluk Ayarları ---
    const levelConfig = {
        1: { keeperSpeed: 0.012, aiShotSpeed: 0.025, aiAccuracy: 0.8 },
        2: { keeperSpeed: 0.015, aiShotSpeed: 0.028, aiAccuracy: 0.85 },
        3: { keeperSpeed: 0.018, aiShotSpeed: 0.030, aiAccuracy: 0.9 },
        4: { keeperSpeed: 0.020, aiShotSpeed: 0.032, aiAccuracy: 0.92 },
        5: { keeperSpeed: 0.022, aiShotSpeed: 0.033, aiAccuracy: 0.95 },
        6: { keeperSpeed: 0.025, aiShotSpeed: 0.035, aiAccuracy: 0.98 }
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
        message.visible = false; // Önceki mesajları temizle
        
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
            displayMessage(`LEVEL ${currentLevel}: ŞUTUNU ÇEK!`, '#FFFFFF', 0.05); // Yönlendirici Mesaj
        } else if (gamePhase === 'player_save') {
            gameState = 'save';
            ball.x = canvas.width / 2;
            ball.y = canvas.height * 0.25;
            ball.speed = canvas.width * config.aiShotSpeed;
            keeper.diveSpeed = canvas.width * 0.02;
            displayMessage("SIRA SENDE: KURTARIŞ YAP!", '#FFFFFF', 0.05); // Yönlendirici Mesaj
            setTimeout(() => aiShoot(config.aiAccuracy), 1500); // Oyuncunun mesajı okuması için bekle
        }
        setTimeout(() => { gameReadyForInput = true; }, 500);
    };

    // --- Çizim Fonksiyonları ---
    const drawPitch = () => { /* ... (öncekiyle aynı) ... */ };
    const drawFieldMarkings = () => { /* ... (öncekiyle aynı) ... */ };
    const drawGoal = () => { /* ... (öncekiyle aynı) ... */ };
    const drawBall = () => { /* ... (öncekiyle aynı) ... */ };
    const drawAim = () => { if (!aimTarget.visible || (gameState !== 'aiming' && gameState !== 'save')) return; /* ... */ };
    const drawKeeper = () => { /* ... (öncekiyle aynı) ... */ };
    const drawUI = () => { /* ... (öncekiyle aynı) ... */ };

    // --- Oyun Mantığı ve Güncellemeler ---
    const shoot = () => {
        if (gameState !== 'aiming' || !gameReadyForInput) return;
        message.visible = false; // Talimat mesajını kaldır
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
        message.visible = false; // Talimat mesajını kaldır
        gameReadyForInput = false;
        decideKeeperDive('player');
    };
    
    const aiShoot = (accuracy) => {
        // AI her zaman kaleye isabet ettirir, sadece nereye olacağı değişir
        const targetX = goal.x + (goal.width * (0.1 + Math.random() * 0.8));
        const targetY = goal.height * (Math.random() * 0.8);
        
        const dx = targetX - ball.x;
        const dy = targetY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        ball.vx = (dx / distance) * ball.speed;
        ball.vy = (dy / distance) * ball.speed;
        gameState = 'shooting';
    };

    const checkResult = () => {
        if (gameState !== 'shooting') return;
        const ballInGoalArea = ball.y < goal.height && ball.y > 0;
        if (!ballInGoalArea) return; // Sadece top kale çizgisine gelince kontrol et

        gameState = 'result'; // Sonucu değerlendir, oyunu durdur
        const collides = ball.x > keeper.x && ball.x < keeper.x + keeper.width && ball.y > keeper.y && ball.y < keeper.y + keeper.height;
        const isGoal = ball.x > goal.x && ball.x < goal.x + goal.width;
        
        if (gamePhase === 'player_shot') {
            if (isGoal && !collides) {
                displayMessage("GOOOL!", "#4CAF50");
                gamePhase = 'player_save'; // Bir sonraki aşamaya geç
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
                // Oyuncu kurtardı veya AI dışarı attı (ki artık atmayacak)
                displayMessage(collides ? "KURTARDIN!" : "AUT!", "#4CAF50");
                winLevel();
            }
        }
    };
    
    const winLevel = () => {
        displayMessage(`LEVEL ${currentLevel} TAMAMLANDI!`, "#FFC107");
        if (currentLevel === 2 || currentLevel === 4 || currentLevel === 6) {
            console.log(`ÖDÜL KAZANILDI: LEVEL ${currentLevel}`);
        }
        currentLevel++;
        if (currentLevel > 6) {
            displayMessage("OYUN BİTTİ! TEBRİKLER!", "#4CAF50");
        } else {
            gamePhase = 'player_shot';
            setTimeout(setupTurn, 2000);
        }
    };

    const loseLife = () => {
        lives--;
        if (lives > 0) {
            gamePhase = 'player_shot'; // Aynı levelde, şut çekme aşamasına dön
            setTimeout(setupTurn, 2000);
        } else {
            displayMessage("OYUN BİTTİ!", "#F44336");
        }
    };
    
    const displayMessage = (txt, color, size = 0.08) => {
        message.text = txt;
        message.color = color;
        message.size = size;
        message.visible = true;
    };
    
    // Diğer tüm fonksiyonlar (updateKeeper, updateBallPosition, setupEventListeners, gameLoop, init vb.)
    // öncekiyle aynı şekilde, tam içerikleriyle kalacak.

    const init = (pData) => {
        playerData = pData;
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions();
        setupTurn(); 
        setupEventListeners();
        gameLoop();
    };

    // ... (Diğer tüm fonksiyonların tam içeriği buraya gelecek, önceki cevaptaki gibi) ...
    // ... Bu sefer kodun tamamını eksiksiz olarak aşağıya ekliyorum. ...
};

// **Aşağıdaki tam ve eksiksiz kodu kullanın.**
const fullGameCode = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) { console.error("Canvas elementi bulunamadı!"); return; }
    const ctx = canvas.getContext('2d');
    let playerData = {};
    let gameState = 'idle';
    let gamePhase = 'player_shot';
    let currentLevel = 1;
    let lives = 3;
    let message = { text: '', visible: false, color: '#FFF', size: 0.08 };
    let gameReadyForInput = false;
    const levelConfig = {
        1: { keeperSpeed: 0.012, aiShotSpeed: 0.025 },
        2: { keeperSpeed: 0.015, aiShotSpeed: 0.028 },
        3: { keeperSpeed: 0.018, aiShotSpeed: 0.030 },
        4: { keeperSpeed: 0.020, aiShotSpeed: 0.032 },
        5: { keeperSpeed: 0.022, aiShotSpeed: 0.033 },
        6: { keeperSpeed: 0.025, aiShotSpeed: 0.035 }
    };
    const ball = { x: 0, y: 0, radius: 0, vx: 0, vy: 0, speed: 0 };
    const keeper = { x: 0, y: 0, width: 0, height: 0, state: 'idle', diveTarget: { x: 0, y: 0 }, diveSpeed: 0, idleAnimTime: 0 };
    const goal = { x: 0, width: 0, height: 0 };
    const aimTarget = { x: 0, y: 0, visible: false };

    const setCanvasDimensions = () => {
        const screenWidth = window.innerWidth; const screenHeight = window.innerHeight;
        let canvasWidth = Math.min(screenWidth * 0.9, 800);
        let canvasHeight = canvasWidth * (9 / 16);
        if (canvasHeight > screenHeight * 0.95) { canvasHeight = screenHeight * 0.95; canvasWidth = canvasHeight * (16 / 9); }
        canvas.width = canvasWidth; canvas.height = canvasHeight;
    };

    const setupTurn = () => {
        const config = levelConfig[currentLevel]; message.visible = false; ball.radius = canvas.width * 0.025; ball.vx = 0; ball.vy = 0;
        goal.width = canvas.width * 0.35; goal.height = goal.width * 0.45; goal.x = (canvas.width - goal.width) / 2;
        keeper.width = canvas.width * 0.1; keeper.height = canvas.width * 0.04; keeper.y = goal.height - keeper.height; keeper.state = 'idle';
        if (gamePhase === 'player_shot') {
            gameState = 'aiming'; ball.x = canvas.width / 2; ball.y = canvas.height * 0.8; ball.speed = canvas.width * 0.03; keeper.diveSpeed = canvas.width * config.keeperSpeed;
            displayMessage(`LEVEL ${currentLevel}: ŞUTUNU ÇEK!`, '#FFFFFF', 0.05);
        } else if (gamePhase === 'player_save') {
            gameState = 'save'; ball.x = canvas.width / 2; ball.y = canvas.height * 0.25; ball.speed = canvas.width * config.aiShotSpeed; keeper.diveSpeed = canvas.width * 0.02;
            displayMessage("SIRA SENDE: KURTARIŞ YAP!", '#FFFFFF', 0.05);
            setTimeout(() => aiShoot(), 1500);
        }
        gameReadyForInput = false; setTimeout(() => { gameReadyForInput = true; }, 500);
    };

    const drawPitch = () => { const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, '#3a8f3a'); gradient.addColorStop(1, '#2a7e2a'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); };
    const drawFieldMarkings = () => { ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; ctx.lineWidth = canvas.width * 0.005; const pA = { w: canvas.width * 0.6, h: canvas.height * 0.4, x: (canvas.width - canvas.width * 0.6) / 2 }; ctx.strokeRect(pA.x, 0, pA.w, pA.h); const pS_Y = canvas.height * 0.25; ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; ctx.beginPath(); ctx.arc(canvas.width / 2, pS_Y, canvas.width * 0.006, 0, 2 * Math.PI); ctx.fill(); ctx.beginPath(); ctx.arc(canvas.width / 2, pS_Y, canvas.width * 0.15, 0.35, Math.PI - 0.35); ctx.stroke(); };
    const drawGoal = () => { const gF = { w: goal.width, h: goal.height, x: goal.x }; const gD = gF.h * 0.5; const pW = canvas.width * 0.012; const bPX = gF.x + gD * 0.3; const bPW = gF.w - (gD * 0.6); ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gF.x, 0); ctx.lineTo(bPX, 0); ctx.lineTo(bPX, gF.h); ctx.lineTo(gF.x, gF.h); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(gF.x + gF.w, 0); ctx.lineTo(bPX + bPW, 0); ctx.lineTo(bPX + bPW, gF.h); ctx.lineTo(gF.x + gF.w, gF.h); ctx.fill(); ctx.stroke(); const pG = ctx.createLinearGradient(gF.x, 0, gF.x + pW, 0); pG.addColorStop(0, '#ddd'); pG.addColorStop(0.5, '#fff'); pG.addColorStop(1, '#ddd'); ctx.fillStyle = pG; ctx.fillRect(gF.x - pW, 0, pW, gF.h); ctx.fillRect(gF.x + gF.w, 0, pW, gF.h); ctx.fillRect(gF.x - pW, 0, gF.w + (pW * 2), pW); };
    const drawBall = () => { const grad = ctx.createRadialGradient(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, ball.x, ball.y, ball.radius * 1.5); grad.addColorStop(0, '#ffffff'); grad.addColorStop(0.8, '#f0f0f0'); grad.addColorStop(1, '#cccccc'); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI); ctx.fill(); ctx.closePath(); ctx.fillStyle = '#222222'; const pS = ball.radius * 0.3; ctx.beginPath(); ctx.moveTo(ball.x, ball.y - pS); ctx.lineTo(ball.x + pS * 0.95, ball.y - pS * 0.3); ctx.lineTo(ball.x + pS * 0.6, ball.y + pS * 0.8); ctx.lineTo(ball.x - pS * 0.6, ball.y + pS * 0.8); ctx.lineTo(ball.x - pS * 0.95, ball.y - pS * 0.3); ctx.closePath(); ctx.fill(); };
    const drawAim = () => { if (!aimTarget.visible || (gameState !== 'aiming' && gameState !== 'save')) return; ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(aimTarget.x, aimTarget.y, 15, 0, 2 * Math.PI); ctx.moveTo(aimTarget.x - 10, aimTarget.y); ctx.lineTo(aimTarget.x + 10, aimTarget.y); ctx.moveTo(aimTarget.x, aimTarget.y - 10); ctx.lineTo(aimTarget.x, aimTarget.y + 10); ctx.stroke(); };
    const drawKeeper = () => { ctx.fillStyle = '#0052A2'; ctx.fillRect(keeper.x, keeper.y, keeper.width, keeper.height); ctx.fillStyle = '#FFFFFF'; const sW = keeper.width * 0.1; ctx.fillRect(keeper.x + keeper.width * 0.2, keeper.y, sW, keeper.height); ctx.fillRect(keeper.x + keeper.width * 0.45, keeper.y, sW, keeper.height); ctx.fillRect(keeper.x + keeper.width * 0.7, keeper.y, sW, keeper.height); };
    const drawUI = () => { ctx.fillStyle = 'white'; ctx.font = `bold ${canvas.width * 0.03}px Roboto`; ctx.textAlign = 'left'; ctx.fillText(`Level: ${currentLevel}`, 20, 40); ctx.textAlign = 'right'; ctx.fillText(`Kalan Hak: ${lives}`, canvas.width - 20, 40); if (message.visible) { ctx.fillStyle = message.color; ctx.font = `bold ${canvas.width * message.size}px Roboto`; ctx.textAlign = 'center'; ctx.shadowColor = 'black'; ctx.shadowBlur = 10; ctx.fillText(message.text, canvas.width / 2, canvas.height / 2); ctx.shadowBlur = 0; } };

    const shoot = () => { if (gameState !== 'aiming' || !gameReadyForInput) return; message.visible = false; gameReadyForInput = false; const dx = aimTarget.x - ball.x, dy = aimTarget.y - ball.y, dist = Math.sqrt(dx * dx + dy * dy); ball.vx = (dx / dist) * ball.speed; ball.vy = (dy / dist) * ball.speed; gameState = 'shooting'; aimTarget.visible = false; decideKeeperDive('ai'); };
    const playerDive = () => { if (gameState !== 'save' || !gameReadyForInput) return; message.visible = false; gameReadyForInput = false; decideKeeperDive('player'); };
    const decideKeeperDive = (who) => { let targetX; if (who === 'ai') { const timeToGoal = Math.abs((ball.y - goal.height) / ball.vy); const finalBallX = ball.x + ball.vx * timeToGoal; const errorMargin = goal.width * 0.4 * (Math.random() - 0.5); targetX = finalBallX + errorMargin; } else { targetX = aimTarget.x; } targetX = Math.max(goal.x, Math.min(targetX, goal.x + goal.width - keeper.width)); keeper.diveTarget.x = targetX; keeper.state = 'diving'; };
    const aiShoot = () => { const targetX = goal.x + (goal.width * (0.1 + Math.random() * 0.8)); const targetY = goal.height * (Math.random() * 0.8); const dx = targetX - ball.x, dy = targetY - ball.y, dist = Math.sqrt(dx * dx + dy * dy); ball.vx = (dx / dist) * ball.speed; ball.vy = (dy / dist) * ball.speed; gameState = 'shooting'; };
    const updateKeeper = () => { if (keeper.state === 'idle' && gamePhase === 'player_shot') { keeper.idleAnimTime += 0.02; const moveRange = (goal.width - keeper.width) / 2; keeper.x = goal.x + moveRange + (Math.sin(keeper.idleAnimTime) * moveRange); } else if (keeper.state === 'diving') { const dx = keeper.diveTarget.x - keeper.x; if (Math.abs(dx) > keeper.diveSpeed) { keeper.x += Math.sign(dx) * keeper.diveSpeed; } } };
    const checkResult = () => { if (gameState !== 'shooting') return; const ballInGoalArea = ball.y < goal.height && ball.y > 0; if (!ballInGoalArea) return; gameState = 'result'; const collides = ball.x > keeper.x && ball.x < keeper.x + keeper.width && ball.y > keeper.y && ball.y < keeper.y + keeper.height; const isGoal = ball.x > goal.x && ball.x < goal.x + goal.width; if (gamePhase === 'player_shot') { if (isGoal && !collides) { displayMessage("GOOOL!", "#4CAF50"); gamePhase = 'player_save'; setTimeout(setupTurn, 1500); } else { displayMessage(collides ? "KURTARIŞ!" : "AUT!", "#F44336"); loseLife(); } } else if (gamePhase === 'player_save') { if (isGoal && !collides) { displayMessage("GOL YEDİN!", "#F44336"); loseLife(); } else { displayMessage(collides ? "KURTARDIN!" : "AUT!", "#4CAF50"); winLevel(); } } };
    const winLevel = () => { displayMessage(`LEVEL ${currentLevel} TAMAMLANDI!`, "#FFC107"); if ([2, 4, 6].includes(currentLevel)) { console.log(`ÖDÜL KAZANILDI: LEVEL ${currentLevel}`); } currentLevel++; if (currentLevel > 6) { displayMessage("OYUN BİTTİ! TEBRİKLER!", "#4CAF50"); } else { gamePhase = 'player_shot'; setTimeout(setupTurn, 2000); } };
    const loseLife = () => { lives--; if (lives > 0) { gamePhase = 'player_shot'; setTimeout(setupTurn, 2000); } else { displayMessage("OYUN BİTTİ!", "#F44336"); } };
    const displayMessage = (txt, color, size = 0.08) => { message.text = txt; message.color = color; message.size = size; message.visible = true; };
    const updateBallPosition = () => { if (gameState === 'shooting') { ball.x += ball.vx; ball.y += ball.vy; ball.radius *= 0.995; checkResult(); } };
    const setupEventListeners = () => { const updateAimPos = (e) => { if (!gameReadyForInput || (gameState !== 'aiming' && gameState !== 'save')) return; const rect = canvas.getBoundingClientRect(); const clientX = e.clientX || e.touches[0].clientX; const clientY = e.clientY || e.touches[0].clientY; aimTarget.x = clientX - rect.left; aimTarget.y = clientY - rect.top; aimTarget.visible = true; }; const handleClick = (e) => { if (gameState === 'aiming') { shoot(); } else if (gameState === 'save') { playerDive(); } }; canvas.addEventListener('mousemove', updateAimPos); canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateAimPos(e); }); canvas.addEventListener('mouseleave', () => { aimTarget.visible = false; }); canvas.addEventListener('click', handleClick); canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleClick(); aimTarget.visible = false; }); window.addEventListener('resize', () => { setCanvasDimensions(); setupTurn(); }); };
    const gameLoop = () => { updateKeeper(); updateBallPosition(); ctx.clearRect(0, 0, canvas.width, canvas.height); drawPitch(); drawFieldMarkings(); drawGoal(); drawKeeper(); drawBall(); drawAim(); drawUI(); requestAnimationFrame(gameLoop); };
    const init = (pData) => { playerData = pData; console.log("Oyun başlatılıyor...", pData); setCanvasDimensions(); setupTurn(); setupEventListeners(); gameLoop(); };
    window.addEventListener('game:start', (event) => { init(event.detail); });
};
fullGameCode();
