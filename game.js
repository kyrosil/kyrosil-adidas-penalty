// Önce Three.js sahnesi kurulur

let scene, camera, renderer, ball, goal;
let level = 1;
let currentTurn = 'kyrosil'; // AI alternates

initScene();
animate();

// Sahne kurulumu
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('gameContainer').appendChild(renderer.domElement);

  // Zemin
  const groundGeometry = new THREE.PlaneGeometry(20, 20);
  const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Kale
  const goalGeometry = new THREE.BoxGeometry(4, 2, 0.1);
  const goalMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  goal = new THREE.Mesh(goalGeometry, goalMaterial);
  goal.position.set(0, 1, -6);
  scene.add(goal);

  // Top
  const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.position.set(0, 0.3, 0);
  scene.add(ball);

  document.addEventListener('click', handleShot);
}

// Oyun döngüsü
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Basit şut simülasyonu
function handleShot() {
  if (currentTurn === 'kyrosil') {
    // Oyuncu şutu: rastgele yön
    const xDir = (Math.random() - 0.5) * 4;
    shootBall(xDir);
    currentTurn = 'adidas';
  } else {
    // AI şutu: seviye bazlı hedef
    const xDir = level >= 2 ? (Math.random() > 0.5 ? 2 : -2) : (Math.random() - 0.5) * 2;
    shootBall(xDir);
    currentTurn = 'kyrosil';
    levelUpCheck();
  }
}

// Şut hareketi
function shootBall(xDirection) {
  ball.position.set(0, 0.3, 0);
  let z = 0;
  const interval = setInterval(() => {
    z -= 0.2;
    ball.position.x += xDirection * 0.02;
    ball.position.z = z;
    if (z <= -6) clearInterval(interval);
  }, 30);
}

// Level geçiş ve ödül tetikleme
function levelUpCheck() {
  level++;
  const gameText = document.getElementById("gameText");
  if (level === 3) {
    gameText.textContent = currentLanguage === 'tr'
      ? 'Seviye 2 tamamlandı! Ödül ekranı açılıyor...'
      : 'Level 2 completed! Reward screen opening...';

    const email = document.getElementById("email").value;
    const country = document.getElementById("country").value;
    const username = document.getElementById("username").value;

    const subject = currentLanguage === "tr" ? "Tebrikler!" : "Congratulations!";
    const body = encodeURIComponent(
      `Level 2 tamamlandı.\nMail: ${email}\nÜlke: ${country}\nKullanıcı adı: ${username}\nÖdül: ${currentLanguage === "tr" ? "1000 TL Hediye Çeki" : "€20 Gift Voucher"}`
    );

    setTimeout(() => {
      window.location.href = `mailto:adidasgiveaway@kyrosil.eu?subject=${subject}&body=${body}`;
    }, 3000);
  } else {
    gameText.textContent = currentLanguage === 'tr'
      ? `Seviye ${level} başlıyor...`
      : `Level ${level} begins...`;
  }
}
