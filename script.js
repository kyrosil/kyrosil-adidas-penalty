function setLanguage(lang) {
  const texts = {
    tr: {
      title: "Kyrosil x Adidas: Penaltı Shoot",
      desc: "Yapay zekâya karşı mücadele et, ödülleri kazan!",
      email: "Adidas e-posta adresi",
      country: "Ülke",
      username: "Instagram veya EU Portal kullanıcı adı",
      consent: "KVKK onayını kabul ediyorum.",
      start: "Başla"
    },
    en: {
      title: "Kyrosil x Adidas: Penalty Shoot",
      desc: "Defeat the Adidas AI and win rewards!",
      email: "Adidas website registered email",
      country: "Country",
      username: "Instagram or EU Portal username",
      consent: "I agree to GDPR terms.",
      start: "Start"
    }
  };

  const t = texts[lang];
  document.getElementById("gameTitle").textContent = t.title;
  document.getElementById("gameDesc").textContent = t.desc;
  document.getElementById("email").placeholder = t.email;
  document.getElementById("country").placeholder = t.country;
  document.getElementById("username").placeholder = t.username;
  document.getElementById("consentLabel").textContent = t.consent;
  document.getElementById("startButton").textContent = t.start;
}

document.getElementById("playerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  document.getElementById("playerForm").style.display = "none";
  document.getElementById("gameScene").style.display = "block";
  // İleride Three.js ile oyun sahnesi buraya gelecek!
});
