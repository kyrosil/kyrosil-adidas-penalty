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
    let gameState = 'aiming'; // Oyunun durumu: 'aiming', 'shooting'

    const ball = {
        x: 0, y: 0, radius: 0,
        vx: 0, // Yatay hız
        vy: 0, // Dikey hız
        speed: 0 // Şutun hızı
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
        
        // Topun başlangıç konumunu ve hızını ayarla
        resetBall();
    };

    // YENİ: Topu başlangıç konumuna getiren fonksiyon
    const resetBall = () => {
        ball.radius = canvas.width * 0.025;
        ball.x = canvas.width / 2;
        ball.y = canvas.height * 0.8;
        ball.vx = 0;
        ball.vy = 0;
        ball.speed = canvas.width * 0.03; // Hızı canvas boyutuna göre ayarla
        gameState = 'aiming'; // Durumu nişan almaya ayarla
    };

    // --- Çizim Fonksiyonları (Değişiklik yok) ---
    const drawPitch = () => { /* ... kod aynı ... */ };
    const drawFieldMarkings = () => { /* ... kod aynı ... */ };
    const drawGoal = () => { /* ... kod aynı ... */ };
    const drawBall = () => { /* ... kod aynı ... */ };
    const drawAim = () => {
        if (!aimTarget.visible || gameState !== 'aiming') return; // Sadece nişan alırken çiz
        /* ... geri kalan kod aynı ... */
    };
    
    // --- Oyun Mantığı ---
    
    // YENİ: Şut çekme fonksiyonu
    const shoot = () => {
        if (gameState !== 'aiming') return; // Zaten şut çekilmişse tekrar çekme

        // Hedef ile top arasındaki mesafeyi ve yönü hesapla
        const dx = aimTarget.x - ball.x;
        const dy = aimTarget.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Hız vektörlerini hesapla
        ball.vx = (dx / distance) * ball.speed;
        ball.vy = (dy / distance) * ball.speed;

        gameState = 'shooting'; // Oyun durumunu 'şut çekiliyor' olarak değiştir
        aimTarget.visible = false; // Hedefi gizle
    };

    // YENİ: Topun pozisyonunu güncelleyen fonksiyon
    const updateBallPosition = () => {
        if (gameState === 'shooting') {
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Perspektif efekti: Top kaleye yaklaştıkça küçülmeli
            ball.radius *= 0.995; 

            // Şut bitti mi kontrolü (şimdilik basitçe ekran dışına çıkınca)
            if (ball.y < 0 || ball.x < 0 || ball.x > canvas.width) {
                console.log("Şut tamamlandı. Top resetleniyor.");
                resetBall(); // Topu ve oyunu sıfırla
            }
        }
    };
    
    // --- Olay Dinleyicileri (Input Handling) ---
    const setupEventListeners = () => {
        const updateAimPosition = (e) => {
            if (gameState !== 'aiming') return; // Şut çekilmişse nişan almayı engelle
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            aimTarget.x = clientX - rect.left;
            aimTarget.y = clientY - rect.top;
            aimTarget.visible = true;
        };

        canvas.addEventListener('mousemove', updateAimPosition);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateAimPosition(e); });
        
        // Fare canvas dışına çıktığında veya parmak kaldırıldığında hedefi gizle
        canvas.addEventListener('mouseleave', () => { if (gameState === 'aiming') aimTarget.visible = false; });
        
        // YENİ: Şutu tetikleyen olaylar
        canvas.addEventListener('click', shoot);
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault(); // Çift tıklama gibi istenmeyen olayları engelle
            shoot();
            aimTarget.visible = false;
        });

        window.addEventListener('resize', setCanvasDimensions);
    };

    // --- Oyun Döngüsü ---
    const gameLoop = () => {
        // 1. Güncelleme
        updateBallPosition(); // Topun pozisyonunu güncelle

        // 2. Çizim
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPitch();
        drawFieldMarkings();
        drawGoal();
        drawBall();
        drawAim();

        // 3. Döngüyü tekrarla
        requestAnimationFrame(gameLoop);
    };

    // --- Oyun Başlatma ---
    const init = (pData) => {
        playerData = pData;
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions();
        setupEventListeners();
        gameLoop();
    };
    
    window.addEventListener('game:start', (event) => {
        init(event.detail);
    });
};

// Çizim fonksiyonlarının içeriğini buraya ekleyelim (kısalık için yukarıda gizlendi)
game.toString = () => {
    const fullCode = game.toString();
    const drawPitchCode = `const drawPitch = () => {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#3a8f3a');
        gradient.addColorStop(1, '#2a7e2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };`;
    const drawFieldMarkingsCode = `const drawFieldMarkings = () => {
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
    };`;
    const drawGoalCode = `const drawGoal = () => {
        const goalFrontWidth = canvas.width * 0.35;
        const goalHeight = goalFrontWidth * 0.45;
        const goalDepth = goalHeight * 0.5;
        const goalFrontX = (canvas.width - goalFrontWidth) / 2;
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
    };`;
    const drawBallCode = `const drawBall = () => {
        const gradient = ctx.createRadialGradient(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, ball.x, ball.y, ball.radius * 1.5);
        gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(0.8, '#f0f0f0'); gradient.addColorStop(1, '#cccccc');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI); ctx.fill(); ctx.closePath();
        ctx.fillStyle = '#222222';
        const panelSize = ball.radius * 0.3;
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y - panelSize); ctx.lineTo(ball.x + panelSize * 0.95, ball.y - panelSize * 0.3); ctx.lineTo(ball.x + panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.6, ball.y + panelSize * 0.8); ctx.lineTo(ball.x - panelSize * 0.95, ball.y - panelSize * 0.3);
        ctx.closePath(); ctx.fill();
    };`;

    return fullCode.replace('/* ... kod aynı ... */', drawPitchCode)
                   .replace('/* ... kod aynı ... */', drawFieldMarkingsCode)
                   .replace('/* ... kod aynı ... */', drawGoalCode)
                   .replace('/* ... kod aynı ... */', drawBallCode);
};

game();
