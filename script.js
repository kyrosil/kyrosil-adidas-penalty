let currentLanguage = 'tr';

const translations = {
  tr: {
    title: "Kyrosil x Adidas: Penaltı Shoot",
    subtitle: "Yapay zekâya karşı mücadele et, ödülleri kazan!",
    labelEmail: "Adidas kayıtlı e-posta adresi:",
    labelCountry: "Ülkeniz (Adidas bölgesi):",
    labelUsername: "Instagram veya EU Portal kullanıcı adı:",
    consentText: "KVKK kapsamında kişisel verilerimin işlenmesini kabul ediyorum.",
    startBtn: "Başla",
    rewards: ["1000 TL hediye çeki", "2500 TL hediye çeki", "10.000 TL hediye çeki"],
    rewardNote: "2 / 4 / 6. seviyeyi tamamladıktan sonra adidasgiveaway@kyrosil.eu adresine e-posta gönderilecektir."
  },
  en: {
    title: "Kyrosil x Adidas: Penalty Shoot",
    subtitle: "Defeat the Adidas AI and win rewards!",
    labelEmail: "Adidas website registered email:",
    labelCountry: "Country (Adidas region):",
    labelUsername: "Instagram or EU Portal username:",
    consentText: "I agree to the processing of my personal data under GDPR.",
    startBtn: "Start",
    rewards: ["€20 gift voucher", "€50 gift voucher", "€200 gift voucher"],
    rewardNote: "After completing Levels 2 / 4 / 6, you'll be directed to send a reward claim to adidasgiveaway@kyrosil.eu."
  }
};

function setLanguage(lang) {
  currentLanguage = lang;
  const t = translations[lang];

  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("labelEmail").textContent = t.labelEmail;
  document.getElementById("labelCountry").textContent = t.labelCountry;
  document.getElementById("labelUsername").textContent = t.labelUsername;
  document.getElementById("consentText").textContent = t.consentText;
  document.getElementById("startBtn").textContent = t.startBtn;

  const rewardList = document.getElementById("rewardList");
  rewardList.innerHTML = "";
  t.rewards.forEach((rwd, i) => {
    rewardList.innerHTML += `<li><strong>${lang === "tr" ? "Seviye" : "Level"} ${i * 2 + 2}:</strong> ${rwd}</li>`;
  });
  document.getElementById("rewardDesc").textContent = t.rewardNote;
}

// Başlangıç dili
setLanguage(currentLanguage);

// Form gönderimi
document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();
  document.getElementById("userForm").style.display = "none";
  document.querySelector(".rewards").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";
  startGame(); // Oyunu başlatan fonksiyon
});

// Demo oyun mantığı
let level = 1;
function startGame() {
  const gameText = document.getElementById("gameText");

  gameText.textContent = currentLanguage === "tr"
    ? `Seviye ${level} başlıyor... Kyrosil ve Adidas sırayla penaltı atıyor!`
    : `Level ${level} begins... Kyrosil and Adidas take turns shooting!`;

  // Demo: 2. seviye sonunda ödül tetikleme
  if (level === 2) {
    const form = {
      email: document.getElementById("email").value,
      country: document.getElementById("country").value,
      username: document.getElementById("username").value
    };
    const subject = currentLanguage === "tr" ? "Tebrikler!" : "Congratulations!";
    const body = encodeURIComponent(
      `${currentLanguage === "tr" ? "Kyrosil x Adidas Penaltı Shoot oyununu başarıyla tamamladınız." : "You have successfully completed Kyrosil x Adidas Penalty Shoot."}\nLevel: 2\nMail: ${form.email}\nÜlke: ${form.country}\nKullanıcı adı: ${form.username}\nÖdül: ${currentLanguage === "tr" ? "1000 TL hediye çeki" : "€20 gift voucher"}`
    );
    setTimeout(() => {
      window.location.href = `mailto:adidasgiveaway@kyrosil.eu?subject=${subject}&body=${body}`;
    }, 3000);
  }

  level++;
}
