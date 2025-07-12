// JavaScript pour la page support - Version complète corrigée
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎧 YAKO Support - Initialisation...');

    // Variables globales
    let isDarkMode = false;
    let formDraft = {};

    // ========== GESTION DE LA FAQ ==========
    function initFAQ() {
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

        console.log('✅ FAQ initialisée');
    }

    // ========== RECHERCHE DANS LA FAQ ==========
    function initFAQSearch() {
        const searchInput = document.querySelector('.faq-search');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performFAQSearch(e.target.value.toLowerCase());
            }, 300);
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
                showNotification('💡 Recherchez dans la FAQ', 'info', 2000);
            }
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
                (node) => node.parentNode.tagName !== 'SCRIPT' && node.parentNode.tagName !== 'STYLE'
                    ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
            );

            const textNodes = [];
            let node;

            while (node = walker.nextNode()) {
                textNodes.push(node);
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

        console.log('✅ Recherche FAQ initialisée');
    }

    // ========== GESTION DU FORMULAIRE DE CONTACT ==========
    function initContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;

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
                    saveDraft();
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

        // Auto-sauvegarde du brouillon
        function saveDraft() {
            const draftData = {
                email: emailInput?.value || '',
                subject: subjectInput?.value || '',
                message: messageInput?.value || '',
                category: categorySelect?.value || '',
                server_id: serverInput?.value || '',
                timestamp: Date.now()
            };

            localStorage.setItem('contactFormDraft', JSON.stringify(draftData));
            formDraft = draftData;
        }

        function loadDraft() {
            const savedDraft = localStorage.getItem('contactFormDraft');
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                const age = Date.now() - draftData.timestamp;

                // Si le brouillon a moins de 24h
                if (age < 24 * 60 * 60 * 1000) {
                    const shouldRestore = confirm('Un brouillon de votre message a été sauvegardé. Voulez-vous le restaurer ?');
                    if (shouldRestore) {
                        if (emailInput) emailInput.value = draftData.email || '';
                        if (subjectInput) subjectInput.value = draftData.subject || '';
                        if (messageInput) {
                            messageInput.value = draftData.message || '';
                            updateCharacterCount(messageInput);
                        }
                        if (categorySelect) categorySelect.value = draftData.category || '';
                        if (serverInput) serverInput.value = draftData.server_id || '';

                        showNotification('Brouillon restauré avec succès.', 'info');
                    }
                } else {
                    // Supprimer les anciens brouillons
                    localStorage.removeItem('contactFormDraft');
                }
            }
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

        // Initialiser la validation et le brouillon
        setupRealTimeValidation();
        loadDraft();

        // Initialiser le compteur de caractères
        if (messageInput) {
            updateCharacterCount(messageInput);
        }

        console.log('✅ Formulaire de contact initialisé');
    }

    // ========== SOUMISSION DU FORMULAIRE ==========
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
            formData.append('dark_mode', isDarkMode ? 'true' : 'false');

            // Log pour déboguer
            console.log('📤 Envoi du formulaire vers:', form.action);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('📥 Réponse du serveur:', response.status, response.statusText);

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

            } else {
                // Erreur serveur
                let errorMessage = `Erreur ${response.status}: ${response.statusText}`;

                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    console.warn('Impossible de parser la réponse d\'erreur JSON');
                }

                console.error('❌ Erreur serveur:', errorMessage);
                showNotification(`❌ Erreur lors de l'envoi: ${errorMessage}`, 'error', 7000);
                trackFormSubmission('error', errorMessage);
            }

        } catch (error) {
            // Erreur réseau
            console.error('❌ Erreur réseau:', error);

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

    // ========== GESTION DES FILTRES DE RESSOURCES ==========
    function initResourceFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const resourceCards = document.querySelectorAll('.resource-card');

        if (filterButtons.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.textContent.trim();

                // Retirer l'état actif des autres boutons
                filterButtons.forEach(btn => btn.classList.remove('active'));

                // Activer le bouton cliqué
                button.classList.add('active');

                // Filtrer les ressources
                filterResources(filter, resourceCards);

                // Analytics
                trackResourceFilter(filter);
            });
        });

        function filterResources(filter, cards) {
            cards.forEach((card, index) => {
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
                    }, index * 100);
                }
            });
        }

        console.log('✅ Filtres de ressources initialisés');
    }

    // ========== ANIMATIONS AU SCROLL ==========
    function initScrollAnimations() {
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

        console.log('✅ Animations au scroll initialisées');
    }

    // ========== SMOOTH SCROLLING ==========
    function initSmoothScrolling() {
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

        console.log('✅ Smooth scrolling initialisé');
    }

    // ========== MODE SOMBRE ==========
    function initDarkMode() {
        // Utiliser le mode sombre du script principal si disponible
        if (window.yakoUtils && window.yakoUtils.toggleDarkMode) {
            isDarkMode = document.body.classList.contains('dark-mode');
            console.log('✅ Mode sombre synchronisé avec le script principal');
            return;
        }

        // Fallback si le script principal n'est pas disponible
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
            background: #059669;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        `;

        document.body.appendChild(darkModeToggle);

        darkModeToggle.addEventListener('click', () => {
            toggleDarkMode();
        });

        function toggleDarkMode() {
            isDarkMode = !isDarkMode;
            document.body.classList.toggle('dark-mode', isDarkMode);

            darkModeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            darkModeToggle.style.background = isDarkMode ? '#fbbf24' : '#059669';

            localStorage.setItem('darkMode', isDarkMode);

            showNotification(
                `${isDarkMode ? '🌙 Mode sombre' : '☀️ Mode clair'} activé`,
                'info',
                2000
            );
        }

        // Restaurer la préférence sauvegardée
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            isDarkMode = true;
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            darkModeToggle.style.background = '#fbbf24';
        }

        console.log('✅ Mode sombre initialisé');
    }

    // ========== RACCOURCIS CLAVIER ==========
    function initKeyboardShortcuts() {
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
                // Fermer toutes les FAQ ouvertes
                document.querySelectorAll('.faq-item.active').forEach(item => {
                    item.classList.remove('active');
                });

                // Effacer la recherche
                const search = document.querySelector('.faq-search');
                if (search && search.value) {
                    search.value = '';
                    // Trigger search clear
                    search.dispatchEvent(new Event('input'));
                }
            }

            // H pour l'aide
            if (e.key === 'h' || e.key === 'H') {
                if (!e.target.matches('input, textarea')) {
                    showKeyboardHelp();
                }
            }
        });

        console.log('✅ Raccourcis clavier initialisés');
    }

    function showKeyboardHelp() {
        const helpHTML = `
            <div style="max-width: 500px; text-align: left;">
                <h3 style="margin-bottom: 20px; color: #059669;">⌨️ Raccourcis clavier</h3>
                <div style="display: grid; gap: 10px; font-size: 0.9rem;">
                    <div><kbd>Ctrl+K</kbd> - Rechercher dans la FAQ</div>
                    <div><kbd>Ctrl+M</kbd> - Focus sur le formulaire de message</div>
                    <div><kbd>Échap</kbd> - Fermer la FAQ ouverte / Effacer la recherche</div>
                    <div><kbd>H</kbd> - Afficher cette aide</div>
                    <div><kbd>Entrée/Espace</kbd> - Ouvrir/fermer une question FAQ</div>
                </div>
                <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; font-size: 0.8rem; color: #065f46;">
                    💡 <strong>Astuce :</strong> Votre brouillon est sauvegardé automatiquement pendant que vous tapez !
                </div>
            </div>
        `;

        showNotification(helpHTML, 'info', 8000);
    }

    // ========== AUTO-REMPLISSAGE (DÉVELOPPEMENT) ==========
    function initAutoFill() {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return;
        }

        const autoFillButton = document.createElement('button');
        autoFillButton.textContent = 'Auto-remplir (dev)';
        autoFillButton.className = 'auto-fill-btn';

        autoFillButton.addEventListener('click', () => {
            const form = document.querySelector('.contact-form');
            if (!form) return;

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
        });

        document.body.appendChild(autoFillButton);

        console.log('✅ Auto-remplissage (dev) initialisé');
    }

    // ========== FONCTIONS UTILITAIRES ==========
    function showNotification(message, type = 'success', duration = 4000) {
        // Utiliser la fonction du script principal si disponible
        if (window.yakoUtils && window.yakoUtils.showNotification) {
            return window.yakoUtils.showNotification(message, type, duration);
        }

        // Fallback si la fonction principale n'est pas disponible
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

    // ========== FONCTIONS D'ANALYTICS ==========
    function trackFAQInteraction(question) {
        console.log('📊 Analytics: FAQ ouverte -', question);
    }

    function trackFAQSearch(term, results) {
        console.log(`📊 Analytics: Recherche FAQ "${term}" - ${results} résultats`);
    }

    function trackFormSubmission(status, error = null) {
        console.log('📊 Analytics: Soumission formulaire -', status, error);
    }

    function trackResourceFilter(filter) {
        console.log('📊 Analytics: Filtre ressources -', filter);
    }

    // ========== GESTION DE LA CONNECTIVITÉ ==========
    function initConnectivityDetection() {
        function updateOnlineStatus() {
            const isOnline = navigator.onLine;
            if (!isOnline) {
                showNotification('Connexion Internet perdue. Le formulaire sera sauvegardé localement.', 'warning', 5000);
            } else if (document.querySelector('.notification')) {
                showNotification('Connexion Internet rétablie.', 'success', 2000);
            }
        }

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        console.log('✅ Détection de connectivité initialisée');
    }

    // ========== INITIALISATION COMPLÈTE ==========
    try {
        initFAQ();
        initFAQSearch();
        initContactForm();
        initResourceFilter();
        initScrollAnimations();
        initSmoothScrolling();
        initDarkMode();
        initKeyboardShortcuts();
        initAutoFill();
        initConnectivityDetection();

        console.log('✅ YAKO Support - Toutes les fonctionnalités initialisées');

        // Notification de bienvenue (première visite)
        if (!localStorage.getItem('supportVisited')) {
            setTimeout(() => {
                showNotification('Bienvenue sur la page de support ! Tapez H pour voir les raccourcis clavier.', 'info', 5000);
                localStorage.setItem('supportVisited', 'true');
            }, 1000);
        }

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showNotification('Une erreur est survenue lors du chargement de la page.', 'error');
    }

    // ========== GESTION DES ERREURS GLOBALES ==========
    window.addEventListener('error', function(e) {
        console.error('Erreur JavaScript sur support:', e.error);
        if (window.location.hostname === 'localhost') {
            showNotification('Erreur JavaScript détectée. Consultez la console.', 'error');
        }
    });

    window.addEventListener('unhandledrejection', function(e) {
        console.error('Promise rejetée sur support:', e.reason);
        if (window.location.hostname === 'localhost') {
            showNotification('Erreur de promesse détectée. Consultez la console.', 'error');
        }
    });

    // Exposer les fonctions utiles
    window.yakoSupport = {
        showNotification: showNotification,
        saveDraft: () => {
            const form = document.querySelector('.contact-form');
            if (form) {
                // Déclencher la sauvegarde
                const messageInput = form.querySelector('#message');
                if (messageInput) {
                    messageInput.dispatchEvent(new Event('input'));
                }
            }
        },
        clearDraft: () => {
            localStorage.removeItem('contactFormDraft');
            showNotification('Brouillon supprimé', 'info', 2000);
        },
        getCurrentDraft: () => formDraft
    };
});

// ========== STYLES DYNAMIQUES ==========
const supportStyles = document.createElement('style');
supportStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .search-highlight {
        background: #fbbf24;
        color: #1e293b;
        padding: 2px 4px;
        border-radius: 3px;
        font-weight: 600;
        animation: highlight 0.3s ease;
    }
    
    @keyframes highlight {
        0% { background: #fbbf24; }
        50% { background: #f59e0b; }
        100% { background: #fbbf24; }
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

    /* Amélioration des tooltips */
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

    /* Amélioration pour les appareils tactiles */
    @media (hover: none) {
        .support-card:hover,
        .resource-card:hover,
        .contact-method:hover {
            transform: none;
        }
        
        .support-card:active,
        .resource-card:active {
            transform: scale(0.98);
        }
    }

    /* Focus amélioré */
    .faq-question:focus-visible {
        outline: 2px solid #059669;
        outline-offset: -2px;
    }

    body.dark-mode .faq-question:focus-visible {
        outline-color: #10b981;
    }
`;

document.head.appendChild(supportStyles);

console.log('🎨 Styles dynamiques de support ajoutés');