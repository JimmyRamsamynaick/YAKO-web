class BotConfigurator {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.guilds = [];
        this.selectedGuild = null;
        this.currentTab = 'features';
        this.configurations = new Map();
        this.apiBaseUrl = 'http://localhost:3000';
        this.pendingChanges = new Set();

        this.init();
    }

    async init() {
        console.log('🚀 Initialisation du configurateur YAKO Bot');

        this.setupEventListeners();
        await this.checkAuthStatus();
        this.handleUrlParams();

        console.log('✅ Configurateur initialisé');
    }

    // ========== GESTION DE L'AUTHENTIFICATION ==========

    async checkAuthStatus() {
        try {
            console.log('🔍 Vérification du statut d\'authentification...');
            this.showLoading('Vérification de la connexion...');

            const response = await this.apiCall('/api/auth/status');
            console.log('📊 Réponse statut auth:', response);

            if (response.success && response.user) {
                this.isAuthenticated = true;
                this.currentUser = response.user;
                this.guilds = response.guilds || [];

                console.log(`✅ Connecté en tant que ${response.user.username}`);
                console.log(`🏰 ${this.guilds.length} serveur(s) avec permissions admin`);

                this.updateAuthUI();
                this.showServerSelection();
                this.showNotification('Connexion établie', 'success');
            } else {
                console.log('❌ Non authentifié');
                this.isAuthenticated = false;
                this.showWelcomePage();
            }
        } catch (error) {
            console.error('❌ Erreur vérification auth:', error);
            this.isAuthenticated = false;
            this.showWelcomePage();
            this.showNotification('Erreur de vérification de connexion', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async login() {
        try {
            console.log('🔐 Tentative de connexion Discord...');
            this.showLoading('Connexion à Discord...');

            const response = await this.apiCall('/auth/discord');
            console.log('📨 Réponse login:', response);

            if (response.success && response.authUrl) {
                console.log('✅ URL d\'authentification reçue, redirection...');
                window.location.href = response.authUrl;
            } else {
                throw new Error(response.error || 'URL d\'authentification non reçue');
            }
        } catch (error) {
            console.error('❌ Erreur login:', error);

            let errorMessage = 'Erreur de connexion Discord';
            if (error.message.includes('Configuration Discord manquante')) {
                errorMessage = 'Configuration Discord incomplete. Vérifiez le fichier .env';
            }

            this.showNotification(errorMessage, 'error');
            this.hideLoading();
        }
    }

    async logout() {
        try {
            console.log('🚪 Déconnexion...');
            await this.apiCall('/auth/logout', 'POST');

            this.isAuthenticated = false;
            this.currentUser = null;
            this.guilds = [];
            this.selectedGuild = null;

            this.updateAuthUI();
            this.showWelcomePage();
            this.showNotification('Déconnexion réussie', 'info');
        } catch (error) {
            console.error('❌ Erreur logout:', error);
            this.showNotification('Erreur de déconnexion', 'error');
        }
    }

    // ========== GESTION DES SERVEURS ==========

    renderServers() {
        const serversGrid = document.getElementById('serversGrid');
        if (!serversGrid) {
            console.warn('Element serversGrid not found');
            return;
        }

        serversGrid.innerHTML = '';

        if (this.guilds.length === 0) {
            serversGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-server"></i>
                    <h3>Aucun serveur trouvé</h3>
                    <p>Vous devez avoir les permissions d'administrateur sur un serveur pour le configurer.</p>
                    <p><small>Si vous êtes admin d'un serveur et qu'il n'apparaît pas, vérifiez vos permissions.</small></p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-refresh"></i>
                        Actualiser
                    </button>
                </div>
            `;
            return;
        }

        console.log(`🏰 Affichage de ${this.guilds.length} serveur(s)`);

        // Trier les serveurs : bot installé en premier, puis par nombre de membres
        const sortedGuilds = [...this.guilds].sort((a, b) => {
            // D'abord par statut du bot (installé en premier)
            if (a.bot_installed !== b.bot_installed) {
                return b.bot_installed - a.bot_installed;
            }
            // Puis par nombre de membres (plus grand en premier)
            return (b.approximate_member_count || 0) - (a.approximate_member_count || 0);
        });

        sortedGuilds.forEach(guild => {
            const serverCard = this.createServerCard(guild);
            serversGrid.appendChild(serverCard);
        });

        console.log(`✅ ${this.guilds.filter(g => g.bot_installed).length} serveur(s) avec bot installé`);
    }

    createServerCard(guild) {
        const card = document.createElement('div');
        card.className = 'server-card';
        card.dataset.guildId = guild.id;

        const iconUrl = guild.icon
            ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
            : null;

        // Afficher le nombre de membres avec formatage
        const memberCount = this.formatMemberCount(guild.approximate_member_count || 0);

        card.innerHTML = `
            <div class="server-card-header">
                <div class="server-icon" ${iconUrl ? `style="background-image: url(${iconUrl})"` : ''}>
                    ${!iconUrl ? guild.name.charAt(0).toUpperCase() : ''}
                </div>
                <div class="server-details">
                    <h3>${this.escapeHtml(guild.name)}</h3>
                    <p>${memberCount}</p>
                </div>
            </div>
            <div class="server-status ${guild.bot_installed ? 'installed' : 'not-installed'}">
                ${guild.bot_installed ? '✅ Bot installé' : '⚠️ Bot non installé'}
            </div>
            ${!guild.bot_installed ? `
                <button class="invite-bot-btn" onclick="configurator.inviteBot('${guild.id}')">
                    <i class="fas fa-plus"></i>
                    Inviter le bot
                </button>
            ` : ''}
        `;

        card.addEventListener('click', (e) => {
            if (!e.target.closest('.invite-bot-btn')) {
                this.selectServer(guild);
            }
        });

        return card;
    }

    // Fonction utilitaire pour formater le nombre de membres
    formatMemberCount(count) {
        if (count === 0) return 'Nombre de membres non disponible';
        if (count < 1000) return `${count} membres`;
        if (count < 1000000) return `${(count / 1000).toFixed(1)}k membres`;
        return `${(count / 1000000).toFixed(1)}M membres`;
    }

    async selectServer(guild) {
        try {
            console.log(`🏰 Sélection du serveur: ${guild.name}`);
            this.showLoading('Chargement de la configuration...');

            this.selectedGuild = guild;

            // Charger les détails du serveur si le bot est installé
            if (guild.bot_installed) {
                console.log('🔄 Chargement des détails du serveur...');
                const details = await this.apiCall(`/guild/${guild.id}`);

                // Fusionner les informations
                this.selectedGuild = {
                    ...guild,
                    ...details,
                    // S'assurer que le nombre de membres est correct
                    approximate_member_count: details.member_count || guild.approximate_member_count || 0
                };

                console.log(`✅ Détails chargés: ${this.selectedGuild.channels?.length || 0} canaux, ${this.selectedGuild.roles?.length || 0} rôles`);

                await this.loadGuildConfiguration();
            } else {
                console.log('⚠️ Bot non installé, configuration limitée');
            }

            this.showServerConfig();
            this.updateServerHeader();
            this.switchTab('features');

        } catch (error) {
            console.error('❌ Erreur sélection serveur:', error);
            this.showNotification('Erreur lors du chargement du serveur', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async inviteBot(guildId) {
        try {
            console.log(`🤖 Invitation du bot sur le serveur ${guildId}`);
            const response = await this.apiCall(`/guild/${guildId}/invite`);

            if (response.inviteUrl) {
                const popup = window.open(
                    response.inviteUrl,
                    'discord-invite',
                    'width=500,height=700,scrollbars=yes,resizable=yes'
                );

                if (popup) {
                    const checkClosed = setInterval(() => {
                        if (popup.closed) {
                            clearInterval(checkClosed);
                            this.checkBotInstallation(guildId);
                        }
                    }, 1000);
                } else {
                    this.showNotification('Popup bloquée - Vérifiez vos paramètres de navigateur', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Erreur invitation bot:', error);
            this.showNotification('Erreur lors de l\'invitation du bot', 'error');
        }
    }

    async checkBotInstallation(guildId) {
        try {
            console.log(`🔍 Vérification installation bot sur ${guildId}`);
            this.showNotification('Vérification de l\'installation...', 'info');

            // Attendre un peu pour que Discord traite l'invitation
            await new Promise(resolve => setTimeout(resolve, 3000));

            const response = await this.apiCall(`/guild/${guildId}/status`);

            if (response.bot_installed) {
                this.showNotification('Bot installé avec succès !', 'success');

                // Mettre à jour les informations du serveur
                const guild = this.guilds.find(g => g.id === guildId);
                if (guild) {
                    guild.bot_installed = true;
                    // Mettre à jour le nombre de membres si disponible
                    if (response.member_count) {
                        guild.approximate_member_count = response.member_count;
                    }
                }

                // Recharger l'affichage des serveurs
                this.renderServers();

                console.log(`✅ Bot installé et détecté sur ${guild?.name || guildId}`);
            } else {
                console.log(`❌ Bot non détecté sur ${guildId}:`, response.error || 'Raison inconnue');
                this.showNotification(
                    response.error === 'Bot non autorisé'
                        ? 'Bot non autorisé - Vérifiez les permissions'
                        : 'Bot non détecté - Réessayez dans quelques instants',
                    'warning'
                );
            }
        } catch (error) {
            console.error('❌ Erreur vérification installation:', error);
            this.showNotification('Erreur lors de la vérification', 'error');
        }
    }

    // ========== GESTION DE LA CONFIGURATION ==========

    async loadGuildConfiguration() {
        try {
            // Pour l'instant, on utilise une configuration par défaut
            // Plus tard, vous pourrez implémenter la sauvegarde en base de données
            this.configurations.set(this.selectedGuild.id, this.getDefaultConfig());
        } catch (error) {
            console.error('❌ Erreur chargement config:', error);
            this.configurations.set(this.selectedGuild.id, this.getDefaultConfig());
        }
    }

    getDefaultConfig() {
        return {
            features: {
                moderation: { enabled: false },
                music: { enabled: false },
                levels: { enabled: false },
                welcome: { enabled: false },
                economy: { enabled: false },
                polls: { enabled: false }
            },
            moderation: {
                auto_mod: false,
                filter_words: [],
                max_mentions: 5,
                spam_protection: true,
                log_channel: null
            },
            music: {
                default_volume: 50,
                max_queue_size: 100,
                auto_leave: true,
                voice_channel: null
            },
            levels: {
                xp_per_message: 15,
                level_up_channel: null,
                role_rewards: [],
                blacklisted_channels: []
            },
            logs: {
                moderation: { enabled: false, channel: null },
                messages: { enabled: false, channel: null },
                voice: { enabled: false, channel: null },
                members: { enabled: false, channel: null }
            }
        };
    }

    getCurrentConfig() {
        return this.configurations.get(this.selectedGuild?.id) || this.getDefaultConfig();
    }

    updateConfig(path, value) {
        const config = this.getCurrentConfig();
        const keys = path.split('.');
        let current = config;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        this.configurations.set(this.selectedGuild.id, config);
        this.markAsChanged(path);
    }

    markAsChanged(path) {
        this.pendingChanges.add(path);
        this.updateSaveButton();
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) {
            if (this.pendingChanges.size > 0) {
                saveBtn.classList.add('btn-warning');
                saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Modifications non sauvegardées';
            } else {
                saveBtn.classList.remove('btn-warning');
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Sauvegarder';
            }
        }
    }

    // ========== RENDU DES ONGLETS ==========

    renderFeaturesTab() {
        const featuresList = document.getElementById('featuresList');
        if (!featuresList) return;

        const config = this.getCurrentConfig();
        const features = [
            {
                id: 'moderation',
                name: 'Modération',
                description: 'Outils de modération automatique et manuelle',
                icon: 'fas fa-shield-alt'
            },
            {
                id: 'music',
                name: 'Musique',
                description: 'Lecteur musical avec support multi-plateformes',
                icon: 'fas fa-music'
            },
            {
                id: 'levels',
                name: 'Système de niveaux',
                description: 'XP, niveaux et récompenses pour les membres',
                icon: 'fas fa-trophy'
            },
            {
                id: 'welcome',
                name: 'Messages de bienvenue',
                description: 'Accueil automatique des nouveaux membres',
                icon: 'fas fa-hand-wave'
            },
            {
                id: 'economy',
                name: 'Économie',
                description: 'Système de monnaie virtuelle et boutique',
                icon: 'fas fa-coins'
            },
            {
                id: 'polls',
                name: 'Sondages',
                description: 'Création de sondages interactifs',
                icon: 'fas fa-poll'
            }
        ];

        featuresList.innerHTML = features.map(feature => `
            <div class="feature-item">
                <div class="feature-info">
                    <div class="feature-icon">
                        <i class="${feature.icon}"></i>
                    </div>
                    <div class="feature-details">
                        <h4>${feature.name}</h4>
                        <p>${feature.description}</p>
                    </div>
                </div>
                <div class="toggle-switch ${config.features[feature.id]?.enabled ? 'active' : ''}" 
                     onclick="configurator.toggleFeature('${feature.id}')">
                </div>
            </div>
        `).join('');
    }

    renderModerationTab() {
        const moderationConfig = document.getElementById('moderationConfig');
        if (!moderationConfig) return;

        const config = this.getCurrentConfig();
        const channels = this.selectedGuild?.channels?.filter(c => c.type === 0) || [];

        moderationConfig.innerHTML = `
            <div class="config-section">
                <h4><i class="fas fa-robot"></i> Auto-modération</h4>
                <div class="config-row">
                    <span class="config-label">Activer l'auto-modération</span>
                    <div class="toggle-switch ${config.moderation.auto_mod ? 'active' : ''}" 
                         onclick="configurator.updateConfig('moderation.auto_mod', ${!config.moderation.auto_mod})">
                    </div>
                </div>
                <div class="config-row">
                    <span class="config-label">Protection anti-spam</span>
                    <div class="toggle-switch ${config.moderation.spam_protection ? 'active' : ''}" 
                         onclick="configurator.updateConfig('moderation.spam_protection', ${!config.moderation.spam_protection})">
                    </div>
                </div>
                <div class="config-row">
                    <span class="config-label">Mentions maximales par message</span>
                    <input type="number" class="config-input" value="${config.moderation.max_mentions}"
                           onchange="configurator.updateConfig('moderation.max_mentions', parseInt(this.value))">
                </div>
                <div class="config-row">
                    <span class="config-label">Salon des logs de modération</span>
                    <select class="config-select" onchange="configurator.updateConfig('moderation.log_channel', this.value)">
                        <option value="">Aucun salon</option>
                        ${channels.map(channel => `
                            <option value="${channel.id}" ${config.moderation.log_channel === channel.id ? 'selected' : ''}>
                                #${channel.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="config-section">
                <h4><i class="fas fa-filter"></i> Filtrage de contenu</h4>
                <div class="config-row">
                    <span class="config-label">Mots filtrés (un par ligne)</span>
                    <textarea class="config-input" rows="4" placeholder="Entrez les mots à filtrer..."
                              onchange="configurator.updateConfig('moderation.filter_words', this.value.split('\\n').filter(w => w.trim()))">${config.moderation.filter_words.join('\n')}</textarea>
                </div>
            </div>
        `;
    }

    renderMusicTab() {
        const musicConfig = document.getElementById('musicConfig');
        if (!musicConfig) return;

        const config = this.getCurrentConfig();
        const voiceChannels = this.selectedGuild?.channels?.filter(c => c.type === 2) || [];

        musicConfig.innerHTML = `
            <div class="config-section">
                <h4><i class="fas fa-volume-up"></i> Paramètres audio</h4>
                <div class="config-row">
                    <span class="config-label">Volume par défaut (${config.music.default_volume}%)</span>
                    <input type="range" class="range-slider" min="1" max="100" value="${config.music.default_volume}"
                           onchange="configurator.updateConfig('music.default_volume', parseInt(this.value))">
                </div>
                <div class="config-row">
                    <span class="config-label">Taille maximale de la file d'attente</span>
                    <input type="number" class="config-input" value="${config.music.max_queue_size}" min="1" max="500"
                           onchange="configurator.updateConfig('music.max_queue_size', parseInt(this.value))">
                </div>
                <div class="config-row">
                    <span class="config-label">Quitter automatiquement si inactif</span>
                    <div class="toggle-switch ${config.music.auto_leave ? 'active' : ''}" 
                         onclick="configurator.updateConfig('music.auto_leave', ${!config.music.auto_leave})">
                    </div>
                </div>
            </div>
            
            <div class="config-section">
                <h4><i class="fas fa-headphones"></i> Salon vocal par défaut</h4>
                <div class="config-row">
                    <span class="config-label">Salon vocal</span>
                    <select class="config-select" onchange="configurator.updateConfig('music.voice_channel', this.value)">
                        <option value="">Aucun salon par défaut</option>
                        ${voiceChannels.map(channel => `
                            <option value="${channel.id}" ${config.music.voice_channel === channel.id ? 'selected' : ''}>
                                🔊 ${channel.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    renderLevelsTab() {
        const levelsConfig = document.getElementById('levelsConfig');
        if (!levelsConfig) return;

        const config = this.getCurrentConfig();
        const textChannels = this.selectedGuild?.channels?.filter(c => c.type === 0) || [];
        const roles = this.selectedGuild?.roles?.filter(r => r.name !== '@everyone') || [];

        levelsConfig.innerHTML = `
            <div class="config-section">
                <h4><i class="fas fa-star"></i> Paramètres XP</h4>
                <div class="config-row">
                    <span class="config-label">XP par message</span>
                    <input type="number" class="config-input" value="${config.levels.xp_per_message}" min="1" max="100"
                           onchange="configurator.updateConfig('levels.xp_per_message', parseInt(this.value))">
                </div>
                <div class="config-row">
                    <span class="config-label">Salon d'annonce des niveaux</span>
                    <select class="config-select" onchange="configurator.updateConfig('levels.level_up_channel', this.value)">
                        <option value="">Aucun salon</option>
                        ${textChannels.map(channel => `
                            <option value="${channel.id}" ${config.levels.level_up_channel === channel.id ? 'selected' : ''}>
                                #${channel.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
            
            <div class="config-section">
                <h4><i class="fas fa-gift"></i> Récompenses de rôles</h4>
                <div id="roleRewards">
                    ${this.renderRoleRewards(config.levels.role_rewards, roles)}
                </div>
                <button class="btn btn-outline" onclick="configurator.addRoleReward()">
                    <i class="fas fa-plus"></i> Ajouter une récompense
                </button>
            </div>
            
            <div class="config-section">
                <h4><i class="fas fa-ban"></i> Salons exclus</h4>
                <div class="config-row">
                    <span class="config-label">Salons où l'XP n'est pas gagné</span>
                    <select class="config-select" multiple size="5" onchange="configurator.updateBlacklistedChannels(this)">
                        ${textChannels.map(channel => `
                            <option value="${channel.id}" ${config.levels.blacklisted_channels.includes(channel.id) ? 'selected' : ''}>
                                #${channel.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `;
    }

    renderLogsTab() {
        const logsConfig = document.getElementById('logsConfig');
        if (!logsConfig) return;

        const config = this.getCurrentConfig();
        const textChannels = this.selectedGuild?.channels?.filter(c => c.type === 0) || [];

        const logTypes = [
            { id: 'moderation', name: 'Modération', description: 'Sanctions, avertissements, exclusions', icon: 'fas fa-shield-alt' },
            { id: 'messages', name: 'Messages', description: 'Suppressions, modifications de messages', icon: 'fas fa-comment' },
            { id: 'voice', name: 'Vocal', description: 'Connexions, déconnexions vocales', icon: 'fas fa-microphone' },
            { id: 'members', name: 'Membres', description: 'Arrivées, départs, changements', icon: 'fas fa-users' }
        ];

        logsConfig.innerHTML = logTypes.map(logType => `
            <div class="config-section">
                <h4><i class="${logType.icon}"></i> ${logType.name}</h4>
                <p class="config-label">${logType.description}</p>
                <div class="config-row">
                    <span class="config-label">Activer les logs ${logType.name.toLowerCase()}</span>
                    <div class="toggle-switch ${config.logs[logType.id]?.enabled ? 'active' : ''}" 
                         onclick="configurator.updateConfig('logs.${logType.id}.enabled', ${!config.logs[logType.id]?.enabled})">
                    </div>
                </div>
                <div class="config-row">
                    <span class="config-label">Salon de destination</span>
                    <select class="config-select" ${!config.logs[logType.id]?.enabled ? 'disabled' : ''}
                            onchange="configurator.updateConfig('logs.${logType.id}.channel', this.value)">
                        <option value="">Choisir un salon</option>
                        ${textChannels.map(channel => `
                            <option value="${channel.id}" ${config.logs[logType.id]?.channel === channel.id ? 'selected' : ''}>
                                #${channel.name}
                            </option>
                        `).join('')}
                    </select>
                </div>
            </div>
        `).join('');
    }

    // ========== FONCTIONS PREMIUM ==========

    renderPremiumTab() {
        console.log('🏆 Rendu de l\'onglet Premium');

        // Initialiser les boutons de paiement
        this.initPremiumButtons();

        // Initialiser la copie des commandes Premium
        this.initPremiumCommandCopy();

        // Vérifier le statut Premium
        this.checkPremiumStatus();
    }

    initPremiumButtons() {
        const stripeButton = document.getElementById('stripePurchase');
        const discordButton = document.getElementById('discordPurchase');

        if (stripeButton) {
            stripeButton.addEventListener('click', () => {
                this.handleStripePurchase();
            });
        }

        if (discordButton) {
            discordButton.addEventListener('click', () => {
                this.handleDiscordPurchase();
            });
        }

        console.log('✅ Boutons Premium initialisés');
    }

    async handleStripePurchase() {
        try {
            this.showLoading('Redirection vers Stripe...');

            // Simuler l'appel API pour obtenir l'URL de paiement Stripe
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.showNotification('💳 Redirection vers le paiement sécurisé Stripe', 'info', 3000);

            // Ici tu ajouteras l'intégration réelle avec Stripe
            // const response = await this.apiCall('/premium/stripe-checkout', 'POST', {
            //     guild_id: this.selectedGuild?.id,
            //     return_url: window.location.href
            // });
            //
            // if (response.checkout_url) {
            //     window.open(response.checkout_url, '_blank');
            // }

            setTimeout(() => {
                this.hideLoading();
                // Pour la démo, simuler l'activation Premium
                this.simulatePremiumActivation();
            }, 2000);

        } catch (error) {
            this.hideLoading();
            console.error('❌ Erreur Stripe:', error);
            this.showNotification('Erreur lors de la redirection vers Stripe', 'error');
        }
    }

    async handleDiscordPurchase() {
        try {
            this.showLoading('Génération de la commande Discord...');

            await new Promise(resolve => setTimeout(resolve, 1000));

            const guildName = this.selectedGuild?.name || 'votre serveur';
            const command = `/premium buy server:${this.selectedGuild?.id || 'ID_SERVEUR'}`;

            // Copier la commande dans le presse-papiers
            try {
                await navigator.clipboard.writeText(command);
                this.showNotification(`🤖 Commande copiée ! Utilisez-la dans ${guildName}`, 'success', 5000);
            } catch (clipboardError) {
                this.showNotification(`🤖 Utilisez cette commande dans ${guildName}: ${command}`, 'info', 8000);
            }

            this.hideLoading();

            // Afficher les instructions
            this.showPremiumInstructions(command);

        } catch (error) {
            this.hideLoading();
            console.error('❌ Erreur Discord:', error);
            this.showNotification('Erreur lors de la génération de la commande', 'error');
        }
    }

    showPremiumInstructions(command) {
        const instructionsHTML = `
            <div style="text-align: center; padding: 1rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fab fa-discord"></i> Achat via Discord
                </h4>
                <p style="margin-bottom: 1.5rem;">
                    Suivez ces étapes pour activer Premium via Discord :
                </p>
                <div style="text-align: left; background: var(--background); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>1.</strong> Allez dans votre serveur Discord
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>2.</strong> Tapez la commande suivante :
                    </div>
                    <code style="background: var(--surface); padding: 0.5rem; display: block; margin: 0.5rem 0; border-radius: 4px; color: var(--primary-color);">
                        ${command}
                    </code>
                    <div style="margin-bottom: 0.5rem;">
                        <strong>3.</strong> Suivez les instructions de paiement
                    </div>
                    <div>
                        <strong>4.</strong> Votre Premium sera activé automatiquement
                    </div>
                </div>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">
                    💡 Le configurateur détectera automatiquement votre achat Premium
                </p>
            </div>
        `;

        this.showModal('confirmModal', {
            title: 'Instructions d\'achat Premium',
            body: instructionsHTML,
            footer: `
                <button class="btn btn-secondary" onclick="configurator.hideModal()">
                    Fermer
                </button>
                <button class="btn btn-primary" onclick="configurator.refreshPremiumStatus()">
                    <i class="fas fa-refresh"></i>
                    Vérifier le statut
                </button>
            `
        });
    }

    initPremiumCommandCopy() {
        const premiumCommands = document.querySelectorAll('.premium-commands code');

        premiumCommands.forEach(code => {
            code.style.cursor = 'pointer';
            code.title = 'Cliquer pour copier (Premium requis)';

            code.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(code.textContent);

                    // Effet visuel spécial Premium
                    const originalBg = code.style.backgroundColor;
                    const originalColor = code.style.color;

                    code.style.backgroundColor = '#ffd700';
                    code.style.color = '#1a202c';
                    code.style.transform = 'scale(1.05)';

                    // Icône premium
                    const crownIcon = document.createElement('span');
                    crownIcon.innerHTML = ' 👑';
                    crownIcon.style.fontWeight = 'bold';
                    code.appendChild(crownIcon);

                    setTimeout(() => {
                        code.style.backgroundColor = originalBg;
                        code.style.color = originalColor;
                        code.style.transform = 'scale(1)';
                        if (crownIcon.parentNode) {
                            crownIcon.remove();
                        }
                    }, 1000);

                    this.showNotification('👑 Commande Premium copiée !', 'success', 3000);

                } catch (err) {
                    this.showNotification('❌ Erreur lors de la copie', 'error', 2000);
                }
            });

            // Effet hover spécial
            code.addEventListener('mouseenter', () => {
                code.style.background = 'rgba(255, 215, 0, 0.3)';
                code.style.borderColor = '#ffd700';
                code.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
            });

            code.addEventListener('mouseleave', () => {
                code.style.background = 'rgba(255, 215, 0, 0.1)';
                code.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                code.style.boxShadow = 'none';
            });
        });

        console.log('✅ Commandes Premium initialisées');
    }

    async checkPremiumStatus() {
        try {
            // Vérifier le statut Premium local d'abord
            const localPremium = localStorage.getItem('yakoPremiumStatus') === 'true';

            if (localPremium) {
                this.showPremiumStatus();
                return true;
            }

            // Si on a un serveur sélectionné, vérifier le statut Premium via API
            if (this.selectedGuild) {
                // const response = await this.apiCall(`/premium/status/${this.selectedGuild.id}`);
                // if (response.isPremium) {
                //     this.showPremiumStatus();
                //     return true;
                // }
            }

            return false;
        } catch (error) {
            console.error('❌ Erreur vérification Premium:', error);
            return false;
        }
    }

    showPremiumStatus() {
        // Ajouter un badge Premium à l'interface
        if (!document.querySelector('.premium-status')) {
            const premiumBadge = document.createElement('div');
            premiumBadge.className = 'premium-status';
            premiumBadge.innerHTML = `
                <div style="background: linear-gradient(135deg, #ffd700, #f59e0b); 
                            color: #1a202c; padding: 0.5rem 1rem; border-radius: 20px; 
                            font-weight: 700; font-size: 0.8rem; display: flex; 
                            align-items: center; gap: 0.5rem; cursor: pointer;"
                     title="Premium activé">
                    <i class="fas fa-crown"></i>
                    PREMIUM
                </div>
            `;

            // Ajouter un clic pour plus d'infos
            premiumBadge.addEventListener('click', () => {
                this.showPremiumInfo();
            });

            document.body.appendChild(premiumBadge);
        }

        // Modifier l'onglet Premium pour montrer qu'il est activé
        const premiumTab = document.querySelector('[data-tab="premium"]');
        if (premiumTab) {
            premiumTab.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            premiumTab.innerHTML = `
                <i class="fas fa-crown"></i>
                Premium ✓
            `;
        }
    }

    showPremiumInfo() {
        const premiumInfoHTML = `
            <div style="text-align: center; padding: 1rem;">
                <div style="background: linear-gradient(135deg, #ffd700, #f59e0b); 
                            width: 80px; height: 80px; border-radius: 50%; 
                            display: flex; align-items: center; justify-content: center; 
                            margin: 0 auto 1rem; color: #1a202c; font-size: 2rem;">
                    <i class="fas fa-crown"></i>
                </div>
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    🎉 Premium Activé !
                </h4>
                <p style="margin-bottom: 1.5rem;">
                    Vous avez accès à toutes les fonctionnalités Premium de YAKO
                </p>
                <div style="text-align: left; background: var(--background); padding: 1rem; border-radius: 8px;">
                    <div style="margin-bottom: 0.5rem;">
                        ✅ IA Conversationnelle avec ChatGPT
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        ✅ Économie Pro avec bourse virtuelle
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        ✅ Modération IA avancée
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        ✅ Analytics Pro et prédictions
                    </div>
                    <div style="margin-bottom: 0.5rem;">
                        ✅ Événements automatiques
                    </div>
                    <div>
                        ✅ Personnalisation ultime
                    </div>
                </div>
            </div>
        `;

        this.showModal('confirmModal', {
            title: 'Statut Premium',
            body: premiumInfoHTML,
            footer: `
                <button class="btn btn-secondary" onclick="configurator.hideModal()">
                    Fermer
                </button>
                <button class="btn btn-outline" onclick="configurator.managePremium()">
                    <i class="fas fa-cog"></i>
                    Gérer l'abonnement
                </button>
            `
        });
    }

    simulatePremiumActivation() {
        localStorage.setItem('yakoPremiumStatus', 'true');
        this.showNotification('🎉 Premium activé avec succès !', 'success', 5000);
        this.showPremiumStatus();

        // Mettre à jour l'onglet Premium
        this.renderPremiumTab();
    }

    async refreshPremiumStatus() {
        this.showLoading('Vérification du statut Premium...');

        try {
            // Simuler une vérification API
            await new Promise(resolve => setTimeout(resolve, 2000));

            const isPremium = await this.checkPremiumStatus();

            if (isPremium) {
                this.showNotification('✅ Premium détecté et activé !', 'success');
            } else {
                this.showNotification('❌ Premium non détecté', 'warning');
            }

        } catch (error) {
            this.showNotification('Erreur lors de la vérification', 'error');
        } finally {
            this.hideLoading();
            this.hideModal();
        }
    }

    managePremium() {
        const manageHTML = `
            <div style="text-align: center; padding: 1rem;">
                <h4 style="color: var(--primary-color); margin-bottom: 1rem;">
                    <i class="fas fa-cog"></i> Gestion Premium
                </h4>
                <p style="margin-bottom: 1.5rem;">
                    Options de gestion de votre abonnement Premium
                </p>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button class="btn btn-outline" onclick="configurator.viewPremiumUsage()" style="width: 100%;">
                        <i class="fas fa-chart-bar"></i>
                        Voir l'utilisation
                    </button>
                    <button class="btn btn-outline" onclick="configurator.downloadPremiumInvoice()" style="width: 100%;">
                        <i class="fas fa-file-invoice"></i>
                        Télécharger la facture
                    </button>
                    <button class="btn btn-outline" onclick="configurator.cancelPremium()" style="width: 100%; color: var(--error);">
                        <i class="fas fa-times"></i>
                        Annuler l'abonnement
                    </button>
                </div>
            </div>
        `;

        this.showModal('confirmModal', {
            title: 'Gestion Premium',
            body: manageHTML,
            footer: `
                <button class="btn btn-secondary" onclick="configurator.hideModal()">
                    Retour
                </button>
            `
        });
    }

    viewPremiumUsage() {
        this.showNotification('📊 Fonctionnalité en cours de développement', 'info');
    }

    downloadPremiumInvoice() {
        this.showNotification('📄 Fonctionnalité en cours de développement', 'info');
    }

    cancelPremium() {
        this.showConfirmModal(
            'Annuler Premium',
            'Êtes-vous sûr de vouloir annuler votre abonnement Premium ? Vous perdrez l\'accès aux fonctionnalités avancées.',
            () => {
                localStorage.removeItem('yakoPremiumStatus');
                document.querySelector('.premium-status')?.remove();
                this.showNotification('Premium annulé', 'info');
                location.reload();
            }
        );
    }

    renderRoleRewards(rewards, roles) {
        return rewards.map((reward, index) => `
            <div class="config-row">
                <span class="config-label">Niveau ${reward.level}</span>
                <select class="config-select" onchange="configurator.updateRoleReward(${index}, 'role', this.value)">
                    <option value="">Choisir un rôle</option>
                    ${roles.map(role => `
                        <option value="${role.id}" ${reward.role === role.id ? 'selected' : ''}>
                            @${role.name}
                        </option>
                    `).join('')}
                </select>
                <input type="number" class="config-input" placeholder="Niveau" value="${reward.level}"
                       onchange="configurator.updateRoleReward(${index}, 'level', parseInt(this.value))">
                <button class="btn btn-danger" onclick="configurator.removeRoleReward(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    // ========== ACTIONS DE CONFIGURATION ==========

    toggleFeature(featureId) {
        const config = this.getCurrentConfig();
        const currentValue = config.features[featureId]?.enabled || false;
        this.updateConfig(`features.${featureId}.enabled`, !currentValue);
        this.renderFeaturesTab();
    }

    addRoleReward() {
        const config = this.getCurrentConfig();
        if (!config.levels.role_rewards) config.levels.role_rewards = [];

        config.levels.role_rewards.push({ level: 1, role: '' });
        this.configurations.set(this.selectedGuild.id, config);
        this.markAsChanged('levels.role_rewards');
        this.renderLevelsTab();
    }

    updateRoleReward(index, field, value) {
        const config = this.getCurrentConfig();
        if (config.levels.role_rewards[index]) {
            config.levels.role_rewards[index][field] = value;
            this.configurations.set(this.selectedGuild.id, config);
            this.markAsChanged('levels.role_rewards');
        }
    }

    removeRoleReward(index) {
        const config = this.getCurrentConfig();
        config.levels.role_rewards.splice(index, 1);
        this.configurations.set(this.selectedGuild.id, config);
        this.markAsChanged('levels.role_rewards');
        this.renderLevelsTab();
    }

    updateBlacklistedChannels(select) {
        const selectedChannels = Array.from(select.selectedOptions).map(option => option.value);
        this.updateConfig('levels.blacklisted_channels', selectedChannels);
    }

    // ========== SAUVEGARDE ET RESET ==========

    async saveConfiguration() {
        if (!this.selectedGuild || this.pendingChanges.size === 0) return;

        try {
            this.showLoading('Sauvegarde en cours...');

            // Pour l'instant, on simule la sauvegarde
            await new Promise(resolve => setTimeout(resolve, 1000));

            this.pendingChanges.clear();
            this.updateSaveButton();

            this.showNotification('Configuration sauvegardée avec succès', 'success');
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde', 'error');
        } finally {
            this.hideLoading();
        }
    }

    resetConfiguration() {
        this.showConfirmModal(
            'Réinitialiser la configuration',
            'Êtes-vous sûr de vouloir remettre la configuration par défaut ? Toutes les modifications seront perdues.',
            () => {
                const defaultConfig = this.getDefaultConfig();
                this.configurations.set(this.selectedGuild.id, defaultConfig);
                this.pendingChanges.clear();
                this.updateSaveButton();
                this.renderCurrentTab();
                this.showNotification('Configuration réinitialisée', 'info');
            }
        );
    }

    previewConfiguration() {
        const config = this.getCurrentConfig();
        const previewContent = JSON.stringify(config, null, 2);

        this.showModal('inviteModal', {
            title: 'Aperçu de la configuration',
            body: `<pre style="background: var(--background); padding: 1rem; border-radius: 4px; overflow: auto; max-height: 400px;"><code>${this.escapeHtml(previewContent)}</code></pre>`,
            footer: '<button class="btn btn-secondary" onclick="configurator.hideModal()">Fermer</button>'
        });
    }

    // ========== GESTION DE L'INTERFACE ==========

    setupEventListeners() {
        document.getElementById('loginBtn')?.addEventListener('click', () => this.login());
        document.getElementById('ctaLogin')?.addEventListener('click', () => this.login());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        document.getElementById('backBtn')?.addEventListener('click', () => this.showServerSelection());

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        document.getElementById('saveBtn')?.addEventListener('click', () => this.saveConfiguration());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.resetConfiguration());
        document.getElementById('previewBtn')?.addEventListener('click', () => this.previewConfiguration());

        document.getElementById('closeInviteModal')?.addEventListener('click', () => this.hideModal());
        document.getElementById('cancelInvite')?.addEventListener('click', () => this.hideModal());
        document.getElementById('cancelConfirm')?.addEventListener('click', () => this.hideModal());

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.hideModal();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hideModal();
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveConfiguration();
            }
        });
    }

    updateAuthUI() {
        const navUser = document.getElementById('navUser');
        const loginBtn = document.getElementById('loginBtn');
        const userAvatar = document.getElementById('userAvatar');
        const username = document.getElementById('username');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        if (this.isAuthenticated && this.currentUser) {
            if (navUser) navUser.style.display = 'flex';
            if (loginBtn) loginBtn.style.display = 'none';

            const avatarUrl = this.currentUser.avatar
                ? `https://cdn.discordapp.com/avatars/${this.currentUser.id}/${this.currentUser.avatar}.png?size=128`
                : `https://cdn.discordapp.com/embed/avatars/${this.currentUser.discriminator % 5}.png`;

            if (userAvatar) userAvatar.style.backgroundImage = `url(${avatarUrl})`;
            if (username) username.textContent = this.currentUser.username;

            if (statusIndicator) statusIndicator.className = 'status-indicator online';
            if (statusText) statusText.textContent = 'En ligne';
        } else {
            if (navUser) navUser.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline-flex';

            if (statusIndicator) statusIndicator.className = 'status-indicator offline';
            if (statusText) statusText.textContent = 'Hors ligne';
        }
    }

    updateServerHeader() {
        if (!this.selectedGuild) return;

        const serverAvatar = document.getElementById('serverAvatar');
        const serverName = document.getElementById('serverName');
        const serverMembers = document.getElementById('serverMembers');
        const botStatus = document.getElementById('botStatus');

        const iconUrl = this.selectedGuild.icon
            ? `https://cdn.discordapp.com/icons/${this.selectedGuild.id}/${this.selectedGuild.icon}.png?size=128`
            : null;

        if (iconUrl) {
            serverAvatar.style.backgroundImage = `url(${iconUrl})`;
            serverAvatar.textContent = '';
        } else {
            serverAvatar.style.backgroundImage = 'none';
            serverAvatar.textContent = this.selectedGuild.name.charAt(0).toUpperCase();
        }

        serverName.textContent = this.selectedGuild.name;

        // Afficher le nombre de membres formaté
        const memberCount = this.selectedGuild.member_count || this.selectedGuild.approximate_member_count || 0;
        serverMembers.textContent = this.formatMemberCount(memberCount);

        // Mettre à jour le statut du bot
        if (this.selectedGuild.bot_installed) {
            botStatus.className = 'bot-status online';
            botStatus.innerHTML = '<i class="fas fa-circle"></i><span>Bot en ligne</span>';

            // Afficher des informations supplémentaires si disponibles
            if (this.selectedGuild.channels) {
                const textChannels = this.selectedGuild.text_channels?.length || this.selectedGuild.channels.filter(c => c.type === 0).length;
                const voiceChannels = this.selectedGuild.voice_channels?.length || this.selectedGuild.channels.filter(c => c.type === 2).length;
                console.log(`📊 Serveur ${this.selectedGuild.name}: ${textChannels} salons texte, ${voiceChannels} salons vocaux`);
            }
        } else {
            botStatus.className = 'bot-status offline';
            botStatus.innerHTML = '<i class="fas fa-circle"></i><span>Bot non installé</span>';
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        this.renderCurrentTab();
    }

    renderCurrentTab() {
        switch (this.currentTab) {
            case 'features':
                this.renderFeaturesTab();
                break;
            case 'moderation':
                this.renderModerationTab();
                break;
            case 'music':
                this.renderMusicTab();
                break;
            case 'levels':
                this.renderLevelsTab();
                break;
            case 'logs':
                this.renderLogsTab();
                break;
            case 'premium':
                this.renderPremiumTab();
                break;
        }
    }

    showWelcomePage() {
        console.log('📄 Affichage de la page d\'accueil');
        document.getElementById('welcomePage').style.display = 'block';
        document.getElementById('serverSelection').style.display = 'none';
        document.getElementById('serverConfig').style.display = 'none';
    }

    showServerSelection() {
        console.log('🏰 Affichage de la sélection de serveur');
        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('serverSelection').style.display = 'block';
        document.getElementById('serverConfig').style.display = 'none';
        this.renderServers();
    }

    showServerConfig() {
        console.log('⚙️ Affichage de la configuration serveur');
        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('serverSelection').style.display = 'none';
        document.getElementById('serverConfig').style.display = 'block';
    }

    // ========== MODALES ET NOTIFICATIONS ==========

    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (options.title) {
            const titleEl = modal.querySelector('.modal-header h3');
            if (titleEl) titleEl.textContent = options.title;
        }

        if (options.body) {
            const bodyEl = modal.querySelector('.modal-body');
            if (bodyEl) bodyEl.innerHTML = options.body;
        }

        if (options.footer) {
            const footerEl = modal.querySelector('.modal-footer');
            if (footerEl) footerEl.innerHTML = options.footer;
        }

        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
    }

    hideModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    showConfirmModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmModal');
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;

        const confirmBtn = document.getElementById('confirmAction');
        confirmBtn.onclick = () => {
            onConfirm();
            this.hideModal();
        };

        this.showModal('confirmModal');
    }

    showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${this.escapeHtml(message)}</div>
            </div>
        `;

        container.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('show'));

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    showLoading(message = 'Chargement...') {
        const overlay = document.getElementById('loadingOverlay');
        const text = document.getElementById('loadingText');

        if (overlay && text) {
            text.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    // ========== API ==========

    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        console.log(`🌐 API Call: ${method} ${url}`);

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            console.log(`📨 API Response (${response.status}):`, result);

            if (!response.ok) {
                throw new Error(result.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            return result;
        } catch (error) {
            console.error(`❌ Erreur API ${method} ${endpoint}:`, error);
            throw error;
        }
    }

    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('success') === 'true') {
            this.showNotification('Connexion Discord réussie !', 'success');
            window.history.replaceState({}, document.title, window.location.pathname);
            setTimeout(() => this.checkAuthStatus(), 1000);
        }

        if (urlParams.get('error')) {
            const error = urlParams.get('error');
            let message = 'Erreur de connexion Discord';

            switch (error) {
                case 'invalid_state':
                    message = 'État de sécurité invalide - Réessayez';
                    break;
                case 'no_code':
                    message = 'Code d\'autorisation manquant';
                    break;
                case 'invalid_grant':
                    message = 'Autorisation expirée - Reconnectez-vous';
                    break;
                case 'discord_oauth_error':
                    message = 'Erreur d\'autorisation Discord';
                    break;
                case 'auth_failed':
                    message = 'Échec de l\'authentification Discord';
                    break;
            }

            this.showNotification(message, 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // ========== UTILITAIRES ==========

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ========== INITIALISATION ==========

let configurator;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation du configurateur...');
    configurator = new BotConfigurator();
    window.configurator = configurator;

    // Exposer les fonctions Premium pour les tests
    window.yakoPremium = {
        simulate: () => configurator.simulatePremiumActivation(),
        check: () => configurator.checkPremiumStatus(),
        refresh: () => configurator.refreshPremiumStatus()
    };
});

window.addEventListener('error', (e) => {
    console.error('❌ Erreur globale:', e.error);
    if (configurator) {
        configurator.showNotification('Une erreur inattendue s\'est produite', 'error');
    }
});

window.addEventListener('online', () => {
    if (configurator && !configurator.isAuthenticated) {
        configurator.checkAuthStatus();
    }
});

window.addEventListener('offline', () => {
    if (configurator) {
        configurator.showNotification('Connexion internet perdue', 'warning');
    }
});

window.addEventListener('beforeunload', (e) => {
    if (configurator && configurator.pendingChanges.size > 0) {
        e.preventDefault();
        e.returnValue = 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?';
    }
});