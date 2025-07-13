// Menu mobile toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Bloquer le scroll du body quand le menu est ouvert
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Fermer le menu en cliquant à l'extérieur
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth scrolling pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========== ANIMATIONS AU SCROLL CORRIGÉES ==========

    // Configuration de l'observateur d'intersection
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Pour les titres
                if (entry.target.matches('h2')) {
                    entry.target.classList.add('animate');
                }

                // Pour les cartes de fonctionnalités
                if (entry.target.classList.contains('features-grid')) {
                    const cards = entry.target.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('animate');
                        }, index * 200); // Délai progressif entre les cartes
                    });
                }

                // Pour les statistiques
                if (entry.target.classList.contains('stats-grid')) {
                    const stats = entry.target.querySelectorAll('.stat-item');
                    stats.forEach((stat, index) => {
                        setTimeout(() => {
                            stat.classList.add('animate');
                            // Animer les nombres après l'animation d'apparition
                            setTimeout(() => {
                                const numberElement = stat.querySelector('.stat-number');
                                if (numberElement) {
                                    animateNumber(numberElement);
                                }
                            }, 300);
                        }, index * 150);
                    });
                }

                // Pour la section CTA
                if (entry.target.classList.contains('cta')) {
                    const h2 = entry.target.querySelector('h2');
                    const p = entry.target.querySelector('p');
                    const btn = entry.target.querySelector('.btn');

                    if (h2) h2.classList.add('animate');
                    if (p) {
                        setTimeout(() => p.classList.add('animate'), 200);
                    }
                    if (btn) {
                        setTimeout(() => btn.classList.add('animate'), 400);
                    }
                }

                // Une fois animé, ne plus observer cet élément
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observer tous les éléments à animer
    const elementsToObserve = [
        document.querySelector('.features-preview h2'),
        document.querySelector('.features-grid'),
        document.querySelector('.stats-grid'),
        document.querySelector('.cta')
    ].filter(Boolean); // Filtrer les éléments null

    elementsToObserve.forEach(element => {
        observer.observe(element);
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            }
        }
    });

    // Effet parallax léger sur le hero
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero && scrolled < hero.offsetHeight) {
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
});

// Animation des nombres
function animateNumber(element) {
    const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
    const increment = target / 80; // Plus fluide
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        // Formatage du nombre
        let displayValue = Math.floor(current);
        const originalText = element.textContent;

        if (originalText.includes('+')) {
            displayValue = displayValue.toLocaleString() + '+';
        } else if (originalText.includes('%')) {
            displayValue = displayValue + '%';
        } else if (originalText.includes('/')) {
            displayValue = displayValue + '/7';
        } else {
            displayValue = displayValue.toLocaleString();
        }

        element.textContent = displayValue;
    }, 16); // 60fps
}

// Fonction pour créer des notifications (utilisée par le mode sombre)
function showNotification(message, type = 'info', duration = 3000) {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Supprimer automatiquement après la durée spécifiée
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, duration);

    // Permettre de fermer en cliquant
    notification.addEventListener('click', () => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

// Fonction pour ajouter des effets de particules (optionnel)
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;

    document.body.appendChild(particleContainer);

    for (let i = 0; i < 50; i++) {
        createParticle(particleContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
    `;

    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 2 + 's';

    container.appendChild(particle);
}

// Gestion des erreurs
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

// Fonction utilitaire pour déboguer
function debug(message) {
    if (window.location.hostname === 'localhost') {
        console.log('YAKO Debug:', message);
    }
}

// Exposer les fonctions utilitaires globalement
window.showNotification = showNotification;
window.yakoUtils = {
    showNotification,
    debug,
    createParticles
};

console.log('✅ YAKO Index - Script initialisé avec animations au scroll');