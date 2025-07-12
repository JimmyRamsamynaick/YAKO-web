// Gestion complète des onglets légaux et fonctionnalités avancées
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ YAKO Legal - Initialisation...');

    // Variables globales
    let currentSection = 'mentions';
    let searchResults = [];
    let isDarkMode = false;

    // Gestion des onglets légaux avec navigation complète
    const legalTabs = document.querySelectorAll('.legal-tab');
    const legalSections = document.querySelectorAll('.legal-section');

    function switchLegalSection(targetSection) {
        console.log(`📋 Changement vers section: ${targetSection}`);

        // Animation de sortie pour la section active
        const currentActiveSection = document.querySelector('.legal-section.active');
        if (currentActiveSection) {
            currentActiveSection.style.opacity = '0';
            currentActiveSection.style.transform = 'translateY(-20px)';
        }

        // Retirer les classes actives
        legalTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        legalSections.forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });

        // Activer le nouvel onglet
        const activeTab = document.querySelector(`[data-section="${targetSection}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
            activeTab.setAttribute('tabindex', '0');

            // Effet visuel sur l'onglet
            activeTab.style.transform = 'scale(1.05)';
            setTimeout(() => {
                activeTab.style.transform = 'scale(1)';
            }, 150);
        }

        // Activer la nouvelle section avec animation
        const activeSection = document.getElementById(targetSection);
        if (activeSection) {
            setTimeout(() => {
                activeSection.classList.add('active');
                activeSection.setAttribute('aria-hidden', 'false');
                activeSection.style.opacity = '1';
                activeSection.style.transform = 'translateY(0)';
            }, 100);
        }

        // Mettre à jour l'historique
        const newUrl = new URL(window.location);
        newUrl.hash = targetSection;
        window.history.pushState({ section: targetSection }, '', newUrl);

        // Sauvegarder
        localStorage.setItem('activeLegalTab', targetSection);
        currentSection = targetSection;

        // Mettre à jour la TOC si ouverte
        if (document.querySelector('.toc-panel') && document.querySelector('.toc-panel').style.display === 'block') {
            updateTOC();
        }

        // Analytics
        trackTabSwitch(targetSection);
        announceTabChange(targetSection);

        // Réinitialiser la recherche
        clearSearch();
    }

    // Configuration des onglets avec accessibilité complète
    legalTabs.forEach((tab, index) => {
        // Attributs ARIA
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', tab.getAttribute('data-section'));
        tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');

        // Événements de clic
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = tab.getAttribute('data-section');
            switchLegalSection(targetSection);
        });

        // Navigation au clavier complète
        tab.addEventListener('keydown', (e) => {
            let newIndex = index;

            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    newIndex = index > 0 ? index - 1 : legalTabs.length - 1;
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    newIndex = index < legalTabs.length - 1 ? index + 1 : 0;
                    break;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = legalTabs.length - 1;
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    tab.click();
                    return;
            }

            if (newIndex !== index) {
                legalTabs[newIndex].focus();
                legalTabs[newIndex].click();
            }
        });

        // Effets visuels
        tab.addEventListener('mouseenter', () => {
            if (!tab.classList.contains('active')) {
                tab.style.transform = 'translateY(-2px)';
                tab.style.boxShadow = '0 6px 20px rgba(124, 45, 18, 0.2)';
            }
        });

        tab.addEventListener('mouseleave', () => {
            if (!tab.classList.contains('active')) {
                tab.style.transform = 'translateY(0)';
                tab.style.boxShadow = '';
            }
        });
    });

    // Gestion des liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            if (document.getElementById(targetSection)) {
                switchLegalSection(targetSection);
                setTimeout(() => {
                    document.querySelector('.legal-content').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 200);
            }
        });
    });

    // Initialisation de l'onglet actif
    function initializeLegalTab() {
        let targetSection = 'mentions';

        // Priorité : URL > localStorage > défaut
        if (window.location.hash) {
            const hashSection = window.location.hash.substring(1);
            if (document.getElementById(hashSection)) {
                targetSection = hashSection;
            }
        } else {
            const savedTab = localStorage.getItem('activeLegalTab');
            if (savedTab && document.getElementById(savedTab)) {
                targetSection = savedTab;
            }
        }

        switchLegalSection(targetSection);
    }

    // Gestion de l'historique du navigateur
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.section) {
            switchLegalSection(e.state.section);
        } else {
            initializeLegalTab();
        }
    });

    // Menu mobile avec gestion complète
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.contains('active');

            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Bloquer le scroll
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

            // Accessibilité
            navToggle.setAttribute('aria-expanded', !isActive);
            navMenu.setAttribute('aria-hidden', isActive);

            // Focus management
            if (!isActive) {
                const firstLink = navMenu.querySelector('.nav-link');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        });

        // Fermer le menu avec clic extérieur
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMenu();
            }
        });

        // Navigation clavier dans le menu
        navMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMenu();
                navToggle.focus();
            }
        });

        function closeMenu() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = '';
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.setAttribute('aria-hidden', 'true');
        }
    }

    // Animations au scroll avec intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('animate-in');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Observer tous les éléments animables
    const elementsToAnimate = document.querySelectorAll('.legal-item, .summary-card, .legal-document h2');
    elementsToAnimate.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
        scrollObserver.observe(element);
    });

    // ========== GESTION DES COOKIES AVANCÉE ==========
    const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');
    const saveCookieBtn = document.getElementById('save-cookie-preferences');
    const resetCookieBtn = document.getElementById('reset-cookie-preferences');

    // Configuration des cookies par défaut
    const defaultCookieSettings = {
        analytics: false,
        performance: true,
        preferences: true
    };

    function loadCookiePreferences() {
        console.log('🍪 Chargement des préférences de cookies');
        const preferences = JSON.parse(localStorage.getItem('cookiePreferences') || JSON.stringify(defaultCookieSettings));

        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '');
            toggle.checked = preferences[cookieType] !== undefined ? preferences[cookieType] : defaultCookieSettings[cookieType];
            toggle.setAttribute('aria-checked', toggle.checked);

            // Ajouter un indicateur visuel
            updateToggleVisual(toggle);
        });

        applyCookiePreferences(preferences);
        updateCookieStatusBadge(preferences);
    }

    function saveCookiePreferences() {
        console.log('💾 Sauvegarde des préférences de cookies');
        const preferences = {};

        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '');
            preferences[cookieType] = toggle.checked;
            toggle.setAttribute('aria-checked', toggle.checked);
        });

        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        applyCookiePreferences(preferences);
        updateCookieStatusBadge(preferences);

        showNotification('✅ Vos préférences de cookies ont été sauvegardées !', 'success');
        trackCookiePreferences(preferences);

        // Effet visuel sur le bouton
        if (saveCookieBtn) {
            saveCookieBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                saveCookieBtn.style.transform = 'scale(1)';
            }, 150);
        }
    }

    function resetCookiePreferences() {
        console.log('🔄 Réinitialisation des préférences de cookies');

        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '');
            toggle.checked = defaultCookieSettings[cookieType] || false;
            toggle.setAttribute('aria-checked', toggle.checked);
            updateToggleVisual(toggle);
        });

        localStorage.removeItem('cookiePreferences');
        applyCookiePreferences(defaultCookieSettings);
        updateCookieStatusBadge(defaultCookieSettings);

        showNotification('🔄 Préférences de cookies réinitialisées aux valeurs par défaut', 'info');
    }

    function updateToggleVisual(toggle) {
        const slider = toggle.nextElementSibling;
        if (slider && slider.classList.contains('toggle-slider')) {
            slider.style.background = toggle.checked ? '#7c2d12' : '#d1d5db';
        }
    }

    function applyCookiePreferences(preferences) {
        console.log('⚙️ Application des préférences:', preferences);

        // Analytics
        if (preferences.analytics) {
            console.log('📊 Analytics activé');
            // window.gtag && gtag('consent', 'update', { analytics_storage: 'granted' });
        } else {
            console.log('🚫 Analytics désactivé');
            // window.gtag && gtag('consent', 'update', { analytics_storage: 'denied' });
        }

        // Performance
        if (preferences.performance) {
            console.log('⚡ Cookies de performance activés');
        } else {
            console.log('🐌 Cookies de performance désactivés');
        }

        // Préférences
        if (preferences.preferences) {
            console.log('🎨 Cookies de préférences activés');
        } else {
            console.log('🚫 Cookies de préférences désactivés');
        }
    }

    function updateCookieStatusBadge(preferences) {
        let statusBadge = document.querySelector('.cookie-status-badge');

        if (!statusBadge) {
            statusBadge = document.createElement('div');
            statusBadge.className = 'cookie-status-badge';
            statusBadge.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                z-index: 999;
                transition: all 0.3s ease;
                cursor: pointer;
                user-select: none;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            `;
            document.body.appendChild(statusBadge);

            statusBadge.addEventListener('click', () => {
                switchLegalSection('cookies');
                setTimeout(() => {
                    document.querySelector('#cookies').scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            });
        }

        const enabledCount = Object.values(preferences).filter(Boolean).length;
        const totalCount = Object.keys(preferences).length;

        statusBadge.textContent = `🍪 ${enabledCount}/${totalCount}`;
        statusBadge.title = `${enabledCount} types de cookies activés sur ${totalCount} - Cliquer pour gérer`;

        // Couleur selon le niveau d'acceptation
        if (enabledCount === 0) {
            statusBadge.style.background = '#ef4444';
            statusBadge.style.color = 'white';
        } else if (enabledCount === totalCount) {
            statusBadge.style.background = '#10b981';
            statusBadge.style.color = 'white';
        } else {
            statusBadge.style.background = '#f59e0b';
            statusBadge.style.color = 'white';
        }
    }

    // Événements des cookies
    if (saveCookieBtn) {
        saveCookieBtn.addEventListener('click', saveCookiePreferences);
    }

    if (resetCookieBtn) {
        resetCookieBtn.addEventListener('click', resetCookiePreferences);
    }

    cookieToggles.forEach(toggle => {
        toggle.addEventListener('change', () => {
            updateToggleVisual(toggle);

            // Feedback visuel immédiat
            const label = toggle.parentElement.querySelector('span:last-child');
            if (label) {
                label.style.color = toggle.checked ? '#10b981' : '#ef4444';
                setTimeout(() => {
                    label.style.color = '';
                }, 500);
            }
        });
    });

    // ========== RECHERCHE AVANCÉE ==========
    function setupLegalSearch() {
        console.log('🔍 Configuration de la recherche légale');

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Rechercher dans les documents légaux... (Ctrl+F)';
        searchInput.className = 'legal-search';
        searchInput.setAttribute('aria-label', 'Rechercher dans les documents légaux');

        const legalContent = document.querySelector('.legal-content .container');
        if (legalContent) {
            legalContent.insertBefore(searchInput, legalContent.firstChild);

            // Debounced search
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
                    showNotification('💡 Utilisez la recherche pour trouver rapidement des informations', 'info', 2000);
                }
            });

            // Auto-suggestions (simulation)
            const suggestions = [
                'données personnelles', 'cookies', 'droits', 'rgpd', 'contact',
                'responsabilité', 'utilisation', 'conditions', 'confidentialité'
            ];

            searchInput.addEventListener('focus', () => {
                if (!searchInput.value) {
                    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
                    searchInput.placeholder = `Essayez: "${randomSuggestion}"`;
                }
            });

            searchInput.addEventListener('blur', () => {
                searchInput.placeholder = 'Rechercher dans les documents légaux... (Ctrl+F)';
            });
        }
    }

    function performSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            clearSearch();
            return;
        }

        console.log(`🔎 Recherche: "${searchTerm}"`);

        const legalItems = document.querySelectorAll('.legal-item');
        let hasResults = false;
        let resultsBySection = {};
        let totalMatches = 0;

        legalItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const matches = (text.match(new RegExp(searchTerm, 'gi')) || []).length;
            const isVisible = matches > 0;

            item.style.display = isVisible ? 'block' : 'none';

            if (isVisible) {
                hasResults = true;
                totalMatches += matches;
                highlightText(item, searchTerm);

                const section = item.closest('.legal-section');
                const sectionId = section ? section.id : 'unknown';
                resultsBySection[sectionId] = (resultsBySection[sectionId] || 0) + matches;
            } else {
                removeHighlight(item);
            }
        });

        showSearchResults(hasResults, searchTerm, resultsBySection, totalMatches);
        trackLegalSearch(searchTerm, hasResults, totalMatches);

        // Basculer vers la première section avec résultats si nécessaire
        if (hasResults && Object.keys(resultsBySection).length > 0) {
            const firstSectionWithResults = Object.keys(resultsBySection)[0];
            if (firstSectionWithResults !== currentSection) {
                switchLegalSection(firstSectionWithResults);
            }
        }
    }

    function clearSearch() {
        document.querySelectorAll('.legal-item').forEach(item => {
            item.style.display = 'block';
            removeHighlight(item);
        });
        hideSearchResults();
        searchResults = [];
    }

    function highlightText(element, searchTerm) {
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

    function showSearchResults(hasResults, searchTerm, resultsBySection, totalMatches) {
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

            const legalContent = document.querySelector('.legal-content .container');
            const searchInput = legalContent ? legalContent.querySelector('.legal-search') : null;
            if (searchInput && searchInput.parentNode) {
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
                    💡 Essayez des mots-clés différents ou naviguez manuellement dans les sections
                </small>
            `;
        } else {
            const sectionNames = {
                'mentions': 'Mentions légales',
                'privacy': 'Politique de confidentialité',
                'terms': 'Conditions d\'utilisation',
                'cookies': 'Politique des cookies'
            };

            let sectionsHTML = '';
            Object.entries(resultsBySection).forEach(([sectionId, count]) => {
                if (count > 0) {
                    sectionsHTML += `
                        <span onclick="switchLegalSection('${sectionId}')" 
                              style="display: inline-block; margin: 5px; padding: 6px 12px; 
                                     background: rgba(124, 45, 18, 0.1); border: 1px solid rgba(124, 45, 18, 0.3);
                                     border-radius: 20px; cursor: pointer; transition: all 0.2s ease; font-size: 0.9rem;"
                              onmouseenter="this.style.background='rgba(124, 45, 18, 0.2)'"
                              onmouseleave="this.style.background='rgba(124, 45, 18, 0.1)'">
                            ${sectionNames[sectionId] || sectionId}: ${count} occurrence${count > 1 ? 's' : ''}
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
                <p style="margin-bottom: 15px;">Résultats pour "<em>${searchTerm}</em>" dans ${Object.keys(resultsBySection).length} section${Object.keys(resultsBySection).length > 1 ? 's' : ''}</p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">
                    ${sectionsHTML}
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    }

    function hideSearchResults() {
        const resultDiv = document.querySelector('.search-results');
        if (resultDiv) {
            resultDiv.style.display = 'none';
        }
    }

    // ========== TABLE DES MATIÈRES FLOTTANTE ==========
    function setupFloatingTOC() {
        console.log('📑 Configuration de la table des matières');

        const tocButton = document.createElement('button');
        tocButton.innerHTML = '<i class="fas fa-list"></i>';
        tocButton.className = 'toc-toggle';
        tocButton.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid #7c2d12;
            background: white;
            color: #7c2d12;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(124, 45, 18, 0.3);
        `;

        const tocPanel = document.createElement('div');
        tocPanel.className = 'toc-panel';
        tocPanel.style.cssText = `
            position: fixed;
            bottom: 200px;
            left: 20px;
            width: 320px;
            max-height: 450px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
            padding: 25px;
            display: none;
            overflow-y: auto;
            z-index: 999;
            border: 2px solid #7c2d12;
            transform: translateY(10px);
            opacity: 0;
            transition: all 0.3s ease;
        `;

        tocButton.setAttribute('title', 'Table des matières (T)');
        tocButton.setAttribute('aria-label', 'Ouvrir la table des matières');

        document.body.appendChild(tocButton);
        document.body.appendChild(tocPanel);

        let tocOpen = false;

        tocButton.addEventListener('click', () => {
            tocOpen = !tocOpen;

            if (tocOpen) {
                tocPanel.style.display = 'block';
                setTimeout(() => {
                    tocPanel.style.transform = 'translateY(0)';
                    tocPanel.style.opacity = '1';
                }, 10);

                updateTOC();
                tocButton.style.background = '#7c2d12';
                tocButton.style.color = 'white';
                tocButton.style.transform = 'scale(1.1)';
            } else {
                tocPanel.style.transform = 'translateY(10px)';
                tocPanel.style.opacity = '0';
                setTimeout(() => {
                    tocPanel.style.display = 'none';
                }, 300);

                tocButton.style.background = 'white';
                tocButton.style.color = '#7c2d12';
                tocButton.style.transform = 'scale(1)';
            }
        });

        // Fermer en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (!tocButton.contains(e.target) && !tocPanel.contains(e.target) && tocOpen) {
                tocButton.click();
            }
        });

        window.updateTOC = updateTOC;
    }

    function updateTOC() {
        const tocPanel = document.querySelector('.toc-panel');
        const activeSection = document.querySelector('.legal-section.active');

        if (!activeSection || !tocPanel) return;

        const headings = activeSection.querySelectorAll('h3');
        const sectionTitle = activeSection.querySelector('h2') ?
            activeSection.querySelector('h2').textContent :
            'Section courante';

        let tocHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #7c2d12;">
                <h4 style="margin: 0; color: #7c2d12; font-size: 1.1rem;">📑 ${sectionTitle}</h4>
                <button onclick="document.querySelector('.toc-toggle').click()" 
                        style="background: none; border: none; color: #7c2d12; cursor: pointer; font-size: 1.2rem; padding: 5px;"
                        title="Fermer">✕</button>
            </div>
        `;

        if (headings.length === 0) {
            tocHTML += '<p style="color: #64748b; font-style: italic;">Aucun titre dans cette section</p>';
        } else {
            headings.forEach((heading, index) => {
                const id = `heading-${currentSection}-${index}`;
                heading.id = id;

                tocHTML += `
                    <div style="margin-bottom: 8px;">
                        <a href="#${id}" 
                           style="color: #4b5563; text-decoration: none; font-size: 0.95rem; line-height: 1.5; 
                                  display: block; padding: 8px 12px; border-radius: 8px; transition: all 0.2s ease;
                                  border-left: 3px solid transparent;" 
                           data-toc-link="${id}"
                           onmouseenter="this.style.background='#f8fafc'; this.style.borderLeftColor='#7c2d12'; this.style.color='#7c2d12'; this.style.paddingLeft='16px'"
                           onmouseleave="this.style.background=''; this.style.borderLeftColor='transparent'; this.style.color='#4b5563'; this.style.paddingLeft='12px'">
                            ${heading.textContent}
                        </a>
                    </div>
                `;
            });
        }

        tocHTML += `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center;">
                <button onclick="window.print()" 
                        style="background: #7c2d12; color: white; border: none; padding: 8px 16px; 
                               border-radius: 6px; cursor: pointer; font-size: 0.9rem; margin-right: 10px;"
                        title="Imprimer cette section">
                    <i class="fas fa-print"></i> Imprimer
                </button>
                <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
                        style="background: #64748b; color: white; border: none; padding: 8px 16px; 
                               border-radius: 6px; cursor: pointer; font-size: 0.9rem;"
                        title="Retour en haut">
                    <i class="fas fa-arrow-up"></i> Haut
                </button>
            </div>
        `;

        tocPanel.innerHTML = tocHTML;

        // Ajouter les écouteurs pour les liens
        tocPanel.querySelectorAll('[data-toc-link]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('data-toc-link');
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Effet de highlight sur le titre
                    targetElement.style.background = 'rgba(124, 45, 18, 0.1)';
                    targetElement.style.padding = '10px';
                    targetElement.style.borderRadius = '8px';
                    setTimeout(() => {
                        targetElement.style.background = '';
                        targetElement.style.padding = '';
                        targetElement.style.borderRadius = '';
                    }, 2000);

                    // Fermer la TOC
                    document.querySelector('.toc-toggle').click();
                }
            });
        });
    }

    // ========== FONCTION D'IMPRESSION AVANCÉE ==========
    function setupPrintFunction() {
        console.log('🖨️ Configuration de l\'impression');

        const printButton = document.createElement('button');
        printButton.innerHTML = '<i class="fas fa-print"></i>';
        printButton.className = 'print-btn';
        printButton.style.cssText = `
            position: fixed;
            bottom: 140px;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid #7c2d12;
            background: white;
            color: #7c2d12;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(124, 45, 18, 0.3);
        `;

        printButton.setAttribute('title', 'Imprimer le document actuel (Ctrl+P)');
        printButton.setAttribute('aria-label', 'Imprimer le document légal actuel');

        printButton.addEventListener('click', () => {
            const activeSection = document.querySelector('.legal-section.active');
            if (activeSection) {
                printLegalDocument(activeSection);
            }
        });

        // Effets visuels
        printButton.addEventListener('mouseenter', () => {
            printButton.style.background = '#7c2d12';
            printButton.style.color = 'white';
            printButton.style.transform = 'scale(1.1)';
        });

        printButton.addEventListener('mouseleave', () => {
            printButton.style.background = 'white';
            printButton.style.color = '#7c2d12';
            printButton.style.transform = 'scale(1)';
        });

        document.body.appendChild(printButton);
    }

    function printLegalDocument(section) {
        const sectionTitle = section.querySelector('h2') ?
            section.querySelector('h2').textContent :
            'Document Légal';
        console.log(`🖨️ Impression: ${sectionTitle}`);

        const printWindow = window.open('', '_blank', 'width=800,height=600');

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>YAKO Bot - ${sectionTitle}</title>
                <style>
                    @page {
                        margin: 2cm;
                        size: A4;
                    }
                    
                    body { 
                        font-family: 'Georgia', 'Times New Roman', serif;
                        margin: 0;
                        padding: 0;
                        line-height: 1.7; 
                        color: #333;
                        font-size: 12pt;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #7c2d12;
                    }
                    
                    .header h1 {
                        color: #7c2d12;
                        font-size: 24pt;
                        margin-bottom: 10px;
                        font-weight: bold;
                    }
                    
                    .header .subtitle {
                        font-size: 14pt;
                        color: #666;
                        margin-bottom: 5px;
                    }
                    
                    .header .date {
                        font-size: 10pt;
                        color: #888;
                        font-style: italic;
                    }
                    
                    h2 { 
                        color: #7c2d12; 
                        margin: 30px 0 20px 0; 
                        padding-bottom: 10px;
                        border-bottom: 2px solid #7c2d12;
                        font-size: 18pt;
                        break-after: avoid;
                    }
                    
                    h3 { 
                        color: #7c2d12; 
                        margin: 25px 0 15px 0; 
                        font-size: 14pt;
                        font-weight: bold;
                        break-after: avoid;
                    }
                    
                    h4 {
                        color: #444;
                        margin: 20px 0 10px 0;
                        font-size: 12pt;
                        font-weight: bold;
                    }
                    
                    p { 
                        margin-bottom: 12px; 
                        text-align: justify;
                        orphans: 3;
                        widows: 3;
                    }
                    
                    ul, ol { 
                        margin: 15px 0 15px 25px;
                        padding-left: 0;
                    }
                    
                    li {
                        margin-bottom: 8px;
                        line-height: 1.6;
                    }
                    
                    strong {
                        font-weight: bold;
                        color: #222;
                    }
                    
                    em {
                        font-style: italic;
                    }
                    
                    .legal-item {
                        margin-bottom: 30px;
                        break-inside: avoid;
                    }
                    
                    .cookie-category {
                        background: #f9f9f9;
                        padding: 15px;
                        border-left: 4px solid #7c2d12;
                        margin: 15px 0;
                        break-inside: avoid;
                    }
                    
                    .search-highlight { 
                        background: #ffeb3b;
                        color: #333;
                        font-weight: bold;
                        padding: 1px 2px;
                    }
                    
                    .cookie-controls,
                    .browser-instructions details,
                    .cookie-preferences,
                    button,
                    .data-management {
                        display: none !important;
                    }
                    
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ccc;
                        font-size: 10pt;
                        color: #666;
                        text-align: center;
                    }
                    
                    .footer p {
                        margin-bottom: 5px;
                    }
                    
                    @media print {
                        body { 
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        
                        .legal-item { 
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }
                        
                        h2, h3, h4 { 
                            break-after: avoid;
                            page-break-after: avoid;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🤖 YAKO Bot</h1>
                    <div class="subtitle">${sectionTitle}</div>
                    <div class="date">Document généré le ${formattedDate}</div>
                </div>
                
                <div class="content">
                    ${section.innerHTML}
                </div>
                
                <div class="footer">
                    <p><strong>YAKO Bot Services</strong> - Bot Discord d'administration</p>
                    <p>📧 legal@yakobot.com | 🌐 https://yakobot.com</p>
                    <p>📍 123 Avenue des Champs-Élysées, 75008 Paris, France</p>
                    <p style="margin-top: 15px; font-style: italic;">
                        Ce document a été généré automatiquement depuis notre site web.<br>
                        Pour la version la plus récente, consultez : <strong>https://yakobot.com/legal</strong>
                    </p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();

        // Attendre le chargement avant d'imprimer
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();

                // Fermer la fenêtre après impression (optionnel)
                setTimeout(() => {
                    printWindow.close();
                }, 1000);
            }, 500);
        };

        trackDocumentPrint(sectionTitle);
        showNotification(`📄 Préparation de l'impression: ${sectionTitle}`, 'info', 3000);
    }

    // ========== MODE SOMBRE AVANCÉ ==========
    function setupDarkMode() {
        console.log('🌙 Configuration du mode sombre');

        const darkModeToggle = document.createElement('button');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        darkModeToggle.className = 'dark-mode-toggle';
        darkModeToggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: #7c2d12;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(124, 45, 18, 0.3);
        `;

        darkModeToggle.setAttribute('title', 'Basculer le mode sombre (Ctrl+D)');
        darkModeToggle.setAttribute('aria-label', 'Basculer entre mode clair et mode sombre');

        document.body.appendChild(darkModeToggle);

        darkModeToggle.addEventListener('click', () => {
            toggleDarkMode();
        });

        // Effets visuels
        darkModeToggle.addEventListener('mouseenter', () => {
            darkModeToggle.style.transform = 'scale(1.1) rotate(10deg)';
        });

        darkModeToggle.addEventListener('mouseleave', () => {
            darkModeToggle.style.transform = 'scale(1) rotate(0deg)';
        });

        function toggleDarkMode() {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark-mode', isDarkMode);

            darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            darkModeToggle.style.background = isDarkMode ? '#fbbf24' : '#7c2d12';

            localStorage.setItem('darkMode', isDarkMode);

            showNotification(
                `${isDarkMode ? '🌙 Mode sombre' : '☀️ Mode clair'} activé`,
                'info',
                2000
            );

            trackDarkModeToggle(isDarkMode);
        }

        // Restaurer la préférence
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            isDarkMode = true;
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeToggle.style.background = '#fbbf24';
        }

        // Détecter la préférence système
        if (!localStorage.getItem('darkMode')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                isDarkMode = true;
                document.body.classList.add('dark-mode');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                darkModeToggle.style.background = '#fbbf24';
            }
        }

        // Écouter les changements de préférence système
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('darkMode')) {
                if (e.matches && !isDarkMode) {
                    toggleDarkMode();
                } else if (!e.matches && isDarkMode) {
                    toggleDarkMode();
                }
            }
        });
    }

    // ========== RACCOURCIS CLAVIER COMPLETS ==========
    function setupKeyboardShortcuts() {
        console.log('⌨️ Configuration des raccourcis clavier');

        document.addEventListener('keydown', (e) => {
            // Ignorer si on est dans un champ de saisie
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(true) {
                // Ctrl/Cmd + F pour la recherche
                case (e.ctrlKey || e.metaKey) && e.key === 'f':
                    e.preventDefault();
                    const searchInput = document.querySelector('.legal-search');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                    break;

                // Ctrl/Cmd + P pour imprimer
                case (e.ctrlKey || e.metaKey) && e.key === 'p':
                    e.preventDefault();
                    const printBtn = document.querySelector('.print-btn');
                    if (printBtn) {
                        printBtn.click();
                    }
                    break;

                // Ctrl/Cmd + D pour le mode sombre
                case (e.ctrlKey || e.metaKey) && e.key === 'd':
                    e.preventDefault();
                    const darkBtn = document.querySelector('.dark-mode-toggle');
                    if (darkBtn) {
                        darkBtn.click();
                    }
                    break;

                // T pour la table des matières
                case e.key === 't' || e.key === 'T':
                    const tocBtn = document.querySelector('.toc-toggle');
                    if (tocBtn) {
                        tocBtn.click();
                    }
                    break;

                // Échap pour fermer tout
                case e.key === 'Escape':
                    // Fermer le menu mobile
                    const navMenu = document.querySelector('.nav-menu');
                    const navToggle = document.querySelector('.nav-toggle');
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        navToggle.classList.remove('active');
                        document.body.style.overflow = '';
                    }

                    // Fermer la TOC
                    const tocPanel = document.querySelector('.toc-panel');
                    if (tocPanel && tocPanel.style.display === 'block') {
                        document.querySelector('.toc-toggle').click();
                    }

                    // Effacer la recherche
                    const search = document.querySelector('.legal-search');
                    if (search && search.value) {
                        search.value = '';
                        clearSearch();
                    }
                    break;

                // Chiffres 1-4 pour naviguer entre les sections
                case ['1', '2', '3', '4'].includes(e.key):
                    const sections = ['mentions', 'privacy', 'terms', 'cookies'];
                    const sectionIndex = parseInt(e.key) - 1;
                    if (sections[sectionIndex]) {
                        switchLegalSection(sections[sectionIndex]);
                    }
                    break;

                // H pour afficher l'aide des raccourcis
                case e.key === 'h' || e.key === 'H':
                    showKeyboardHelp();
                    break;
            }
        });
    }

    function showKeyboardHelp() {
        const helpHTML = `
            <div style="max-width: 500px; text-align: left;">
                <h3 style="margin-bottom: 20px; color: #7c2d12;">⌨️ Raccourcis clavier</h3>
                <div style="display: grid; gap: 10px; font-size: 0.9rem;">
                    <div><kbd>Ctrl+F</kbd> - Rechercher dans les documents</div>
                    <div><kbd>Ctrl+P</kbd> - Imprimer le document actuel</div>
                    <div><kbd>Ctrl+D</kbd> - Basculer le mode sombre</div>
                    <div><kbd>T</kbd> - Ouvrir/fermer la table des matières</div>
                    <div><kbd>1-4</kbd> - Naviguer entre les sections</div>
                    <div><kbd>Échap</kbd> - Fermer les panneaux ouverts</div>
                    <div><kbd>H</kbd> - Afficher cette aide</div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; font-size: 0.8rem; color: #1e40af;">
                    💡 <strong>Astuce :</strong> Utilisez les flèches ← → pour naviguer entre les onglets quand l'un d'eux est sélectionné
                </div>
            </div>
        `;

        showNotification(helpHTML, 'info', 8000);
    }

    // ========== GESTION DES DONNÉES UTILISATEUR ==========
    function setupDataManagement() {
        console.log('💾 Configuration de la gestion des données');

        // Ajouter les boutons d'export et de suppression après un délai
        setTimeout(() => {
            const privacySection = document.getElementById('privacy');
            if (privacySection) {
                addDataManagementButtons(privacySection);
            }
        }, 1500);
    }

    function addDataManagementButtons(privacySection) {
        const dataManagementDiv = document.createElement('div');
        dataManagementDiv.className = 'data-management';
        dataManagementDiv.style.cssText = `
            margin-top: 30px;
            padding: 25px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 15px;
            border: 2px solid #7c2d12;
            text-align: center;
            box-shadow: 0 4px 15px rgba(124, 45, 18, 0.1);
        `;

        const userData = getUserDataSummary();

        dataManagementDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                <i class="fas fa-database" style="color: #7c2d12; font-size: 1.2rem;"></i>
                <h4 style="margin: 0; color: #7c2d12;">Gestion de vos données personnelles</h4>
            </div>
            
            <p style="margin-bottom: 20px; color: #64748b; font-size: 0.95rem; line-height: 1.6;">
                Conformément à vos droits RGPD, vous pouvez consulter, exporter ou supprimer vos données stockées localement.<br>
                <strong>Données actuellement stockées :</strong> ${userData.summary}
            </p>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-bottom: 15px;">
                <button onclick="exportUserData()" 
                        class="btn-data" 
                        style="background: #059669; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;"
                        onmouseenter="this.style.background='#047857'; this.style.transform='translateY(-2px)'"
                        onmouseleave="this.style.background='#059669'; this.style.transform='translateY(0)'">
                    <i class="fas fa-download"></i> Exporter mes données
                </button>
                
                <button onclick="deleteAllUserData()" 
                        class="btn-data" 
                        style="background: #ef4444; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 0.9rem; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;"
                        onmouseenter="this.style.background='#dc2626'; this.style.transform='translateY(-2px)'"
                        onmouseleave="this.style.background='#ef4444'; this.style.transform='translateY(0)'">
                    <i class="fas fa-trash"></i> Supprimer mes données
                </button>
            </div>
            
            <div style="font-size: 0.8rem; color: #6b7280; font-style: italic;">
                <i class="fas fa-info-circle"></i> Ces actions n'affectent que les données stockées dans votre navigateur
            </div>
        `;

        const lastLegalItem = privacySection.querySelector('.legal-document .legal-item:last-child');
        if (lastLegalItem) {
            lastLegalItem.appendChild(dataManagementDiv);
        }
    }

    function getUserDataSummary() {
        const cookiePrefs = localStorage.getItem('cookiePreferences');
        const activeTab = localStorage.getItem('activeLegalTab');
        const darkMode = localStorage.getItem('darkMode');

        let count = 0;
        let details = [];

        if (cookiePrefs) {
            count++;
            details.push('préférences cookies');
        }
        if (activeTab) {
            count++;
            details.push('onglet actif');
        }
        if (darkMode) {
            count++;
            details.push('mode d\'affichage');
        }

        return {
            count,
            summary: count > 0 ? `${count} élément${count > 1 ? 's' : ''} (${details.join(', ')})` : 'aucune donnée'
        };
    }

    // ========== SCROLL NAVBAR ==========
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const currentScrollY = window.scrollY;

        // Effet de transparence
        if (currentScrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }

        // Masquer/afficher selon la direction
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    });

    // ========== INITIALISATION ==========

    // Charger les préférences de cookies
    loadCookiePreferences();

    // Initialiser l'onglet actif
    initializeLegalTab();

    // Configurer toutes les fonctionnalités
    setupLegalSearch();
    setupFloatingTOC();
    setupPrintFunction();
    setupDarkMode();
    setupKeyboardShortcuts();
    setupDataManagement();

    // Exposer les fonctions globales nécessaires
    window.switchLegalSection = switchLegalSection;
    window.exportUserData = exportUserData;
    window.deleteAllUserData = deleteAllUserData;

    console.log('✅ YAKO Legal - Toutes les fonctionnalités initialisées');
});

// ========== FONCTIONS UTILITAIRES GLOBALES ==========

function announceTabChange(sectionName) {
    const announcer = document.getElementById('aria-announcer') || createAnnouncer();
    const sectionNames = {
        'mentions': 'Mentions légales',
        'privacy': 'Politique de confidentialité',
        'terms': 'Conditions d\'utilisation',
        'cookies': 'Politique des cookies'
    };

    announcer.textContent = `Section ${sectionNames[sectionName] || sectionName} affichée`;
}

function createAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'aria-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(announcer);
    return announcer;
}

// FONCTION NOTIFICATION CORRIGÉE POUR POSITION COHÉRENTE
function showNotification(message, type = 'success', duration = 4000) {
    // Supprimer les notifications existantes
    document.querySelectorAll('.notification').forEach(notif => notif.remove());

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

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        color: ${colors[type]};
        padding: 20px 25px;
        border-radius: 12px;
        border-left: 4px solid ${colors[type]};
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        cursor: pointer;
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fas ${icons[type]}" style="font-size: 1.2rem; margin-top: 2px; flex-shrink: 0;"></i>
            <div style="flex: 1; line-height: 1.4;">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: 10px; opacity: 0.7; flex-shrink: 0;"
                    title="Fermer">×</button>
        </div>
    `;

    // Ajouter l'animation CSS si elle n'existe pas
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Fermer automatiquement
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    // Fermer au clic
    notification.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// ========== FONCTIONS D'ANALYTICS ET TRACKING ==========

function trackTabSwitch(section) {
    console.log(`📊 Analytics: Changement vers ${section}`);
    // Ici vous pouvez ajouter votre code d'analytics
    // gtag('event', 'tab_switch', { section: section });
}

function trackCookiePreferences(preferences) {
    console.log('📊 Analytics: Préférences cookies sauvegardées', preferences);
    // gtag('event', 'cookie_preferences_saved', preferences);
}

function trackLegalSearch(searchTerm, hasResults, totalMatches) {
    console.log(`📊 Analytics: Recherche "${searchTerm}" - ${totalMatches} résultats`);
    // gtag('event', 'legal_search', {
    //     search_term: searchTerm,
    //     has_results: hasResults,
    //     total_matches: totalMatches
    // });
}

function trackDocumentPrint(sectionTitle) {
    console.log(`📊 Analytics: Impression ${sectionTitle}`);
    // gtag('event', 'document_print', { section: sectionTitle });
}

function trackDarkModeToggle(isDark) {
    console.log(`📊 Analytics: Mode ${isDark ? 'sombre' : 'clair'} activé`);
    // gtag('event', 'dark_mode_toggle', { is_dark: isDark });
}

// ========== FONCTIONS DE GESTION DES DONNÉES ==========

function exportUserData() {
    console.log('📤 Export des données utilisateur');

    const userData = {
        cookiePreferences: JSON.parse(localStorage.getItem('cookiePreferences') || '{}'),
        activeLegalTab: localStorage.getItem('activeLegalTab'),
        darkMode: localStorage.getItem('darkMode') === 'true',
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `yako-legal-data-${new Date().toISOString().split('T')[0]}.json`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

    showNotification('📥 Vos données ont été exportées avec succès !', 'success');
    console.log('✅ Export terminé:', userData);
}

function deleteAllUserData() {
    const confirmation = confirm(
        '⚠️ Êtes-vous sûr de vouloir supprimer toutes vos données ?\n\n' +
        'Cette action supprimera :\n' +
        '• Vos préférences de cookies\n' +
        '• Votre onglet actif sauvegardé\n' +
        '• Votre préférence de mode d\'affichage\n\n' +
        'Cette action est irréversible.'
    );

    if (confirmation) {
        // Supprimer toutes les données liées à YAKO Legal
        localStorage.removeItem('cookiePreferences');
        localStorage.removeItem('activeLegalTab');
        localStorage.removeItem('darkMode');

        // Réinitialiser l'interface
        document.body.classList.remove('dark-mode');

        // Réinitialiser les cookies
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');
        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '');
            const defaultSettings = {
                analytics: false,
                performance: true,
                preferences: true
            };
            toggle.checked = defaultSettings[cookieType] || false;
        });

        // Retourner à la première section
        if (window.switchLegalSection) {
            window.switchLegalSection('mentions');
        }

        // Supprimer le badge de statut des cookies
        const statusBadge = document.querySelector('.cookie-status-badge');
        if (statusBadge) {
            statusBadge.remove();
        }

        // Mettre à jour le bouton de mode sombre
        const darkBtn = document.querySelector('.dark-mode-toggle');
        if (darkBtn) {
            darkBtn.innerHTML = '<i class="fas fa-moon"></i>';
            darkBtn.style.background = '#7c2d12';
        }

        showNotification('🗑️ Toutes vos données ont été supprimées', 'success');
        console.log('🗑️ Toutes les données utilisateur supprimées');

        // Recharger la page après un délai pour s'assurer que tout est réinitialisé
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

// ========== STYLES CSS POUR LES ÉLÉMENTS DYNAMIQUES ==========
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .legal-search {
        width: 100%;
        padding: 15px 20px;
        margin-bottom: 25px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        font-size: 1rem;
        transition: all 0.3s ease;
        background: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    
    .legal-search:focus {
        outline: none;
        border-color: #7c2d12;
        box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
    }
    
    .search-highlight {
        background: #fef08a;
        color: #854d0e;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
    }
    
    .dark-mode .legal-search {
        background: #374151;
        border-color: #4b5563;
        color: white;
    }
    
    .dark-mode .legal-search:focus {
        border-color: #fbbf24;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
    }
    
    .dark-mode .search-highlight {
        background: #fbbf24;
        color: #1f2937;
    }
    
    .toc-panel::-webkit-scrollbar {
        width: 6px;
    }
    
    .toc-panel::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
    }
    
    .toc-panel::-webkit-scrollbar-thumb {
        background: #7c2d12;
        border-radius: 3px;
    }
    
    .toc-panel::-webkit-scrollbar-thumb:hover {
        background: #5d1e0f;
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
    
    .dark-mode kbd {
        background: #4b5563;
        border-color: #6b7280;
        color: #e5e7eb;
    }
    
    /* Styles pour le mode sombre */
    .dark-mode {
        background: #1f2937;
        color: #e5e7eb;
    }
    
    .dark-mode .legal-document {
        background: #374151;
        border-color: #4b5563;
    }
    
    .dark-mode .legal-item {
        border-bottom-color: #4b5563;
    }
    
    .dark-mode .cookie-category {
        background: #4b5563;
        border-left-color: #fbbf24;
    }
    
    .dark-mode .cookie-controls {
        background: #4b5563;
    }
    
    .dark-mode .summary-card {
        background: #374151;
        border-color: #4b5563;
    }
    
    .dark-mode .toc-panel {
        background: #374151;
        border-color: #fbbf24;
        color: #e5e7eb;
    }
    
    .dark-mode .notification {
        background: #374151 !important;
        color: #e5e7eb !important;
    }
    
    @media (max-width: 768px) {
        .toc-panel {
            width: calc(100vw - 40px);
            left: 20px;
            right: 20px;
            max-width: none;
        }
        
        .print-btn,
        .toc-toggle,
        .dark-mode-toggle {
            width: 45px;
            height: 45px;
            font-size: 1.1rem;
        }
        
        .legal-search {
            font-size: 16px; /* Évite le zoom sur iOS */
        }
        
        .notification {
            top: 10px !important;
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
    }
`;

document.head.appendChild(dynamicStyles);

// ========== GESTION DU SCROLL POUR LA NAVIGATION LÉGALE ==========
function initLegalNavScroll() {
    const legalNav = document.querySelector('.legal-nav');
    if (!legalNav) return;

    let lastScrollY = window.scrollY;
    let isNavVisible = true;
    let scrollTimeout;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - lastScrollY);

        // Ne pas réagir aux petits mouvements de scroll
        if (scrollDifference < 5) return;

        // Masquer si on scroll vers le bas et qu'on a dépassé la hauteur de la nav
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            hideLegalNav();
        }
        // Afficher si on scroll vers le haut
        else if (currentScrollY < lastScrollY) {
            showLegalNav();
        }

        lastScrollY = currentScrollY;

        // Toujours afficher la nav après 2 secondes d'inactivité
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            showLegalNav();
        }, 2000);
    }

    function hideLegalNav() {
        if (isNavVisible && window.innerWidth > 768) { // Seulement sur desktop
            legalNav.classList.add('hidden');
            isNavVisible = false;
            console.log('📱 Navigation légale masquée');
        }
    }

    function showLegalNav() {
        if (!isNavVisible) {
            legalNav.classList.remove('hidden');
            isNavVisible = true;
            console.log('📱 Navigation légale affichée');
        }
    }

    // Événement de scroll avec throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Toujours afficher la nav au hover
    legalNav.addEventListener('mouseenter', showLegalNav);

    // Afficher la nav quand on atteint le haut de la page
    window.addEventListener('scroll', () => {
        if (window.scrollY < 100) {
            showLegalNav();
        }
    });

    // Gestion responsive
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            showLegalNav(); // Toujours visible sur mobile
        }
    });

    console.log('✅ Gestion du scroll de la navigation légale initialisée');
}

// Initialiser la gestion du scroll de navigation si on est sur la page légale
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('legal.html')) {
        initLegalNavScroll();
    }
});

// Exposer les fonctions utilitaires
window.yakoLegal = {
    showNotification,
    switchLegalSection: window.switchLegalSection,
    exportUserData: window.exportUserData,
    deleteAllUserData: window.deleteAllUserData
};

console.log('🎨 Fichier legal.js complet et corrigé');