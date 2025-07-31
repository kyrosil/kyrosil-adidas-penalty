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

        if (canvasHeight > screenHeight * 0.9) {
            canvasHeight = screenHeight * 0.9;
            canvasWidth = canvasHeight * (16 / 9);
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    };

    const drawPitch = () => {
        ctx.fillStyle = '#2a7e2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.1, 0, 2 * Math.PI);
        ctx.stroke();

        console.log("Oyun alanı çizildi.");
    };

    const init = (playerData) => {
        console.log("Oyun başlatılıyor...", playerData);
        setCanvasDimensions();
        drawPitch();
    };
    
    window.addEventListener('game:start', (event) => {
        init(event.detail);
    });

    window.addEventListener('resize', () => {
        // Yeniden boyutlandırma sırasında tekrar init çağırmak yerine sadece boyutları ve çizimi yenile
        setCanvasDimensions();
        drawPitch();
    });
};

game();
