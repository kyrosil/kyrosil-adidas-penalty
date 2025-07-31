console.log("game.js yüklendi.");

const game = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas elementi bulunamadı!");
        return;
    }

    const ctx = canvas.getContext('2d');

    // --- Oyun Elementlerinin Tanımları ---
    const ball = {
        x: 0,
        y: 0,
        radius: 0
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

        // Topun boyutunu ve konumunu canvas'a göre ayarla
        ball.radius = canvas.width * 0.025;
        ball.x = canvas.width / 2;
        ball.y = canvas.height * 0.8;
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

    // GÜNCELLENDİ: Daha gerçekçi, 3D perspektifli kale çizimi
    const drawGoal = () => {
        const goalFrontWidth = canvas.width * 0.35;
        const goalHeight = goalFrontWidth * 0.45;
        const goalDepth = goalHeight * 0.5;
        const goalFrontX = (canvas.width - goalFrontWidth) / 2;
        const postWidth = canvas.width * 0.012;

        const backPostX = goalFrontX + goalDepth * 0.3;
        const backPostWidth = goalFrontWidth - (goalDepth * 0.6);

        // Arka ve yan ağlar (perspektif hissi için)
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(goalFrontX, 0); // Sol ön
        ctx.lineTo(backPostX, 0); // Sol arka
        ctx.lineTo(backPostX, goalHeight); // Sol arka alt
        ctx.lineTo(goalFrontX, goalHeight); // Sol ön alt
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(goalFrontX + goalFrontWidth, 0); // Sağ ön
        ctx.lineTo(backPostX + backPostWidth, 0); // Sağ arka
        ctx.lineTo(backPostX + backPostWidth, goalHeight); // Sağ arka alt
        ctx.lineTo(goalFrontX + goalFrontWidth, goalHeight); // Sağ ön alt
        ctx.fill();
        ctx.stroke();

        // Kale Direkleri (Gradient ile 3D efekti)
        const postGradient = ctx.createLinearGradient(goalFrontX, 0, goalFrontX + postWidth, 0);
        postGradient.addColorStop(0, '#ddd');
        postGradient.addColorStop(0.5, '#fff');
        postGradient.addColorStop(1, '#ddd');
        ctx.fillStyle = postGradient;

        // Yan direkler
        ctx.fillRect(goalFrontX - postWidth, 0, postWidth, goalHeight);
        ctx.fillRect(goalFrontX + goalFrontWidth, 0, postWidth, goalHeight);
        // Üst direk
        ctx.fillRect(goalFrontX - postWidth, 0, goalFrontWidth + (postWidth * 2), postWidth);
    };

    // YENİ: Adidas tarzı, gölgeli top çizim fonksiyonu
    const drawBall = () => {
        // 3D efekti için gölgelendirme (Radial Gradient)
        const gradient = ctx.createRadialGradient(
            ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0, 
            ball.x, ball.y, ball.radius * 1.5
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.8, '#f0f0f0');
        gradient.addColorStop(1, '#cccccc');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        
        // Adidas tarzı paneller (basitleştirilmiş)
        ctx.fillStyle = '#222222';
        const panelSize = ball.radius * 0.3;

        // Merkez panel (pentagonu andıran şekil)
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y - panelSize);
        ctx.lineTo(ball.x + panelSize * 0.95, ball.y - panelSize * 0.3);
        ctx.lineTo(ball.x + panelSize * 0.6, ball.y + panelSize * 0.8);
        ctx.lineTo(ball.x - panelSize * 0.6, ball.y + panelSize * 0.8);
        ctx.lineTo(ball.x - panelSize * 0.95, ball.y - panelSize * 0.3);
        ctx.closePath();
        ctx.fill();
    };
    
    // Ana Sahne Çizim Fonksiyonu
    const drawScene = () => {
        drawPitch();
        drawFieldMarkings();
        drawGoal();
        drawBall(); // Topu çizme fonksiyonunu çağır
    };

    // --- Oyun Başlatma ---
    const init = (playerData) => {
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions();
        drawScene();
    };
    
    window.addEventListener('game:start', (event) => {
        init(event.detail);
    });

    window.addEventListener('resize', () => {
        setCanvasDimensions();
        drawScene();
    });
};

game();
