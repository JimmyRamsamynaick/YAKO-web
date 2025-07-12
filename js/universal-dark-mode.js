// Script unifié pour le mode sombre YAKO - Version complète et corrigée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌙 Initialisation du mode sombre YAKO v3.0...');

    // ========== CONFIGURATION GLOBALE ==========
    const STORAGE_KEY = 'yako-dark-mode';
    let isDarkMode = false;
    let darkModeToggle = null;
    let domObserver = null;

    // ========== CRÉATION DU BOUTON MODE SOMBRE ==========
    function createDarkModeToggle() {
        // Vérifier si le bouton existe déjà
        const existingToggle = document.querySelector('.dark-mode-toggle');
        if (existingToggle) {
            return existingToggle;
        }

        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.innerHTML = '<i class="fas fa-moon"></i>';
        toggle.setAttribute('title', 'Basculer le mode sombre (Ctrl+D)');
        toggle.setAttribute('aria-label', 'Basculer entre mode clair et mode sombre');

        // Styles du bouton - Positionnement en bas à droite
        toggle.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            font-size: 1.3rem;
            cursor: pointer;
            z-index: 10000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(30, 58, 138, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
        `;

        document.body.appendChild(toggle);
        return toggle;
    }

    // ========== GESTION DU MODE SOMBRE ==========
    function enableDarkMode() {
        document.body.classList.add('dark-mode');

        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeToggle.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
            darkModeToggle.style.boxShadow = '0 4px 20px rgba(251, 191, 36, 0.4)';
        }

        isDarkMode = true;

        // Appliquer immédiatement les styles sombres
        applyDarkModeStyles();
        updatePageElements(true);

        console.log('🌙 Mode sombre activé');
    }

    function disableDarkMode() {
        document.body.classList.remove('dark-mode');

        if (darkModeToggle) {
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            darkModeToggle.style.background = 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
            darkModeToggle.style.boxShadow = '0 4px 20px rgba(30, 58, 138, 0.4)';
        }

        isDarkMode = false;

        // Restaurer immédiatement les styles clairs
        removeDarkModeStyles();
        updatePageElements(false);

        console.log('☀️ Mode clair activé');
    }

    function toggleDarkMode() {
        if (isDarkMode) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }

        // Sauvegarder la préférence
        localStorage.setItem(STORAGE_KEY, isDarkMode);

        // Notification
        showNotification(
            `${isDarkMode ? '🌙 Mode sombre' : '☀️ Mode clair'} activé`,
            'info',
            2000
        );

        // Animation du bouton
        if (darkModeToggle) {
            darkModeToggle.style.transform = 'scale(0.85) rotate(180deg)';
            setTimeout(() => {
                darkModeToggle.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        }
    }

    // ========== APPLICATION/SUPPRESSION DES STYLES SOMBRES ==========
    function applyDarkModeStyles() {
        // Styles généraux
        document.body.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        document.body.style.color = '#e2e8f0';

        // Navigation
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.background = 'rgba(15, 23, 42, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.borderBottom = '1px solid #374151';
        }

        // Appliquer selon la page
        applyPageSpecificDarkStyles();
    }

    function removeDarkModeStyles() {
        // Restaurer les styles généraux
        document.body.style.background = '';
        document.body.style.color = '';

        // Navigation
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.background = '';
            navbar.style.backdropFilter = '';
            navbar.style.borderBottom = '';
        }

        // Restaurer selon la page
        removePageSpecificDarkStyles();
    }

    function applyPageSpecificDarkStyles() {
        const currentPage = window.location.pathname;

        if (currentPage.includes('legal.html')) {
            applyLegalPageDarkStyles();
        } else if (currentPage.includes('support.html')) {
            applySupportPageDarkStyles();
        } else if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
            applyHomePageDarkStyles();
        } else if (currentPage.includes('fonctionnalites.html')) {
            applyFeaturesPageDarkStyles();
        }
    }

    function removePageSpecificDarkStyles() {
        const currentPage = window.location.pathname;

        if (currentPage.includes('legal.html')) {
            removeLegalPageDarkStyles();
        } else if (currentPage.includes('support.html')) {
            removeSupportPageDarkStyles();
        } else if (currentPage.includes('index.html') || currentPage === '/' || currentPage === '') {
            removeHomePageDarkStyles();
        } else if (currentPage.includes('fonctionnalites.html')) {
            removeFeaturesPageDarkStyles();
        }
    }

    // ========== STYLES SPÉCIFIQUES PAGE LÉGALE ==========
    function applyLegalPageDarkStyles() {
        console.log('🏛️ Application du mode sombre page légale');

        // Hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        }

        // Legal nav
        const legalNav = document.querySelector('.legal-nav');
        if (legalNav) {
            legalNav.style.background = '#1e293b';
            legalNav.style.borderBottom = '1px solid #374151';
        }

        // Legal content
        const legalContent = document.querySelector('.legal-content');
        if (legalContent) {
            legalContent.style.background = '#0f172a';
        }

        // Legal summary
        const legalSummary = document.querySelector('.legal-summary');
        if (legalSummary) {
            legalSummary.style.background = '#1e293b';
        }

        // Legal tabs
        const legalTabs = document.querySelectorAll('.legal-tab');
        legalTabs.forEach(tab => {
            if (!tab.classList.contains('active')) {
                tab.style.background = '#374151';
                tab.style.borderColor = '#475569';
                tab.style.color = '#e2e8f0';
            }
        });

        // Legal sections et documents
        const legalElements = document.querySelectorAll('.legal-section, .legal-document, .legal-item');
        legalElements.forEach(element => {
            element.style.background = '#1e293b';
            element.style.borderColor = '#374151';
            element.style.color = '#e2e8f0';
        });

        // Summary cards
        const summaryCards = document.querySelectorAll('.summary-card');
        summaryCards.forEach(card => {
            card.style.background = '#334155';
            card.style.borderColor = '#475569';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });

        // Summary contact
        const summaryContact = document.querySelector('.summary-contact');
        if (summaryContact) {
            summaryContact.style.background = '#334155';
            summaryContact.style.borderColor = '#10b981';
        }

        // Cookie categories
        const cookieCategories = document.querySelectorAll('.cookie-category');
        cookieCategories.forEach(category => {
            category.style.background = '#374151';
            category.style.borderLeftColor = '#10b981';
        });

        // Cookie controls
        const cookieControls = document.querySelector('.cookie-controls');
        if (cookieControls) {
            cookieControls.style.background = '#374151';
        }

        // Browser instructions details
        const browserDetails = document.querySelectorAll('.browser-instructions details');
        browserDetails.forEach(detail => {
            detail.style.background = '#334155';
            detail.style.borderColor = '#475569';

            const summary = detail.querySelector('summary');
            if (summary) {
                summary.style.background = '#475569';
                summary.style.color = '#e2e8f0';
            }
        });

        // Titles and text
        const titles = document.querySelectorAll('.legal-document h2, .legal-item h3, .summary-card h3');
        titles.forEach(title => {
            title.style.color = '#f1f5f9';
        });

        const paragraphs = document.querySelectorAll('.legal-details p, .summary-card p');
        paragraphs.forEach(p => {
            p.style.color = '#cbd5e1';
        });

        // Footer
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.style.background = '#0f172a';
            footer.style.borderTop = '1px solid #374151';
        }
    }

    function removeLegalPageDarkStyles() {
        console.log('☀️ Restauration du mode clair page légale');

        // Hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.background = '';
        }

        // Legal nav
        const legalNav = document.querySelector('.legal-nav');
        if (legalNav) {
            legalNav.style.background = '';
            legalNav.style.borderBottom = '';
        }

        // Legal content
        const legalContent = document.querySelector('.legal-content');
        if (legalContent) {
            legalContent.style.background = '';
        }

        // Legal summary
        const legalSummary = document.querySelector('.legal-summary');
        if (legalSummary) {
            legalSummary.style.background = '';
        }

        // Legal tabs
        const legalTabs = document.querySelectorAll('.legal-tab');
        legalTabs.forEach(tab => {
            if (!tab.classList.contains('active')) {
                tab.style.background = '';
                tab.style.borderColor = '';
                tab.style.color = '';
            }
        });

        // Legal sections et documents
        const legalElements = document.querySelectorAll('.legal-section, .legal-document, .legal-item');
        legalElements.forEach(element => {
            element.style.background = '';
            element.style.borderColor = '';
            element.style.color = '';
        });

        // Summary cards
        const summaryCards = document.querySelectorAll('.summary-card');
        summaryCards.forEach(card => {
            card.style.background = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });

        // Summary contact
        const summaryContact = document.querySelector('.summary-contact');
        if (summaryContact) {
            summaryContact.style.background = '';
            summaryContact.style.borderColor = '';
        }

        // Cookie categories
        const cookieCategories = document.querySelectorAll('.cookie-category');
        cookieCategories.forEach(category => {
            category.style.background = '';
            category.style.borderLeftColor = '';
        });

        // Cookie controls
        const cookieControls = document.querySelector('.cookie-controls');
        if (cookieControls) {
            cookieControls.style.background = '';
        }

        // Browser instructions details
        const browserDetails = document.querySelectorAll('.browser-instructions details');
        browserDetails.forEach(detail => {
            detail.style.background = '';
            detail.style.borderColor = '';

            const summary = detail.querySelector('summary');
            if (summary) {
                summary.style.background = '';
                summary.style.color = '';
            }
        });

        // Titles and text
        const titles = document.querySelectorAll('.legal-document h2, .legal-item h3, .summary-card h3');
        titles.forEach(title => {
            title.style.color = '';
        });

        const paragraphs = document.querySelectorAll('.legal-details p, .summary-card p');
        paragraphs.forEach(p => {
            p.style.color = '';
        });

        // Footer
        const footer = document.querySelector('.footer');
        if (footer) {
            footer.style.background = '';
            footer.style.borderTop = '';
        }
    }

    // ========== STYLES SPÉCIFIQUES PAGE SUPPORT ==========
    function applySupportPageDarkStyles() {
        console.log('🎧 Application du mode sombre page support');

        // Hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        }

        // Sections
        const sections = document.querySelectorAll('.support-options, .contact-section, .resources-section');
        sections.forEach(section => {
            section.style.background = '#1e293b';
        });

        const faqSection = document.querySelector('.faq-section');
        if (faqSection) {
            faqSection.style.background = '#0f172a';
        }

        // Cards
        const cards = document.querySelectorAll('.support-card, .resource-card, .faq-category');
        cards.forEach(card => {
            card.style.background = '#334155';
            card.style.borderColor = '#475569';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });

        // FAQ items
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.style.borderBottomColor = '#374151';
        });

        // Form container
        const formContainer = document.querySelector('.contact-form-container');
        if (formContainer) {
            formContainer.style.background = '#334155';
            formContainer.style.borderColor = '#475569';
        }
    }

    function removeSupportPageDarkStyles() {
        console.log('☀️ Restauration du mode clair page support');

        // Hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.background = '';
        }

        // Sections
        const sections = document.querySelectorAll('.support-options, .contact-section, .resources-section, .faq-section');
        sections.forEach(section => {
            section.style.background = '';
        });

        // Cards
        const cards = document.querySelectorAll('.support-card, .resource-card, .faq-category');
        cards.forEach(card => {
            card.style.background = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });

        // FAQ items
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            item.style.borderBottomColor = '';
        });

        // Form container
        const formContainer = document.querySelector('.contact-form-container');
        if (formContainer) {
            formContainer.style.background = '';
            formContainer.style.borderColor = '';
        }
    }

    // ========== STYLES SPÉCIFIQUES PAGE D'ACCUEIL ==========
    function applyHomePageDarkStyles() {
        console.log('🏠 Application du mode sombre page d\'accueil');

        // Hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        }

        // Features preview
        const featuresPreview = document.querySelector('.features-preview');
        if (featuresPreview) {
            featuresPreview.style.background = '#1e293b';
        }

        // CTA section
        const cta = document.querySelector('.cta');
        if (cta) {
            cta.style.background = '#1e293b';
        }

        // Stats section
        const stats = document.querySelector('.stats');
        if (stats) {
            stats.style.background = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
        }

        // Feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.style.background = '#334155';
            card.style.borderColor = '#475569';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
    }

    function removeHomePageDarkStyles() {
        console.log('☀️ Restauration du mode clair page d\'accueil');

        // Hero
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.background = '';
        }

        // Sections
        const sections = document.querySelectorAll('.features-preview, .cta, .stats');
        sections.forEach(section => {
            section.style.background = '';
        });

        // Feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.style.background = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });
    }

    // ========== STYLES SPÉCIFIQUES PAGE FONCTIONNALITÉS ==========
    function applyFeaturesPageDarkStyles() {
        console.log('⚡ Application du mode sombre page fonctionnalités');

        const sections = document.querySelectorAll('.features-showcase, .commands-section');
        sections.forEach(section => {
            section.style.background = section.classList.contains('features-showcase') ? '#1e293b' : '#0f172a';
        });

        const cards = document.querySelectorAll('.feature-card, .command-category');
        cards.forEach(card => {
            card.style.background = '#334155';
            card.style.borderColor = '#475569';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        });
    }

    function removeFeaturesPageDarkStyles() {
        console.log('☀️ Restauration du mode clair page fonctionnalités');

        const sections = document.querySelectorAll('.features-showcase, .commands-section');
        sections.forEach(section => {
            section.style.background = '';
        });

        const cards = document.querySelectorAll('.feature-card, .command-category');
        cards.forEach(card => {
            card.style.background = '';
            card.style.borderColor = '';
            card.style.boxShadow = '';
        });
    }

    // ========== MISE À JOUR DES ÉLÉMENTS DE PAGE ==========
    function updatePageElements(isDark) {
        // Mise à jour des formulaires
        updateForms(isDark);

        // Mise à jour des toggles de cookies
        updateCookieToggles(isDark);

        // Mise à jour des liens de navigation
        updateNavigationLinks(isDark);

        // Mise à jour des titres et textes
        updateTextElements(isDark);

        // Mise à jour des boutons
        updateButtons(isDark);

        // Mise à jour des éléments de footer
        updateFooter(isDark);
    }

    function updateForms(isDark) {
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (isDark) {
                input.style.background = '#374151';
                input.style.borderColor = '#4b5563';
                input.style.color = '#e2e8f0';
            } else {
                input.style.background = '';
                input.style.borderColor = '';
                input.style.color = '';
            }
        });

        // Focus styles dynamiques
        updateDynamicFocusStyles(isDark);
    }

    function updateDynamicFocusStyles(isDark) {
        const focusStyle = isDark ? `
            input:focus, textarea:focus, select:focus {
                background: #475569 !important; 
                border-color: #10b981 !important; 
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
            }
            input::placeholder, textarea::placeholder {
                color: #9ca3af !important;
            }
        ` : '';

        let focusStyleElement = document.querySelector('#dynamic-focus-styles');
        if (!focusStyleElement) {
            focusStyleElement = document.createElement('style');
            focusStyleElement.id = 'dynamic-focus-styles';
            document.head.appendChild(focusStyleElement);
        }
        focusStyleElement.textContent = focusStyle;
    }

    function updateCookieToggles(isDark) {
        const cookieToggles = document.querySelectorAll('.cookie-toggle input[type="checkbox"]:not([disabled])');
        cookieToggles.forEach(toggle => {
            const slider = toggle.nextElementSibling;
            if (slider && slider.classList.contains('toggle-slider')) {
                if (isDark) {
                    slider.style.background = toggle.checked ? '#10b981' : '#4b5563';
                } else {
                    slider.style.background = toggle.checked ? '#7c2d12' : '#d1d5db';
                }
            }
        });
    }

    function updateNavigationLinks(isDark) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (isDark) {
                link.style.color = '#e2e8f0';
            } else {
                link.style.color = '';
            }
        });

        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) {
            if (isDark) {
                navBrand.style.color = '#e2e8f0';
            } else {
                navBrand.style.color = '';
            }
        }
    }

    function updateTextElements(isDark) {
        // Titres (sauf dans le hero qui garde ses couleurs)
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            if (isDark && !heading.closest('.hero')) {
                heading.style.color = '#f1f5f9';
            } else if (!isDark) {
                heading.style.color = '';
            }
        });

        // Paragraphes (sauf dans le hero)
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (isDark && !p.closest('.hero')) {
                p.style.color = '#cbd5e1';
            } else if (!isDark) {
                p.style.color = '';
            }
        });

        // Liens
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (isDark) {
                link.style.color = '#10b981';
            } else {
                link.style.color = '';
            }
        });
    }

    function updateButtons(isDark) {
        const outlineButtons = document.querySelectorAll('.btn-outline');
        outlineButtons.forEach(button => {
            if (isDark) {
                button.style.borderColor = '#10b981';
                button.style.color = '#10b981';
            } else {
                button.style.borderColor = '';
                button.style.color = '';
            }
        });

        const secondaryButtons = document.querySelectorAll('.btn-secondary');
        secondaryButtons.forEach(button => {
            if (isDark) {
                button.style.background = '#475569';
                button.style.color = '#e2e8f0';
            } else {
                button.style.background = '';
                button.style.color = '';
            }
        });
    }

    function updateFooter(isDark) {
        const footerLinks = document.querySelectorAll('.footer a');
        footerLinks.forEach(link => {
            if (isDark) {
                link.style.color = '#cbd5e1';
            } else {
                link.style.color = '';
            }
        });

        const footerHeadings = document.querySelectorAll('.footer h4');
        footerHeadings.forEach(heading => {
            if (isDark) {
                heading.style.color = '#f1f5f9';
            } else {
                heading.style.color = '';
            }
        });

        const socialLinks = document.querySelectorAll('.social-links a');
        socialLinks.forEach(link => {
            if (isDark) {
                link.style.background = '#475569';
            } else {
                link.style.background = '';
            }
        });
    }

    // ========== GESTION DES ÉVÉNEMENTS ==========
    function setupEventListeners() {
        // Événement du bouton
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', toggleDarkMode);

            // Effets visuels au survol
            darkModeToggle.addEventListener('mouseenter', () => {
                darkModeToggle.style.transform = 'scale(1.1) rotate(10deg)';
                darkModeToggle.style.boxShadow = isDarkMode
                    ? '0 6px 25px rgba(251, 191, 36, 0.6)'
                    : '0 6px 25px rgba(30, 58, 138, 0.6)';
            });

            darkModeToggle.addEventListener('mouseleave', () => {
                darkModeToggle.style.transform = 'scale(1) rotate(0deg)';
                darkModeToggle.style.boxShadow = isDarkMode
                    ? '0 4px 20px rgba(251, 191, 36, 0.4)'
                    : '0 4px 20px rgba(30, 58, 138, 0.4)';
            });
        }

        // Raccourci clavier Ctrl+D
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                toggleDarkMode();
            }
        });

        // Écouter les changements de préférence système
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                if (e.matches && !isDarkMode) {
                    enableDarkMode();
                } else if (!e.matches && isDarkMode) {
                    disableDarkMode();
                }
            }
        });
    }

    // ========== INITIALISATION ==========
    function initializeDarkMode() {
        // Créer le bouton
        darkModeToggle = createDarkModeToggle();

        // Restaurer la préférence sauvegardée
        const savedTheme = localStorage.getItem(STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'true' || (!savedTheme && prefersDark)) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }

        // Configurer les événements
        setupEventListeners();
    }

    // ========== FONCTION DE NOTIFICATION ==========
    function showNotification(message, type = 'info', duration = 3000) {
        // Supprimer les notifications existantes
        document.querySelectorAll('.yako-notification, .notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `yako-notification ${type}`;

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
                <i class="fas ${icons[type]}" style="font-size: 1.1rem; margin-top: 2px; flex-shrink: 0;"></i>
                <div style="flex: 1; line-height: 1.4;">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: 10px; opacity: 0.7; flex-shrink: 0; padding: 0; line-height: 1;"
                        aria-label="Fermer la notification">
                    ×
                </button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: white;
            color: ${colors[type]};
            padding: 20px 25px;
            border-radius: 12px;
            border-left: 4px solid ${colors[type]};
            font-weight: 500;
            z-index: 9999;
            animation: slideInFromBottom 0.3s ease;
            box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
            max-width: 380px;
            min-width: 300px;
            font-size: 0.9rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(0, 0, 0, 0.1);
        `;

        // Mode sombre pour la notification
        if (isDarkMode) {
            notification.style.background = '#1e293b';
            notification.style.color = '#e2e8f0';
            notification.style.border = `1px solid ${colors[type]}`;
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
    }

    // ========== STYLES CSS DYNAMIQUES ==========
    function addDynamicStyles() {
        const existingStyles = document.querySelector('#yako-dark-mode-dynamic');
        if (existingStyles) return;

        const style = document.createElement('style');
        style.id = 'yako-dark-mode-dynamic';
        style.textContent = `
            /* Animations pour les notifications */
            @keyframes slideInFromBottom {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideOutToBottom {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }

            /* Amélioration des transitions */
            body, .navbar, .hero, .feature-card, .support-card, .legal-section, 
            .legal-document, .legal-item, .summary-card, .footer, input, textarea, select {
                transition: all 0.3s ease !important;
            }

            /* Styles pour le mode sombre spécifique à la page légale */
            body.dark-mode .legal-nav {
                background: #1e293b !important;
                border-bottom: 1px solid #374151 !important;
            }

            body.dark-mode .legal-content {
                background: #0f172a !important;
            }

            body.dark-mode .legal-summary {
                background: #1e293b !important;
            }

            body.dark-mode .legal-tab:not(.active) {
                background: #374151 !important;
                border-color: #475569 !important;
                color: #e2e8f0 !important;
            }

            body.dark-mode .legal-tab.active {
                background: linear-gradient(135deg, #10b981, #059669) !important;
                color: white !important;
                border-color: #10b981 !important;
            }

            body.dark-mode .legal-section,
            body.dark-mode .legal-document,
            body.dark-mode .legal-item {
                background: #1e293b !important;
                border-color: #374151 !important;
            }

            body.dark-mode .legal-document h2 {
                background: linear-gradient(135deg, #10b981, #059669) !important;
                color: white !important;
            }

            body.dark-mode .summary-card {
                background: #334155 !important;
                border-color: #475569 !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
            }

            body.dark-mode .summary-contact {
                background: #334155 !important;
                border-color: #10b981 !important;
            }

            body.dark-mode .cookie-category {
                background: #374151 !important;
                border-left-color: #10b981 !important;
            }

            body.dark-mode .cookie-controls {
                background: #374151 !important;
            }

            body.dark-mode .browser-instructions details {
                background: #334155 !important;
                border-color: #475569 !important;
            }

            body.dark-mode .browser-instructions summary {
                background: #475569 !important;
                color: #e2e8f0 !important;
            }

            /* Correction pour les titres en mode sombre */
            body.dark-mode .legal-document h2,
            body.dark-mode .legal-item h3,
            body.dark-mode .summary-card h3,
            body.dark-mode h1, body.dark-mode h2, body.dark-mode h3, 
            body.dark-mode h4, body.dark-mode h5, body.dark-mode h6 {
                color: #f1f5f9 !important;
            }

            /* Correction pour les paragraphes en mode sombre */
            body.dark-mode .legal-details p,
            body.dark-mode .summary-card p,
            body.dark-mode p {
                color: #cbd5e1 !important;
            }

            /* Correction pour les liens en mode sombre */
            body.dark-mode a {
                color: #10b981 !important;
            }

            body.dark-mode a:hover {
                color: #059669 !important;
            }

            /* Footer en mode sombre */
            body.dark-mode .footer {
                background: #0f172a !important;
                border-top: 1px solid #374151 !important;
            }

            body.dark-mode .footer h4,
            body.dark-mode .footer-brand {
                color: #f1f5f9 !important;
            }

            body.dark-mode .footer a {
                color: #cbd5e1 !important;
            }

            body.dark-mode .footer a:hover {
                color: #10b981 !important;
            }

            body.dark-mode .social-links a {
                background: #475569 !important;
            }

            body.dark-mode .social-links a:hover {
                background: #10b981 !important;
            }

            /* Navigation en mode sombre */
            body.dark-mode .navbar {
                background: rgba(15, 23, 42, 0.95) !important;
                backdrop-filter: blur(10px) !important;
                border-bottom: 1px solid #374151 !important;
            }

            body.dark-mode .nav-link {
                color: #e2e8f0 !important;
            }

            body.dark-mode .nav-link:hover,
            body.dark-mode .nav-link.active {
                color: #10b981 !important;
            }

            body.dark-mode .nav-brand {
                color: #e2e8f0 !important;
            }

            /* Formulaires en mode sombre */
            body.dark-mode input,
            body.dark-mode textarea,
            body.dark-mode select {
                background: #374151 !important;
                border-color: #4b5563 !important;
                color: #e2e8f0 !important;
            }

            body.dark-mode input:focus,
            body.dark-mode textarea:focus,
            body.dark-mode select:focus {
                background: #475569 !important;
                border-color: #10b981 !important;
                box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
            }

            body.dark-mode input::placeholder,
            body.dark-mode textarea::placeholder {
                color: #9ca3af !important;
            }

            /* Boutons en mode sombre */
            body.dark-mode .btn-outline {
                border-color: #10b981 !important;
                color: #10b981 !important;
            }

            body.dark-mode .btn-outline:hover {
                background: #10b981 !important;
                color: #0f172a !important;
            }

            body.dark-mode .btn-secondary {
                background: #475569 !important;
                color: #e2e8f0 !important;
            }

            body.dark-mode .btn-secondary:hover {
                background: #64748b !important;
            }

            /* Toggle des cookies en mode sombre */
            body.dark-mode .cookie-toggle input[type="checkbox"]:checked + .toggle-slider {
                background: #10b981 !important;
            }

            body.dark-mode .cookie-toggle input[type="checkbox"]:not(:checked) + .toggle-slider {
                background: #4b5563 !important;
            }

            /* Mode responsive */
            @media (max-width: 768px) {
                .dark-mode-toggle {
                    bottom: 15px !important;
                    right: 15px !important;
                    width: 50px !important;
                    height: 50px !important;
                    font-size: 1.1rem !important;
                }

                .yako-notification {
                    bottom: 80px !important;
                    right: 15px !important;
                    left: 15px !important;
                    max-width: none !important;
                }
            }

            /* Focus visible pour l'accessibilité */
            .dark-mode-toggle:focus-visible {
                outline: 3px solid #3b82f6;
                outline-offset: 3px;
            }

            body.dark-mode .dark-mode-toggle:focus-visible {
                outline-color: #fbbf24;
            }

            /* Amélioration du contraste */
            body.dark-mode {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                color: #e2e8f0 !important;
            }

            /* Scrollbar personnalisée en mode sombre */
            body.dark-mode::-webkit-scrollbar {
                width: 8px;
            }

            body.dark-mode::-webkit-scrollbar-track {
                background: #1e293b;
            }

            body.dark-mode::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 4px;
            }

            body.dark-mode::-webkit-scrollbar-thumb:hover {
                background: #64748b;
            }

            /* Firefox scrollbar */
            body.dark-mode {
                scrollbar-width: thin;
                scrollbar-color: #475569 #1e293b;
            }

            /* Sélection de texte en mode sombre */
            body.dark-mode ::selection {
                background: #10b981;
                color: #0f172a;
            }

            body.dark-mode ::-moz-selection {
                background: #10b981;
                color: #0f172a;
            }

            /* États pour reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .dark-mode-toggle,
                .yako-notification,
                body, body * {
                    transition: none !important;
                    animation: none !important;
                }
            }

            /* Mode impression */
            @media print {
                .dark-mode-toggle,
                .yako-notification {
                    display: none !important;
                }

                body.dark-mode {
                    background: white !important;
                    color: black !important;
                }

                body.dark-mode * {
                    background: white !important;
                    color: black !important;
                    border-color: black !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // ========== OBSERVER POUR LES CHANGEMENTS DOM ==========
    function setupDOMObserver() {
        domObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && isDarkMode) {
                            // Appliquer le mode sombre aux nouveaux éléments
                            setTimeout(() => {
                                updatePageElements(true);
                            }, 100);
                        }
                    });
                }
            });
        });

        domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // ========== GESTION DE L'ACCESSIBILITÉ ==========
    function enhanceAccessibility() {
        // Ajouter un indicateur de statut pour les lecteurs d'écran
        const statusElement = document.createElement('div');
        statusElement.id = 'dark-mode-status';
        statusElement.setAttribute('aria-live', 'polite');
        statusElement.setAttribute('aria-atomic', 'true');
        statusElement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(statusElement);

        // Mettre à jour le statut
        function updateStatus() {
            statusElement.textContent = isDarkMode ?
                'Mode sombre activé' :
                'Mode clair activé';
        }

        // Observer les changements de classe sur body
        const classObserver = new MutationObserver(updateStatus);
        classObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        updateStatus();
    }

    // ========== GESTION DES PRÉFÉRENCES SYSTÈME ==========
    function handleSystemPreferences() {
        // Écouter les changements de préférence système
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        function handleChange(e) {
            const hasStoredPreference = localStorage.getItem(STORAGE_KEY);

            if (!hasStoredPreference) {
                if (e.matches && !isDarkMode) {
                    enableDarkMode();
                    showNotification('🌙 Mode sombre activé automatiquement selon vos préférences système', 'info', 3000);
                } else if (!e.matches && isDarkMode) {
                    disableDarkMode();
                    showNotification('☀️ Mode clair activé automatiquement selon vos préférences système', 'info', 3000);
                }
            }
        }

        mediaQuery.addEventListener('change', handleChange);

        // Vérification initiale
        const hasStoredPreference = localStorage.getItem(STORAGE_KEY);
        if (!hasStoredPreference && mediaQuery.matches) {
            enableDarkMode();
        }
    }

    // ========== FONCTIONS UTILITAIRES ==========
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // ========== INITIALISATION PRINCIPALE ==========
    function init() {
        try {
            console.log('🚀 Initialisation du mode sombre YAKO...');

            // Ajouter les styles CSS dynamiques
            addDynamicStyles();

            // Initialiser le mode sombre
            initializeDarkMode();

            // Configurer l'observateur DOM
            setupDOMObserver();

            // Améliorer l'accessibilité
            enhanceAccessibility();

            // Gérer les préférences système
            handleSystemPreferences();

            console.log('✅ Mode sombre YAKO initialisé avec succès');

            // Analytics (si disponible)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'dark_mode_init', {
                    event_category: 'UI',
                    event_label: isDarkMode ? 'dark' : 'light'
                });
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);

            // Notification d'erreur pour le développement
            if (window.location.hostname === 'localhost') {
                setTimeout(() => {
                    showNotification('⚠️ Erreur d\'initialisation du mode sombre', 'error', 5000);
                }, 1000);
            }
        }
    }

    // ========== EXPOSITION DES FONCTIONS GLOBALES ==========
    window.yakoGlobalDarkMode = {
        toggle: toggleDarkMode,
        enable: enableDarkMode,
        disable: disableDarkMode,
        isEnabled: () => isDarkMode,
        showNotification: showNotification,
        updateElements: updatePageElements,
        refresh: () => {
            if (isDarkMode) {
                applyDarkModeStyles();
                updatePageElements(true);
            } else {
                removeDarkModeStyles();
                updatePageElements(false);
            }
        }
    };

    // Compatibilité avec les scripts existants
    window.yakoUtils = window.yakoUtils || {};
    Object.assign(window.yakoUtils, {
        toggleDarkMode: toggleDarkMode,
        showNotification: showNotification,
        isDarkMode: () => isDarkMode,
        refreshDarkMode: window.yakoGlobalDarkMode.refresh
    });

    // ========== NETTOYAGE ET GESTION DES ÉVÉNEMENTS ==========

    // Nettoyer lors du déchargement
    window.addEventListener('beforeunload', () => {
        if (domObserver) {
            domObserver.disconnect();
        }
    });

    // Gestion de la visibilité de la page
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Vérifier si les préférences ont changé dans un autre onglet
            const savedTheme = localStorage.getItem(STORAGE_KEY);
            if (savedTheme === 'true' && !isDarkMode) {
                enableDarkMode();
            } else if (savedTheme === 'false' && isDarkMode) {
                disableDarkMode();
            }
        }
    });

    // Gestion du redimensionnement
    window.addEventListener('resize', debounce(() => {
        if (darkModeToggle) {
            // Repositionner le bouton si nécessaire
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                darkModeToggle.style.bottom = '15px';
                darkModeToggle.style.right = '15px';
                darkModeToggle.style.width = '50px';
                darkModeToggle.style.height = '50px';
            } else {
                darkModeToggle.style.bottom = '20px';
                darkModeToggle.style.right = '20px';
                darkModeToggle.style.width = '60px';
                darkModeToggle.style.height = '60px';
            }
        }
    }, 250));

    // ========== LANCEMENT DE L'INITIALISATION ==========
    init();

    // ========== MESSAGE DE STATUT FINAL ==========
    console.log(`
🌙 YAKO Dark Mode v3.0 - INITIALISÉ

✅ Fonctionnalités:
   • Mode sombre/clair avec bouton flottant en bas à droite
   • Sauvegarde automatique des préférences utilisateur
   • Support complet des préférences système (prefers-color-scheme)
   • Accessibilité améliorée avec ARIA et lecteurs d'écran
   • Raccourcis clavier: Ctrl+D ou Cmd+D
   • Notifications contextuelles avec auto-suppression
   • Adaptation responsive pour mobile et desktop
   • Observer DOM pour les éléments dynamiques
   • Gestion spécialisée pour chaque page (légale, support, etc.)
   • Transitions fluides et animations optimisées
   • Nettoyage automatique des styles lors du basculement

🎯 État actuel: ${isDarkMode ? 'Mode SOMBRE' : 'Mode CLAIR'}
💾 Préférence: ${localStorage.getItem(STORAGE_KEY) || 'Auto (système)'}
⌨️  Raccourci: Ctrl+D
🌐 Page: ${window.location.pathname}

🔧 API disponible: window.yakoGlobalDarkMode
   • .toggle() - Basculer le mode
   • .enable() - Activer le mode sombre
   • .disable() - Activer le mode clair
   • .isEnabled() - Vérifier l'état
   • .refresh() - Actualiser les styles
    `);
});

// ========== GESTION GLOBALE DES ERREURS ==========
window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('universal-dark-mode')) {
        console.error('🚨 Erreur dans le mode sombre:', e.error);

        // Tentative de récupération
        try {
            if (window.yakoGlobalDarkMode && window.yakoGlobalDarkMode.refresh) {
                window.yakoGlobalDarkMode.refresh();
                console.log('🔄 Récupération automatique réussie');
            }
        } catch (recoveryError) {
            console.error('❌ Échec de la récupération:', recoveryError);
        }
    }
});

// ========== EXPORT DU MODULE (optionnel) ==========
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        init: () => console.log('Mode sombre YAKO - Utiliser dans un navigateur'),
        version: '3.0'
    };
}