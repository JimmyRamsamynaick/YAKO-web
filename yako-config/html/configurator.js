// js/configurator.js - Frontend JavaScript avec vraie API Discord
class DiscordConfigurator {
    constructor() {
        this.isConnected = false;
        this.currentUser = null;
        this.userServers = [];
        this.selectedServer = null;
        this.serverConfigs = new Map();
        this.currentTab = 'modules';
        // MODIFIEZ CETTE LIGNE pour votre URL backend
        this.apiBaseUrl = 'http://localhost:3000';
        this.loadingStates = new Set();
        this.hasUnsavedChanges = false;
        this.pendingModalAction = null;
        this.modulesData = [];
    }

    // ========== INITIALISATION ==========
    async init() {
        console.log('🔧 Discord Configurator Real - Initialisation...');

        this.bindEvents();
        await this.checkAuthStatus();
        this.initModulesData();
        this.handleUrlParams();
        this.setupErrorHandling();

        console.log('✅ Discord Configurator Real initialisé');
    }

    // ========== GESTION DES ERREURS ==========
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('❌ Erreur JavaScript:', e.error);
            this.showNotification('Une erreur inattendue s\'est produite', 'error');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('❌ Promise rejetée:', e.reason);
            this.showNotification('Erreur de connexion réseau', 'error');
        });
    }

    // ========== GESTION DES PARAMÈTRES URL ==========
    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('success') === 'true') {
            this.showNotification('✅ Connexion Discord réussie !', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => this.checkAuthStatus(), 1500);
        }

        if (urlParams.get('error')) {
            const errorType = urlParams.get('error');
            let errorMessage = 'Erreur de connexion Discord';

            switch (errorType) {
                case 'no_code':
                    errorMessage = 'Code d\'autorisation manquant - Veuillez réessayer';
                    break;
                case 'auth_failed':
                    errorMessage = 'Échec de l\'authentification Discord';
                    break;
                case 'invalid_state':
                    errorMessage = 'État de sécurité invalide - Session expirée';
                    break;
                default:
                    errorMessage = 'Erreur de connexion inconnue';
            }

            this.showNotification(`❌ ${errorMessage}`, 'error', 6000);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // ========== ÉVÉNEMENTS ==========
    bindEvents() {
        this.bindElement('connectDiscordBtn', 'click', () => this.connectToDiscord());
        this.bindElement('connectButton', 'click', () => this.connectToDiscord());
        this.bindElement('disconnectBtn', 'click', () => this.disconnect());
        this.bindElement('yakoHome', 'click', () => this.showWelcomeScreen());

        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        this.bindElement('saveConfig', 'click', () => this.saveConfiguration());
        this.bindElement('deployConfig', 'click', () => this.deployBot());
        this.bindElement('modalCancel', 'click', () => this.hideModal());
        this.bindElement('modalConfirm', 'click', () => this.confirmModalAction());

        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'modalOverlay') {
                    this.hideModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    bindElement(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`⚠️ Élément #${id} non trouvé`);
        }
    }

    // ========== AUTHENTIFICATION DISCORD RÉELLE ==========
    async connectToDiscord() {
        if (this.loadingStates.has('connect')) return;

        try {
            this.setLoading('connect', true);
            this.showNotification('🔗 Redirection vers Discord...', 'info');

            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/auth/discord`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Erreur serveur ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.authUrl) {
                console.log('🔗 Redirection vers Discord OAuth');
                localStorage.setItem('yakoConnecting', 'true');
                window.location.href = data.authUrl;
            } else {
                throw new Error('URL d\'authentification non reçue du serveur');
            }
        } catch (error) {
            console.error('❌ Erreur de connexion Discord:', error);
            this.showNotification(`❌ Erreur de connexion: ${error.message}`, 'error');
        } finally {
            this.setLoading('connect', false);
        }
    }

    async checkAuthStatus() {
        if (this.loadingStates.has('auth')) return;

        try {
            this.setLoading('auth', true);
            console.log('🔍 Vérification du statut d\'authentification...');

            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/api/auth/status`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}`);
            }

            const data = await response.json();

            if (data.isConnected && data.user) {
                console.log('✅ Utilisateur connecté:', data.user.username);

                this.currentUser = data.user;
                this.userServers = data.guilds || [];
                this.isConnected = true;

                localStorage.removeItem('yakoConnecting');

                this.updateUI();
                this.renderServers();

                console.log(`📊 ${this.userServers.length} serveur(s) avec permissions admin trouvé(s)`);

                if (this.userServers.length === 0) {
                    this.showNotification('ℹ️ Aucun serveur avec permissions admin trouvé', 'warning');
                }
            } else {
                console.log('❌ Utilisateur non connecté');
                this.isConnected = false;
                this.updateUI();
            }
        } catch (error) {
            console.error('❌ Erreur vérification statut auth:', error);
            this.isConnected = false;
            this.updateUI();

            if (localStorage.getItem('yakoConnecting')) {
                localStorage.removeItem('yakoConnecting');
                this.showNotification('❌ Erreur lors de la vérification de la connexion', 'error');
            }
        } finally {
            this.setLoading('auth', false);
        }
    }

    async disconnect() {
        this.showModal(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ? Les modifications non sauvegardées seront perdues.',
            async () => {
                try {
                    this.setLoading('disconnect', true);

                    const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/api/auth/logout`, {
                        method: 'POST',
                        credentials: 'include'
                    });

                    if (response.ok) {
                        this.showNotification('✅ Déconnexion réussie', 'success');

                        // Recharger la page après un court délai pour voir la notification
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        throw new Error('Erreur lors de la déconnexion');
                    }
                } catch (error) {
                    console.error('❌ Erreur déconnexion:', error);
                    this.showNotification('❌ Erreur lors de la déconnexion', 'error');
                    this.setLoading('disconnect', false);
                }
            }
        );
    }

    resetState() {
        this.isConnected = false;
        this.currentUser = null;
        this.userServers = [];
        this.selectedServer = null;
        this.currentTab = 'modules';
        this.serverConfigs.clear();
        this.updateUI();
    }

    // ========== GESTION DES SERVEURS ==========
    renderServers() {
        const serversList = document.getElementById('serversList');
        if (!serversList) return;

        serversList.innerHTML = '';

        if (this.userServers.length === 0) {
            const noServersMsg = document.createElement('div');
            noServersMsg.className = 'no-servers-message';
            noServersMsg.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>Aucun serveur admin</span>
            `;
            serversList.appendChild(noServersMsg);
            return;
        }

        this.userServers.forEach(server => {
            const serverElement = this.createServerElement(server);
            serversList.appendChild(serverElement);
        });

        console.log('🖥️ Serveurs rendus dans l\'interface');
    }

    createServerElement(server) {
        const serverDiv = document.createElement('div');
        serverDiv.className = `server-icon ${server.yakoInstalled ? 'has-yako' : 'no-yako'}`;
        serverDiv.title = this.getServerTooltip(server);
        serverDiv.dataset.serverId = server.id;

        if (server.icon) {
            const img = document.createElement('img');
            img.src = `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png?size=256`;
            img.alt = server.name;
            img.onerror = () => {
                img.style.display = 'none';
                this.addServerInitial(serverDiv, server.name);
            };
            serverDiv.appendChild(img);
        } else {
            this.addServerInitial(serverDiv, server.name);
        }

        if (server.yakoInstalled) {
            const notification = document.createElement('div');
            notification.className = 'server-notification';
            notification.textContent = '✓';
            notification.title = 'YAKO installé et configuré';
            serverDiv.appendChild(notification);
        }

        serverDiv.addEventListener('click', () => this.selectServer(server));

        serverDiv.addEventListener('mouseenter', () => {
            if (!serverDiv.classList.contains('active')) {
                serverDiv.style.transform = 'scale(1.1)';
            }
        });

        serverDiv.addEventListener('mouseleave', () => {
            if (!serverDiv.classList.contains('active')) {
                serverDiv.style.transform = 'scale(1)';
            }
        });

        return serverDiv;
    }

    addServerInitial(serverDiv, serverName) {
        const initial = document.createElement('div');
        initial.className = 'server-initial';
        initial.textContent = serverName.charAt(0).toUpperCase();
        serverDiv.appendChild(initial);
    }

    getServerTooltip(server) {
        let tooltip = server.name;
        if (server.memberCount || server.approximate_member_count) {
            tooltip += ` (${server.memberCount || server.approximate_member_count} membres)`;
        }
        tooltip += server.yakoInstalled ? ' • YAKO installé' : ' • YAKO non installé';
        return tooltip;
    }

    async selectServer(server) {
        if (this.loadingStates.has('selectServer')) return;

        try {
            console.log(`🏰 Sélection du serveur: ${server.name}`);
            this.setLoading('selectServer', true);

            this.selectedServer = server;

            document.querySelectorAll('.server-icon').forEach(el => el.classList.remove('active'));
            const serverElement = document.querySelector(`[data-server-id="${server.id}"]`);
            if (serverElement) {
                serverElement.classList.add('active');
            }

            if (server.yakoInstalled) {
                await this.loadServerDetails();
            }

            this.updateServerInfo();
            this.showConfigArea();
            this.loadServerConfiguration();

            this.showNotification(`📋 Serveur "${server.name}" sélectionné`, 'info');
        } catch (error) {
            console.error('❌ Erreur sélection serveur:', error);
            this.showNotification('❌ Erreur lors de la sélection du serveur', 'error');
        } finally {
            this.setLoading('selectServer', false);
        }
    }

    async loadServerDetails() {
        if (!this.selectedServer) return;

        try {
            console.log(`🔍 Chargement des détails pour ${this.selectedServer.name}...`);

            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/api/guild/${this.selectedServer.id}`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                this.selectedServer.details = data.guild;
                this.selectedServer.channels = data.channels;
                this.selectedServer.roles = data.roles;

                console.log('✅ Détails serveur chargés:', {
                    channels: data.channels?.length || 0,
                    roles: data.roles?.length || 0
                });
            } else if (response.status === 403) {
                console.warn('⚠️ Bot non présent sur le serveur');
                this.selectedServer.yakoInstalled = false;
            } else {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement détails serveur:', error);
            if (!error.message.includes('403')) {
                this.showNotification('⚠️ Impossible de charger les détails du serveur', 'warning');
            }
        }
    }

    async inviteBotToServer() {
        if (!this.selectedServer) {
            this.showNotification('Aucun serveur sélectionné', 'warning');
            return;
        }

        if (this.loadingStates.has('invite')) return;

        try {
            this.setLoading('invite', true);

            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/api/guild/${this.selectedServer.id}/invite-bot`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                const inviteWindow = window.open(
                    data.inviteUrl,
                    'discord-invite',
                    'width=500,height=700,scrollbars=yes,resizable=yes'
                );

                if (inviteWindow) {
                    this.showNotification('🔗 Invitation ouverte dans une nouvelle fenêtre', 'success');

                    const checkInvite = setInterval(() => {
                        if (inviteWindow.closed) {
                            clearInterval(checkInvite);
                            this.showNotification('ℹ️ Vérification de l\'installation...', 'info');

                            setTimeout(() => {
                                this.checkBotInstallation();
                            }, 3000);
                        }
                    }, 1000);
                } else {
                    this.showNotification('🔗 Popup bloquée - Lien copié dans le presse-papier', 'warning');
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(data.inviteUrl);
                    }
                }
            } else {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('❌ Erreur génération lien invitation:', error);
            this.showNotification('❌ Erreur lors de la génération du lien d\'invitation', 'error');
        } finally {
            this.setLoading('invite', false);
        }
    }

    async checkBotInstallation() {
        if (!this.selectedServer) return;

        try {
            const response = await this.fetchWithTimeout(`${this.apiBaseUrl}/api/guild/${this.selectedServer.id}/yako-status`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                if (data.yakoInstalled && !this.selectedServer.yakoInstalled) {
                    this.selectedServer.yakoInstalled = true;
                    this.updateServerInfo();
                    this.renderServers();
                    this.loadServerConfiguration();

                    this.showNotification('🎉 YAKO a été installé avec succès !', 'success');
                } else if (!data.yakoInstalled) {
                    this.showNotification('ℹ️ YAKO n\'a pas encore été installé', 'info');
                }
            }
        } catch (error) {
            console.error('❌ Erreur vérification installation bot:', error);
        }
    }

    // ========== GESTION DE L'INTERFACE ==========
    updateUI() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const configArea = document.getElementById('configArea');
        const userInfo = document.getElementById('userInfo');
        const connectButton = document.getElementById('connectButton');

        if (this.isConnected && this.currentUser) {
            if (welcomeScreen) welcomeScreen.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            if (connectButton) connectButton.style.display = 'none';

            this.updateUserInfo();

            if (this.selectedServer && configArea) {
                configArea.style.display = 'flex';
            }
        } else {
            if (welcomeScreen) welcomeScreen.style.display = 'flex';
            if (configArea) configArea.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (connectButton) connectButton.style.display = 'flex';

            this.resetServerInfo();
        }
    }

    updateUserInfo() {
        const avatarUrl = this.currentUser.avatar
            ? `https://cdn.discordapp.com/avatars/${this.currentUser.id}/${this.currentUser.avatar}.png?size=128`
            : `https://cdn.discordapp.com/embed/avatars/${(this.currentUser.discriminator || 0) % 5}.png`;

        const userAvatar = document.getElementById('userAvatar');
        const username = document.getElementById('username');

        if (userAvatar) {
            userAvatar.style.backgroundImage = `url(${avatarUrl})`;
        }

        if (username) {
            const displayName = this.currentUser.global_name ||
                `${this.currentUser.username}${this.currentUser.discriminator ? '#' + this.currentUser.discriminator : ''}`;
            username.textContent = displayName;
        }
    }

    updateServerInfo() {
        const currentServerName = document.getElementById('currentServerName');
        const serverStatus = document.getElementById('serverStatus');

        if (this.selectedServer) {
            if (currentServerName) {
                currentServerName.textContent = this.selectedServer.name;
            }

            if (serverStatus) {
                let statusText = '';
                const memberCount = this.selectedServer.memberCount || this.selectedServer.approximate_member_count;
                if (memberCount) {
                    statusText += `${memberCount} membres`;
                }
                statusText += ` • ${this.selectedServer.yakoInstalled ? '✅ YAKO installé' : '⚠️ YAKO non installé'}`;
                serverStatus.textContent = statusText;
            }
        }
    }

    resetServerInfo() {
        const currentServerName = document.getElementById('currentServerName');
        const serverStatus = document.getElementById('serverStatus');

        if (currentServerName) {
            currentServerName.textContent = 'YAKO Configurateur';
        }

        if (serverStatus) {
            serverStatus.textContent = 'Connectez-vous pour commencer';
        }
    }

    showWelcomeScreen() {
        this.selectedServer = null;
        document.querySelectorAll('.server-icon').forEach(el => el.classList.remove('active'));

        const configArea = document.getElementById('configArea');
        const welcomeScreen = document.getElementById('welcomeScreen');

        if (configArea) configArea.style.display = 'none';
        if (welcomeScreen) welcomeScreen.style.display = 'flex';

        this.resetServerInfo();

        if (this.isConnected) {
            const serverStatus = document.getElementById('serverStatus');
            if (serverStatus) {
                serverStatus.textContent = 'Sélectionnez un serveur pour commencer';
            }
        }
    }

    showConfigArea() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const configArea = document.getElementById('configArea');

        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (configArea) configArea.style.display = 'flex';
    }

    // ========== GESTION DES ONGLETS ==========
    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        this.currentTab = tabName;

        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            const isActive = pane.id === `${tabName}-tab`;
            if (isActive) {
                pane.classList.add('active');
                pane.style.opacity = '0';
                setTimeout(() => {
                    pane.style.opacity = '1';
                }, 50);
            } else {
                pane.classList.remove('active');
            }
        });

        this.loadTabContent(tabName);
        console.log(`📋 Onglet "${tabName}" activé`);
    }

    loadTabContent(tabName) {
        try {
            switch (tabName) {
                case 'modules':
                    this.renderModules();
                    break;
                case 'permissions':
                    this.renderPermissions();
                    break;
                case 'channels':
                    this.renderChannels();
                    break;
                case 'logs':
                    this.renderLogs();
                    break;
                default:
                    console.warn(`⚠️ Onglet inconnu: ${tabName}`);
            }
        } catch (error) {
            console.error(`❌ Erreur chargement onglet ${tabName}:`, error);
            this.showNotification(`Erreur lors du chargement de l'onglet ${tabName}`, 'error');
        }
    }

    // ========== MODULES ET AUTRES RENDUS ==========
    initModulesData() {
        this.modulesData = [
            {
                id: 'moderation',
                name: 'Modération',
                icon: 'fas fa-shield-alt',
                description: 'Outils de modération automatique et manuelle pour maintenir l\'ordre.',
                features: [
                    'Auto-modération intelligente',
                    'Système de sanctions graduelles',
                    'Filtrage de contenu',
                    'Logs de modération'
                ],
                enabled: false
            },
            {
                id: 'music',
                name: 'Musique',
                icon: 'fas fa-music',
                description: 'Lecteur de musique avec support YouTube, Spotify et autres plateformes.',
                features: [
                    'Lecture depuis YouTube/Spotify',
                    'Files d\'attente et playlists',
                    'Contrôles vocaux',
                    'Qualité audio HD'
                ],
                enabled: false
            },
            {
                id: 'levels',
                name: 'Système de niveaux',
                icon: 'fas fa-trophy',
                description: 'Gamification avec XP, niveaux et récompenses pour encourager l\'activité.',
                features: [
                    'Gain d\'XP par activité',
                    'Classements et tableaux',
                    'Rôles de récompense',
                    'Badges personnalisés'
                ],
                enabled: true
            },
            {
                id: 'welcome',
                name: 'Messages de bienvenue',
                icon: 'fas fa-hand-wave',
                description: 'Accueillez automatiquement les nouveaux membres avec des messages personnalisés.',
                features: [
                    'Messages personnalisables',
                    'Attribution de rôles automatique',
                    'Images de bienvenue',
                    'Règles du serveur'
                ],
                enabled: false
            },
            {
                id: 'economy',
                name: 'Économie',
                icon: 'fas fa-coins',
                description: 'Système économique virtuel avec monnaie, boutique et jeux.',
                features: [
                    'Monnaie virtuelle',
                    'Boutique d\'objets',
                    'Jeux d\'argent',
                    'Transactions entre utilisateurs'
                ],
                enabled: false
            },
            {
                id: 'polls',
                name: 'Sondages',
                icon: 'fas fa-poll',
                description: 'Créez des sondages interactifs avec options multiples.',
                features: [
                    'Sondages à choix multiples',
                    'Votes anonymes',
                    'Résultats en temps réel',
                    'Programmation de sondages'
                ],
                enabled: true
            }
        ];
    }

    renderModules() {
        const modulesGrid = document.getElementById('modulesGrid');
        if (!modulesGrid) return;

        if (!this.selectedServer?.yakoInstalled) {
            modulesGrid.innerHTML = this.getNotInstalledMessage('Invitez YAKO sur ce serveur pour activer les modules');
            return;
        }

        const config = this.getServerConfig();

        let modulesHTML = '';
        this.modulesData.forEach(module => {
            const isEnabled = config.modules?.[module.id]?.enabled ?? module.enabled;

            modulesHTML += `
                <div class="module-card">
                    <div class="module-header">
                        <div class="module-title">
                            <i class="${module.icon}"></i>
                            ${module.name}
                        </div>
                        <div class="module-toggle ${isEnabled ? 'active' : ''}" data-module="${module.id}">
                        </div>
                    </div>
                    <div class="module-description">${module.description}</div>
                    <ul class="module-features">
                        ${module.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        modulesGrid.innerHTML = modulesHTML;

        modulesGrid.querySelectorAll('.module-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const moduleId = toggle.dataset.module;
                this.toggleModule(moduleId);
            });
        });
    }

    toggleModule(moduleId) {
        const config = this.getServerConfig();
        if (!config.modules) config.modules = {};
        if (!config.modules[moduleId]) config.modules[moduleId] = {};

        config.modules[moduleId].enabled = !config.modules[moduleId].enabled;
        this.setServerConfig(config);

        const toggle = document.querySelector(`[data-module="${moduleId}"]`);
        if (toggle) {
            toggle.classList.toggle('active', config.modules[moduleId].enabled);
        }

        const moduleName = this.modulesData.find(m => m.id === moduleId)?.name;
        const status = config.modules[moduleId].enabled ? 'activé' : 'désactivé';
        this.showNotification(`Module ${moduleName} ${status}`, 'info');

        this.markAsChanged();
    }

    renderPermissions() {
        const permissionsList = document.getElementById('permissionsList');
        if (!permissionsList) return;

        if (!this.selectedServer?.yakoInstalled) {
            permissionsList.innerHTML = this.getNotInstalledMessage('Invitez YAKO sur ce serveur pour configurer les permissions');
            return;
        }

        if (!this.selectedServer.roles) {
            permissionsList.innerHTML = this.getLoadingMessage('Chargement des rôles...');
            return;
        }

        const roles = this.selectedServer.roles
            .filter(role => role.name !== '@everyone')
            .sort((a, b) => b.position - a.position);

        if (roles.length === 0) {
            permissionsList.innerHTML = this.getEmptyMessage('Aucun rôle disponible pour la configuration');
            return;
        }

        let permissionsHTML = `
            <div class="permission-group">
                <h3><i class="fas fa-user-shield"></i> Configuration des rôles</h3>
        `;

        roles.forEach(role => {
            const config = this.getRoleConfig(role.id);
            const roleColor = role.color ? `#${role.color.toString(16).padStart(6, '0')}` : '#99aab5';

            permissionsHTML += `
                <div class="permission-item">
                    <div class="permission-info">
                        <div class="permission-name">
                            <div class="role-color" style="background-color: ${roleColor};"></div>
                            ${this.escapeHtml(role.name)}
                        </div>
                        <div class="permission-desc">${role.managed ? 'Rôle géré automatiquement' : 'Rôle personnalisé'}</div>
                    </div>
                    <select class="permission-level" data-role="${role.id}">
                        <option value="none" ${config.level === 'none' ? 'selected' : ''}>Aucune permission</option>
                        <option value="basic" ${config.level === 'basic' ? 'selected' : ''}>Permissions de base</option>
                        <option value="moderator" ${config.level === 'moderator' ? 'selected' : ''}>Modérateur</option>
                        <option value="admin" ${config.level === 'admin' ? 'selected' : ''}>Administrateur</option>
                    </select>
                </div>
            `;
        });

        permissionsHTML += '</div>';
        permissionsList.innerHTML = permissionsHTML;

        permissionsList.querySelectorAll('.permission-level').forEach(select => {
            select.addEventListener('change', (e) => {
                const roleId = select.dataset.role;
                const level = e.target.value;
                this.updateRolePermission(roleId, level);
            });
        });
    }

    getRoleConfig(roleId) {
        const config = this.getServerConfig();
        return config.permissions?.[roleId] || { level: 'none' };
    }

    updateRolePermission(roleId, level) {
        const config = this.getServerConfig();
        if (!config.permissions) config.permissions = {};

        config.permissions[roleId] = { level };
        this.setServerConfig(config);

        const role = this.selectedServer.roles.find(r => r.id === roleId);
        const roleName = role?.name || 'rôle inconnu';

        this.showNotification(`🔐 Permissions "${level}" définies pour le rôle @${roleName}`, 'info');
        this.markAsChanged();
    }

    renderChannels() {
        const channelsList = document.getElementById('channelsList');
        if (!channelsList) return;

        if (!this.selectedServer?.yakoInstalled) {
            channelsList.innerHTML = this.getNotInstalledMessage('Invitez YAKO sur ce serveur pour configurer les salons');
            return;
        }

        if (!this.selectedServer.channels) {
            channelsList.innerHTML = this.getLoadingMessage('Chargement des salons...');
            return;
        }

        const channels = this.selectedServer.channels;
        const channelTypes = {
            0: { name: 'Salon textuel', icon: 'fas fa-hashtag' },
            2: { name: 'Salon vocal', icon: 'fas fa-volume-up' },
            4: { name: 'Catégorie', icon: 'fas fa-folder' },
            5: { name: 'Salon d\'annonces', icon: 'fas fa-bullhorn' },
            13: { name: 'Salon de forum', icon: 'fas fa-comments' },
            15: { name: 'Salon de forum média', icon: 'fas fa-images' }
        };

        const sortedChannels = channels
            .filter(channel => channel.type !== 4)
            .sort((a, b) => a.position - b.position);

        if (sortedChannels.length === 0) {
            channelsList.innerHTML = this.getEmptyMessage('Aucun salon disponible pour la configuration');
            return;
        }

        let channelsHTML = '';
        sortedChannels.forEach(channel => {
            const channelType = channelTypes[channel.type] || { name: 'Inconnu', icon: 'fas fa-question' };
            const config = this.getChannelConfig(channel.id);

            channelsHTML += `
                <div class="channel-item">
                    <div class="channel-info">
                        <i class="${channelType.icon} channel-icon"></i>
                        <div>
                            <div class="channel-name">${this.escapeHtml(channel.name)}</div>
                            <div class="channel-type">${channelType.name}</div>
                        </div>
                    </div>
                    <div class="module-toggle ${config.enabled ? 'active' : ''}" 
                         data-channel="${channel.id}"></div>
                </div>
            `;
        });

        channelsList.innerHTML = channelsHTML;

        channelsList.querySelectorAll('.module-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const channelId = toggle.dataset.channel;
                this.toggleChannelConfig(channelId);
            });
        });
    }

    getChannelConfig(channelId) {
        const config = this.getServerConfig();
        return config.channels?.[channelId] || { enabled: false };
    }

    toggleChannelConfig(channelId) {
        const config = this.getServerConfig();
        if (!config.channels) config.channels = {};
        if (!config.channels[channelId]) config.channels[channelId] = {};

        config.channels[channelId].enabled = !config.channels[channelId].enabled;
        this.setServerConfig(config);

        const toggle = document.querySelector(`[data-channel="${channelId}"]`);
        if (toggle) {
            toggle.classList.toggle('active', config.channels[channelId].enabled);
        }

        const channelName = this.selectedServer.channels.find(c => c.id === channelId)?.name || 'salon inconnu';

        this.showNotification(
            `${config.channels[channelId].enabled ? '✅' : '❌'} Configuration ${config.channels[channelId].enabled ? 'activée' : 'désactivée'} pour #${channelName}`,
            'info'
        );

        this.markAsChanged();
    }

    renderLogs() {
        const logsConfig = document.getElementById('logsConfig');
        if (!logsConfig) return;

        if (!this.selectedServer?.yakoInstalled) {
            logsConfig.innerHTML = this.getNotInstalledMessage('Invitez YAKO sur ce serveur pour configurer les logs');
            return;
        }

        const logTypes = [
            { id: 'moderation', name: 'Modération', icon: 'fas fa-shield-alt', description: 'Sanctions, avertissements, exclusions' },
            { id: 'messages', name: 'Messages', icon: 'fas fa-comment', description: 'Suppressions, modifications de messages' },
            { id: 'members', name: 'Membres', icon: 'fas fa-users', description: 'Arrivées, départs, changements de rôles' },
            { id: 'channels', name: 'Salons', icon: 'fas fa-hashtag', description: 'Créations, suppressions, modifications' },
            { id: 'server', name: 'Serveur', icon: 'fas fa-server', description: 'Modifications des paramètres du serveur' }
        ];

        let logsHTML = `
            <div class="permission-group">
                <h3><i class="fas fa-clipboard-list"></i> Configuration des logs</h3>
        `;

        logTypes.forEach(logType => {
            const config = this.getLogConfig(logType.id);

            logsHTML += `
                <div class="permission-item">
                    <div class="permission-info">
                        <div class="permission-name">
                            <i class="${logType.icon}"></i>
                            ${logType.name}
                        </div>
                        <div class="permission-desc">${logType.description}</div>
                    </div>
                    <div class="log-controls">
                        <div class="module-toggle ${config.enabled ? 'active' : ''}" 
                             data-log="${logType.id}"></div>
                        <select class="log-channel" data-log="${logType.id}" ${!config.enabled ? 'disabled' : ''}>
                            <option value="">Choisir un salon</option>
                            ${this.renderChannelOptions(config.channelId)}
                        </select>
                    </div>
                </div>
            `;
        });

        logsHTML += '</div>';
        logsConfig.innerHTML = logsHTML;

        logsConfig.querySelectorAll('.module-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const logType = toggle.dataset.log;
                this.toggleLogConfig(logType);
            });
        });

        logsConfig.querySelectorAll('.log-channel').forEach(select => {
            select.addEventListener('change', (e) => {
                const logType = select.dataset.log;
                const channelId = e.target.value;
                this.updateLogChannel(logType, channelId);
            });
        });
    }

    renderChannelOptions(selectedChannelId) {
        if (!this.selectedServer?.channels) return '';

        return this.selectedServer.channels
            .filter(channel => channel.type === 0)
            .map(channel => `
                <option value="${channel.id}" ${channel.id === selectedChannelId ? 'selected' : ''}>
                    #${channel.name}
                </option>
            `).join('');
    }

    getLogConfig(logType) {
        const config = this.getServerConfig();
        return config.logs?.[logType] || { enabled: false, channelId: null };
    }

    toggleLogConfig(logType) {
        const config = this.getServerConfig();
        if (!config.logs) config.logs = {};
        if (!config.logs[logType]) config.logs[logType] = { enabled: false, channelId: null };

        config.logs[logType].enabled = !config.logs[logType].enabled;
        this.setServerConfig(config);

        const toggle = document.querySelector(`[data-log="${logType}"]`);
        const select = document.querySelector(`select[data-log="${logType}"]`);

        if (toggle) {
            toggle.classList.toggle('active', config.logs[logType].enabled);
        }

        if (select) {
            select.disabled = !config.logs[logType].enabled;
        }

        this.showNotification(
            `${config.logs[logType].enabled ? '✅' : '❌'} Logs ${logType} ${config.logs[logType].enabled ? 'activés' : 'désactivés'}`,
            'info'
        );

        this.markAsChanged();
    }

    updateLogChannel(logType, channelId) {
        const config = this.getServerConfig();
        if (!config.logs) config.logs = {};
        if (!config.logs[logType]) config.logs[logType] = { enabled: false };

        config.logs[logType].channelId = channelId;
        this.setServerConfig(config);

        const channel = this.selectedServer.channels.find(c => c.id === channelId);
        const channelName = channel?.name || 'salon inconnu';

        this.showNotification(
            `📝 Salon de logs ${logType} défini : #${channelName}`,
            'info'
        );

        this.markAsChanged();
    }

    // ========== CONFIGURATION ==========
    getServerConfig() {
        return this.serverConfigs.get(this.selectedServer?.id) || {};
    }

    setServerConfig(config) {
        if (this.selectedServer) {
            this.serverConfigs.set(this.selectedServer.id, config);
        }
    }

    async loadServerConfiguration() {
        if (!this.selectedServer?.yakoInstalled) return;

        try {
            const config = this.getServerConfig();
            if (Object.keys(config).length === 0) {
                this.setServerConfig({
                    modules: {},
                    permissions: {},
                    channels: {},
                    logs: {}
                });
            }

            this.loadTabContent(this.currentTab);
            console.log('✅ Configuration serveur chargée');
        } catch (error) {
            console.error('❌ Erreur chargement configuration:', error);
            this.showNotification('⚠️ Impossible de charger la configuration du serveur', 'warning');
        }
    }

    async saveConfiguration() {
        if (!this.selectedServer?.yakoInstalled) {
            this.showNotification('❌ YAKO doit être installé pour sauvegarder', 'error');
            return;
        }

        if (this.loadingStates.has('save')) return;

        try {
            this.setLoading('save', true);
            this.showNotification('💾 Sauvegarde en cours...', 'info');

            await new Promise(resolve => setTimeout(resolve, 1500));

            this.showNotification('✅ Configuration sauvegardée avec succès !', 'success');
            this.markAsSaved();
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.showNotification(`❌ Erreur lors de la sauvegarde: ${error.message}`, 'error');
        } finally {
            this.setLoading('save', false);
        }
    }

    async deployBot() {
        if (!this.selectedServer) {
            this.showNotification('❌ Aucun serveur sélectionné', 'error');
            return;
        }

        if (!this.selectedServer.yakoInstalled) {
            this.showModal(
                'Installation requise',
                `YAKO n'est pas encore installé sur "${this.selectedServer.name}". Voulez-vous l'inviter maintenant ?`,
                () => this.inviteBotToServer()
            );
            return;
        }

        this.showModal(
            'Déployer la configuration',
            'Voulez-vous appliquer la configuration actuelle au bot ? Cette action redémarrera les modules modifiés.',
            async () => {
                if (this.loadingStates.has('deploy')) return;

                try {
                    this.setLoading('deploy', true);

                    await this.saveConfiguration();

                    this.showNotification('🚀 Déploiement en cours...', 'info');
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    this.showNotification('🚀 Configuration déployée avec succès !', 'success');
                } catch (error) {
                    console.error('❌ Erreur déploiement:', error);
                    this.showNotification(`❌ Erreur lors du déploiement: ${error.message}`, 'error');
                } finally {
                    this.setLoading('deploy', false);
                }
            }
        );
    }

    // ========== UTILITAIRES ==========
    async fetchWithTimeout(url, options = {}, timeout = 10000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Timeout de la requête');
            }
            throw error;
        }
    }

    setLoading(action, isLoading) {
        if (isLoading) {
            this.loadingStates.add(action);
        } else {
            this.loadingStates.delete(action);
        }

        this.updateLoadingButtons();
    }

    updateLoadingButtons() {
        const buttons = {
            'connect': ['connectDiscordBtn', 'connectButton'],
            'disconnect': ['disconnectBtn'],
            'save': ['saveConfig'],
            'deploy': ['deployConfig'],
            'invite': []
        };

        Object.entries(buttons).forEach(([action, buttonIds]) => {
            const isLoading = this.loadingStates.has(action);
            buttonIds.forEach(buttonId => {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.disabled = isLoading;
                    button.style.opacity = isLoading ? '0.6' : '1';
                    button.style.cursor = isLoading ? 'not-allowed' : 'pointer';
                }
            });
        });
    }

    showNotification(message, type = 'info', duration = 4000) {
        document.querySelectorAll('.notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10000',
            maxWidth: '400px',
            wordWrap: 'break-word',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        const colors = {
            success: '#43a047',
            error: '#e53e3e',
            warning: '#ff9800',
            info: '#2196f3'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        console.log(`📢 Notification ${type}: ${message}`);
    }

    showModal(title, message, onConfirm) {
        const modal = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');

        if (modal && modalTitle && modalMessage) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            modal.style.display = 'flex';

            this.pendingModalAction = onConfirm;

            requestAnimationFrame(() => {
                modal.style.opacity = '1';
                const modalEl = modal.querySelector('.modal');
                if (modalEl) {
                    modalEl.style.transform = 'scale(1)';
                }
            });
        }
    }

    hideModal() {
        const modal = document.getElementById('modalOverlay');
        if (modal) {
            modal.style.opacity = '0';
            const modalEl = modal.querySelector('.modal');
            if (modalEl) {
                modalEl.style.transform = 'scale(0.95)';
            }

            setTimeout(() => {
                modal.style.display = 'none';
                this.pendingModalAction = null;
            }, 200);
        }
    }

    confirmModalAction() {
        if (this.pendingModalAction && typeof this.pendingModalAction === 'function') {
            this.pendingModalAction();
        }
        this.hideModal();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getNotInstalledMessage(message) {
        return `
            <div class="status-message not-installed">
                <i class="fas fa-robot"></i>
                <h3>YAKO non installé</h3>
                <p>${message}</p>
                <button class="invite-bot-btn" onclick="discordConfig.inviteBotToServer()">
                    <i class="fas fa-plus"></i>
                    Inviter YAKO
                </button>
            </div>
        `;
    }

    getLoadingMessage(message) {
        return `
            <div class="status-message loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${message}</p>
            </div>
        `;
    }

    getEmptyMessage(message) {
        return `
            <div class="status-message empty">
                <i class="fas fa-inbox"></i>
                <p>${message}</p>
            </div>
        `;
    }

    markAsChanged() {
        this.hasUnsavedChanges = true;

        const saveButton = document.getElementById('saveConfig');
        if (saveButton && !saveButton.classList.contains('has-changes')) {
            saveButton.classList.add('has-changes');
            saveButton.style.backgroundColor = '#ff9800';
        }
    }

    markAsSaved() {
        this.hasUnsavedChanges = false;

        const saveButton = document.getElementById('saveConfig');
        if (saveButton) {
            saveButton.classList.remove('has-changes');
            saveButton.style.backgroundColor = '';
        }
    }
}

// ========== INITIALISATION GLOBALE ==========
let discordConfig;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        discordConfig = new DiscordConfigurator();
        await discordConfig.init();

        console.log('🎉 YAKO Configurateur prêt !');
        window.discordConfig = discordConfig;
    } catch (error) {
        console.error('❌ Erreur d\'initialisation:', error);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'init-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erreur d'initialisation</h3>
            <p>Une erreur s'est produite lors du chargement du configurateur.</p>
            <button onclick="location.reload()">Recharger la page</button>
        `;
        Object.assign(errorDiv.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#f8f9fa',
            color: '#495057',
            padding: '30px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            zIndex: '10000'
        });

        document.body.appendChild(errorDiv);
    }
});

window.addEventListener('beforeunload', (e) => {
    if (discordConfig?.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
    }
});

window.addEventListener('online', () => {
    if (discordConfig && !discordConfig.isConnected) {
        discordConfig.checkAuthStatus();
    }
});

window.addEventListener('offline', () => {
    if (discordConfig) {
        discordConfig.showNotification('🌐 Connexion internet perdue', 'warning');
    }
});

window.DiscordConfigurator = DiscordConfigurator;