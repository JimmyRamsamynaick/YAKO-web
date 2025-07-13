// YAKO Legal - Version corrigée avec gestion complète des cookies et aide améliorée
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

    // ========== NAVIGATION AU SCROLL ==========
    setupScrollNavigation() {
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleLegalNavScroll();
                    this.handleNavbarScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        const legalNav = document.querySelector('.legal-nav');
        if (legalNav) {
            legalNav.addEventListener('mouseenter', () => {
                if (window.scrollY <= 200) this.showLegalNav();
            });
        }
    }

    handleLegalNavScroll() {
        const currentScrollY = window.scrollY;
        const scrollDifference = Math.abs(currentScrollY - this.lastScrollY);

        if (scrollDifference < 5) return;

        if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
            this.hideLegalNav();
        } else if (currentScrollY < this.lastScrollY || currentScrollY <= 100) {
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

    // ========== GESTION DES COOKIES ==========
    setupCookies() {
        this.loadCookiePreferences();
        this.bindCookieEvents();
        this.setupCookieModal();
        this.createCookieStatusBadge();
    }

    loadCookiePreferences() {
        console.log('🍪 Chargement des préférences de cookies');
        const preferences = JSON.parse(localStorage.getItem('cookiePreferences') || JSON.stringify(this.defaultCookieSettings));

        // Charger les toggles principaux dans la page
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

        // Gérer les toggles de la page principale
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
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');

        cookieToggles.forEach(toggle => {
            const cookieType = toggle.id.replace('-cookies', '').replace('modal-', '');
            preferences[cookieType] = toggle.checked;
            toggle.setAttribute('aria-checked', toggle.checked);
        });

        return preferences;
    }

    resetCookiePreferences() {
        // Réinitialiser tous les toggles
        this.updateCookieToggles(this.defaultCookieSettings);

        localStorage.removeItem('cookiePreferences');
        this.applyCookiePreferences(this.defaultCookieSettings);
        this.updateCookieStatusBadge(this.defaultCookieSettings);
        this.showNotification('🔄 Préférences de cookies réinitialisées aux valeurs par défaut', 'info');
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

            // Synchroniser avec la modal si elle est ouverte
            const modal = document.querySelector('.cookie-modal');
            if (modal && this.cookieModalVisible) {
                this.loadModalPreferences(modal);
            }
        }, 100);
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

        // Gestion des cookies analytiques (Google Analytics exemple)
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

        // Gestion des cookies de performance
        if (preferences.performance) {
            this.enablePerformanceFeatures();
        } else {
            this.disablePerformanceFeatures();
        }

        // Gestion des cookies de préférences
        if (preferences.preferences) {
            console.log('✅ Cookies de préférences activés');
        } else {
            console.log('❌ Cookies de préférences désactivés');
        }
    }

    enablePerformanceFeatures() {
        // Activer le cache des ressources
        if ('serviceWorker' in navigator) {
            console.log('🚀 Fonctionnalités de performance activées');
        }
    }

    disablePerformanceFeatures() {
        console.log('⏸️ Fonctionnalités de performance désactivées');
    }

    createCookieStatusBadge() {
        // Supprimer le badge existant s'il y en a un
        const existingBadge = document.querySelector('.cookie-status-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        const statusBadge = document.createElement('div');
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

        statusBadge.addEventListener('click', () => this.showCookieModal());
        statusBadge.addEventListener('mouseenter', () => {
            statusBadge.style.transform = 'translateY(-2px)';
            statusBadge.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
        });
        statusBadge.addEventListener('mouseleave', () => {
            statusBadge.style.transform = 'translateY(0)';
            statusBadge.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
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

        statusBadge.textContent = `🍪 ${enabledCount}/${totalCount}`;
        statusBadge.title = `${enabledCount} types de cookies activés sur ${totalCount} - Cliquer pour gérer`;

        this.updateBadgeColor(statusBadge, enabledCount, totalCount);
    }

    updateBadgeColor(badge, enabledCount, totalCount) {
        if (enabledCount === 0) {
            badge.style.background = '#ef4444';
            badge.style.color = 'white';
        } else if (enabledCount === totalCount) {
            badge.style.background = '#10b981';
            badge.style.color = 'white';
        } else {
            badge.style.background = '#f59e0b';
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

        // Mettre le focus sur la modal pour l'accessibilité
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
            toggle.addEventListener('change', () => this.updateToggleVisual(toggle));
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
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');
        cookieToggles.forEach(toggle => {
            if (!toggle.id.startsWith('modal-')) {
                const cookieType = toggle.id.replace('-cookies', '');
                if (preferences[cookieType] !== undefined) {
                    toggle.checked = preferences[cookieType];
                    this.updateToggleVisual(toggle);
                }
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
        resultDiv.style.cssText = `
            text-align: center; padding: 20px; margin: 20px 0; border-radius: 12px;
            font-weight: 500; animation: fadeIn 0.3s ease;
        `;

        const legalContent = document.querySelector('.legal-content .container');
        const searchInput = legalContent ? legalContent.querySelector('.legal-search') : null;
        if (searchInput && searchInput.parentNode) {
            searchInput.parentNode.insertBefore(resultDiv, searchInput.nextSibling);
        }

        return resultDiv;
    }

    showNoResults(resultDiv, searchTerm) {
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
            <div class="help-modal-content">
                <div class="help-header">
                    <h2><i class="fas fa-keyboard"></i> Centre d'Aide YAKO Legal</h2>
                    <p>Raccourcis clavier et fonctionnalités disponibles</p>
                </div>

                <div class="help-sections">
                    <div class="help-section">
                        <h3><i class="fas fa-rocket"></i> Raccourcis Principaux</h3>
                        <div class="help-grid">
                            <div class="help-item">
                                <kbd>Ctrl+F</kbd>
                                <span>Rechercher dans les documents légaux</span>
                            </div>
                            <div class="help-item">
                                <kbd>Ctrl+D</kbd>
                                <span>Basculer entre mode clair/sombre</span>
                            </div>
                            <div class="help-item">
                                <kbd>Échap</kbd>
                                <span>Fermer tous les panneaux ouverts</span>
                            </div>
                            <div class="help-item">
                                <kbd>H</kbd>
                                <span>Afficher cette aide</span>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <h3><i class="fas fa-compass"></i> Navigation</h3>
                        <div class="help-grid">
                            <div class="help-item">
                                <kbd>1</kbd>
                                <span>Aller aux Mentions Légales</span>
                            </div>
                            <div class="help-item">
                                <kbd>2</kbd>
                                <span>Aller à la Politique de Confidentialité</span>
                            </div>
                            <div class="help-item">
                                <kbd>3</kbd>
                                <span>Aller aux Conditions d'Utilisation</span>
                            </div>
                            <div class="help-item">
                                <kbd>4</kbd>
                                <span>Aller à la Politique des Cookies</span>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <h3><i class="fas fa-search"></i> Recherche Avancée</h3>
                        <div class="help-tips">
                            <div class="help-tip">
                                <i class="fas fa-lightbulb"></i>
                                <div>
                                    <strong>Recherche intelligente :</strong>
                                    <p>Tapez au moins 2 caractères pour lancer la recherche automatiquement</p>
                                </div>
                            </div>
                            <div class="help-tip">
                                <i class="fas fa-highlight"></i>
                                <div>
                                    <strong>Mise en évidence :</strong>
                                    <p>Les termes trouvés sont surlignés dans le texte pour un repérage facile</p>
                                </div>
                            </div>
                            <div class="help-tip">
                                <i class="fas fa-filter"></i>
                                <div>
                                    <strong>Filtrage par section :</strong>
                                    <p>Cliquez sur les badges de résultats pour naviguer directement vers une section</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <h3><i class="fas fa-cookie-bite"></i> Gestion des Cookies</h3>
                        <div class="help-features">
                            <div class="help-feature">
                                <div class="feature-icon"><i class="fas fa-toggle-on"></i></div>
                                <div>
                                    <strong>Contrôle total :</strong>
                                    <p>Activez ou désactivez chaque type de cookie selon vos préférences</p>
                                </div>
                            </div>
                            <div class="help-feature">
                                <div class="feature-icon"><i class="fas fa-save"></i></div>
                                <div>
                                    <strong>Sauvegarde automatique :</strong>
                                    <p>Vos préférences sont sauvegardées instantanément et appliquées</p>
                                </div>
                            </div>
                            <div class="help-feature">
                                <div class="feature-icon"><i class="fas fa-shield-alt"></i></div>
                                <div>
                                    <strong>Transparence totale :</strong>
                                    <p>Consultez l'usage détaillé de chaque type de cookie</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <h3><i class="fas fa-mobile-alt"></i> Accessibilité</h3>
                        <div class="help-accessibility">
                            <div class="accessibility-item">
                                <i class="fas fa-universal-access"></i>
                                <span>Interface entièrement accessible au clavier</span>
                            </div>
                            <div class="accessibility-item">
                                <i class="fas fa-eye"></i>
                                <span>Support des lecteurs d'écran (ARIA)</span>
                            </div>
                            <div class="accessibility-item">
                                <i class="fas fa-adjust"></i>
                                <span>Mode sombre pour réduire la fatigue oculaire</span>
                            </div>
                            <div class="accessibility-item">
                                <i class="fas fa-text-height"></i>
                                <span>Texte redimensionnable sans perte de fonctionnalité</span>
                            </div>
                        </div>
                    </div>

                    <div class="help-section">
                        <h3><i class="fas fa-question-circle"></i> Besoin d'Aide ?</h3>
                        <div class="help-contact">
                            <div class="contact-option">
                                <i class="fas fa-envelope"></i>
                                <div>
                                    <strong>Email Support :</strong>
                                    <a href="mailto:legal@yakobot.com">legal@yakobot.com</a>
                                </div>
                            </div>
                            <div class="contact-option">
                                <i class="fab fa-discord"></i>
                                <div>
                                    <strong>Discord :</strong>
                                    <a href="#">Serveur de support YAKO</a>
                                </div>
                            </div>
                            <div class="contact-option">
                                <i class="fas fa-book"></i>
                                <div>
                                    <strong>Documentation :</strong>
                                    <a href="support.html">Centre d'aide complet</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="help-footer">
                    <div class="help-stats">
                        <div class="stat">
                            <strong>4</strong>
                            <span>Sections légales</span>
                        </div>
                        <div class="stat">
                            <strong>3</strong>
                            <span>Types de cookies</span>
                        </div>
                        <div class="stat">
                            <strong>8</strong>
                            <span>Raccourcis clavier</span>
                        </div>
                    </div>
                    <p><i class="fas fa-info-circle"></i> Cette aide est toujours accessible en appuyant sur <kbd>H</kbd></p>
                </div>
            </div>
        `;

        // Créer et afficher la modal d'aide
        this.showHelpModal(helpHTML);
    }

    showHelpModal(content) {
        // Supprimer toute modal d'aide existante
        const existingModal = document.querySelector('.help-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'help-modal-overlay';
        modalOverlay.innerHTML = `
            <div class="help-modal">
                <button class="help-modal-close" onclick="this.closest('.help-modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
                ${content}
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Fermeture au clic sur l'overlay
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });

        // Fermeture par Échap
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modalOverlay.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Animation d'entrée
        setTimeout(() => {
            modalOverlay.classList.add('show');
        }, 10);
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

    // ========== NOTIFICATIONS ==========
    showNotification(message, type = 'success', duration = 4000) {
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
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <i class="fas ${icons[type]}" style="font-size: 1.2rem; margin-top: 2px; flex-shrink: 0;"></i>
                <div style="flex: 1; line-height: 1.4;">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: 10px; opacity: 0.7; flex-shrink: 0;"
                        title="Fermer">×</button>
            </div>
        `;

        // Positionner la notification au-dessus des boutons (mode sombre et cookies)
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 450px;
            padding: 20px;
            border-radius: 12px;
            font-weight: 500;
            z-index: 10002;
            animation: slideInFromTop 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            line-height: 1.4;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            border-left: 4px solid;
        `;

        // Couleurs selon le type
        const colors = {
            success: { bg: '#10b981', border: '#10b981' },
            error: { bg: '#ef4444', border: '#ef4444' },
            warning: { bg: '#f59e0b', border: '#f59e0b' },
            info: { bg: '#3b82f6', border: '#3b82f6' }
        };

        notification.style.background = colors[type].bg;
        notification.style.borderLeftColor = colors[type].border;
        notification.style.color = 'white';

        document.body.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutToTop 0.3s ease';
                    setTimeout(() => {
                        if (notification.parentNode) notification.remove();
                    }, 300);
                }
            }, duration);
        }

        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOutToTop 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) notification.remove();
            }, 300);
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
            @keyframes slideInFromTop {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideOutToTop {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(-100%); opacity: 0; }
            }
            
            .animate-in {
                animation: fadeInUp 0.6s ease forwards;
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            kbd {
                background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px;
                box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2); color: #334155;
                display: inline-block; font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
                font-size: 0.85em; font-weight: 700; line-height: 1; padding: 2px 4px; white-space: nowrap;
            }
            
            body.dark-mode kbd {
                background: #4b5563; border-color: #6b7280; color: #e5e7eb;
            }

            /* Styles pour les toggles de cookies */
            .cookie-toggle input[type="checkbox"]:checked + .toggle-slider {
                background: #7c2d12 !important;
            }

            body.dark-mode .cookie-toggle input[type="checkbox"]:checked + .toggle-slider {
                background: #fbbf24 !important;
            }

            .cookie-toggle input[type="checkbox"] + .toggle-slider {
                background: #d1d5db;
                transition: background 0.3s ease;
            }

            body.dark-mode .cookie-toggle input[type="checkbox"] + .toggle-slider {
                background: #6b7280;
            }

            .cookie-toggle input[type="checkbox"]:checked + .toggle-slider::before {
                transform: translateX(26px);
            }

            /* Notification positionnée au-dessus des boutons */
            .notification {
                z-index: 10002 !important;
            }

            /* Modal d'aide - Style similaire à la page support */
            .help-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10003;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(5px);
            }

            .help-modal-overlay.show {
                opacity: 1;
            }

            .help-modal {
                background: white;
                border-radius: 20px;
                max-width: 900px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                position: relative;
                margin: 20px;
                transform: scale(0.95);
                transition: transform 0.3s ease;
                border: 1px solid #e5e7eb;
            }

            .help-modal-overlay.show .help-modal {
                transform: scale(1);
            }

            body.dark-mode .help-modal {
                background: #1e293b;
                border-color: #374151;
                color: #e2e8f0;
            }

            .help-modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: #6b7280;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1;
            }

            .help-modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }

            body.dark-mode .help-modal-close {
                color: #94a3b8;
            }

            body.dark-mode .help-modal-close:hover {
                background: #374151;
                color: #e2e8f0;
            }

            .help-modal-content {
                padding: 40px;
            }

            .help-header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e5e7eb;
            }

            body.dark-mode .help-header {
                border-bottom-color: #374151;
            }

            .help-header h2 {
                font-size: 2rem;
                color: #7c2d12;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }

            body.dark-mode .help-header h2 {
                color: #fbbf24;
            }

            .help-header p {
                color: #6b7280;
                font-size: 1.1rem;
            }

            body.dark-mode .help-header p {
                color: #94a3b8;
            }

            .help-sections {
                display: grid;
                gap: 30px;
            }

            .help-section {
                background: #f9fafb;
                border-radius: 15px;
                padding: 25px;
                border-left: 4px solid #7c2d12;
            }

            body.dark-mode .help-section {
                background: #334155;
                border-left-color: #fbbf24;
            }

            .help-section h3 {
                color: #7c2d12;
                font-size: 1.3rem;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
            }

            body.dark-mode .help-section h3 {
                color: #fbbf24;
            }

            .help-grid {
                display: grid;
                gap: 15px;
            }

            .help-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: white;
                border-radius: 10px;
                transition: all 0.3s ease;
                border: 1px solid #e5e7eb;
            }

            .help-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }

            body.dark-mode .help-item {
                background: #475569;
                border-color: #64748b;
            }

            body.dark-mode .help-item:hover {
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }

            .help-item kbd {
                flex-shrink: 0;
                font-size: 0.9rem;
                padding: 6px 10px;
            }

            .help-item span {
                color: #4b5563;
                font-weight: 500;
            }

            body.dark-mode .help-item span {
                color: #cbd5e1;
            }

            .help-tips {
                display: grid;
                gap: 15px;
            }

            .help-tip {
                display: flex;
                gap: 15px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
            }

            body.dark-mode .help-tip {
                background: #475569;
                border-color: #64748b;
            }

            .help-tip i {
                color: #7c2d12;
                font-size: 1.2rem;
                flex-shrink: 0;
                margin-top: 2px;
            }

            body.dark-mode .help-tip i {
                color: #fbbf24;
            }

            .help-tip strong {
                color: #1f2937;
                font-size: 1rem;
                margin-bottom: 5px;
                display: block;
            }

            body.dark-mode .help-tip strong {
                color: #f1f5f9;
            }

            .help-tip p {
                color: #6b7280;
                margin: 0;
                line-height: 1.5;
            }

            body.dark-mode .help-tip p {
                color: #cbd5e1;
            }

            .help-features {
                display: grid;
                gap: 20px;
            }

            .help-feature {
                display: flex;
                gap: 20px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                align-items: flex-start;
            }

            body.dark-mode .help-feature {
                background: #475569;
                border-color: #64748b;
            }

            .feature-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #7c2d12, #92400e);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }

            body.dark-mode .feature-icon {
                background: linear-gradient(135deg, #fbbf24, #f59e0b);
            }

            .feature-icon i {
                color: white;
                font-size: 1.2rem;
            }

            body.dark-mode .feature-icon i {
                color: #1f2937;
            }

            .help-feature strong {
                color: #1f2937;
                font-size: 1.1rem;
                margin-bottom: 5px;
                display: block;
            }

            body.dark-mode .help-feature strong {
                color: #f1f5f9;
            }

            .help-feature p {
                color: #6b7280;
                margin: 0;
                line-height: 1.5;
            }

            body.dark-mode .help-feature p {
                color: #cbd5e1;
            }

            .help-accessibility {
                display: grid;
                gap: 15px;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            }

            .accessibility-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                background: white;
                border-radius: 10px;
                border: 1px solid #e5e7eb;
            }

            body.dark-mode .accessibility-item {
                background: #475569;
                border-color: #64748b;
            }

            .accessibility-item i {
                color: #7c2d12;
                font-size: 1.1rem;
                flex-shrink: 0;
            }

            body.dark-mode .accessibility-item i {
                color: #fbbf24;
            }

            .accessibility-item span {
                color: #4b5563;
                font-weight: 500;
                font-size: 0.9rem;
            }

            body.dark-mode .accessibility-item span {
                color: #cbd5e1;
            }

            .help-contact {
                display: grid;
                gap: 15px;
            }

            .contact-option {
                display: flex;
                gap: 15px;
                padding: 20px;
                background: white;
                border-radius: 12px;
                border: 1px solid #e5e7eb;
                align-items: center;
            }

            body.dark-mode .contact-option {
                background: #475569;
                border-color: #64748b;
            }

            .contact-option i {
                color: #7c2d12;
                font-size: 1.3rem;
                flex-shrink: 0;
            }

            body.dark-mode .contact-option i {
                color: #fbbf24;
            }

            .contact-option strong {
                color: #1f2937;
                margin-bottom: 3px;
                display: block;
            }

            body.dark-mode .contact-option strong {
                color: #f1f5f9;
            }

            .contact-option a {
                color: #7c2d12;
                text-decoration: none;
                font-weight: 500;
                transition: color 0.3s ease;
            }

            .contact-option a:hover {
                color: #92400e;
                text-decoration: underline;
            }

            body.dark-mode .contact-option a {
                color: #fbbf24;
            }

            body.dark-mode .contact-option a:hover {
                color: #f59e0b;
            }

            .help-footer {
                margin-top: 40px;
                padding-top: 30px;
                border-top: 2px solid #e5e7eb;
                text-align: center;
            }

            body.dark-mode .help-footer {
                border-top-color: #374151;
            }

            .help-stats {
                display: flex;
                justify-content: center;
                gap: 40px;
                margin-bottom: 20px;
            }

            .stat {
                text-align: center;
            }

            .stat strong {
                display: block;
                font-size: 2rem;
                color: #7c2d12;
                font-weight: 700;
                line-height: 1;
            }

            body.dark-mode .stat strong {
                color: #fbbf24;
            }

            .stat span {
                color: #6b7280;
                font-size: 0.9rem;
                font-weight: 500;
            }

            body.dark-mode .stat span {
                color: #94a3b8;
            }

            .help-footer p {
                color: #6b7280;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 0.95rem;
            }

            body.dark-mode .help-footer p {
                color: #94a3b8;
            }

            .help-footer i {
                color: #7c2d12;
            }

            body.dark-mode .help-footer i {
                color: #fbbf24;
            }

            /* Badge de statut des cookies responsive */
            @media (max-width: 768px) {
                .cookie-status-badge {
                    bottom: 90px !important;
                    right: 15px !important;
                    font-size: 0.7rem !important;
                    padding: 6px 10px !important;
                }
                
                .notification {
                    top: 15px !important;
                    right: 15px !important;
                    left: 15px !important;
                    max-width: none !important;
                }
                
                .cookie-modal {
                    bottom: 15px !important;
                    right: 15px !important;
                    left: 15px !important;
                    width: auto !important;
                    max-width: none !important;
                }

                .help-modal {
                    margin: 10px;
                    max-height: 95vh;
                }

                .help-modal-content {
                    padding: 20px;
                }

                .help-sections {
                    gap: 20px;
                }

                .help-section {
                    padding: 20px;
                }

                .help-stats {
                    gap: 20px;
                }

                .help-accessibility {
                    grid-template-columns: 1fr;
                }

                .help-item {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
            }

            /* Amélioration de l'accessibilité */
            .cookie-toggle input[type="checkbox"]:focus + .toggle-slider {
                outline: 2px solid #7c2d12;
                outline-offset: 2px;
            }

            body.dark-mode .cookie-toggle input[type="checkbox"]:focus + .toggle-slider {
                outline-color: #fbbf24;
            }

            /* Animation des toggles */
            .toggle-slider::before {
                transition: transform 0.3s ease, background 0.3s ease;
            }

            /* Indication visuelle des cookies activés/désactivés */
            .cookie-option {
                transition: all 0.3s ease;
            }

            .cookie-option:has(input:checked) {
                background: rgba(16, 185, 129, 0.05);
                border-left-color: #10b981;
            }

            body.dark-mode .cookie-option:has(input:checked) {
                background: rgba(251, 191, 36, 0.05);
                border-left-color: #fbbf24;
            }

            /* Scrollbar personnalisée pour la modal d'aide */
            .help-modal::-webkit-scrollbar {
                width: 8px;
            }

            .help-modal::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
            }

            .help-modal::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
            }

            .help-modal::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }

            body.dark-mode .help-modal::-webkit-scrollbar-track {
                background: #374151;
            }

            body.dark-mode .help-modal::-webkit-scrollbar-thumb {
                background: #64748b;
            }

            body.dark-mode .help-modal::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
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