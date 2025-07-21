// JavaScript pour la page fonctionnalités - Version complète et corrigée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 YAKO Fonctionnalités - Initialisation...');

    // Variables globales
    let currentTab = 'moderation';
    let searchResults = [];

    // ========== GESTION DES ONGLETS ==========
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        function switchTab(targetTab) {
            console.log(`📋 Changement vers onglet: ${targetTab}`);

            // Animation de sortie pour l'onglet actif
            const currentActiveContent = document.querySelector('.tab-content.active');
            if (currentActiveContent) {
                currentActiveContent.style.opacity = '0';
                currentActiveContent.style.transform = 'translateY(-20px)';
            }

            // Retirer les classes actives
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
                btn.setAttribute('tabindex', '-1');
            });

            tabContents.forEach(content => {
                content.classList.remove('active');
                content.setAttribute('aria-hidden', 'true');
            });

            // Activer le nouvel onglet
            const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
                activeButton.setAttribute('aria-selected', 'true');
                activeButton.setAttribute('tabindex', '0');

                // Effet visuel sur l'onglet
                activeButton.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    activeButton.style.transform = 'scale(1)';
                }, 150);
            }

            // Activer le nouveau contenu avec animation
            const activeContent = document.getElementById(targetTab);
            if (activeContent) {
                setTimeout(() => {
                    activeContent.classList.add('active');
                    activeContent.setAttribute('aria-hidden', 'false');
                    activeContent.style.opacity = '1';
                    activeContent.style.transform = 'translateY(0)';
                }, 100);
            }

            // Sauvegarder l'onglet actif
            localStorage.setItem('activeTab', targetTab);
            currentTab = targetTab;

            // Réinitialiser la recherche
            clearSearch();

            // Analytics
            trackTabSwitch(targetTab);
        }

        // Configuration des onglets avec accessibilité
        tabButtons.forEach((tab, index) => {
            // Attributs ARIA
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', tab.getAttribute('data-tab'));
            tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');

            // Événements de clic
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.getAttribute('data-tab');
                switchTab(targetTab);
            });

            // Navigation au clavier
            tab.addEventListener('keydown', (e) => {
                let newIndex = index;

                switch(e.key) {
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        newIndex = index > 0 ? index - 1 : tabButtons.length - 1;
                        break;
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        newIndex = index < tabButtons.length - 1 ? index + 1 : 0;
                        break;
                    case 'Home':
                        e.preventDefault();
                        newIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        newIndex = tabButtons.length - 1;
                        break;
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        tab.click();
                        return;
                }

                if (newIndex !== index) {
                    tabButtons[newIndex].focus();
                    tabButtons[newIndex].click();
                }
            });

            // Effets visuels améliorés
            tab.addEventListener('mouseenter', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.transform = 'translateY(-2px) scale(1.02)';
                }
            });

            tab.addEventListener('mouseleave', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.transform = 'translateY(0) scale(1)';
                }
            });
        });

        // Restaurer l'onglet actif depuis le localStorage
        const savedTab = localStorage.getItem('activeTab');
        if (savedTab && document.getElementById(savedTab)) {
            switchTab(savedTab);
        } else {
            switchTab('moderation');
        }

        console.log('✅ Onglets initialisés');
    }

    // ========== RECHERCHE DANS LES FONCTIONNALITÉS ==========
    function initFeatureSearch() {
        const searchInput = document.querySelector('.feature-search');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value.toLowerCase());
            }, 300);
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
                showNotification('💡 Recherchez dans les fonctionnalités', 'info', 2000);
            }
        });

        // Auto-suggestions
        const suggestions = [
            'modération', 'musique', 'rôles', 'sanctions', 'niveaux', 'sondages',
            'commandes', 'permissions', 'logs', 'automatique'
        ];

        searchInput.addEventListener('focus', () => {
            if (!searchInput.value) {
                const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                searchInput.placeholder = `Essayez: "${randomSuggestion}"`;
            }
        });

        searchInput.addEventListener('blur', () => {
            searchInput.placeholder = 'Rechercher une fonctionnalité... (Ctrl+F)';
        });

        console.log('✅ Recherche initialisée');
    }

    function performSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            clearSearch();
            return;
        }

        console.log(`🔎 Recherche: "${searchTerm}"`);

        const featureCards = document.querySelectorAll('.feature-card');
        let hasResults = false;
        let resultsByTab = {};
        let totalMatches = 0;

        featureCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const features = Array.from(card.querySelectorAll('li')).map(li => li.textContent.toLowerCase()).join(' ');

            const matches = (title + ' ' + description + ' ' + features).split(' ')
                .filter(word => word.includes(searchTerm)).length;

            const isVisible = matches > 0;

            card.style.display = isVisible ? 'block' : 'none';

            if (isVisible) {
                hasResults = true;
                totalMatches += matches;
                highlightSearchTerm(card, searchTerm);

                // Déterminer l'onglet parent
                const tabContent = card.closest('.tab-content');
                const tabId = tabContent ? tabContent.id : 'unknown';
                resultsByTab[tabId] = (resultsByTab[tabId] || 0) + matches;
            } else {
                removeHighlight(card);
            }
        });

        showSearchResults(hasResults, searchTerm, resultsByTab, totalMatches);
        trackSearch(searchTerm, hasResults, totalMatches);

        // Basculer vers le premier onglet avec résultats
        if (hasResults && Object.keys(resultsByTab).length > 0) {
            const firstTabWithResults = Object.keys(resultsByTab)[0];
            if (firstTabWithResults !== currentTab) {
                const tabButton = document.querySelector(`[data-tab="${firstTabWithResults}"]`);
                if (tabButton) {
                    tabButton.click();
                }
            }
        }
    }

    function highlightSearchTerm(element, searchTerm) {
        removeHighlight(element);

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            (node) => {
                return node.parentNode.tagName !== 'SCRIPT' &&
                node.parentNode.tagName !== 'STYLE' &&
                !node.parentNode.classList.contains('search-highlight')
                    ? NodeFilter.FILTER_ACCEPT
                    : NodeFilter.FILTER_REJECT;
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');

            if (regex.test(text)) {
                const highlightedHTML = text.replace(regex, '<span class="search-highlight">$1</span>');
                const wrapper = document.createElement('div');
                wrapper.innerHTML = highlightedHTML;

                const fragment = document.createDocumentFragment();
                while (wrapper.firstChild) {
                    fragment.appendChild(wrapper.firstChild);
                }

                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    function removeHighlight(element) {
        const highlights = element.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            highlight.outerHTML = highlight.textContent;
        });
    }

    function showSearchResults(hasResults, searchTerm, resultsByTab, totalMatches) {
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
                animation: fadeIn 0.3s ease;
            `;

            const featuresShowcase = document.querySelector('.features-showcase .container');
            const searchInput = featuresShowcase?.querySelector('.feature-search');
            if (searchInput?.parentNode) {
                searchInput.parentNode.insertBefore(resultDiv, searchInput.nextSibling);
            }
        }

        if (!hasResults) {
            resultDiv.style.background = '#fef2f2';
            resultDiv.style.color = '#dc2626';
            resultDiv.style.border = '2px solid #fecaca';
            resultDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                    <i class="fas fa-search" style="font-size: 1.2rem;"></i>
                    <strong>Aucun résultat trouvé</strong>
                </div>
                <p>Aucun résultat pour "<em>${searchTerm}</em>"</p>
                <small style="display: block; margin-top: 10px; opacity: 0.8;">
                    💡 Essayez des mots-clés différents ou parcourez les onglets
                </small>
            `;
        } else {
            const tabNames = {
                'moderation': 'Modération',
                'management': 'Gestion',
                'entertainment': 'Divertissement',
                'utilities': 'Utilitaires'
            };

            let tabsHTML = '';
            Object.entries(resultsByTab).forEach(([tabId, count]) => {
                if (count > 0) {
                    tabsHTML += `
                        <span onclick="document.querySelector('[data-tab=\\"${tabId}\\"]').click()" 
                              style="display: inline-block; margin: 5px; padding: 8px 15px; 
                                     background: rgba(79, 70, 229, 0.1); border: 1px solid rgba(79, 70, 229, 0.3);
                                     border-radius: 25px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;"
                              onmouseenter="this.style.background='rgba(79, 70, 229, 0.2)'"
                              onmouseleave="this.style.background='rgba(79, 70, 229, 0.1)'">
                            ${tabNames[tabId] || tabId}: ${count} occurrence${count > 1 ? 's' : ''}
                        </span>
                    `;
                }
            });

            resultDiv.style.background = '#f0fdf4';
            resultDiv.style.color = '#16a34a';
            resultDiv.style.border = '2px solid #bbf7d0';
            resultDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                    <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
                    <strong>${totalMatches} occurrence${totalMatches > 1 ? 's' : ''} trouvée${totalMatches > 1 ? 's' : ''}</strong>
                </div>
                <p style="margin-bottom: 15px;">Résultats pour "<em>${searchTerm}</em>" dans ${Object.keys(resultsByTab).length} onglet${Object.keys(resultsByTab).length > 1 ? 's' : ''}</p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px;">
                    ${tabsHTML}
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    }

    function clearSearch() {
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.display = 'block';
            removeHighlight(card);
        });
        hideSearchResults();
        searchResults = [];
    }

    function hideSearchResults() {
        const resultDiv = document.querySelector('.search-results');
        if (resultDiv) {
            resultDiv.style.display = 'none';
        }
    }

    // ========== COPIE DES COMMANDES ==========
    function initCommandCopy() {
        const commandItems = document.querySelectorAll('.command-item code');

        commandItems.forEach(code => {
            code.style.cursor = 'pointer';
            code.title = 'Cliquer pour copier';

            // Effets visuels
            code.addEventListener('mouseenter', () => {
                code.style.background = isDarkMode() ? '#4b5563' : '#d1d5db';
                code.style.transform = 'scale(1.02)';
            });

            code.addEventListener('mouseleave', () => {
                code.style.background = isDarkMode() ? '#374151' : '#e2e8f0';
                code.style.transform = 'scale(1)';
            });

            code.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);

                    // Feedback visuel
                    const originalBg = code.style.backgroundColor;
                    const originalColor = code.style.color;

                    code.style.backgroundColor = '#10b981';
                    code.style.color = 'white';
                    code.style.transform = 'scale(1.05)';

                    // Icône de confirmation
                    const checkIcon = document.createElement('span');
                    checkIcon.innerHTML = ' ✓';
                    checkIcon.style.fontWeight = 'bold';
                    code.appendChild(checkIcon);

                    setTimeout(() => {
                        code.style.backgroundColor = originalBg;
                        code.style.color = originalColor;
                        code.style.transform = 'scale(1)';
                        if (checkIcon.parentNode) {
                            checkIcon.remove();
                        }
                    }, 800);

                    showNotification('Commande copiée ! 📋', 'success', 2000);
                    trackCommandCopy(code.textContent);

                } catch (err) {
                    console.error('Erreur lors de la copie:', err);
                    showNotification('Erreur lors de la copie', 'error', 3000);
                }
            });
        });

        console.log('✅ Copie des commandes initialisée');
    }

    // ========== ANIMATIONS AU SCROLL (OPTIMISÉES) ==========
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '50px 0px -20px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        entry.target.classList.add('animate-in');
                    }, index * 50);
                }
            });
        }, observerOptions);

        // Observer tous les éléments animables SAUF les preview-item
        const elementsToAnimate = document.querySelectorAll('.feature-card, .command-category, .step');
        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.4s ease ${index * 0.02}s, transform 0.4s ease ${index * 0.02}s`;
            observer.observe(element);
        });

        console.log('✅ Animations au scroll optimisées');
    }

    // ========== EFFECT MACHINE À ÉCRIRE POUR LES COMMANDES ==========
    function initTypewriterEffect() {
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
                    setTimeout(() => {
                        element.style.borderRight = 'none';
                    }, 500);
                }
            }

            type();
        }

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

        const commandCategories = document.querySelectorAll('.command-category');
        commandCategories.forEach(category => {
            commandObserver.observe(category);
        });

        console.log('✅ Effet machine à écrire initialisé');
    }

    // ========== GESTION DE L'ÉTAT ==========
    function initStateManagement() {
        // Sauvegarder la position de scroll
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('scrollPosition', window.scrollY);
            localStorage.setItem('lastVisit', Date.now());
        });

        // Restaurer la position de scroll
        window.addEventListener('load', () => {
            const savedScrollPosition = localStorage.getItem('scrollPosition');
            if (savedScrollPosition) {
                setTimeout(() => {
                    window.scrollTo(0, parseInt(savedScrollPosition));
                }, 100);
            }

            const lastVisit = localStorage.getItem('lastVisit');
            if (lastVisit) {
                const timeSinceLastVisit = Date.now() - parseInt(lastVisit);
                if (timeSinceLastVisit > 24 * 60 * 60 * 1000) {
                    showNotification('Bienvenue ! Découvrez les nouvelles fonctionnalités 🚀', 'info', 4000);
                }
            }
        });

        console.log('✅ Gestion d\'état initialisée');
    }

    // ========== RACCOURCIS CLAVIER ==========
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignorer si on est dans un champ de saisie
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(true) {
                // Ctrl/Cmd + K pour la recherche
                case (e.ctrlKey || e.metaKey) && e.key === 'k':
                    e.preventDefault();
                    const searchInput = document.querySelector('.feature-search');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                    break;

                // Chiffres 1-4 pour naviguer entre les onglets
                case ['1', '2', '3', '4'].includes(e.key):
                    const tabs = ['moderation', 'management', 'entertainment', 'utilities'];
                    const tabIndex = parseInt(e.key) - 1;
                    if (tabs[tabIndex]) {
                        const tabButton = document.querySelector(`[data-tab="${tabs[tabIndex]}"]`);
                        if (tabButton) {
                            tabButton.click();
                        }
                    }
                    break;

                // Échap pour réinitialiser la recherche
                case e.key === 'Escape':
                    const search = document.querySelector('.feature-search');
                    if (search && search.value) {
                        search.value = '';
                        clearSearch();
                        search.blur();
                    }
                    break;

                // H pour afficher l'aide
                case e.key === 'h' || e.key === 'H':
                    showKeyboardHelp();
                    break;
            }
        });

        console.log('✅ Raccourcis clavier initialisés');
    }

    function showKeyboardHelp() {
        const helpHTML = `
            <div style="max-width: 500px; text-align: left;">
                <h3 style="margin-bottom: 20px; color: #4f46e5;">⌨️ Raccourcis clavier</h3>
                <div style="display: grid; gap: 10px; font-size: 0.9rem;">
                    <div><kbd>Ctrl+K</kbd> - Rechercher dans les fonctionnalités</div>
                    <div><kbd>1-4</kbd> - Naviguer entre les onglets</div>
                    <div><kbd>Échap</kbd> - Effacer la recherche</div>
                    <div><kbd>H</kbd> - Afficher cette aide</div>
                    <div><kbd>←→</kbd> - Naviguer entre onglets (focus clavier)</div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; font-size: 0.8rem; color: #1e40af;">
                    💡 <strong>Astuce :</strong> Cliquez sur une commande pour la copier automatiquement !
                </div>
            </div>
        `;

        showNotification(helpHTML, 'info', 8000);
    }

    // ========== GESTION DU BOUTON CONFIGURATEUR (CORRIGÉ) ==========
    function initConfiguratorButton() {
        const configuratorButton = document.querySelector('.btn-configurator');

        if (configuratorButton) {
            // S'assurer que le bouton est activé
            configuratorButton.disabled = false;
            configuratorButton.classList.remove('disabled');

            // Mise à jour du contenu du bouton
            configuratorButton.innerHTML = `
                <i class="fas fa-wrench"></i>
                Accéder au Configurateur
            `;

            // Ajouter les effets visuels
            configuratorButton.addEventListener('mouseenter', () => {
                configuratorButton.style.background = 'linear-gradient(135deg, #5a6fd8, #6d28d9)';
                configuratorButton.style.transform = 'translateY(-2px)';
                configuratorButton.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
            });

            configuratorButton.addEventListener('mouseleave', () => {
                configuratorButton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                configuratorButton.style.transform = 'translateY(0)';
                configuratorButton.style.boxShadow = 'none';
            });

            // Événement de clic avec redirection vers le fichier local
            configuratorButton.addEventListener('click', (e) => {
                e.preventDefault();

                // Animation de clic
                configuratorButton.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    configuratorButton.style.transform = 'scale(1)';
                }, 150);

                // Notification
                showNotification('🔧 Ouverture du configurateur...', 'info', 2000);

                // Redirection vers le fichier local
                setTimeout(() => {
                    window.open('file:///C:/Users/jimmy/Downloads/YAKO-web/yako-config/html/configurateur.html', '_blank');
                }, 300);

                console.log('🔧 Ouverture du configurateur local');
            });

            console.log('✅ Bouton configurateur initialisé');
        }
    }

    // ========== FONCTIONS UTILITAIRES ==========
    function isDarkMode() {
        return document.body.classList.contains('dark-mode');
    }

    function showNotification(message, type = 'success', duration = 4000) {
        // Utiliser la fonction du script principal si disponible
        if (window.yakoGlobalDarkMode && window.yakoGlobalDarkMode.showNotification) {
            return window.yakoGlobalDarkMode.showNotification(message, type, duration);
        }

        // Fallback uniforme si la fonction principale n'est pas disponible
        // Supprimer les notifications existantes
        document.querySelectorAll('.notification, .yako-notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <i class="fas ${icons[type] || icons.info}" style="font-size: 1.1rem; margin-top: 2px; flex-shrink: 0;"></i>
                <div style="flex: 1; line-height: 1.4;">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: 10px; opacity: 0.7; flex-shrink: 0; padding: 0; line-height: 1;"
                        aria-label="Fermer la notification">
                    ×
                </button>
            </div>
        `;

        const isDarkModeActive = document.body.classList.contains('dark-mode');

        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: ${isDarkModeActive ? '#1e293b' : 'white'};
            color: ${isDarkModeActive ? '#e2e8f0' : colors[type]};
            padding: 20px 25px;
            border-radius: 12px;
            border-left: 4px solid ${colors[type]};
            border: 1px solid ${isDarkModeActive ? colors[type] : 'rgba(0, 0, 0, 0.1)'};
            font-weight: 500;
            z-index: 10000;
            animation: slideInFromBottom 0.3s ease;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
            max-width: 380px;
            min-width: 300px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
        `;

        // Ajouter l'animation CSS si elle n'existe pas
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInFromBottom {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOutToBottom {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.style.animation = 'slideOutToBottom 0.3s ease';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        }

        // Fermer au clic
        notification.addEventListener('click', (e) => {
            if (e.target === notification || e.target.closest('button')) {
                notification.style.animation = 'slideOutToBottom 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        });
    }

    // ========== FONCTIONS D'ANALYTICS ==========
    function trackTabSwitch(tab) {
        console.log(`📊 Analytics: Onglet "${tab}" visité`);
        // Ici vous pouvez ajouter votre code d'analytics
    }

    function trackSearch(term, hasResults, totalMatches) {
        console.log(`📊 Analytics: Recherche "${term}" - ${totalMatches} résultats`);
    }

    function trackCommandCopy(command) {
        console.log(`📊 Analytics: Commande copiée "${command}"`);
    }

    // ========== INITIALISATION COMPLÈTE ==========
    try {
        initTabs();
        initFeatureSearch();
        initCommandCopy();
        initScrollAnimations();
        initTypewriterEffect();
        initStateManagement();
        initKeyboardShortcuts();
        initConfiguratorButton();

        console.log('✅ YAKO Fonctionnalités - Toutes les fonctionnalités initialisées');

        // Notification de bienvenue (seulement la première fois)
        if (!localStorage.getItem('fonctionnalitesVisited')) {
            setTimeout(() => {
                showNotification('Bienvenue sur la page des fonctionnalités ! Tapez H pour voir les raccourcis.', 'info', 5000);
                localStorage.setItem('fonctionnalitesVisited', 'true');
            }, 1000);
        }

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showNotification('Une erreur est survenue lors du chargement de la page.', 'error');
    }

    // ========== GESTION DES ERREURS GLOBALES ==========
    window.addEventListener('error', function(e) {
        console.error('Erreur JavaScript sur fonctionnalités:', e.error);
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('Promise rejetée sur fonctionnalités:', e.reason);
    });

    // Exposer les fonctions utiles globalement
    window.yakoFonctionnalites = {
        clearSearch: () => clearSearch(),
        switchTab: (tab) => {
            const tabButton = document.querySelector(`[data-tab="${tab}"]`);
            if (tabButton) tabButton.click();
        },
        getCurrentTab: () => currentTab,
        getSearchResults: () => searchResults
    };
});

// ========== STYLES DYNAMIQUES OPTIMISÉS ==========
const functionalitiesStyles = document.createElement('style');
functionalitiesStyles.textContent = `
    /* Animations plus rapides et fluides */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .animate-in {
        animation: fadeInUp 0.4s ease forwards;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Assurer que les éléments du configurateur apparaissent immédiatement */
    .bot-configurator .preview-item,
    .config-preview .preview-item {
        opacity: 1 !important;
        transform: translateY(0) !important;
        transition: background-color 0.2s ease, transform 0.2s ease !important;
    }

    .preview-item:hover {
        background: rgba(79, 70, 229, 0.05);
        border-radius: 10px;
        padding-left: 10px;
        padding-right: 10px;
        transform: translateX(5px);
    }

    body.dark-mode .preview-item:hover {
        background: rgba(99, 102, 241, 0.1);
    }

    /* Animation du bouton configurateur plus fluide */
    .btn-configurator {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .btn-configurator:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .btn-configurator:active {
        transform: scale(0.98);
    }

    /* Animation plus douce pour le badge */
    .maintenance-badge {
        animation: pulse 3s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { 
            transform: scale(1);
            opacity: 1;
        }
        50% { 
            transform: scale(1.02);
            opacity: 0.9;
        }
    }

    /* Optimisation pour les performances */
    .feature-card,
    .command-category,
    .tab-button,
    .step {
        will-change: transform, opacity;
    }

    /* Transitions instantanées pour le contenu critique */
    .configurator-panel,
    .config-preview {
        transition: none;
    }

    .configurator-panel *,
    .config-preview * {
        opacity: 1 !important;
        transform: none !important;
    }

    /* Search highlight amélioré */
    .search-highlight {
        background: #fbbf24;
        color: #1e293b;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
        animation: highlight 0.3s ease;
    }

    body.dark-mode .search-highlight {
        background: #f59e0b;
        color: #0f172a;
    }

    @keyframes highlight {
        0% { background: #fbbf24; }
        50% { background: #f59e0b; }
        100% { background: #fbbf24; }
    }

    .command-item code {
        position: relative;
        overflow: hidden;
    }

    .command-item code::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
    }

    .command-item:hover code::before {
        left: 100%;
    }

    /* Focus amélioré pour l'accessibilité */
    .tab-button:focus-visible {
        outline: 2px solid #4f46e5;
        outline-offset: 2px;
        border-radius: 50px;
    }

    .feature-search:focus-visible {
        outline: 2px solid #4f46e5;
        outline-offset: 2px;
    }

    /* Amélioration du focus pour l'accessibilité */
    kbd {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 4px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        color: #334155;
        display: inline-block;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
        font-size: 0.85em;
        font-weight: 700;
        line-height: 1;
        padding: 2px 4px;
        white-space: nowrap;
    }
    
    body.dark-mode kbd {
        background: #4b5563;
        border-color: #6b7280;
        color: #e5e7eb;
    }

    /* Responsive pour mobile */
    @media (max-width: 768px) {
        .search-highlight {
            padding: 1px 3px;
            font-size: 0.9em;
        }

        .feature-search {
            font-size: 16px; /* Évite le zoom sur iOS */
        }
    }

    /* États spéciaux pour reduced motion */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }

        .preview-item,
        .feature-card,
        .command-category,
        .step {
            opacity: 1 !important;
            transform: none !important;
        }
    }

    /* Contrast élevé */
    @media (prefers-contrast: high) {
        .search-highlight {
            background: #000000 !important;
            color: #ffffff !important;
            border: 1px solid #ffffff;
        }

        body.dark-mode .search-highlight {
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #000000;
        }
    }
`;

document.head.appendChild(functionalitiesStyles);

console.log('🎨 Styles dynamiques de fonctionnalités ajoutés');