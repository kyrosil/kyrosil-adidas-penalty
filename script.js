// Tüm kodun, sayfa tamamen yüklendikten sonra çalışmasını sağlar.
document.addEventListener('DOMContentLoaded', () => {

    // --- Dil Çevirileri için Nesne ---
    const translations = {
        'tr': {
            gameTitle: 'Kyrosil x Adidas Penaltı Shoot',
            gameDescription: 'Sırayla penaltı atılacak bu oyunda Kyrosil olarak Adidas\'a meydan oku! Her level 3 tur sürer. 2, 4 ve 6. levellerde muhteşem ödüller seni bekliyor. Günlük 3 oynama hakkın var.',
            emailLabel: 'Adidas Mail Adresi',
            countryLabel: 'Ülke',
            selectCountry: '-- Ülke Seçin --',
            usernameLabel: 'EU Portal / Instagram Kullanıcı Adı',
            consentLabel: 'Kişisel verilerimin işlenmesini onaylıyorum (KVKK).',
            startGame: 'Oyuna Başla',
            rewardsTitle: 'Ödüller',
            reward1: '<strong>Seviye 2:</strong> 20€ veya 1000 TL Hediye Çeki',
            reward2: '<strong>Seviye 4:</strong> 50€ veya 2500 TL Hediye Çeki',
            reward3: '<strong>Seviye 6:</strong> 200€ veya 10.000 TL Hediye Çeki',
            limitReached: 'Bugünkü 3 oynama hakkınızın tümünü kullandınız. Lütfen yarın tekrar deneyin!'
        },
        'en': {
            gameTitle: 'Kyrosil x Adidas Penalty Shootout',
            gameDescription: 'Challenge Adidas as Kyrosil in this turn-based penalty shootout! Each level has 3 rounds. Amazing prizes await you at levels 2, 4, and 6. You have 3 plays per day.',
            emailLabel: 'Adidas Email Address',
            countryLabel: 'Country',
            selectCountry: '-- Select Country --',
            usernameLabel: 'EU Portal / Instagram Username',
            consentLabel: 'I consent to the processing of my personal data (GDPR).',
            startGame: 'Start Game',
            rewardsTitle: 'Rewards',
            reward1: '<strong>Level 2:</strong> €20 or 1000 TL Gift Voucher',
            reward2: '<strong>Level 4:</strong> €50 or 2500 TL Gift Voucher',
            reward3: '<strong>Level 6:</strong> €200 or 10.000 TL Gift Voucher',
            limitReached: 'You have used all of your 3 plays for today. Please try again tomorrow!'
        }
    };

    // YENİ: Avrupa ülkeleri listesi
    const en_euCountries = [
        { code: 'TR', name: 'Turkey' }, { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' },
        { code: 'ES', name: 'Spain' }, { code: 'IT', name: 'Italy' }, { code: 'GB', name: 'United Kingdom' },
        { code: 'NL', name: 'Netherlands' }, { code: 'BE', name: 'Belgium' }, { code: 'PT', name: 'Portugal' },
        { code: 'SE', name: 'Sweden' }, { code: 'AT', name: 'Austria' }, { code: 'CH', name: 'Switzerland' },
        { code: 'PL', name: 'Poland' }, { code: 'GR', name: 'Greece' }, { code: 'IE', name: 'Ireland' },
        { code: 'DK', name: 'Denmark' }, { code: 'FI', name: 'Finland' }, { code: 'NO', name: 'Norway' },
        // Diğer Avrupa ülkeleri buraya eklenebilir...
    ];
    const tr_countries = [
        { code: 'TR', name: 'Türkiye' }
    ];

    // --- HTML Elementlerini Seçme ---
    const langButtons = document.querySelectorAll('.lang-switcher button');
    const form = document.getElementById('player-info-form');
    const inputs = form.querySelectorAll('input, select');
    const startGameBtn = document.getElementById('start-game-btn');
    const elementsToTranslate = document.querySelectorAll('[data-lang-key]');
    const countrySelect = document.getElementById('country'); // Ülke dropdown'ını seç

    // YENİ: Ülke listesini dinamik olarak dolduran fonksiyon
    const populateCountries = (lang) => {
        const countries = (lang === 'tr') ? tr_countries : en_euCountries;
        countrySelect.innerHTML = ''; // Mevcut seçenekleri temizle

        // Varsayılan "Ülke Seçin" seçeneğini ekle
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = translations[lang].selectCountry;
        countrySelect.appendChild(defaultOption);
        
        // Listeden ülkeleri ekle
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    };

    // --- Dil Değiştirme Fonksiyonu (GÜNCELLENDİ) ---
    const changeLanguage = (lang) => {
        elementsToTranslate.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            if (translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            }
        });

        // GÜNCELLEME: Ülke listesini seçilen dile göre yeniden doldur
        populateCountries(lang);

        document.querySelector('.lang-switcher .active').classList.remove('active');
        document.getElementById(`lang-${lang}`).classList.add('active');
        localStorage.setItem('preferredLanguage', lang);
        
        // Dil değiştiğinde formun geçerliliğini tekrar kontrol et
        validateForm();
    };

    // --- Form Doğrulama Fonksiyonu ---
    const validateForm = () => {
        let isValid = true;
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (!input.checked) isValid = false;
            } else {
                if (input.value.trim() === '') isValid = false;
            }
        });
        startGameBtn.disabled = !isValid;
    };

    // --- Günlük Oynama Hakkı Kontrolü ---
    const checkPlayLimit = () => {
        const today = new Date().toISOString().split('T')[0];
        const playData = JSON.parse(localStorage.getItem('kyrosilAdidasPlayData'));
        if (playData && playData.date === today && playData.count >= 3) {
            alert(translations[localStorage.getItem('preferredLanguage') || 'tr'].limitReached);
            form.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
            return false;
        }
        return true;
    };
    
    // --- Oynama Hakkını Güncelleme Fonksiyonu ---
    const updatePlayCount = () => {
        const today = new Date().toISOString().split('T')[0];
        let playData = JSON.parse(localStorage.getItem('kyrosilAdidasPlayData'));
        if (playData && playData.date === today) {
            playData.count++;
        } else {
            playData = { date: today, count: 1 };
        }
        localStorage.setItem('kyrosilAdidasPlayData', JSON.stringify(playData));
    };

    // --- Olay Dinleyicilerini (Event Listeners) Ayarlama ---
    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            changeLanguage(button.id.split('-')[1]);
        });
    });
    form.addEventListener('input', validateForm);
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (checkPlayLimit()) {
            updatePlayCount();
            const playerData = {
                email: document.getElementById('email').value,
                country: countrySelect.value,
                username: document.getElementById('username').value,
                lang: localStorage.getItem('preferredLanguage') || 'tr'
            };
            console.log('Oyun Başlatılıyor! Oyuncu Bilgileri:', playerData);
            alert('Oyun Başlıyor!');
            // TODO: Modül 2'ye geçiş kodu buraya gelecek.
        }
    });

    // --- Başlangıç Ayarları ---
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'tr';
    changeLanguage(preferredLanguage); // Bu fonksiyon artık ülke listesini de dolduracak
    checkPlayLimit();
    validateForm();
});
