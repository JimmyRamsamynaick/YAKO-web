// Gestion des onglets
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Fonction pour basculer entre les onglets
    function switchTab(targetTab) {
        // Retirer la classe active de tous les boutons et contenus
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Ajouter la classe active au bouton cliqué
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Afficher le contenu correspondant
        const activeContent = document.getElementById(targetTab);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Sauvegarder l'onglet actif dans le localStorage
        localStorage.setItem('activeTab', targetTab);

        // Analytics personnalisé
        trackTabSwitch(targetTab);
    }

    // Ajouter les écouteurs d'événements aux boutons d'onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });

        // Ajouter des effets sonores (optionnel)
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.02)';
        });

        button.addEventListener('mouseleave', () => {
            if (!button.classList.contains('active')) {
                button.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Restaurer l'onglet actif depuis le localStorage
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab);
    } else {
        // Par défaut, afficher le premier onglet
        switchTab('moderation');
    }

    // Menu mobile toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Bloquer le scroll du body quand le menu est ouvert
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Fermer le menu quand on clique sur un lien
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Animation des éléments au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                // Animation spéciale pour les cartes
                if (entry.target.classList.contains('feature-card')) {
                    entry.target.style.animationDelay = `${Math.random() * 0.3}s`;
                    entry.target.classList.add('animate-in');
                }
            }
        });
    }, observerOptions);

    // Observer toutes les cartes de fonctionnalités
    const featureCards = document.querySelectorAll('.feature-card');
    const commandCategories = document.querySelectorAll('.command-category');
    const setupSteps = document.querySelectorAll('.step');

    // Initialiser l'état des éléments pour l'animation
    [...featureCards, ...commandCategories, ...setupSteps].forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });

    // Effet de machine à écrire pour les commandes
    function typeWriter(element, text, speed = 30) {
        let i = 0;
        const originalText = text;
        element.textContent = '';
        element.style.borderRight = '2px solid #4f46e5';

        function type() {
            if (i < originalText.length) {
                element.textContent += originalText.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // Retirer le curseur clignotant
                setTimeout(() => {
                    element.style.borderRight = 'none';
                }, 500);
            }
        }

        type();
    }

    // Animer les commandes quand elles deviennent visibles
    const commandObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const codeElements = entry.target.querySelectorAll('code');
                codeElements.forEach((code, index) => {
                    const originalText = code.textContent;
                    setTimeout(() => {
                        typeWriter(code, originalText);
                    }, index * 150);
                });
                commandObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    commandCategories.forEach(category => {
        commandObserver.observe(category);
    });

    // Navbar scroll effect avec parallax
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }

        // Masquer/afficher la navbar selon la direction du scroll
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    });

    // Fonction pour copier les commandes dans le presse-papiers
    function setupCommandCopy() {
        const commandItems = document.querySelectorAll('.command-item code');

        commandItems.forEach(code => {
            code.style.cursor = 'pointer';
            code.title = 'Cliquer pour copier';

            // Ajouter un effet visuel au survol
            code.addEventListener('mouseenter', () => {
                code.style.background = '#d1d5db';
                code.style.transform = 'scale(1.02)';
            });

            code.addEventListener('mouseleave', () => {
                code.style.background = '#e2e8f0';
                code.style.transform = 'scale(1)';
            });

            code.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);

                    // Feedback visuel amélioré
                    const originalBg = code.style.backgroundColor;
                    const originalColor = code.style.color;

                    code.style.backgroundColor = '#10b981';
                    code.style.color = 'white';
                    code.style.transform = 'scale(1.05)';

                    // Ajouter une icône de confirmation
                    const checkIcon = document.createElement('span');
                    checkIcon.innerHTML = ' ✓';
                    checkIcon.style.fontWeight = 'bold';
                    code.appendChild(checkIcon);

                    setTimeout(() => {
                        code.style.backgroundColor = originalBg;
                        code.style.color = originalColor;
                        code.style.transform = 'scale(1)';
                        code.removeChild(checkIcon);
                    }, 800);

                    // Créer une notification temporaire
                    showNotification('Commande copiée dans le presse-papiers !', 'success');

                    // Analytics
                    trackCommandCopy(code.textContent);

                } catch (err) {
                    console.error('Erreur lors de la copie:', err);
                    showNotification('Erreur lors de la copie. Votre navigateur ne supporte peut-être pas cette fonctionnalité.', 'error');
                }
            });
        });
    }

    // Fonction pour afficher des notifications améliorées
    function showNotification(message, type = 'success', duration = 3000) {
        // Vérifier s'il y a déjà une notification et la supprimer
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas ${icons[type] || icons.info}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: auto;">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            cursor: pointer;
        `;

        document.body.appendChild(notification);

        // Auto-suppression
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);

        // Supprimer au clic
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }

    // Fonction pour filtrer les fonctionnalités avec recherche avancée
    function setupFeatureFilter() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Rechercher une fonctionnalité...';
        searchInput.className = 'feature-search';

        // Insérer la barre de recherche avant les onglets
        const featuresShowcase = document.querySelector('.features-showcase .container');
        const tabsContainer = document.querySelector('.features-tabs');
        featuresShowcase.insertBefore(searchInput, tabsContainer);

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value.toLowerCase());
            }, 300);
        });

        function performSearch(searchTerm) {
            const featureCards = document.querySelectorAll('.feature-card');
            let visibleCount = 0;

            featureCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const features = Array.from(card.querySelectorAll('li')).map(li => li.textContent.toLowerCase()).join(' ');

                const isVisible = !searchTerm ||
                    title.includes(searchTerm) ||
                    description.includes(searchTerm) ||
                    features.includes(searchTerm);

                card.style.display = isVisible ? 'block' : 'none';
                if (isVisible) visibleCount++;

                // Surligner les termes trouvés
                if (searchTerm && isVisible) {
                    highlightSearchTerm(card, searchTerm);
                } else {
                    removeHighlight(card);
                }
            });

            // Afficher un message si aucun résultat
            showSearchResults(visibleCount, searchTerm);
        }

        function highlightSearchTerm(card, term) {
            const textNodes = [];
            const walker = document.createTreeWalker(
                card,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let node;
            while (node = walker.nextNode()) {
                if (node.parentNode.tagName !== 'SCRIPT' && node.parentNode.tagName !== 'STYLE') {
                    textNodes.push(node);
                }
            }

            textNodes.forEach(textNode => {
                const text = textNode.textContent;
                const regex = new RegExp(`(${term})`, 'gi');
                if (regex.test(text)) {
                    const highlightedText = text.replace(regex, '<mark style="background: #fbbf24; color: #1e293b; padding: 2px 4px; border-radius: 3px;">$1</mark>');
                    const span = document.createElement('span');
                    span.innerHTML = highlightedText;
                    textNode.parentNode.replaceChild(span, textNode);
                }
            });
        }

        function removeHighlight(card) {
            const marks = card.querySelectorAll('mark');
            marks.forEach(mark => {
                mark.outerHTML = mark.textContent;
            });
        }

        function showSearchResults(count, term) {
            let resultDiv = document.querySelector('.search-results');

            if (!resultDiv) {
                resultDiv = document.createElement('div');
                resultDiv.className = 'search-results';
                resultDiv.style.cssText = `
                    text-align: center;
                    padding: 20px;
                    margin: 20px 0;
                    border-radius: 12px;
                    font-weight: 500;
                `;

                const featuresShowcase = document.querySelector('.features-showcase .container');
                const searchInput = featuresShowcase.querySelector('.feature-search');
                searchInput.parentNode.insertBefore(resultDiv, searchInput.nextSibling);
            }

            if (term && count === 0) {
                resultDiv.style.background = '#fef2f2';
                resultDiv.style.color = '#dc2626';
                resultDiv.style.border = '1px solid #fecaca';
                resultDiv.innerHTML = `
                    <i class="fas fa-search"></i>
                    Aucune fonctionnalité trouvée pour "${term}"
                `;
                resultDiv.style.display = 'block';
            } else if (term && count > 0) {
                resultDiv.style.background = '#f0fdf4';
                resultDiv.style.color = '#16a34a';
                resultDiv.style.border = '1px solid #bbf7d0';
                resultDiv.innerHTML = `
                    <i class="fas fa-check"></i>
                    ${count} fonctionnalité${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''} pour "${term}"
                `;
                resultDiv.style.display = 'block';
            } else {
                resultDiv.style.display = 'none';
            }
        }
    }

    // Initialiser le filtre de recherche
    setupFeatureFilter();

    // Initialiser la fonctionnalité de copie
    setupCommandCopy();

    // Fonction pour le mode sombre
    function setupDarkMode() {
        const darkModeToggle = document.createElement('button');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.className = 'dark-mode-toggle';

        document.body.appendChild(darkModeToggle);

        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

            // Sauvegarder la préférence
            localStorage.setItem('darkMode', isDark);

            // Notification
            showNotification(`Mode ${isDark ? 'sombre' : 'clair'} activé`, 'info');
        });

        // Restaurer la préférence du mode sombre
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // Détecter la préférence système
        if (!localStorage.getItem('darkMode')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    }

    // Initialiser le mode sombre
    setupDarkMode();

    // Fonction pour les raccourcis clavier
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K pour ouvrir la recherche
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.feature-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Échap pour fermer le menu mobile
            if (e.key === 'Escape') {
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }

            // Flèches pour naviguer entre les onglets
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const activeTab = document.querySelector('.tab-button.active');
                if (activeTab) {
                    const tabs = Array.from(document.querySelectorAll('.tab-button'));
                    const currentIndex = tabs.indexOf(activeTab);
                    let newIndex;

                    if (e.key === 'ArrowLeft') {
                        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                    } else {
                        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                    }

                    tabs[newIndex].click();
                }
            }
        });
    }

    setupKeyboardShortcuts();

    // Fonction pour les statistiques d'utilisation
    function setupAnalytics() {
        // Temps passé sur chaque onglet
        let tabStartTime = Date.now();
        let currentTab = 'moderation';

        function trackTabSwitch(newTab) {
            const timeSpent = Date.now() - tabStartTime;
            console.log(`Temps passé sur l'onglet ${currentTab}: ${timeSpent}ms`);

            currentTab = newTab;
            tabStartTime = Date.now();
        }

        // Suivi des interactions
        function trackCommandCopy(command) {
            console.log(`Commande copiée: ${command}`);
        }

        // Suivi des recherches
        function trackSearch(term, results) {
            console.log(`Recherche: "${term}" - ${results} résultats`);
        }

        // Exposer les fonctions globalement
        window.trackTabSwitch = trackTabSwitch;
        window.trackCommandCopy = trackCommandCopy;
        window.trackSearch = trackSearch;
    }

    setupAnalytics();

    // Fonction pour l'accessibilité
    function setupAccessibility() {
        // Ajouter des attributs ARIA
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach((button, index) => {
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', button.classList.contains('active'));
            button.setAttribute('aria-controls', button.getAttribute('data-tab'));
            button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');
        });

        tabContents.forEach(content => {
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-hidden', !content.classList.contains('active'));
        });

        // Navigation au clavier dans les onglets
        tabButtons.forEach(button => {
            button.addEventListener('focus', () => {
                button.click();
            });
        });

        // Annoncer les changements aux lecteurs d'écran
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);

        window.announce = function(message) {
            announcer.textContent = message;
            setTimeout(() => {
                announcer.textContent = '';
            }, 1000);
        };
    }

    setupAccessibility();

    // Fonction pour la performance
    function setupPerformanceOptimizations() {
        // Lazy loading des images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));

        // Préchargement des onglets
        const preloadTimer = setTimeout(() => {
            const inactiveContents = document.querySelectorAll('.tab-content:not(.active)');
            inactiveContents.forEach(content => {
                content.style.visibility = 'hidden';
                content.style.position = 'absolute';
                content.classList.add('active');

                setTimeout(() => {
                    content.classList.remove('active');
                    content.style.visibility = '';
                    content.style.position = '';
                }, 100);
            });
        }, 2000);
    }

    setupPerformanceOptimizations();

    // Fonction pour gérer la connectivité
    function setupConnectivityHandling() {
        function updateOnlineStatus() {
            const isOnline = navigator.onLine;
            if (!isOnline) {
                showNotification('Connexion Internet perdue. Certaines fonctionnalités peuvent être limitées.', 'warning', 5000);
            } else {
                showNotification('Connexion Internet rétablie.', 'success', 2000);
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    setupConnectivityHandling();

    // Fonction pour les easter eggs
    function setupEasterEggs() {
        let konamiCode = [];
        const konamiSequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.code);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }

            if (konamiCode.join(',') === konamiSequence.join(',')) {
                activateKonamiMode();
                konamiCode = [];
            }
        });

        function activateKonamiMode() {
            showNotification('🎉 Mode Konami activé ! YAKO est maintenant en mode festif !', 'success', 5000);

            // Ajouter des effets visuels
            document.body.style.animation = 'rainbow 2s infinite linear';

            // Ajouter l'animation rainbow
            const rainbowStyle = document.createElement('style');
            rainbowStyle.textContent = `
                @keyframes rainbow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            document.head.appendChild(rainbowStyle);

            // Retirer l'effet après 10 secondes
            setTimeout(() => {
                document.body.style.animation = '';
                rainbowStyle.remove();
            }, 10000);
        }

        // Double-clic sur le logo pour des stats
        const logo = document.querySelector('.nav-brand');
        let clickCount = 0;

        logo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                showStats();
                clickCount = 0;
            }

            setTimeout(() => {
                clickCount = 0;
            }, 3000);
        });

        function showStats() {
            const stats = {
                'Onglet actuel': localStorage.getItem('activeTab') || 'moderation',
                'Mode sombre': document.body.classList.contains('dark-mode') ? 'Activé' : 'Désactivé',
                'Navigateur': navigator.userAgent.split(' ')[0],
                'Résolution': `${window.screen.width}x${window.screen.height}`,
                'Langue': navigator.language
            };

            let message = 'Statistiques YAKO:\n\n';
            Object.entries(stats).forEach(([key, value]) => {
                message += `${key}: ${value}\n`;
            });

            alert(message);
        }
    }

    setupEasterEggs();

    // Fonction pour le feedback utilisateur
    function setupFeedbackSystem() {
        // Bouton de feedback flottant
        const feedbackBtn = document.createElement('button');
        feedbackBtn.innerHTML = '<i class="fas fa-comment"></i>';
        feedbackBtn.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: #4f46e5;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
        `;

        feedbackBtn.addEventListener('click', () => {
            const feedback = prompt('Que pensez-vous de cette page ? Vos suggestions nous aident à nous améliorer !');
            if (feedback) {
                showNotification('Merci pour votre feedback ! Il sera pris en compte.', 'success');
                console.log('Feedback utilisateur:', feedback);
            }
        });

        document.body.appendChild(feedbackBtn);
    }

    setupFeedbackSystem();

    // Fonction pour sauvegarder l'état de la page
    function setupStateManagement() {
        // Sauvegarder la position de scroll
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('scrollPosition', window.scrollY);
            localStorage.setItem('lastVisit', Date.now());
        });

        // Restaurer la position de scroll
        window.addEventListener('load', () => {
            const savedScrollPosition = localStorage.getItem('scrollPosition');
            if (savedScrollPosition) {
                window.scrollTo(0, parseInt(savedScrollPosition));
            }

            const lastVisit = localStorage.getItem('lastVisit');
            if (lastVisit) {
                const timeSinceLastVisit = Date.now() - parseInt(lastVisit);
                if (timeSinceLastVisit > 24 * 60 * 60 * 1000) { // Plus de 24h
                    showNotification('Content de vous revoir ! Découvrez les nouvelles fonctionnalités.', 'info');
                }
            }
        });
    }

    setupStateManagement();
});

// Ajouter les styles d'animation pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .notification {
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .notification:hover {
        transform: translateX(-5px);
    }
`;
document.head.appendChild(style);

// Fonctions utilitaires globales
window.yakoUtils = {
    // Fonction pour déboguer
    debug: function(message) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('YAKO Fonctionnalités Debug:', message);
        }
    },

    // Fonction pour formater les nombres
    formatNumber: function(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    },

    // Fonction pour valider un email
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Fonction pour obtenir des informations sur l'appareil
    getDeviceInfo: function() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    },

    // Fonction pour copier du texte
    copyToClipboard: async function(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            return false;
        }
    }
};

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    yakoUtils.debug(`Erreur: ${e.error.message} à la ligne ${e.lineno}`);

    // Envoyer l'erreur au service de monitoring (si configuré)
    if (window.errorReporting) {
        window.errorReporting.report(e.error);
    }
});

// Gestion des promesses rejetées
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejetée:', e.reason);
    yakoUtils.debug(`Promise rejetée: ${e.reason}`);
});

// Initialisation finale
document.addEventListener('DOMContentLoaded', function() {
    yakoUtils.debug('Page fonctionnalités entièrement chargée');
    yakoUtils.debug('Informations de l\'appareil:', yakoUtils.getDeviceInfo());
});