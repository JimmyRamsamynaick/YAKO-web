// YAKO Legal - Version corrigée complète avec navigation sticky et cookie badge fixé
class YakoLegal {
    constructor() {
        this.currentSection = 'mentions';
        this.searchResults = [];
        this.isDarkMode = false;
        this.cookieModalVisible = false;
        this.isNavVisible = true;
        this.lastScrollY = window.scrollY;

        this.defaultCookieSettings = {
            analytics: false,
            performance: true,
            preferences: true
        };
    }

    // Initialisation principale
    init() {
        console.log('🏛️ YAKO Legal - Initialisation...');

        this.setupMobileMenu();
        this.setupLegalTabs();
        this.setupScrollToTop();
        this.setupCookies();
        this.setupSearch();
        this.setupKeyboardShortcuts();
        this.setupAnimations();
        this.setupNavbarEffects();
        this.setupStickyNavigation();
        this.loadInitialState();

        // CORRECTION: Vérifier et afficher l'état des cookies au démarrage
        setTimeout(() => {
            const preferences = this.getSavedCookiePreferences();
            console.log('🔍 Vérification finale des préférences cookies au démarrage:', preferences);
            this.updateCookieStatusBadge(preferences);
        }, 200);

        console.log('✅ YAKO Legal - Toutes les fonctionnalités initialisées');
        this.addStyles();
    }

    // ========== NAVIGATION STICKY ==========
    setupStickyNavigation() {
        const legalNav = document.querySelector('.legal-nav');
        if (!legalNav) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        function updateNavigation() {
            const scrollY = window.scrollY;
            const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';

            if (scrollY > 200) {
                if (scrollDirection === 'down') {
                    legalNav.style.transform = 'translateY(-100%)';
                    legalNav.style.opacity = '0';
                } else {
                    legalNav.style.transform = 'translateY(0)';
                    legalNav.style.opacity = '1';
                }
            } else {
                legalNav.style.transform = 'translateY(0)';
                legalNav.style.opacity = '1';
            }

            lastScrollY = scrollY;
            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateNavigation);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
        console.log('✅ Navigation sticky initialisée');
    }

    // ========== MENU MOBILE ==========
    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', () => this.toggleMobileMenu(navMenu, navToggle));
        document.addEventListener('click', (e) => this.handleOutsideClick(e, navToggle, navMenu));
        navMenu.addEventListener('keydown', (e) => this.handleMenuKeydown(e, navToggle));

        window.closeMenu = () => this.closeMobileMenu(navMenu, navToggle);
    }

    toggleMobileMenu(navMenu, navToggle) {
        const isActive = navMenu.classList.contains('active');

        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

        navToggle.setAttribute('aria-expanded', !isActive);
        navMenu.setAttribute('aria-hidden', isActive);

        if (!isActive) {
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) setTimeout(() => firstLink.focus(), 100);
        }
    }

    handleOutsideClick(e, navToggle, navMenu) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            this.closeMobileMenu(navMenu, navToggle);
        }
    }

    handleMenuKeydown(e, navToggle) {
        if (e.key === 'Escape') {
            this.closeMobileMenu(document.querySelector('.nav-menu'), navToggle);
            navToggle.focus();
        }
    }

    closeMobileMenu(navMenu, navToggle) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.setAttribute('aria-hidden', 'true');
    }

    // ========== ONGLETS LÉGAUX ==========
    setupLegalTabs() {
        const legalTabs = document.querySelectorAll('.legal-tab');

        legalTabs.forEach((tab, index) => {
            this.configureLegalTab(tab, index);
        });

        window.switchLegalSection = (targetSection) => this.switchLegalSection(targetSection);
    }

    configureLegalTab(tab, index) {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', tab.getAttribute('data-section'));
        tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');

        tab.addEventListener('click', (e) => this.handleTabClick(e, tab));
        tab.addEventListener('keydown', (e) => this.handleTabKeydown(e, index));
        tab.addEventListener('mouseenter', () => this.handleTabHover(tab, true));
        tab.addEventListener('mouseleave', () => this.handleTabHover(tab, false));
    }

    handleTabClick(e, tab) {
        e.preventDefault();
        const targetSection = tab.getAttribute('data-section');
        this.switchLegalSection(targetSection);
    }

    handleTabKeydown(e, currentIndex) {
        const legalTabs = document.querySelectorAll('.legal-tab');
        let newIndex = currentIndex;

        switch(e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : legalTabs.length - 1;
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                newIndex = currentIndex < legalTabs.length - 1 ? currentIndex + 1 : 0;
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
                document.querySelectorAll('.legal-tab')[currentIndex].click();
                return;
        }

        if (newIndex !== currentIndex) {
            legalTabs[newIndex].focus();
            legalTabs[newIndex].click();
        }
    }

    handleTabHover(tab, isEntering) {
        if (!tab.classList.contains('active')) {
            if (isEntering) {
                tab.style.transform = 'translateY(-2px)';
                tab.style.boxShadow = '0 6px 20px rgba(124, 45, 18, 0.2)';
            } else {
                tab.style.transform = 'translateY(0)';
                tab.style.boxShadow = '';
            }
        }
    }

    switchLegalSection(targetSection) {
        console.log(`📋 Changement vers section: ${targetSection}`);

        this.animateCurrentSectionOut();
        this.deactivateAllSections();
        this.activateNewTab(targetSection);
        this.activateNewSection(targetSection);
        this.updateHistory(targetSection);
        this.updateState(targetSection);
        this.clearSearch();
    }

    animateCurrentSectionOut() {
        const currentActiveSection = document.querySelector('.legal-section.active');
        if (currentActiveSection) {
            currentActiveSection.style.opacity = '0';
            currentActiveSection.style.transform = 'translateY(-20px)';
        }
    }

    deactivateAllSections() {
        const legalTabs = document.querySelectorAll('.legal-tab');
        const legalSections = document.querySelectorAll('.legal-section');

        legalTabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        legalSections.forEach(section => {
            section.classList.remove('active');
            section.setAttribute('aria-hidden', 'true');
        });
    }

    activateNewTab(targetSection) {
        const activeTab = document.querySelector(`[data-section="${targetSection}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.setAttribute('aria-selected', 'true');
            activeTab.setAttribute('tabindex', '0');

            activeTab.style.transform = 'scale(1.05)';
            setTimeout(() => activeTab.style.transform = 'scale(1)', 150);
        }
    }

    activateNewSection(targetSection) {
        const activeSection = document.getElementById(targetSection);
        if (activeSection) {
            setTimeout(() => {
                activeSection.classList.add('active');
                activeSection.setAttribute('aria-hidden', 'false');
                activeSection.style.opacity = '1';
                activeSection.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    updateHistory(targetSection) {
        const newUrl = new URL(window.location);
        newUrl.hash = targetSection;
        window.history.pushState({ section: targetSection }, '', newUrl);
    }

    updateState(targetSection) {
        localStorage.setItem('activeLegalTab', targetSection);
        this.currentSection = targetSection;
        this.announceTabChange(targetSection);
    }

    // ========== BOUTON RETOUR EN HAUT ==========
    setupScrollToTop() {
        const scrollToTopBtn = document.createElement('button');
        scrollToTopBtn.className = 'scroll-to-top';
        scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollToTopBtn.title = 'Retour en haut';
        scrollToTopBtn.setAttribute('aria-label', 'Retour en haut de la page');

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(scrollToTopBtn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
    }

    // ========== GESTION DES COOKIES (CORRIGÉE POUR SAUVEGARDE) ==========
    setupCookies() {
        this.loadCookiePreferences();
        this.bindCookieEvents();
        this.setupCookieModal();
        this.createCookieStatusBadge();

        // CORRECTION: Mettre à jour le badge immédiatement après création
        setTimeout(() => {
            const savedPreferences = this.getSavedCookiePreferences();
            this.updateCookieStatusBadge(savedPreferences);
        }, 100);
    }

    loadCookiePreferences() {
        console.log('🍪 Chargement des préférences de cookies');

        const preferences = this.getSavedCookiePreferences();
        console.log('✅ Préférences chargées:', preferences);

        this.updateCookieToggles(preferences);
        this.applyCookiePreferences(preferences);

        // CORRECTION: Pas besoin d'appeler updateCookieStatusBadge ici car le badge n'existe pas encore
    }

    // NOUVELLE FONCTION: Récupérer les préférences sauvegardées
    getSavedCookiePreferences() {
        const saved = localStorage.getItem('cookiePreferences');

        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.warn('⚠️ Erreur parsing localStorage, utilisation des valeurs par défaut');
                return { ...this.defaultCookieSettings };
            }
        } else {
            console.log('📝 Aucune préférence sauvegardée, utilisation des valeurs par défaut');
            return { ...this.defaultCookieSettings };
        }
    }

    updateCookieToggles(preferences) {
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');

        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '').replace('modal-', '');
            const isChecked = preferences[cookieType] !== undefined ? preferences[cookieType] : this.defaultCookieSettings[cookieType];

            toggle.checked = isChecked;
            toggle.setAttribute('aria-checked', isChecked);
            this.updateToggleVisual(toggle);
        });
    }

    bindCookieEvents() {
        const saveCookieBtn = document.getElementById('save-cookie-preferences');
        const resetCookieBtn = document.getElementById('reset-cookie-preferences');

        if (saveCookieBtn) {
            saveCookieBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveCookiePreferences();
            });
        }

        if (resetCookieBtn) {
            resetCookieBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetCookiePreferences();
            });
        }

        document.addEventListener('click', (e) => {
            const cookieToggle = e.target.closest('.cookie-toggle');
            if (cookieToggle) {
                const checkbox = cookieToggle.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.disabled) {
                    if (e.target === checkbox) {
                        return;
                    }
                    e.preventDefault();
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('.cookie-toggle input[type="checkbox"]:not([disabled])')) {
                this.handleToggleChange(e.target);
            }
        });
    }

    saveCookiePreferences() {
        const preferences = this.collectCookiePreferences();

        // CORRECTION: Sauvegarder immédiatement
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        console.log('💾 Préférences sauvegardées:', preferences);

        this.applyCookiePreferences(preferences);
        this.updateCookieStatusBadge(preferences);
        this.showNotification('✅ Vos préférences de cookies ont été sauvegardées !', 'success');
        this.hideCookieModal();
    }

    collectCookiePreferences() {
        const preferences = {};
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled]):not([id^="modal-"])');

        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '');
            preferences[cookieType] = toggle.checked;
            toggle.setAttribute('aria-checked', toggle.checked);
        });

        return preferences;
    }

    resetCookiePreferences() {
        this.updateCookieToggles(this.defaultCookieSettings);
        this.synchronizeAllToggles();

        // CORRECTION: Réinitialiser le localStorage aussi
        localStorage.setItem('cookiePreferences', JSON.stringify(this.defaultCookieSettings));
        console.log('🔄 Préférences réinitialisées');

        this.applyCookiePreferences(this.defaultCookieSettings);
        this.updateCookieStatusBadge(this.defaultCookieSettings);
        this.showNotification('🔄 Préférences de cookies réinitialisées aux valeurs par défaut', 'info');
    }

    synchronizeAllToggles() {
        const preferences = this.defaultCookieSettings;

        Object.keys(preferences).forEach(cookieType => {
            const modalToggle = document.getElementById(`modal-${cookieType}-cookies`);
            if (modalToggle) {
                modalToggle.checked = preferences[cookieType];
                this.updateToggleVisual(modalToggle);
            }
        });
    }

    handleToggleChange(toggle) {
        this.updateToggleVisual(toggle);

        const label = toggle.closest('.cookie-toggle').querySelector('label');
        if (label) {
            const originalColor = label.style.color;
            label.style.color = toggle.checked ? '#10b981' : '#ef4444';
            setTimeout(() => {
                label.style.color = originalColor;
            }, 500);
        }

        // CORRECTION: Sauvegarder automatiquement à chaque changement
        setTimeout(() => {
            const preferences = this.collectCookiePreferences();
            localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
            console.log('🔄 Auto-sauvegarde:', preferences);
            this.applyCookiePreferences(preferences);
            this.updateCookieStatusBadge(preferences);
            this.synchronizeCorrespondingToggle(toggle);
        }, 100);
    }

    synchronizeCorrespondingToggle(changedToggle) {
        const isModal = changedToggle.id.startsWith('modal-');
        const cookieType = changedToggle.id.replace('modal-', '').replace('-cookies', '');

        if (isModal) {
            const mainToggle = document.getElementById(`${cookieType}-cookies`);
            if (mainToggle) {
                mainToggle.checked = changedToggle.checked;
                this.updateToggleVisual(mainToggle);
            }
        } else {
            const modalToggle = document.getElementById(`modal-${cookieType}-cookies`);
            if (modalToggle) {
                modalToggle.checked = changedToggle.checked;
                this.updateToggleVisual(modalToggle);
            }
        }
    }

    updateToggleVisual(toggle) {
        const slider = toggle.nextElementSibling;
        if (slider && slider.classList.contains('toggle-slider')) {
            const isDarkMode = document.body.classList.contains('dark-mode');

            if (toggle.checked) {
                slider.style.background = isDarkMode ? '#fbbf24' : '#7c2d12';
            } else {
                slider.style.background = isDarkMode ? '#6b7280' : '#d1d5db';
            }
        }
    }

    applyCookiePreferences(preferences) {
        console.log('⚙️ Application des préférences:', preferences);

        if (preferences.analytics && typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
            console.log('✅ Cookies analytiques activés');
        } else if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
            console.log('❌ Cookies analytiques désactivés');
        }

        if (preferences.performance) {
            this.enablePerformanceFeatures();
        } else {
            this.disablePerformanceFeatures();
        }

        if (preferences.preferences) {
            console.log('✅ Cookies de préférences activés');
        } else {
            console.log('❌ Cookies de préférences désactivés');
        }
    }

    enablePerformanceFeatures() {
        if ('serviceWorker' in navigator) {
            console.log('🚀 Fonctionnalités de performance activées');
        }
    }

    disablePerformanceFeatures() {
        console.log('⏸️ Fonctionnalités de performance désactivées');
    }

    createCookieStatusBadge() {
        const existingBadge = document.querySelector('.cookie-status-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        const statusBadge = document.createElement('div');
        statusBadge.className = 'cookie-status-badge';
        statusBadge.innerHTML = '<i class="fas fa-cookie-bite"></i> <span>0/3</span>';
        statusBadge.title = 'Cliquer pour gérer les cookies';

        statusBadge.addEventListener('click', () => this.showCookieModal());
        statusBadge.addEventListener('mouseenter', () => {
            statusBadge.style.transform = 'translateY(-3px) scale(1.05)';
            statusBadge.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.4)';
        });
        statusBadge.addEventListener('mouseleave', () => {
            statusBadge.style.transform = 'translateY(0) scale(1)';
            statusBadge.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
        });

        document.body.appendChild(statusBadge);

        // CORRECTION: Mettre à jour immédiatement avec les préférences sauvegardées
        const savedPreferences = this.getSavedCookiePreferences();
        this.updateCookieStatusBadge(savedPreferences);

        return statusBadge;
    }

    updateCookieStatusBadge(preferences) {
        let statusBadge = document.querySelector('.cookie-status-badge');

        if (!statusBadge) {
            statusBadge = this.createCookieStatusBadge();
        }

        const enabledCount = Object.values(preferences).filter(Boolean).length;
        const totalCount = Object.keys(preferences).length;

        statusBadge.innerHTML = `<i class="fas fa-cookie-bite"></i> <span>${enabledCount}/${totalCount}</span>`;
        statusBadge.title = `${enabledCount} types de cookies activés sur ${totalCount} - Cliquer pour gérer`;

        this.updateBadgeColor(statusBadge, enabledCount, totalCount);
    }

    updateBadgeColor(badge, enabledCount, totalCount) {
        if (enabledCount === 0) {
            badge.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            badge.style.color = 'white';
        } else if (enabledCount === totalCount) {
            badge.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            badge.style.color = 'white';
        } else {
            badge.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            badge.style.color = 'white';
        }
    }

    // ========== MODAL COOKIES ==========
    setupCookieModal() {
        window.hideCookieModal = () => this.hideCookieModal();
        window.saveModalCookiePreferences = () => this.saveModalCookiePreferences();
    }

    showCookieModal() {
        if (this.cookieModalVisible) return;

        let modal = document.querySelector('.cookie-modal');
        if (!modal) {
            modal = this.createCookieModal();
        }

        this.loadModalPreferences(modal);
        modal.classList.add('show');
        this.cookieModalVisible = true;
        this.bindModalEvents(modal);

        setTimeout(() => modal.focus(), 100);
    }

    createCookieModal() {
        const modal = document.createElement('div');
        modal.className = 'cookie-modal';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-labelledby', 'cookie-modal-title');
        modal.innerHTML = this.getCookieModalHTML();
        document.body.appendChild(modal);
        return modal;
    }

    getCookieModalHTML() {
        return `
            <h3 id="cookie-modal-title"><i class="fas fa-cookie-bite"></i> Gestion des cookies</h3>
            <div class="cookie-option">
                <label><strong>Cookies techniques</strong><br><small>Nécessaires au fonctionnement</small></label>
                <span style="color: #10b981; font-weight: bold;">Toujours activé</span>
            </div>
            <div class="cookie-option">
                <label for="modal-analytics-cookies"><strong>Cookies analytiques</strong><br><small>Améliorer notre service</small></label>
                <div class="cookie-toggle">
                    <input type="checkbox" id="modal-analytics-cookies">
                    <span class="toggle-slider"></span>
                </div>
            </div>
            <div class="cookie-option">
                <label for="modal-performance-cookies"><strong>Cookies de performance</strong><br><small>Optimiser les performances</small></label>
                <div class="cookie-toggle">
                    <input type="checkbox" id="modal-performance-cookies">
                    <span class="toggle-slider"></span>
                </div>
            </div>
            <div class="cookie-option">
                <label for="modal-preferences-cookies"><strong>Cookies de préférences</strong><br><small>Personnaliser l'expérience</small></label>
                <div class="cookie-toggle">
                    <input type="checkbox" id="modal-preferences-cookies">
                    <span class="toggle-slider"></span>
                </div>
            </div>
            <div class="cookie-buttons">
                <button class="btn btn-outline btn-small" onclick="hideCookieModal()">Annuler</button>
                <button class="btn btn-primary btn-small" onclick="saveModalCookiePreferences()">Sauvegarder</button>
            </div>
        `;
    }

    loadModalPreferences(modal) {
        // CORRECTION: Utiliser la nouvelle fonction centralisée
        const preferences = this.getSavedCookiePreferences();

        const analyticsInput = document.getElementById('modal-analytics-cookies');
        const performanceInput = document.getElementById('modal-performance-cookies');
        const preferencesInput = document.getElementById('modal-preferences-cookies');

        if (analyticsInput) {
            analyticsInput.checked = preferences.analytics || false;
            this.updateToggleVisual(analyticsInput);
        }
        if (performanceInput) {
            performanceInput.checked = preferences.performance !== undefined ? preferences.performance : true;
            this.updateToggleVisual(performanceInput);
        }
        if (preferencesInput) {
            preferencesInput.checked = preferences.preferences !== undefined ? preferences.preferences : true;
            this.updateToggleVisual(preferencesInput);
        }
    }

    bindModalEvents(modal) {
        modal.querySelectorAll('.cookie-toggle input').forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.updateToggleVisual(toggle);
                this.synchronizeCorrespondingToggle(toggle);
            });
        });

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideCookieModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    hideCookieModal() {
        const modal = document.querySelector('.cookie-modal');
        if (modal) modal.classList.remove('show');
        this.cookieModalVisible = false;
    }

    saveModalCookiePreferences() {
        const analyticsInput = document.getElementById('modal-analytics-cookies');
        const performanceInput = document.getElementById('modal-performance-cookies');
        const preferencesInput = document.getElementById('modal-preferences-cookies');

        const preferences = {
            analytics: analyticsInput ? analyticsInput.checked : false,
            performance: performanceInput ? performanceInput.checked : false,
            preferences: preferencesInput ? preferencesInput.checked : false
        };

        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        console.log('💾 Préférences modal sauvegardées:', preferences);

        this.applyCookiePreferences(preferences);
        this.updateCookieStatusBadge(preferences);
        this.updateMainToggles(preferences);
        this.showNotification('✅ Vos préférences de cookies ont été sauvegardées !', 'success');
        this.hideCookieModal();
    }

    updateMainToggles(preferences) {
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled]):not([id^="modal-"])');
        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '');
            if (preferences[cookieType] !== undefined) {
                toggle.checked = preferences[cookieType];
                this.updateToggleVisual(toggle);
            }
        });
    }

    // ========== RECHERCHE ==========
    setupSearch() {
        this.createSearchInput();
        this.bindSearchEvents();
    }

    createSearchInput() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Rechercher dans les documents légaux... (Ctrl+F)';
        searchInput.className = 'legal-search';
        searchInput.setAttribute('aria-label', 'Rechercher dans les documents légaux');

        const legalContent = document.querySelector('.legal-content .container');
        if (legalContent) {
            legalContent.insertBefore(searchInput, legalContent.firstChild);
        }
    }

    bindSearchEvents() {
        const searchInput = document.querySelector('.legal-search');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.performSearch(e.target.value.toLowerCase()), 300);
        });
    }

    performSearch(searchTerm) {
        if (!searchTerm || searchTerm.length < 2) {
            this.clearSearch();
            return;
        }

        const results = this.searchInDocuments(searchTerm);
        this.displaySearchResults(results, searchTerm);
        this.navigateToFirstResult(results);
    }

    searchInDocuments(searchTerm) {
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
                this.highlightText(item, searchTerm);

                const section = item.closest('.legal-section');
                const sectionId = section ? section.id : 'unknown';
                resultsBySection[sectionId] = (resultsBySection[sectionId] || 0) + matches;
            } else {
                this.removeHighlight(item);
            }
        });

        return { hasResults, resultsBySection, totalMatches };
    }

    highlightText(element, searchTerm) {
        this.removeHighlight(element);

        const walker = document.createTreeWalker(
            element, NodeFilter.SHOW_TEXT,
            (node) => {
                return node.parentNode.tagName !== 'SCRIPT' &&
                node.parentNode.tagName !== 'STYLE' &&
                !node.parentNode.classList.contains('search-highlight')
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
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

    removeHighlight(element) {
        const highlights = element.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            highlight.outerHTML = highlight.textContent;
        });
    }

    displaySearchResults(results, searchTerm) {
        let resultDiv = document.querySelector('.search-results');

        if (!resultDiv) {
            resultDiv = this.createSearchResultsDiv();
        }

        if (!results.hasResults) {
            this.showNoResults(resultDiv, searchTerm);
        } else {
            this.showSearchResults(resultDiv, results, searchTerm);
        }
    }

    createSearchResultsDiv() {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'search-results';

        const legalContent = document.querySelector('.legal-content .container');
        const searchInput = legalContent ? legalContent.querySelector('.legal-search') : null;
        if (searchInput && searchInput.parentNode) {
            searchInput.parentNode.insertBefore(resultDiv, searchInput.nextSibling);
        }

        return resultDiv;
    }

    showNoResults(resultDiv, searchTerm) {
        resultDiv.className = 'search-results no-results';
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
        resultDiv.style.display = 'block';
    }

    showSearchResults(resultDiv, results, searchTerm) {
        const sectionNames = {
            'mentions': 'Mentions légales',
            'privacy': 'Politique de confidentialité',
            'terms': 'Conditions d\'utilisation',
            'cookies': 'Politique des cookies'
        };

        let sectionsHTML = '';
        Object.entries(results.resultsBySection).forEach(([sectionId, count]) => {
            if (count > 0) {
                sectionsHTML += `
                    <span onclick="switchLegalSection('${sectionId}')" 
                          class="search-section-link">
                        ${sectionNames[sectionId] || sectionId}: ${count} occurrence${count > 1 ? 's' : ''}
                    </span>
                `;
            }
        });

        resultDiv.className = 'search-results has-results';
        resultDiv.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
                <strong>${results.totalMatches} occurrence${results.totalMatches > 1 ? 's' : ''} trouvée${results.totalMatches > 1 ? 's' : ''}</strong>
            </div>
            <p style="margin-bottom: 15px;">Résultats pour "<em>${searchTerm}</em>" dans ${Object.keys(results.resultsBySection).length} section${Object.keys(results.resultsBySection).length > 1 ? 's' : ''}</p>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 5px;">
                ${sectionsHTML}
            </div>
        `;
        resultDiv.style.display = 'block';
    }

    navigateToFirstResult(results) {
        if (results.hasResults && Object.keys(results.resultsBySection).length > 0) {
            const firstSectionWithResults = Object.keys(results.resultsBySection)[0];
            if (firstSectionWithResults !== this.currentSection) {
                this.switchLegalSection(firstSectionWithResults);
            }
        }
    }

    clearSearch() {
        document.querySelectorAll('.legal-item').forEach(item => {
            item.style.display = 'block';
            this.removeHighlight(item);
        });

        const resultDiv = document.querySelector('.search-results');
        if (resultDiv) resultDiv.style.display = 'none';

        this.searchResults = [];
    }

    // ========== RACCOURCIS CLAVIER ==========
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
    }

    handleGlobalKeydown(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const keyActions = {
            'f': () => this.focusSearch(e),
            'd': () => this.toggleDarkMode(e),
            'Escape': () => this.closeAllPanels(),
            'h': () => this.showKeyboardHelp(),
            'H': () => this.showKeyboardHelp(),
            '1': () => this.switchLegalSection('mentions'),
            '2': () => this.switchLegalSection('privacy'),
            '3': () => this.switchLegalSection('terms'),
            '4': () => this.switchLegalSection('cookies')
        };

        const key = e.key;
        const isCtrlOrCmd = e.ctrlKey || e.metaKey;

        if (isCtrlOrCmd && (key === 'f' || key === 'd')) {
            keyActions[key]();
        } else if (!isCtrlOrCmd && keyActions[key]) {
            keyActions[key]();
        }
    }

    focusSearch(e) {
        e.preventDefault();
        const searchInput = document.querySelector('.legal-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    toggleDarkMode(e) {
        e.preventDefault();
        // Géré par universal-dark-mode.js
    }

    closeAllPanels() {
        if (window.closeMenu) window.closeMenu();
        this.hideCookieModal();

        const search = document.querySelector('.legal-search');
        if (search && search.value) {
            search.value = '';
            this.clearSearch();
        }
    }

    showKeyboardHelp() {
        const helpHTML = `
            <div style="max-width: 500px; text-align: left;">
                <h3 style="margin-bottom: 20px; color: #7c2d12;">⌨️ Raccourcis clavier</h3>
                <div style="display: grid; gap: 10px; font-size: 0.9rem;">
                    <div><kbd>Ctrl+F</kbd> - <span style="color: #7c2d12; font-weight: 500;">Rechercher dans les documents</span></div>
                    <div><kbd>Ctrl+D</kbd> - <span style="color: #7c2d12; font-weight: 500;">Basculer le mode sombre/clair</span></div>
                    <div><kbd>Échap</kbd> - <span style="color: #7c2d12; font-weight: 500;">Fermer tous les panneaux</span></div>
                    <div><kbd>H</kbd> - <span style="color: #7c2d12; font-weight: 500;">Afficher cette aide</span></div>
                    <div><kbd>1-4</kbd> - <span style="color: #7c2d12; font-weight: 500;">Navigation entre les sections</span></div>
                    <div><kbd>←→</kbd> - <span style="color: #7c2d12; font-weight: 500;">Naviguer entre onglets (focus clavier)</span></div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #fef8f0; border-radius: 8px; font-size: 0.8rem; color: #92400e;">
                    💡 <strong>Astuce :</strong> Utilisez les flèches ← → pour naviguer entre les onglets focalisés ! Cliquez sur le badge cookies en bas à droite pour gérer vos préférences.
                </div>
            </div>
        `;

        this.showNotification(helpHTML, 'info', 8000);
    }

    // ========== ANIMATIONS ==========
    setupAnimations() {
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

        const elementsToAnimate = document.querySelectorAll('.legal-item, .summary-card, .legal-document h2');
        elementsToAnimate.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `opacity 0.6s ease ${index * 0.05}s, transform 0.6s ease ${index * 0.05}s`;
            scrollObserver.observe(element);
        });

        this.setupHistoryNavigation();
        this.setupAnchorLinks();
    }

    setupHistoryNavigation() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.switchLegalSection(e.state.section);
            } else {
                this.initializeLegalTab();
            }
        });
    }

    setupAnchorLinks() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = anchor.getAttribute('href').substring(1);
                if (document.getElementById(targetSection)) {
                    this.switchLegalSection(targetSection);
                    setTimeout(() => {
                        document.querySelector('.legal-content').scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 200);
                }
            });
        });
    }

    // ========== EFFETS NAVBAR ==========
    setupNavbarEffects() {
        let navbarLastScrollY = window.scrollY;

        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            const currentScrollY = window.scrollY;

            if (currentScrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            }

            if (currentScrollY > navbarLastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            navbarLastScrollY = currentScrollY;
        });
    }

    // ========== ÉTAT INITIAL ==========
    loadInitialState() {
        this.initializeLegalTab();
    }

    initializeLegalTab() {
        let targetSection = 'mentions';

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

        this.switchLegalSection(targetSection);
    }

    // ========== NOTIFICATIONS - STYLE HARMONISÉ ==========
    showNotification(message, type = 'success', duration = 5000) {
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
            animation: slideInFromRight 0.3s ease;
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
                @keyframes slideInFromRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutToRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.style.animation = 'slideOutToRight 0.3s ease';
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
                notification.style.animation = 'slideOutToRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        });
    }

    // ========== UTILITAIRES ==========
    announceTabChange(sectionName) {
        const announcer = document.getElementById('aria-announcer') || this.createAnnouncer();
        const sectionNames = {
            'mentions': 'Mentions légales',
            'privacy': 'Politique de confidentialité',
            'terms': 'Conditions d\'utilisation',
            'cookies': 'Politique des cookies'
        };

        announcer.textContent = `Section ${sectionNames[sectionName] || sectionName} affichée`;
    }

    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'aria-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcer);
        return announcer;
    }

    // ========== STYLES ==========
    addStyles() {
        if (document.querySelector('#yakolegal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'yakolegal-styles';
        styles.textContent = `
            /* Styles pour la navigation sticky */
            .legal-nav {
                transition: transform 0.3s ease, opacity 0.3s ease !important;
            }
            
            /* Amélioration du badge cookies */
            .cookie-status-badge {
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
            }
            
            .cookie-status-badge i {
                font-size: 1rem !important;
            }
            
            .cookie-status-badge span {
                font-weight: 600 !important;
                font-size: 0.9rem !important;
            }

            /* Amélioration des tooltips kbd harmonisé */
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
        `;
        document.head.appendChild(styles);
    }
}

// ========== INITIALISATION ==========
document.addEventListener('DOMContentLoaded', function() {
    const yakoLegal = new YakoLegal();
    yakoLegal.init();

    // Exposer les fonctions nécessaires globalement
    window.showNotification = (message, type, duration) => yakoLegal.showNotification(message, type, duration);
    window.yakoLegal = yakoLegal;
});