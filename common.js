// Генерация звёзд
function initStars() {
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const x = Math.random() * 100;
        const y = Math.random() * 85; 
        
        const size = Math.random() * 2 + 1;
        const duration = Math.random() * 3 + 1;
        
        star.style.left = `${x}vw`;
        star.style.top = `${y}vh`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.setProperty('--duration', `${duration}s`);
        
        starsContainer.appendChild(star);
    }

    // Секретная звезда
    const secretStar = document.createElement('div');
    secretStar.className = 'star secret-star';
    secretStar.style.position = 'fixed';
    secretStar.style.left = '85vw';
    secretStar.style.top = '15vh';
    secretStar.style.width = '10px';
    secretStar.style.height = '10px';
    secretStar.style.zIndex = '9999';
    secretStar.style.cursor = 'pointer';
    secretStar.title = "Что это за яркая звездочка?";
    
    secretStar.addEventListener('click', () => {
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#fde047', '#fbbf24', '#ffffff'],
                zIndex: 10000
            });
        }
        
        const modal = document.getElementById('easter-egg-modal');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('.glass-card').classList.remove('scale-95');
                modal.querySelector('.glass-card').classList.add('scale-100');
            }, 10);
        }
    });
    document.body.appendChild(secretStar);
}

function closeEasterEgg() {
    const modal = document.getElementById('easter-egg-modal');
    if (modal) {
        modal.querySelector('.glass-card').classList.add('scale-95');
        modal.querySelector('.glass-card').classList.remove('scale-100');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Счётчик дней
function initDateCounter() {
    const counterEl = document.getElementById('days-counter');
    if (!counterEl) return;
    
    // Новая дата: 21 апреля 2026 года
    const startDate = new Date('2026-04-21T00:00:00');
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    counterEl.textContent = diffDays;
}

// Фоновая музыка
function initBackgroundAudio() {
    let bgAudio = document.getElementById('bg-audio');
    if (!bgAudio) {
        bgAudio = document.createElement('audio');
        bgAudio.id = 'bg-audio';
        bgAudio.src = 'Audios/bg_music.mp3';
        bgAudio.loop = true;
        document.body.appendChild(bgAudio);
    }
    bgAudio.volume = 0.2;
    
    // Пытаемся запустить музыку, если разблокировано
    if (sessionStorage.getItem('isUnlocked') === 'true') {
        const playPromise = bgAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Браузер заблокировал автовоспроизведение, ждем клика
                const playOnInteraction = () => {
                    bgAudio.play().catch(()=>{});
                    document.removeEventListener('click', playOnInteraction);
                };
                document.addEventListener('click', playOnInteraction);
            });
        }
    }
}

// Плавное изменение громкости фона
function fadeVolume(audio, targetVolume, durationMs) {
    if (!audio) return;
    if (audio._fadeInterval) clearInterval(audio._fadeInterval);
    const startVolume = audio.volume;
    const steps = 40;
    const stepTime = durationMs / steps;
    const delta = (targetVolume - startVolume) / steps;
    let currentStep = 0;
    audio._fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(1, Math.max(0, startVolume + delta * currentStep));
        if (currentStep >= steps) {
            audio.volume = targetVolume;
            clearInterval(audio._fadeInterval);
            audio._fadeInterval = null;
        }
    }, stepTime);
}

// Аудиоплеер логика
function toggleAudio(audioId, btnEl) {
    const audio = document.getElementById(audioId);
    if (!audio) return;
    const icon = btnEl.querySelector('i');
    const bgAudio = document.getElementById('bg-audio');
    
    // Останавливаем все другие аудио
    document.querySelectorAll('audio').forEach(a => {
        if(a.id !== audioId && a.id !== 'bg-audio' && !a.paused) {
            a.pause();
            const otherBtnIcon = a.nextElementSibling?.querySelector('.play-btn i');
            if(otherBtnIcon) {
                otherBtnIcon.setAttribute('data-lucide', 'play');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }
    });

    if (audio.paused) {
        // Плавно приглушаем фоновую музыку, потом запускаем голосовое
        if (bgAudio) {
            fadeVolume(bgAudio, 0.03, 1200);
            setTimeout(() => {
                audio.play().catch(e => console.error("Ошибка воспроизведения:", e));
            }, 1200);
        } else {
            audio.play().catch(e => console.error("Ошибка воспроизведения:", e));
        }
        icon.setAttribute('data-lucide', 'pause');
    } else {
        // Возвращаем громкость плавно
        if (bgAudio) fadeVolume(bgAudio, 0.2, 1200);
        audio.pause();
        icon.setAttribute('data-lucide', 'play');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initAudioPlayers() {
    document.querySelectorAll('audio').forEach(audio => {
        if (audio.id === 'bg-audio') return;
        
        audio.addEventListener('timeupdate', function() {
            const progressId = 'progress-' + this.id;
            const timeId = 'time-' + this.id;
            const progressBar = document.getElementById(progressId);
            const timeDisplay = document.getElementById(timeId);
            
            if(progressBar && this.duration) {
                const percent = (this.currentTime / this.duration) * 100;
                progressBar.style.width = percent + '%';
                
                const mins = Math.floor(this.currentTime / 60);
                const secs = Math.floor(this.currentTime % 60);
                if (timeDisplay) {
                    timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                }
            }
        });

        audio.addEventListener('ended', function() {
            const icon = this.nextElementSibling?.querySelector('.play-btn i');
            if(icon) {
                icon.setAttribute('data-lucide', 'play');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
            
            // Плавно возвращаем громкость фоновой музыки
            const bgAudio = document.getElementById('bg-audio');
            if (bgAudio) fadeVolume(bgAudio, 0.2, 1200);
        });
    });
}

function seekAudio(e, audioId) {
    const audio = document.getElementById(audioId);
    if (!audio || !audio.duration) return;
    
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    
    audio.currentTime = percent * audio.duration;
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initStars();
    initDateCounter();
    initAudioPlayers();
    initBackgroundAudio();
});
