export class AnimationView {
    constructor(store) {
        this.store = store;
        this.revealObserver = null;
    }

    init() {
        this.initScrollReveal();
        this.initParamsSub();
        this.initSplash();
    }

    initParamsSub() {
        this.store.subscribe((state) => {
            this.renderParticles(state);
        });
    }

    renderParticles(state) {
        const container = document.getElementById('particles-container');
        if (!container) return;

        container.innerHTML = '';

        const bgConfig = state.ui?.bgAnimation || {
            enabled: true,
            type: 'particles',
            size: 15,
            opacity: 0.15,
            color: '#6b705c'
        };

        if (bgConfig.enabled === false || bgConfig.type === 'none') {
            return;
        }

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';

            const maxSize = bgConfig.size || 15;
            const size = Math.random() * (maxSize - 2) + 2;
            const left = Math.random() * 100;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 20;

            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.background = bgConfig.color || '#6b705c';
            particle.style.opacity = bgConfig.opacity || 0.15;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${delay}s`;

            container.appendChild(particle);
        }
    }

    initScrollReveal() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        this.revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    entry.target.classList.add('visible');

                    if (entry.target.classList.contains('logistics-grid')) {
                        entry.target.querySelectorAll('.stagger-item').forEach((el, i) => {
                            setTimeout(() => el.classList.add('active'), i * 200);
                        });
                    }
                }
            });
        }, observerOptions);

        this.observeElements();
    }

    observeElements() {
        if (!this.revealObserver) return;
        document.querySelectorAll('.reveal, .animate-on-scroll, .logistics-grid').forEach(el => {
            this.revealObserver.observe(el);
        });
    }

    reObserve() {
        this.observeElements();
    }

    initSplash() {
        const enterBtn = document.getElementById('enter-site');
        const splash = document.getElementById('splash');
        const audio = document.getElementById('wedding-song');
        const musicBtn = document.getElementById('music-toggle');

        if (enterBtn && splash) {
            enterBtn.addEventListener('click', () => {
                document.body.classList.add('show-content');
                splash.style.opacity = '0';
                setTimeout(() => {
                    splash.style.display = 'none';
                    this.initScrollReveal();
                }, 1000);

                if (audio) {
                    audio.play().then(() => {
                        if (musicBtn) musicBtn.classList.remove('paused');
                    }).catch(e => {
                        console.log("Audio prevented by browser policy:", e);
                        if (musicBtn) musicBtn.classList.add('paused');
                    });
                }
            });
        }

        if (musicBtn && audio) {
            musicBtn.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play();
                    musicBtn.classList.remove('paused');
                    musicBtn.setAttribute('aria-pressed', 'true');
                } else {
                    audio.pause();
                    musicBtn.classList.add('paused');
                    musicBtn.setAttribute('aria-pressed', 'false');
                }
            });
        }
    }
}
