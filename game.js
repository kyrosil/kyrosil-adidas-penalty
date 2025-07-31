console.log("game.js yüklendi.");

const game = () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas elementi bulunamadı!");
        return;
    }

    const ctx = canvas.getContext('2d');

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

    // --- Çizim Fonksiyonları ---

    const drawPitch = () => {
        // Çim Rengi - Daha gerçekçi bir görünüm için gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#3a8f3a');
        gradient.addColorStop(1, '#2a7e2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawFieldMarkings = () => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = canvas.width * 0.005; // Çizgi kalınlığını orantısal yap

        // Penaltı Alanı (Büyük Dikdörtgen)
        const penaltyAreaWidth = canvas.width * 0.6;
        const penaltyAreaHeight = canvas.height * 0.4;
        const penaltyAreaX = (canvas.width - penaltyAreaWidth) / 2;
        ctx.strokeRect(penaltyAreaX, 0, penaltyAreaWidth, penaltyAreaHeight);
        
        // Penaltı Noktası
        const penaltySpotY = canvas.height * 0.25;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, penaltySpotY, canvas.width * 0.006, 0, 2 * Math.PI);
        ctx.fill();

        // Penaltı Yayı
        ctx.beginPath();
        ctx.arc(canvas.width / 2, penaltySpotY, canvas.width * 0.15, 0.35, Math.PI - 0.35); // Yayın açılarını ayarla
        ctx.stroke();
    };

    const drawGoal = () => {
        const goalWidth = canvas.width * 0.35;
        const goalHeight = goalWidth * 0.4;
        const goalX = (canvas.width - goalWidth) / 2;
        const postWidth = canvas.width * 0.01; // Direk kalınlığı

        // Kalenin içi (derinlik hissi için koyu)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(goalX, 0, goalWidth, goalHeight - (postWidth / 2));
        
        // Kale Ağı (Net)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        const step = 10;
        for (let i = step; i < goalWidth; i += step) {
            // Dikey ve yatay çizgiler
            ctx.beginPath();
            ctx.moveTo(goalX + i, 0);
            ctx.lineTo(goalX + i, goalHeight);
            ctx.stroke();
        }
        for (let i = step; i < goalHeight; i += step) {
            ctx.beginPath();
            ctx.moveTo(goalX, i);
            ctx.lineTo(goalX + goalWidth, i);
            ctx.stroke();
        }
        
        // Kale Direkleri (Üst ve yan direkler)
        ctx.fillStyle = '#f9f9f9'; // Hafif kırık beyaz
        // Üst direk
        ctx.fillRect(goalX - (postWidth / 2), goalHeight - postWidth, goalWidth + postWidth, postWidth);
        // Sol direk
        ctx.fillRect(goalX - (postWidth / 2), 0, postWidth, goalHeight - postWidth);
        // Sağ direk
        ctx.fillRect(goalX + goalWidth - (postWidth / 2), 0, postWidth, goalHeight - postWidth);
    };
    
    // Ana Sahne Çizim Fonksiyonu
    const drawScene = () => {
        drawPitch();
        drawFieldMarkings();
        drawGoal();
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
        drawScene(); // Ekran yeniden boyutlandığında sahneyi tekrar çiz
    });
};

game();
