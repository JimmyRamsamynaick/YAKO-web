// Gestion de la FAQ et du formulaire de contact
document.addEventListener('DOMContentLoaded', function() {
    // FAQ Toggle avec animations améliorées
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');

            // Fermer toutes les autres questions avec animation
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    const answer = item.querySelector('.faq-answer');
                    answer.style.maxHeight = '0px';
                }
            });

            // Ouvrir/fermer la question cliquée
            if (!isActive) {
                faqItem.classList.add('active');
                const answer = faqItem.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + 'px';

                // Scroll smooth vers la question
                setTimeout(() => {
                    question.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                }, 150);

                // Analytics
                trackFAQInteraction(question.querySelector('h4').textContent);
            } else {
                faqItem.classList.remove('active');
                const answer = faqItem.querySelector('.faq-answer');
                answer.style.maxHeight = '0px';
            }
        });

        // Accessibilité clavier
        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });

        // Attributs ARIA pour l'accessibilité
        question.setAttribute('role', 'button');
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('tabindex', '0');
    });

    // Menu mobile toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');

            // Bloquer le scroll du body quand le menu est ouvert
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';

            // Accessibilité
            const isExpanded = navMenu.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Fermer le menu au clic en dehors
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Fermer le menu avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }

    // Smooth scrolling pour les liens d'ancrage
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Focus sur l'élément cible pour l'accessibilité
                target.focus();
            }
        });
    });

    // Animation des éléments au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
            }
        });
    }, observerOptions);

    // Observer les cartes et éléments à animer
    const elementsToAnimate = document.querySelectorAll('.support-card, .faq-category, .resource-card, .contact-method');

    elementsToAnimate.forEach((element, index) => {
        element.classList.add('fade-in');
        element.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(element);
    });

    // Gestion du formulaire de contact avec validation avancée
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        const categorySelect = document.getElementById('category');
        const serverInput = document.getElementById('server');

        // Configuration de validation
        const validationRules = {
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Veuillez entrer une adresse email valide.'
            },
            subject: {
                required: true,
                minLength: 5,
                maxLength: 100,
                message: 'Le sujet doit contenir entre 5 et 100 caractères.'
            },
            message: {
                required: true,
                minLength: 20,
                maxLength: 2000,
                message: 'Le message doit contenir entre 20 et 2000 caractères.'
            },
            category: {
                required: true,
                message: 'Veuillez sélectionner une catégorie.'
            },
            server_id: {
                required: false,
                pattern: /^\d{17,19}$/,
                message: 'L\'ID du serveur doit être un nombre de 17-19 chiffres.'
            }
        };

        // Validation en temps réel
        function setupRealTimeValidation() {
            [emailInput, subjectInput, messageInput, categorySelect, serverInput].forEach(input => {
                if (!input) return;

                input.addEventListener('blur', () => validateField(input));
                input.addEventListener('input', () => {
                    clearValidation(input);
                    if (input === messageInput) {
                        updateCharacterCount(input);
                    }
                });

                // Validation spéciale pour l'ID serveur
                if (input === serverInput) {
                    input.addEventListener('input', (e) => {
                        // Permettre seulement les chiffres
                        e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    });
                }
            });
        }

        function validateField(input) {
            const name = input.name;
            const value = input.value.trim();
            const rules = validationRules[name];

            if (!rules) return true;

            // Vérifier si requis
            if (rules.required && !value) {
                showFieldError(input, `Ce champ est requis.`);
                return false;
            }

            // Si le champ n'est pas requis et vide, c'est valide
            if (!rules.required && !value) {
                showFieldSuccess(input);
                return true;
            }

            // Vérifier la longueur minimale
            if (rules.minLength && value.length < rules.minLength) {
                showFieldError(input, `Minimum ${rules.minLength} caractères requis.`);
                return false;
            }

            // Vérifier la longueur maximale
            if (rules.maxLength && value.length > rules.maxLength) {
                showFieldError(input, `Maximum ${rules.maxLength} caractères autorisés.`);
                return false;
            }

            // Vérifier le pattern
            if (rules.pattern && !rules.pattern.test(value)) {
                showFieldError(input, rules.message);
                return false;
            }

            showFieldSuccess(input);
            return true;
        }

        function showFieldError(input, message) {
            clearValidation(input);
            input.classList.add('invalid');

            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;

            input.parentNode.appendChild(errorDiv);

            // Animation d'erreur
            input.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }

        function showFieldSuccess(input) {
            clearValidation(input);
            input.classList.add('valid');
        }

        function clearValidation(input) {
            input.classList.remove('valid', 'invalid');

            const existingError = input.parentNode.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }
        }

        function updateCharacterCount(textarea) {
            let counter = textarea.parentNode.querySelector('.character-counter');

            if (!counter) {
                counter = document.createElement('div');
                counter.className = 'character-counter';
                textarea.parentNode.appendChild(counter);
            }

            const currentLength = textarea.value.length;
            const minLength = 20;
            const maxLength = 2000;

            counter.textContent = `${currentLength}/${maxLength} caractères`;

            if (currentLength < minLength) {
                counter.className = 'character-counter error';
                counter.textContent = `${currentLength}/${maxLength} caractères (${minLength - currentLength} de plus requis)`;
            } else if (currentLength > maxLength * 0.9) {
                counter.className = 'character-counter warning';
            } else {
                counter.className = 'character-counter success';
            }
        }

        // Animation shake pour les erreurs
        const shakeStyle = document.createElement('style');
        shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(shakeStyle);

        // Initialiser la validation en temps réel
        setupRealTimeValidation();

        // Initialiser le compteur de caractères
        if (messageInput) {
            updateCharacterCount(messageInput);
        }

        // Soumission du formulaire
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validation complète avant soumission
            const fields = [emailInput, subjectInput, messageInput, categorySelect];
            if (serverInput && serverInput.value) {
                fields.push(serverInput);
            }

            const isValid = fields.every(field => validateField(field));

            if (isValid) {
                await submitForm(this);
            } else {
                showNotification('Veuillez corriger les erreurs avant de soumettre le formulaire.', 'error');

                // Focus sur le premier champ invalide
                const firstInvalidField = contactForm.querySelector('.invalid');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                    firstInvalidField.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        });

        // Auto-sauvegarde du brouillon
        function setupAutoSave() {
            const fields = [emailInput, subjectInput, messageInput, categorySelect, serverInput];

            fields.forEach(field => {
                if (!field) return;

                field.addEventListener('input', debounce(() => {
                    const draftData = {
                        email: emailInput.value,
                        subject: subjectInput.value,
                        message: messageInput.value,
                        category: categorySelect.value,
                        server_id: serverInput ? serverInput.value : '',
                        timestamp: Date.now()
                    };

                    localStorage.setItem('contactFormDraft', JSON.stringify(draftData));
                }, 1000));
            });

            // Restaurer le brouillon au chargement
            const savedDraft = localStorage.getItem('contactFormDraft');
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                const age = Date.now() - draftData.timestamp;

                // Si le brouillon a moins de 24h
                if (age < 24 * 60 * 60 * 1000) {
                    const shouldRestore = confirm('Un brouillon de votre message a été sauvegardé. Voulez-vous le restaurer ?');
                    if (shouldRestore) {
                        emailInput.value = draftData.email || '';
                        subjectInput.value = draftData.subject || '';
                        messageInput.value = draftData.message || '';
                        categorySelect.value = draftData.category || '';
                        if (serverInput) serverInput.value = draftData.server_id || '';

                        updateCharacterCount(messageInput);
                        showNotification('Brouillon restauré avec succès.', 'info');
                    }
                }
            }
        }

        setupAutoSave();
    }

    // Navbar scroll effect
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

    // Fonction de recherche dans la FAQ
    function setupFAQSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Rechercher dans la FAQ...';
        searchInput.className = 'faq-search';

        const faqSection = document.querySelector('.faq-section .container');
        const faqTitle = faqSection.querySelector('h2');
        faqSection.insertBefore(searchInput, faqTitle.nextElementSibling);

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performFAQSearch(e.target.value.toLowerCase());
            }, 300);
        });

        function performFAQSearch(searchTerm) {
            const faqItems = document.querySelectorAll('.faq-item');
            let visibleCount = 0;

            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question h4').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

                const isVisible = !searchTerm || question.includes(searchTerm) || answer.includes(searchTerm);
                item.style.display = isVisible ? 'block' : 'none';

                if (isVisible) {
                    visibleCount++;
                    // Surligner les termes trouvés
                    if (searchTerm) {
                        highlightSearchTerm(item, searchTerm);
                    } else {
                        removeHighlight(item);
                    }
                }
            });

            // Masquer les catégories vides
            const categories = document.querySelectorAll('.faq-category');
            categories.forEach(category => {
                const visibleItems = category.querySelectorAll('.faq-item[style*="block"], .faq-item:not([style*="none"])');
                category.style.display = visibleItems.length > 0 ? 'block' : 'none';
            });

            // Afficher les résultats
            showFAQSearchResults(visibleCount, searchTerm);

            // Analytics
            if (searchTerm) {
                trackFAQSearch(searchTerm, visibleCount);
            }
        }

        function highlightSearchTerm(element, term) {
            removeHighlight(element);

            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const textNodes = [];
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
                    const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
                    const span = document.createElement('span');
                    span.innerHTML = highlightedText;
                    textNode.parentNode.replaceChild(span, textNode);
                }
            });
        }

        function removeHighlight(element) {
            const highlights = element.querySelectorAll('.search-highlight');
            highlights.forEach(highlight => {
                highlight.outerHTML = highlight.textContent;
            });
        }

        function showFAQSearchResults(count, term) {
            let resultDiv = document.querySelector('.faq-search-results');

            if (!resultDiv) {
                resultDiv = document.createElement('div');
                resultDiv.className = 'faq-search-results';
                resultDiv.style.cssText = `
                    text-align: center;
                    padding: 15px;
                    margin: 15px 0;
                    border-radius: 10px;
                    font-weight: 500;
                `;

                const searchInput = document.querySelector('.faq-search');
                searchInput.parentNode.insertBefore(resultDiv, searchInput.nextSibling);
            }

            if (term && count === 0) {
                resultDiv.style.background = '#fef2f2';
                resultDiv.style.color = '#dc2626';
                resultDiv.style.border = '1px solid #fecaca';
                resultDiv.innerHTML = `
                    <i class="fas fa-search"></i>
                    Aucune réponse trouvée pour "${term}". Essayez des termes différents ou contactez le support.
                `;
                resultDiv.style.display = 'block';
            } else if (term && count > 0) {
                resultDiv.style.background = '#f0fdf4';
                resultDiv.style.color = '#16a34a';
                resultDiv.style.border = '1px solid #bbf7d0';
                resultDiv.innerHTML = `
                    <i class="fas fa-check"></i>
                    ${count} réponse${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''} pour "${term}"
                `;
                resultDiv.style.display = 'block';
            } else {
                resultDiv.style.display = 'none';
            }
        }
    }

    // Initialiser la recherche FAQ
    setupFAQSearch();

    // Gestion des filtres de ressources
    function setupResourceFilter() {
        const filterButtons = document.createElement('div');
        filterButtons.className = 'resource-filters';

        const filters = ['Tous', 'Tutoriels', 'Documentation', 'Communauté', 'Actualités'];

        filters.forEach(filter => {
            const button = document.createElement('button');
            button.textContent = filter;
            button.className = `filter-btn ${filter === 'Tous' ? 'active' : ''}`;

            button.addEventListener('click', () => {
                // Retirer l'état actif des autres boutons
                filterButtons.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Activer le bouton cliqué
                button.classList.add('active');

                // Filtrer les ressources
                filterResources(filter);
            });

            filterButtons.appendChild(button);
        });

        const resourcesSection = document.querySelector('.resources-section .container');
        const resourcesTitle = resourcesSection.querySelector('h2');
        resourcesSection.insertBefore(filterButtons, resourcesTitle.nextElementSibling);
    }

    function filterResources(filter) {
        const resourceCards = document.querySelectorAll('.resource-card');

        resourceCards.forEach(card => {
            const title = card.querySelector('h3').textContent;
            let shouldShow = true;

            if (filter !== 'Tous') {
                shouldShow = title.toLowerCase().includes(filter.toLowerCase()) ||
                    (filter === 'Tutoriels' && title.includes('Vidéo')) ||
                    (filter === 'Documentation' && title.includes('API')) ||
                    (filter === 'Communauté' && title.includes('Communauté')) ||
                    (filter === 'Actualités' && title.includes('Blog'));
            }

            card.style.display = shouldShow ? 'block' : 'none';

            // Animation d'apparition
            if (shouldShow) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    }

    setupResourceFilter();

    // Mode sombre
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

    setupDarkMode();

    // Raccourcis clavier
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K pour la recherche FAQ
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('.faq-search');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }

            // Ctrl/Cmd + M pour focus sur le message
            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                const messageInput = document.getElementById('message');
                if (messageInput) {
                    messageInput.focus();
                    messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            // Échap pour fermer les éléments ouverts
            if (e.key === 'Escape') {
                // Fermer le menu mobile
                const navMenu = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }

                // Fermer toutes les FAQ ouvertes
                document.querySelectorAll('.faq-item.active').forEach(item => {
                    item.classList.remove('active');
                });
            }
        });
    }

    setupKeyboardShortcuts();
});

// Soumission du formulaire avec gestion d'erreurs avancée
async function submitForm(form) {
    const submitButton = form.querySelector('.btn-submit');
    const originalText = submitButton.innerHTML;

    // Désactiver le bouton et montrer le chargement
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

    try {
        const formData = new FormData(form);

        // Ajouter des métadonnées
        formData.append('timestamp', new Date().toISOString());
        formData.append('user_agent', navigator.userAgent);
        formData.append('page_url', window.location.href);

        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // Succès
            showNotification('✅ Votre message a été envoyé avec succès ! Notre équipe vous répondra sous 24h.', 'success', 5000);

            // Réinitialiser le formulaire
            form.reset();

            // Supprimer le brouillon sauvegardé
            localStorage.removeItem('contactFormDraft');

            // Réinitialiser les validations
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('valid', 'invalid');
                const error = input.parentNode.querySelector('.field-error');
                if (error) error.remove();
            });

            // Réinitialiser le compteur de caractères
            const messageInput = form.querySelector('#message');
            if (messageInput) {
                const counter = messageInput.parentNode.querySelector('.character-counter');
                if (counter) {
                    counter.textContent = '0/2000 caractères';
                    counter.className = 'character-counter';
                }
            }

            // Analytics
            trackFormSubmission('success');

            // Rediriger vers une page de remerciement (optionnel)
            // window.location.href = '/merci';

        } else {
            // Erreur serveur
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Erreur ${response.status}: ${response.statusText}`;

            showNotification(`❌ Erreur lors de l'envoi: ${errorMessage}`, 'error', 7000);
            trackFormSubmission('error', errorMessage);
        }

    } catch (error) {
        // Erreur réseau
        console.error('Erreur:', error);

        let errorMessage = 'Erreur de connexion. ';
        if (!navigator.onLine) {
            errorMessage += 'Vérifiez votre connexion Internet.';
        } else {
            errorMessage += 'Veuillez réessayer dans quelques instants.';
        }

        showNotification(`❌ ${errorMessage}`, 'error', 7000);
        trackFormSubmission('network_error', error.message);

    } finally {
        // Réactiver le bouton
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.innerHTML = originalText;
    }
}

// Fonction pour afficher des notifications améliorées
function showNotification(message, type = 'success', duration = 4000) {
    // Supprimer les notifications existantes
    document.querySelectorAll('.notification').forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Icônes selon le type
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
            <i class="fas ${icons[type] || icons.info}" style="margin-top: 2px; flex-shrink: 0;"></i>
            <div style="flex: 1;">
                ${message}
                <div style="margin-top: 8px;">
                    <button onclick="this.closest('.notification').remove()" 
                            style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: inherit; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Fermer
                    </button>
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; padding: 0; margin-left: 8px;">
                &times;
            </button>
        </div>
    `;

    // Couleurs selon le type
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
        max-width: 450px;
        padding: 20px;
        background: ${colors[type]};
        color: white;
        border-radius: 12px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        line-height: 1.4;
    `;

    document.body.appendChild(notification);

    // Auto-suppression
    const autoClose = setTimeout(() => {
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
    notification.addEventListener('click', (e) => {
        if (e.target === notification || e.target.closest('.notification') === notification) {
            clearTimeout(autoClose);
            notification.remove();
        }
    });

    // Pause au survol
    notification.addEventListener('mouseenter', () => {
        clearTimeout(autoClose);
    });

    notification.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
        }, 2000);
    });
}

// Fonction utilitaire debounce
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

// Fonctions d'analytics
function trackFAQInteraction(question) {
    console.log('FAQ ouverte:', question);
    // Ici vous pourriez envoyer à Google Analytics, etc.
}

function trackFAQSearch(term, results) {
    console.log(`Recherche FAQ: "${term}" - ${results} résultats`);
}

function trackFormSubmission(status, error = null) {
    console.log('Soumission formulaire:', status, error);
}

// Auto-remplissage pour le développement
function autoFillForm() {
    const form = document.querySelector('.contact-form');
    if (form && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        const testData = {
            email: 'test@example.com',
            server_id: '123456789012345678',
            category: 'setup',
            subject: 'Test de configuration YAKO',
            message: 'Ceci est un message de test pour vérifier le bon fonctionnement du formulaire de contact. Le bot YAKO ne répond pas à mes commandes de modération et j\'aimerais avoir de l\'aide pour configurer correctement les permissions.'
        };

        Object.keys(testData).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = testData[key];
                // Déclencher l'événement input pour la validation
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        showNotification('Formulaire auto-rempli (mode développement)', 'info');
    }
}

// Ajouter les styles d'animation
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .search-highlight {
        background: #fbbf24;
        color: #1e293b;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
    }
    
    .fade-in {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(notificationStyles);

// Initialisation finale et bouton de développement
document.addEventListener('DOMContentLoaded', function() {
    console.log('YAKO Support - Page entièrement chargée');

    // Bouton d'auto-remplissage en mode développement
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const autoFillButton = document.createElement('button');
        autoFillButton.textContent = 'Auto-remplir (dev)';
        autoFillButton.className = 'auto-fill-btn';

        autoFillButton.addEventListener('click', autoFillForm);
        document.body.appendChild(autoFillButton);
    }
});

// Gestion des erreurs globales
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejetée:', e.reason);
});