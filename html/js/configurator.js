// JavaScript pour la page configurateur YAKO - Version complète
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 YAKO Configurateur - Initialisation...');

    // Variables globales
    let isConnectedToDiscord = false;
    let selectedModules = new Set();
    let currentStep = 1;
    let userServers = [];
    let selectedServer = null;

    // ========== SIMULATION DE CONNEXION DISCORD ==========
    function initDiscordConnection() {
        const connectButton = document.getElementById('connectDiscord');
        const statusBadge = document.querySelector('.status-badge');
        const connectionCard = document.querySelector('.connection-card');

        if (connectButton) {
            connectButton.addEventListener('click', async () => {
                if (isConnectedToDiscord) {
                    disconnectFromDiscord();
                } else {
                    await connectToDiscord();
                }
            });
        }

        async function connectToDiscord() {
            console.log('🔌 Tentative de connexion à Discord...');

            // Désactiver le bouton et afficher le chargement
            connectButton.disabled = true;
            connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion en cours...';

            try {
                // Simulation de l'authentification Discord
                await simulateDiscordAuth();

                // Succès de la connexion
                isConnectedToDiscord = true;
                updateConnectionStatus(true);
                updateStepStatus(1, 'completed');
                advanceToStep(2);

                showNotification('✅ Connexion à Discord réussie !', 'success');

                // Charger les serveurs de l'utilisateur
                await loadUserServers();

            } catch (error) {
                console.error('❌ Erreur de connexion Discord:', error);
                showNotification('❌ Erreur lors de la connexion à Discord', 'error');

                // Réactiver le bouton
                connectButton.disabled = false;
                connectButton.innerHTML = '<i class="fab fa-discord"></i> Se connecter avec Discord';
            }
        }

        function disconnectFromDiscord() {
            isConnectedToDiscord = false;
            selectedServer = null;
            userServers = [];
            selectedModules.clear();

            updateConnectionStatus(false);
            resetAllSteps();

            showNotification('Déconnexion de Discord', 'info');
        }

        function updateConnectionStatus(connected) {
            if (connected) {
                statusBadge.textContent = 'Connecté';
                statusBadge.className = 'status-badge connected';
                connectButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Se déconnecter';
                connectButton.classList.add('btn-secondary');
                connectButton.classList.remove('btn-discord');

                connectionCard.style.background = 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
                connectionCard.style.borderColor = '#10b981';
            } else {
                statusBadge.textContent = 'Non connecté';
                statusBadge.className = 'status-badge disconnected';
                connectButton.innerHTML = '<i class="fab fa-discord"></i> Se connecter avec Discord';
                connectButton.classList.remove('btn-secondary');
                connectButton.classList.add('btn-discord');
                connectButton.disabled = false;

                connectionCard.style.background = '';
                connectionCard.style.borderColor = '';
            }
        }

        async function simulateDiscordAuth() {
            // Simulation de l'authentification OAuth Discord
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simuler un succès dans 90% des cas
                    if (Math.random() > 0.1) {
                        resolve({
                            id: '123456789012345678',
                            username: 'Utilisateur#1234',
                            avatar: 'avatar_hash',
                            access_token: 'mock_access_token'
                        });
                    } else {
                        reject(new Error('Connexion échouée'));
                    }
                }, 2000 + Math.random() * 1000); // 2-3 secondes
            });
        }

        console.log('✅ Connexion Discord initialisée');
    }

    // ========== CHARGEMENT DES SERVEURS ==========
    async function loadUserServers() {
        console.log('📡 Chargement des serveurs utilisateur...');

        // Simulation du chargement des serveurs
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Serveurs simulés
        userServers = [
            {
                id: '987654321098765432',
                name: 'Mon Serveur Gaming',
                icon: null,
                permissions: ['ADMINISTRATOR'],
                member_count: 150
            },
            {
                id: '111222333444555666',
                name: 'Communauté Dev',
                icon: 'server_icon_hash',
                permissions: ['MANAGE_GUILD', 'MANAGE_CHANNELS'],
                member_count: 89
            },
            {
                id: '777888999000111222',
                name: 'Serveur Privé',
                icon: null,
                permissions: ['ADMINISTRATOR'],
                member_count: 25
            }
        ];

        console.log(`📊 ${userServers.length} serveurs chargés`);
        showServerSelection();
    }

    function showServerSelection() {
        // Créer une section de sélection de serveur
        const serverSelectionHTML = `
            <section class="server-selection" style="padding: 40px 0; background: white; margin-top: 20px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);">
                <div class="container">
                    <h3 style="text-align: center; margin-bottom: 30px; color: #1e293b;">
                        <i class="fas fa-server"></i> Sélectionnez votre serveur
                    </h3>
                    <div class="servers-grid" style="display: grid; gap: 20px; max-width: 600px; margin: 0 auto;">
                        ${userServers.map(server => `
                            <div class="server-option" data-server-id="${server.id}" style="
                                display: flex; align-items: center; gap: 15px; padding: 20px; 
                                border: 2px solid #e2e8f0; border-radius: 15px; cursor: pointer; 
                                transition: all 0.3s ease; background: white;
                            ">
                                <div class="server-icon" style="
                                    width: 50px; height: 50px; background: #667eea; border-radius: 50%; 
                                    display: flex; align-items: center; justify-content: center; 
                                    color: white; font-weight: bold; font-size: 1.2rem;
                                ">
                                    ${server.icon ? '🖼️' : server.name.charAt(0)}
                                </div>
                                <div class="server-info" style="flex: 1;">
                                    <h4 style="margin: 0 0 5px 0; color: #1e293b;">${server.name}</h4>
                                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">
                                        ${server.member_count} membres • ${server.permissions.includes('ADMINISTRATOR') ? 'Administrateur' : 'Modérateur'}
                                    </p>
                                </div>
                                <i class="fas fa-chevron-right" style="color: #94a3b8;"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;

        // Insérer après la section discord-connection
        const discordSection = document.querySelector('.discord-connection');
        discordSection.insertAdjacentHTML('afterend', serverSelectionHTML);

        // Ajouter les événements
        document.querySelectorAll('.server-option').forEach(option => {
            option.addEventListener('click', () => selectServer(option));

            // Effets hover
            option.addEventListener('mouseenter', () => {
                option.style.borderColor = '#667eea';
                option.style.transform = 'translateY(-2px)';
                option.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.1)';
            });

            option.addEventListener('mouseleave', () => {
                if (!option.classList.contains('selected')) {
                    option.style.borderColor = '#e2e8f0';
                    option.style.transform = 'translateY(0)';
                    option.style.boxShadow = 'none';
                }
            });
        });
    }

    function selectServer(serverElement) {
        const serverId = serverElement.dataset.serverId;
        selectedServer = userServers.find(s => s.id === serverId);

        // Mettre à jour l'apparence
        document.querySelectorAll('.server-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.style.borderColor = '#e2e8f0';
            opt.style.background = 'white';
            opt.style.transform = 'translateY(0)';
            opt.style.boxShadow = 'none';
        });

        serverElement.classList.add('selected');
        serverElement.style.borderColor = '#667eea';
        serverElement.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
        serverElement.style.transform = 'translateY(-2px)';
        serverElement.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.2)';

        updateStepStatus(2, 'completed');
        advanceToStep(3);

        showNotification(`✅ Serveur "${selectedServer.name}" sélectionné`, 'success');
        console.log('🎯 Serveur sélectionné:', selectedServer);

        // Activer la sélection des modules
        setTimeout(() => {
            enableModuleSelection();
        }, 1000);
    }

    // ========== GESTION DES MODULES ==========
    function enableModuleSelection() {
        const moduleCategories = document.querySelectorAll('.module-category');

        moduleCategories.forEach(category => {
            const toggle = category.querySelector('.toggle-preview');
            const toggleSlider = category.querySelector('.toggle-slider');
            const toggleInput = category.querySelector('input[type="checkbox"]');

            // Activer les toggles
            toggle.classList.remove('disabled');
            toggleInput.disabled = false;
            toggleSlider.style.cursor = 'pointer';

            // Ajouter les événements
            toggle.addEventListener('click', () => {
                toggleInput.checked = !toggleInput.checked;
                updateModuleToggle(category, toggleInput.checked);
            });

            toggleInput.addEventListener('change', () => {
                updateModuleToggle(category, toggleInput.checked);
            });

            // Effet visuel
            category.style.cursor = 'pointer';
            category.addEventListener('click', (e) => {
                if (!e.target.closest('.toggle-preview')) {
                    toggle.click();
                }
            });
        });

        showNotification('🧩 Sélection des modules activée ! Cliquez sur les catégories pour les activer.', 'info', 4000);
    }

    function updateModuleToggle(category, isActive) {
        const toggle = category.querySelector('.toggle-preview');
        const toggleSlider = category.querySelector('.toggle-slider');
        const categoryHeader = category.querySelector('.category-header');
        const categoryName = categoryHeader.querySelector('h3').textContent.trim();

        if (isActive) {
            selectedModules.add(categoryName);
            toggleSlider.style.background = '#10b981';
            toggleSlider.style.transform = 'translateX(26px)';
            category.style.borderColor = '#10b981';
            category.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.2)';

            // Animation des items
            const moduleItems = category.querySelectorAll('.module-item');
            moduleItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.background = '#f0fdf4';
                    item.style.borderLeftColor = '#10b981';
                    item.style.borderLeft = '3px solid #10b981';
                }, index * 100);
            });

        } else {
            selectedModules.delete(categoryName);
            toggleSlider.style.background = 'rgba(255, 255, 255, 0.3)';
            toggleSlider.style.transform = 'translateX(0)';
            category.style.borderColor = '#e2e8f0';
            category.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';

            // Réinitialiser les items
            const moduleItems = category.querySelectorAll('.module-item');
            moduleItems.forEach(item => {
                item.style.background = '';
                item.style.borderLeft = '';
            });
        }

        console.log('📦 Modules sélectionnés:', Array.from(selectedModules));

        // Vérifier si au moins un module est sélectionné
        if (selectedModules.size > 0) {
            updateStepStatus(3, 'completed');
            showInstallationOption();
        } else {
            updateStepStatus(3, 'current');
            hideInstallationOption();
        }

        updateProgressBar();
    }

    // ========== GESTION DES ÉTAPES ==========
    function updateStepStatus(stepNumber, status) {
        const stepCards = document.querySelectorAll('.step-card');
        const progressSteps = document.querySelectorAll('.progress-step');

        if (stepCards[stepNumber - 1]) {
            const stepCard = stepCards[stepNumber - 1];
            const statusElement = stepCard.querySelector('.step-status');
            const statusIcon = statusElement.querySelector('i');
            const statusText = statusElement.querySelector('span');

            // Réinitialiser les classes
            statusIcon.className = 'fas fa-circle';

            switch (status) {
                case 'pending':
                    statusIcon.classList.add('pending');
                    statusText.textContent = 'En attente';
                    break;
                case 'current':
                    statusIcon.classList.add('current');
                    statusText.textContent = 'En cours';
                    stepCard.style.borderColor = '#667eea';
                    stepCard.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.2)';
                    break;
                case 'completed':
                    statusIcon.className = 'fas fa-check-circle completed';
                    statusText.textContent = 'Terminé';
                    stepCard.style.borderColor = '#10b981';
                    stepCard.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.2)';
                    break;
            }
        }

        // Mettre à jour la barre de progression
        if (progressSteps[stepNumber - 1]) {
            const progressStep = progressSteps[stepNumber - 1];

            if (status === 'completed') {
                progressStep.classList.add('active');
                progressStep.querySelector('.step-circle').style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (status === 'current') {
                progressStep.classList.add('active');
            } else {
                progressStep.classList.remove('active');
            }
        }

        currentStep = stepNumber;
    }

    function advanceToStep(stepNumber) {
        updateStepStatus(stepNumber, 'current');
        updateProgressBar();

        // Scroll vers la section appropriée
        setTimeout(() => {
            let targetSection;
            switch (stepNumber) {
                case 2:
                    targetSection = document.querySelector('.server-selection');
                    break;
                case 3:
                    targetSection = document.querySelector('.features-selection');
                    break;
                case 4:
                    targetSection = document.querySelector('.installation-section');
                    break;
                default:
                    targetSection = document.querySelector('.discord-connection');
            }

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    }

    function resetAllSteps() {
        for (let i = 1; i <= 4; i++) {
            updateStepStatus(i, 'pending');
        }
        currentStep = 1;
        updateProgressBar();

        // Supprimer la sélection de serveur si elle existe
        const serverSelection = document.querySelector('.server-selection');
        if (serverSelection) {
            serverSelection.remove();
        }

        // Supprimer la section d'installation si elle existe
        const installationSection = document.querySelector('.installation-section');
        if (installationSection) {
            installationSection.remove();
        }

        // Désactiver les modules
        disableModuleSelection();
    }

    function disableModuleSelection() {
        const moduleCategories = document.querySelectorAll('.module-category');

        moduleCategories.forEach(category => {
            const toggle = category.querySelector('.toggle-preview');
            const toggleSlider = category.querySelector('.toggle-slider');
            const toggleInput = category.querySelector('input[type="checkbox"]');

            // Désactiver les toggles
            toggle.classList.add('disabled');
            toggleInput.disabled = true;
            toggleInput.checked = false;
            toggleSlider.style.cursor = 'not-allowed';
            toggleSlider.style.background = 'rgba(255, 255, 255, 0.3)';
            toggleSlider.style.transform = 'translateX(0)';

            // Réinitialiser l'apparence
            category.style.cursor = 'default';
            category.style.borderColor = '#e2e8f0';
            category.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';

            // Réinitialiser les items
            const moduleItems = category.querySelectorAll('.module-item');
            moduleItems.forEach(item => {
                item.style.background = '';
                item.style.borderLeft = '';
            });
        });

        selectedModules.clear();
    }

    function updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const progressInfo = document.querySelector('.progress-info');

        if (progressFill) {
            let percentage = 0;
            let statusText = '';

            switch (currentStep) {
                case 1:
                    percentage = 0;
                    statusText = 'En attente de la connexion Discord';
                    break;
                case 2:
                    percentage = 25;
                    statusText = 'Connecté ! Sélectionnez votre serveur';
                    break;
                case 3:
                    percentage = 50;
                    statusText = 'Serveur sélectionné ! Choisissez vos modules';
                    break;
                case 4:
                    percentage = selectedModules.size > 0 ? 100 : 75;
                    statusText = selectedModules.size > 0 ? 'Configuration terminée ! Prêt pour l\'installation' : 'Sélectionnez au moins un module';
                    break;
            }

            progressFill.style.width = percentage + '%';

            if (progressInfo) {
                const statusP = progressInfo.querySelector('p:first-child strong');
                if (statusP) {
                    statusP.nextSibling.textContent = ' ' + statusText;
                }
            }
        }
    }

    // ========== INSTALLATION FINALE ==========
    function showInstallationOption() {
        // Vérifier si la section existe déjà
        if (document.querySelector('.installation-section')) {
            return;
        }

        const installationHTML = `
            <section class="installation-section" style="padding: 60px 0; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; margin-top: 40px;">
                <div class="container">
                    <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                        <h2 style="font-size: 2.5rem; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 15px;">
                            <i class="fas fa-rocket"></i> Installation YAKO
                        </h2>
                        <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.95;">
                            Votre configuration est prête ! YAKO sera installé sur "<strong>${selectedServer?.name || 'votre serveur'}</strong>" avec ${selectedModules.size} module${selectedModules.size > 1 ? 's' : ''} activé${selectedModules.size > 1 ? 's' : ''}.
                        </p>
                        
                        <div class="selected-modules" style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; margin-bottom: 30px;">
                            <h3 style="margin-bottom: 15px;">📦 Modules sélectionnés :</h3>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
                                ${Array.from(selectedModules).map(module => `
                                    <span style="background: rgba(255, 255, 255, 0.2); padding: 8px 15px; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
                                        ${module}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="installation-actions" style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                            <button class="btn-install" id="startInstallation" style="
                                background: #ffd700; color: #1e293b; border: none; padding: 15px 30px; 
                                border-radius: 50px; font-weight: 600; font-size: 1.1rem; cursor: pointer; 
                                transition: all 0.3s ease; display: flex; align-items: center; gap: 10px;
                                box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
                            ">
                                <i class="fas fa-download"></i> Installer YAKO
                            </button>
                            <button class="btn-preview" id="previewConfig" style="
                                background: transparent; color: white; border: 2px solid white; 
                                padding: 15px 30px; border-radius: 50px; font-weight: 600; 
                                font-size: 1.1rem; cursor: pointer; transition: all 0.3s ease;
                                display: flex; align-items: center; gap: 10px;
                            ">
                                <i class="fas fa-eye"></i> Aperçu config
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Insérer avant la section beta-preview
        const betaSection = document.querySelector('.beta-preview');
        betaSection.insertAdjacentHTML('beforebegin', installationHTML);

        // Ajouter les événements
        document.getElementById('startInstallation')?.addEventListener('click', startInstallation);
        document.getElementById('previewConfig')?.addEventListener('click', showConfigPreview);

        // Effets hover
        const btnInstall = document.getElementById('startInstallation');
        const btnPreview = document.getElementById('previewConfig');

        if (btnInstall) {
            btnInstall.addEventListener('mouseenter', () => {
                btnInstall.style.background = '#ffed4a';
                btnInstall.style.transform = 'translateY(-2px)';
                btnInstall.style.boxShadow = '0 10px 20px rgba(255, 215, 0, 0.4)';
            });

            btnInstall.addEventListener('mouseleave', () => {
                btnInstall.style.background = '#ffd700';
                btnInstall.style.transform = 'translateY(0)';
                btnInstall.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.3)';
            });
        }

        if (btnPreview) {
            btnPreview.addEventListener('mouseenter', () => {
                btnPreview.style.background = 'rgba(255, 255, 255, 0.1)';
                btnPreview.style.transform = 'translateY(-2px)';
            });

            btnPreview.addEventListener('mouseleave', () => {
                btnPreview.style.background = 'transparent';
                btnPreview.style.transform = 'translateY(0)';
            });
        }

        advanceToStep(4);

        // Scroll vers la nouvelle section
        setTimeout(() => {
            document.querySelector('.installation-section').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 500);
    }

    function hideInstallationOption() {
        const installationSection = document.querySelector('.installation-section');
        if (installationSection) {
            installationSection.remove();
        }
    }

    async function startInstallation() {
        console.log('🚀 Début de l\'installation...');

        const btnInstall = document.getElementById('startInstallation');
        const originalText = btnInstall.innerHTML;

        // Désactiver le bouton et afficher le chargement
        btnInstall.disabled = true;
        btnInstall.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Installation en cours...';
        btnInstall.style.background = '#94a3b8';
        btnInstall.style.cursor = 'not-allowed';

        try {
            // Simulation de l'installation
            await simulateInstallation();

            // Succès
            showNotification('🎉 YAKO a été installé avec succès sur votre serveur !', 'success', 5000);
            btnInstall.innerHTML = '<i class="fas fa-check"></i> Installation terminée !';
            btnInstall.style.background = '#10b981';

            // Redirection vers le serveur Discord (simulation)
            setTimeout(() => {
                showPostInstallationInfo();
            }, 2000);

        } catch (error) {
            console.error('❌ Erreur d\'installation:', error);
            showNotification('❌ Erreur lors de l\'installation. Veuillez réessayer.', 'error');

            btnInstall.disabled = false;
            btnInstall.innerHTML = originalText;
            btnInstall.style.background = '#ffd700';
            btnInstall.style.cursor = 'pointer';
        }
    }

    async function simulateInstallation() {
        // Simulation des étapes d'installation
        const steps = [
            'Connexion au serveur Discord...',
            'Vérification des permissions...',
            'Installation des modules sélectionnés...',
            'Configuration des commandes...',
            'Finalisation de l\'installation...'
        ];

        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
            console.log(`📦 ${steps[i]}`);

            // Mise à jour du bouton avec l'étape actuelle
            const btnInstall = document.getElementById('startInstallation');
            if (btnInstall) {
                btnInstall.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${steps[i]}`;
            }
        }

        // Simulation d'une chance d'échec (5%)
        if (Math.random() < 0.05) {
            throw new Error('Erreur d\'installation simulée');
        }
    }

    function showConfigPreview() {
        const configData = {
            server: selectedServer,
            modules: Array.from(selectedModules),
            timestamp: new Date().toISOString(),
            estimated_commands: selectedModules.size * 8, // Estimation
            permissions_needed: [
                'MANAGE_MESSAGES',
                'MANAGE_ROLES',
                'KICK_MEMBERS',
                'BAN_MEMBERS',
                'VIEW_AUDIT_LOG'
            ]
        };

        const previewHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0, 0, 0, 0.8); z-index: 10000; 
                display: flex; align-items: center; justify-content: center;
                padding: 20px; backdrop-filter: blur(5px);
            " class="config-preview-modal">
                <div style="
                    background: white; border-radius: 20px; padding: 40px; 
                    max-width: 600px; width: 100%; max-height: 80vh; 
                    overflow-y: auto; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    position: relative;
                ">
                    <button style="
                        position: absolute; top: 15px; right: 15px; 
                        background: none; border: none; font-size: 1.5rem; 
                        cursor: pointer; color: #64748b;
                    " class="close-preview">&times;</button>
                    
                    <h3 style="margin-bottom: 20px; color: #1e293b; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-cog"></i> Aperçu de la Configuration
                    </h3>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #667eea;">🎯 Serveur cible</h4>
                        <p style="margin: 0; color: #64748b;"><strong>${selectedServer.name}</strong> (${selectedServer.member_count} membres)</p>
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #667eea;">📦 Modules sélectionnés</h4>
                        ${Array.from(selectedModules).map(module => `
                            <div style="margin-bottom: 5px; color: #64748b;">✓ ${module}</div>
                        `).join('')}
                    </div>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h4 style="margin-bottom: 10px; color: #667eea;">⚡ Estimation</h4>
                        <p style="margin: 5px 0; color: #64748b;">Commandes disponibles: ~${configData.estimated_commands}</p>
                        <p style="margin: 5px 0; color: #64748b;">Temps d'installation: 2-3 minutes</p>
                        <p style="margin: 5px 0; color: #64748b;">Permissions requises: ${configData.permissions_needed.length}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button style="
                            background: #667eea; color: white; border: none; 
                            padding: 12px 25px; border-radius: 25px; 
                            cursor: pointer; font-weight: 600;
                        " class="close-preview">
                            Fermer l'aperçu
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', previewHTML);

        // Ajouter les événements de fermeture
        document.querySelectorAll('.close-preview').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.config-preview-modal').remove();
            });
        });

        // Fermer en cliquant à l'extérieur
        document.querySelector('.config-preview-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('config-preview-modal')) {
                e.target.remove();
            }
        });

        console.log('👁️ Aperçu de configuration affiché:', configData);
    }

    function showPostInstallationInfo() {
        const postInstallHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0, 0, 0, 0.9); z-index: 10000; 
                display: flex; align-items: center; justify-content: center;
                padding: 20px;
            " class="post-install-modal">
                <div style="
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                    color: white; border-radius: 20px; padding: 40px; 
                    max-width: 500px; width: 100%; text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                ">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
                    <h2 style="margin-bottom: 20px;">Installation Réussie !</h2>
                    <p style="margin-bottom: 30px; opacity: 0.95; line-height: 1.6;">
                        YAKO a été installé avec succès sur <strong>${selectedServer.name}</strong> !<br>
                        Vous pouvez maintenant utiliser la commande <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">/help</code> pour commencer.
                    </p>
                    
                    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                        <button style="
                            background: #ffd700; color: #1e293b; border: none; 
                            padding: 12px 20px; border-radius: 25px; 
                            cursor: pointer; font-weight: 600; display: flex; 
                            align-items: center; gap: 8px;
                        " onclick="window.open('#', '_blank')">
                            <i class="fab fa-discord"></i> Aller sur Discord
                        </button>
                        <button style="
                            background: transparent; color: white; border: 2px solid white; 
                            padding: 12px 20px; border-radius: 25px; 
                            cursor: pointer; font-weight: 600;
                        " class="close-post-install">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', postInstallHTML);

        // Ajouter l'événement de fermeture
        document.querySelector('.close-post-install').addEventListener('click', () => {
            document.querySelector('.post-install-modal').remove();
        });
    }

    // ========== GESTION DES NOTIFICATIONS BÊTA ==========
    function initBetaNotifications() {
        const notifyBtn = document.getElementById('notifyMe');
        const learnMoreBtn = document.getElementById('learnMore');

        if (notifyBtn) {
            notifyBtn.addEventListener('click', () => {
                const email = prompt('Entrez votre email pour être notifié de la sortie du configurateur :');
                if (email && email.includes('@')) {
                    showNotification('✅ Vous serez notifié dès que le configurateur sera disponible !', 'success');
                    notifyBtn.innerHTML = '<i class="fas fa-check"></i> Notification activée';
                    notifyBtn.disabled = true;
                    notifyBtn.style.background = '#10b981';

                    console.log('📧 Email enregistré pour notification:', email);
                } else if (email) {
                    showNotification('❌ Veuillez entrer une adresse email valide', 'error');
                }
            });
        }

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                showLearnMoreModal();
            });
        }
    }

    function showLearnMoreModal() {
        const learnMoreHTML = `
            <div style="
                position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0, 0, 0, 0.8); z-index: 10000; 
                display: flex; align-items: center; justify-content: center;
                padding: 20px;
            " class="learn-more-modal">
                <div style="
                    background: white; border-radius: 20px; padding: 40px; 
                    max-width: 700px; width: 100%; max-height: 80vh; 
                    overflow-y: auto; position: relative;
                ">
                    <button style="
                        position: absolute; top: 15px; right: 15px; 
                        background: none; border: none; font-size: 1.5rem; 
                        cursor: pointer; color: #64748b;
                    " class="close-learn-more">&times;</button>
                    
                    <h3 style="margin-bottom: 20px; color: #667eea; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i> À propos du Configurateur YAKO
                    </h3>
                    
                    <div style="line-height: 1.6; color: #4b5563;">
                        <h4 style="margin: 20px 0 10px 0; color: #1e293b;">🚀 Fonctionnalités prévues</h4>
                        <ul style="margin-left: 20px; margin-bottom: 20px;">
                            <li>Configuration en temps réel avec prévisualisation</li>
                            <li>Sélection granulaire des commandes par module</li>
                            <li>Personnalisation des permissions et rôles</li>
                            <li>Import/export de configurations</li>
                            <li>Templates prédéfinis par type de serveur</li>
                            <li>Interface de gestion avancée</li>
                        </ul>
                        
                        <h4 style="margin: 20px 0 10px 0; color: #1e293b;">📅 Calendrier de développement</h4>
                        <ul style="margin-left: 20px; margin-bottom: 20px;">
                            <li><strong>Phase 1 (Q2 2025) :</strong> Connexion Discord et sélection de serveur</li>
                            <li><strong>Phase 2 (Q3 2025) :</strong> Configuration des modules et permissions</li>
                            <li><strong>Phase 3 (Q4 2025) :</strong> Interface de gestion complète</li>
                            <li><strong>Phase 4 (Q1 2026) :</strong> Fonctionnalités avancées et templates</li>
                        </ul>
                        
                        <h4 style="margin: 20px 0 10px 0; color: #1e293b;">🛠️ Technologies utilisées</h4>
                        <p style="margin-bottom: 20px;">
                            Le configurateur utilisera les dernières technologies web pour offrir une expérience 
                            fluide et moderne : Discord OAuth2, API Discord, React.js, et WebSockets pour les 
                            mises à jour en temps réel.
                        </p>
                        
                        <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h4 style="margin-bottom: 10px; color: #0369a1;">💡 Participez au développement</h4>
                            <p style="margin: 0;">
                                Rejoignez notre serveur Discord pour participer aux discussions sur le développement 
                                du configurateur et suggérer des fonctionnalités !
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <button style="
                            background: #667eea; color: white; border: none; 
                            padding: 12px 25px; border-radius: 25px; 
                            cursor: pointer; font-weight: 600; margin-right: 10px;
                        " onclick="window.open('#', '_blank')">
                            <i class="fab fa-discord"></i> Rejoindre Discord
                        </button>
                        <button style="
                            background: #64748b; color: white; border: none; 
                            padding: 12px 25px; border-radius: 25px; 
                            cursor: pointer; font-weight: 600;
                        " class="close-learn-more">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', learnMoreHTML);

        // Ajouter les événements de fermeture
        document.querySelectorAll('.close-learn-more').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.learn-more-modal').remove();
            });
        });

        // Fermer en cliquant à l'extérieur
        document.querySelector('.learn-more-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('learn-more-modal')) {
                e.target.remove();
            }
        });
    }

    // ========== UTILITAIRES ==========
    function showNotification(message, type = 'success', duration = 4000) {
        // Utiliser la fonction du script principal si disponible
        if (window.yakoUtils && window.yakoUtils.showNotification) {
            return window.yakoUtils.showNotification(message, type, duration);
        }

        // Fallback
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
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        `;

        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" 
                    style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2rem; margin-left: auto;">
                ×
            </button>
        `;

        document.body.appendChild(notification);

        // Auto-suppression
        if (duration > 0) {
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, duration);
        }

        // Supprimer au clic
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }

    // ========== INITIALISATION ==========
    initDiscordConnection();
    initBetaNotifications();

    // Simulation auto pour les tests (seulement en développement)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Ajouter un bouton de test rapide
        const testButton = document.createElement('button');
        testButton.textContent = 'Test rapide (dev)';
        testButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #f59e0b;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            z-index: 1000;
            font-weight: 600;
        `;

        testButton.addEventListener('click', async () => {
            if (!isConnectedToDiscord) {
                document.getElementById('connectDiscord').click();

                // Attendre la connexion puis sélectionner automatiquement
                setTimeout(() => {
                    const firstServer = document.querySelector('.server-option');
                    if (firstServer) {
                        firstServer.click();

                        // Activer quelques modules automatiquement
                        setTimeout(() => {
                            const moduleToggles = document.querySelectorAll('.toggle-preview');
                            moduleToggles[0]?.click(); // Modération
                            moduleToggles[1]?.click(); // Gestion
                        }, 1000);
                    }
                }, 3000);
            }
        });

        document.body.appendChild(testButton);
        console.log('🛠️ Mode développement : bouton de test rapide ajouté');
    }

    // Ajouter les styles d'animation
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
        
        .server-option:hover {
            border-color: #667eea !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.1) !important;
        }
        
        .module-category:hover {
            transform: translateY(-2px);
        }
        
        .toggle-slider::before {
            transition: transform 0.3s ease;
        }
        
        .btn-install:hover {
            transform: translateY(-2px);
        }
        
        .btn-preview:hover {
            background: rgba(255, 255, 255, 0.1) !important;
        }
    `;
    document.head.appendChild(style);

    console.log('✅ YAKO Configurateur - Initialisation terminée');

    // Message de bienvenue
    setTimeout(() => {
        showNotification('🔧 Bienvenue dans le configurateur YAKO ! Connectez-vous à Discord pour commencer.', 'info', 5000);
    }, 1000);
});

// ========== FONCTIONS GLOBALES ==========
window.yakoConfigurator = {
    getConnectionStatus: () => isConnectedToDiscord,
    getSelectedServer: () => selectedServer,
    getSelectedModules: () => Array.from(selectedModules),
    getCurrentStep: () => currentStep,

    // Fonctions utilitaires pour les tests
    simulateConnection: async () => {
        if (!isConnectedToDiscord) {
            document.getElementById('connectDiscord')?.click();
        }
    },

    selectFirstServer: () => {
        const firstServer = document.querySelector('.server-option');
        if (firstServer) {
            firstServer.click();
        }
    },

    activateAllModules: () => {
        const moduleToggles = document.querySelectorAll('.toggle-preview:not(.disabled)');
        moduleToggles.forEach(toggle => {
            const input = toggle.querySelector('input[type="checkbox"]');
            if (input && !input.checked) {
                toggle.click();
            }
        });
    }
};
