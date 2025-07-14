// YAKO Legal - Version corrigée complète
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
        this.setupScrollNavigation();
        this.setupCookies();
        this.setupSearch();
        this.setupKeyboardShortcuts();
        this.setupAnimations();
        this.setupNavbarEffects();
        this.setupScrollToTop();
        this.loadInitialState();

        console.log('✅ YAKO Legal - Toutes les fonctionnalités initialisées');
        this.addStyles();
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

    // ========== NAVIGATION AU SCROLL (CORRECTION DU BUG) ==========
    setupScrollNavigation() {
        let ticking = false;
        let scrollThreshold = 200;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleLegalNavScroll(scrollThreshold);
                    this.handleNavbarScroll();
                    this.updateScrollToTopButton();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Empêcher le masquage au survol
        const legalNav = document.querySelector('.legal-nav');
        if (legalNav) {
            legalNav.addEventListener('mouseenter', () => {
                this.showLegalNav();
            });
        }
    }

    handleLegalNavScroll(threshold) {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - this.lastScrollY);

        // Réduire la sensibilité
        if (scrollDifference < 10) return;

        const legalNav = document.querySelector('.legal-nav');
        if (!legalNav) return;

        // Masquer seulement si on scroll vers le bas ET qu'on dépasse le seuil
        if (currentScrollY > this.lastScrollY && currentScrollY > threshold) {
            this.hideLegalNav();
        }
        // Afficher si on scroll vers le haut OU si on est en haut de page
        else if (currentScrollY < this.lastScrollY || currentScrollY <= 100) {
            this.showLegalNav();
        }

        this.lastScrollY = currentScrollY;
    }

    hideLegalNav() {
        const legalNav = document.querySelector('.legal-nav');
        if (this.isNavVisible && legalNav) {
            legalNav.classList.add('hidden');
            this.isNavVisible = false;
        }
    }

    showLegalNav() {
        const legalNav = document.querySelector('.legal-nav');
        if (!this.isNavVisible && legalNav) {
            legalNav.classList.remove('hidden');
            this.isNavVisible = true;
        }
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
    }

    updateScrollToTopButton() {
        const scrollBtn = document.querySelector('.scroll-to-top');
        if (scrollBtn) {
            if (window.scrollY > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }
    }

    // ========== GESTION DES COOKIES (CORRECTION DES TOGGLES) ==========
    setupCookies() {
        this.loadCookiePreferences();
        this.bindCookieEvents();
        this.setupCookieModal();
        this.createCookieStatusBadge();
    }

    loadCookiePreferences() {
        console.log('🍪 Chargement des préférences de cookies');
        const preferences = JSON.parse(localStorage.getItem('cookiePreferences') || JSON.stringify(this.defaultCookieSettings));

        this.updateCookieToggles(preferences);
        this.applyCookiePreferences(preferences);
        this.updateCookieStatusBadge(preferences);
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

        // CORRECTION: Gérer les clics sur les labels ET les toggles
        document.addEventListener('click', (e) => {
            // Clic sur le slider
            if (e.target.matches('.toggle-slider')) {
                e.preventDefault();
                const checkbox = e.target.previousElementSibling;
                if (checkbox && checkbox.type === 'checkbox' && !checkbox.disabled) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            // Clic sur le label
            else if (e.target.closest('.cookie-toggle label') && !e.target.matches('input')) {
                e.preventDefault();
                const label = e.target.closest('.cookie-toggle label');
                const toggle = label.closest('.cookie-toggle');
                const checkbox = toggle.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.disabled) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        // Gérer les changements d'état des checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.matches('.cookie-toggle input[type="checkbox"]:not([disabled])')) {
                this.handleToggleChange(e.target);
            }
        });
    }

    saveCookiePreferences() {
        const preferences = this.collectCookiePreferences();
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
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

        localStorage.removeItem('cookiePreferences');
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

        // Animation visuelle du changement
        const label = toggle.closest('.cookie-toggle').querySelector('label');
        if (label) {
            const originalColor = label.style.color;
            label.style.color = toggle.checked ? '#10b981' : '#ef4444';
            setTimeout(() => {
                label.style.color = originalColor;
            }, 500);
        }

        // Sauvegarder automatiquement les préférences
        setTimeout(() => {
            const preferences = this.collectCookiePreferences();
            localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
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
        // Supprimer le badge existant
        const existingBadge = document.querySelector('.cookie-status-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        const statusBadge = document.createElement('div');
        statusBadge.className = 'cookie-status-badge';

        statusBadge.addEventListener('click', () => this.showCookieModal());
        statusBadge.addEventListener('mouseenter', () => {
            statusBadge.style.transform = 'translateY(-3px) scale(1.05)';
            statusBadge.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.35)';
        });
        statusBadge.addEventListener('mouseleave', () => {
            statusBadge.style.transform = 'translateY(0) scale(1)';
            statusBadge.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        });

        document.body.appendChild(statusBadge);

        return statusBadge;
    }

    updateCookieStatusBadge(preferences) {
        let statusBadge = document.querySelector('.cookie-status-badge');

        if (!statusBadge) {
            statusBadge = this.createCookieStatusBadge();
        }

        const enabledCount = Object.values(preferences).filter(Boolean).length;
        const totalCount = Object.keys(preferences).length;

        statusBadge.innerHTML = `<i class="fas fa-cookie-bite" style="margin-right: 8px;"></i>${enabledCount}/${totalCount}`;
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
        const preferences = JSON.parse(localStorage.getItem('cookiePreferences') || JSON.stringify(this.defaultCookieSettings));

        const analyticsInput = document.getElementById('modal-analytics-cookies');
        const performanceInput = document.getElementById('modal-performance-cookies');
        const preferencesInput = document.getElementById('modal-preferences-cookies');

        if (analyticsInput) {
            analyticsInput.checked = preferences.analytics || false;
            this.updateToggleVisual(analyticsInput);
        }
        if (performanceInput) {
            performanceInput.checked = preferences.performance || false;
            this.updateToggleVisual(performanceInput);
        }
        if (preferencesInput) {
            preferencesInput.checked = preferences.preferences || false;
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

        // Gérer les clics sur les sliders dans la modal
        modal.querySelectorAll('.toggle-slider').forEach(slider => {
            slider.addEventListener('click', (e) => {
                e.preventDefault();
                const checkbox = slider.previousElementSibling;
                if (checkbox && checkbox.type === 'checkbox' && !checkbox.disabled) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });

        // Gérer les clics sur les labels dans la modal
        modal.querySelectorAll('.cookie-option label').forEach(label => {
            label.addEventListener('click', (e) => {
                if (e.target.tagName === 'LABEL') {
                    e.preventDefault();
                    const forId = label.getAttribute('for');
                    if (forId) {
                        const checkbox = document.getElementById(forId);
                        if (checkbox && !checkbox.disabled) {
                            checkbox.checked = !checkbox.checked;
                            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                    }
                }
            });
        });

        // Fermeture par Échap
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

    // ========== RACCOURCIS CLAVIER (CORRECTION AIDE) ==========
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
            <div style="max-width: 500px; background: white; border-radius: 15px; padding: 25px; color: #333; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <h3 style="margin-bottom: 25px; color: #7c2d12; display: flex; align-items: center; gap: 12px; font-size: 1.3rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
                    <i class="fas fa-keyboard" style="color: #fbbf24;"></i> Raccourcis clavier
                </h3>
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 20px; padding: 15px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #7c2d12;">
                        <kbd style="background: #7c2d12; color: white; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 600; min-width: 60px; text-align: center;">Ctrl+F</kbd>
                        <span style="color: #374151; font-weight: 500;">Rechercher dans les documents</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px; padding: 15px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #7c2d12;">
                        <kbd style="background: #7c2d12; color: white; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 600; min-width: 60px; text-align: center;">Ctrl+D</kbd>
                        <span style="color: #374151; font-weight: 500;">Basculer le mode sombre/clair</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px; padding: 15px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #7c2d12;">
                        <kbd style="background: #7c2d12; color: white; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 600; min-width: 60px; text-align: center;">Échap</kbd>
                        <span style="color: #374151; font-weight: 500;">Fermer tous les panneaux</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px; padding: 15px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #7c2d12;">
                        <kbd style="background: #7c2d12; color: white; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 600; min-width: 60px; text-align: center;">H</kbd>
                        <span style="color: #374151; font-weight: 500;">Afficher cette aide</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 20px; padding: 15px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #7c2d12;">
                        <kbd style="background: #7c2d12; color: white; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.9rem; font-weight: 600; min-width: 60px; text-align: center;">1-4</kbd>
                        <span style="color: #374151; font-weight: 500;">Navigation entre les sections</span>
                    </div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border-radius: 10px; border-left: 4px solid #10b981;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-lightbulb" style="color: #059669; font-size: 1.1rem;"></i>
                        <strong style="color: #065f46;">Astuce :</strong>
                    </div>
                    <p style="color: #065f46; margin: 8px 0 0 0; font-size: 0.9rem;">Utilisez les flèches ← → pour naviguer entre les onglets focalisés !</p>
                </div>
            </div>
        `;

        this.showNotification(helpHTML, 'info', 10000);
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

    // ========== NOTIFICATIONS (CORRIGÉES POUR VISIBILITÉ) ==========
    showNotification(message, type = 'success', duration = 5000) {
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

        notification.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 15px; width: 100%;">
                <i class="fas ${icons[type] || icons.info}" style="margin-top: 3px; flex-shrink: 0; font-size: 1.4rem;"></i>
                <div style="flex: 1; line-height: 1.5;">
                    ${message}
                </div>
                <button onclick="this.closest('.notification').remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.4rem; padding: 0; margin-left: 10px; opacity: 0.8; transition: opacity 0.3s ease; flex-shrink: 0;"
                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.8'"
                        title="Fermer">
                    ×
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-suppression
        const autoClose = setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.animation = 'slideOutToRight 0.4s ease';
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                }, 400);
            }
        }, duration);

        // Supprimer au clic
        notification.addEventListener('click', (e) => {
            if (e.target === notification || e.target.closest('.notification') === notification) {
                clearTimeout(autoClose);
                notification.style.animation = 'slideOutToRight 0.4s ease';
                setTimeout(() => {
                    if (notification.parentNode) notification.remove();
                }, 400);
            }
        });

        // Pause au survol
        notification.addEventListener('mouseenter', () => {
            clearTimeout(autoClose);
        });

        notification.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.style.animation = 'slideOutToRight 0.4s ease';
                    setTimeout(() => {
                        if (notification.parentNode) notification.remove();
                    }, 400);
                }
            }, 2000);
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
            /* Styles déjà définis dans le CSS - pas besoin de les redéfinir ici */
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