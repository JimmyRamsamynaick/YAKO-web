const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration Discord OAuth2
const DISCORD_CONFIG = {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    redirectUri: process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/discord/callback`,
    scope: 'identify guilds',
    discordApiUrl: 'https://discord.com/api/v10',
    botToken: process.env.DISCORD_BOT_TOKEN
};

// Vérification de la configuration au démarrage
console.log('🔧 Vérification de la configuration Discord...');
console.log('Client ID:', DISCORD_CONFIG.clientId ? '✅ Configuré' : '❌ Manquant');
console.log('Client Secret:', DISCORD_CONFIG.clientSecret ? '✅ Configuré' : '❌ Manquant');
console.log('Bot Token:', DISCORD_CONFIG.botToken ? '✅ Configuré' : '❌ Manquant');
console.log('Redirect URI:', DISCORD_CONFIG.redirectUri);

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || `http://localhost:${PORT}`,
    credentials: true
}));

app.use(express.json());
app.use(express.static('html'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'yako-secret-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// ========== UTILITAIRES ==========

function hasAdminPermissions(permissions) {
    const permissionsInt = parseInt(permissions);
    return (permissionsInt & 0x8) === 0x8 || (permissionsInt & 0x20) === 0x20;
}

function getDiscordHeaders(token, isBot = false) {
    return {
        'Authorization': isBot ? `Bot ${token}` : `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// ========== ROUTES D'AUTHENTIFICATION ==========

app.get('/auth/discord', (req, res) => {
    console.log('🔐 Tentative de connexion Discord...');

    if (!DISCORD_CONFIG.clientId) {
        console.error('❌ Client ID Discord manquant');
        return res.json({
            success: false,
            error: 'Configuration Discord manquante - Client ID requis',
            authUrl: null
        });
    }

    if (!DISCORD_CONFIG.clientSecret) {
        console.error('❌ Client Secret Discord manquant');
        return res.json({
            success: false,
            error: 'Configuration Discord manquante - Client Secret requis',
            authUrl: null
        });
    }

    try {
        const state = Math.random().toString(36).substring(2);
        req.session.oauthState = state;

        const authUrl = `https://discord.com/api/oauth2/authorize?` +
            `client_id=${DISCORD_CONFIG.clientId}&` +
            `redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(DISCORD_CONFIG.scope)}&` +
            `state=${state}`;

        console.log('✅ URL d\'authentification générée');
        res.json({ success: true, authUrl });

    } catch (error) {
        console.error('❌ Erreur génération URL auth:', error);
        res.json({
            success: false,
            error: 'Erreur lors de la génération de l\'URL d\'authentification'
        });
    }
});

app.get('/auth/discord/callback', async (req, res) => {
    const { code, state, error } = req.query;

    console.log('🔄 Callback Discord reçu:', { code: !!code, state: !!state, error });

    if (error) {
        console.error('❌ Erreur OAuth Discord:', error);
        return res.redirect('/?error=discord_oauth_error');
    }

    if (!state || state !== req.session.oauthState) {
        console.error('❌ État OAuth invalide');
        return res.redirect('/?error=invalid_state');
    }

    if (!code) {
        console.error('❌ Code d\'autorisation manquant');
        return res.redirect('/?error=no_code');
    }

    try {
        console.log('🔄 Échange du code Discord...');

        // Échange du code contre un token
        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CONFIG.clientId,
                client_secret: DISCORD_CONFIG.clientSecret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_CONFIG.redirectUri
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const { access_token } = tokenResponse.data;
        console.log('✅ Token d\'accès obtenu');

        // Récupération des informations utilisateur
        const userResponse = await axios.get(`${DISCORD_CONFIG.discordApiUrl}/users/@me`, {
            headers: getDiscordHeaders(access_token)
        });

        console.log(`👤 Utilisateur connecté: ${userResponse.data.username}#${userResponse.data.discriminator}`);

        // Récupération des serveurs avec paramètre with_counts pour avoir le nombre de membres
        const guildsResponse = await axios.get(`${DISCORD_CONFIG.discordApiUrl}/users/@me/guilds?with_counts=true`, {
            headers: getDiscordHeaders(access_token)
        });

        console.log(`🏰 ${guildsResponse.data.length} serveur(s) trouvé(s)`);

        // Filtrer les serveurs avec permissions admin et enrichir les données
        const adminGuilds = [];

        for (const guild of guildsResponse.data) {
            const hasAdmin = hasAdminPermissions(guild.permissions);
            console.log(`  - ${guild.name}: ${hasAdmin ? 'Admin ✅' : 'Pas admin ❌'} (${guild.approximate_member_count || 0} membres)`);

            if (hasAdmin) {
                // Ajouter les informations de base
                adminGuilds.push({
                    ...guild,
                    approximate_member_count: guild.approximate_member_count || 0,
                    bot_installed: false // Sera vérifié plus tard
                });
            }
        }

        console.log(`✅ ${adminGuilds.length} serveur(s) avec permissions admin`);

        // Sauvegarde en session
        req.session.user = userResponse.data;
        req.session.accessToken = access_token;
        req.session.adminGuilds = adminGuilds;

        delete req.session.oauthState;

        console.log('✅ Session utilisateur créée');
        res.redirect('/?success=true');

    } catch (error) {
        console.error('❌ Erreur OAuth Discord:', error.response?.data || error.message);

        if (error.response?.status === 400) {
            return res.redirect('/?error=invalid_grant');
        }

        res.redirect('/?error=auth_failed');
    }
});

// ========== ROUTES API ==========

app.get('/api/auth/status', async (req, res) => {
    console.log('📊 Vérification du statut d\'authentification...');

    if (req.session.user) {
        console.log(`✅ Utilisateur connecté: ${req.session.user.username}`);

        // Enrichir les guilds avec les informations détaillées
        const enrichedGuilds = await Promise.all(
            (req.session.adminGuilds || []).map(async (guild) => {
                try {
                    // Vérifier si le bot est installé
                    let botInstalled = false;
                    let memberCount = guild.approximate_member_count || 0;

                    if (DISCORD_CONFIG.botToken) {
                        try {
                            const guildResponse = await axios.get(
                                `${DISCORD_CONFIG.discordApiUrl}/guilds/${guild.id}`,
                                { headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true) }
                            );

                            botInstalled = true;
                            memberCount = guildResponse.data.approximate_member_count || guildResponse.data.member_count || memberCount;

                            console.log(`✅ Bot détecté sur ${guild.name} (${memberCount} membres)`);
                        } catch (error) {
                            if (error.response?.status === 403 || error.response?.status === 404) {
                                console.log(`❌ Bot non détecté sur ${guild.name}`);
                                botInstalled = false;
                            } else {
                                console.warn(`⚠️ Erreur vérification bot sur ${guild.name}:`, error.response?.status);
                                botInstalled = false;
                            }
                        }
                    }

                    return {
                        ...guild,
                        bot_installed: botInstalled,
                        approximate_member_count: memberCount
                    };
                } catch (error) {
                    console.error(`❌ Erreur enrichissement guild ${guild.name}:`, error);
                    return {
                        ...guild,
                        bot_installed: false,
                        approximate_member_count: guild.approximate_member_count || 0
                    };
                }
            })
        );

        res.json({
            success: true,
            user: req.session.user,
            guilds: enrichedGuilds
        });
    } else {
        console.log('❌ Aucun utilisateur connecté');
        res.json({
            success: false,
            message: 'Non authentifié'
        });
    }
});

app.get('/guild/:guildId', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const { guildId } = req.params;
        console.log(`🏰 Récupération des données détaillées du serveur ${guildId}...`);

        const hasAccess = req.session.adminGuilds?.some(guild => guild.id === guildId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Accès refusé à ce serveur' });
        }

        if (!DISCORD_CONFIG.botToken) {
            console.warn('⚠️ Bot token non configuré, données limitées');
            return res.json({
                error: 'Bot token non configuré',
                channels: [],
                roles: [],
                member_count: 0,
                bot_installed: false
            });
        }

        // Récupérer les informations du serveur, canaux et rôles
        const [guildResponse, channelsResponse, rolesResponse] = await Promise.allSettled([
            axios.get(`${DISCORD_CONFIG.discordApiUrl}/guilds/${guildId}`, {
                headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true)
            }),
            axios.get(`${DISCORD_CONFIG.discordApiUrl}/guilds/${guildId}/channels`, {
                headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true)
            }),
            axios.get(`${DISCORD_CONFIG.discordApiUrl}/guilds/${guildId}/roles`, {
                headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true)
            })
        ]);

        // Vérifier si le bot est installé
        const botInstalled = guildResponse.status === 'fulfilled';
        let guildData = null;
        let memberCount = 0;

        if (botInstalled) {
            guildData = guildResponse.value.data;
            memberCount = guildData.approximate_member_count || guildData.member_count || 0;
            console.log(`✅ Bot installé sur ${guildData.name} (${memberCount} membres)`);
        } else {
            console.log(`❌ Bot non installé sur guild ${guildId}`);
        }

        const channels = channelsResponse.status === 'fulfilled' ? channelsResponse.value.data : [];
        const roles = rolesResponse.status === 'fulfilled' ? rolesResponse.value.data : [];

        // Filtrer et trier les canaux
        const textChannels = channels.filter(c => c.type === 0).sort((a, b) => a.position - b.position);
        const voiceChannels = channels.filter(c => c.type === 2).sort((a, b) => a.position - b.position);

        // Filtrer les rôles (exclure @everyone)
        const filteredRoles = roles.filter(r => r.name !== '@everyone').sort((a, b) => b.position - a.position);

        res.json({
            bot_installed: botInstalled,
            guild: guildData,
            member_count: memberCount,
            channels: [...textChannels, ...voiceChannels],
            text_channels: textChannels,
            voice_channels: voiceChannels,
            roles: filteredRoles,
            total_channels: channels.length,
            total_roles: roles.length
        });

    } catch (error) {
        console.error('❌ Erreur récupération serveur:', error.response?.data || error.message);

        // Retourner des informations même en cas d'erreur
        res.json({
            error: 'Erreur lors de la récupération des données du serveur',
            details: error.response?.status,
            bot_installed: false,
            channels: [],
            roles: [],
            member_count: 0
        });
    }
});

app.get('/guild/:guildId/invite', async (req, res) => {
    const { guildId } = req.params;

    if (!DISCORD_CONFIG.clientId) {
        return res.status(503).json({ error: 'Configuration Discord manquante' });
    }

    const permissions = '8'; // Permissions d'administrateur
    const inviteUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${DISCORD_CONFIG.clientId}&` +
        `permissions=${permissions}&` +
        `guild_id=${guildId}&` +
        `response_type=code&` +
        `scope=bot%20applications.commands`;

    res.json({ inviteUrl });
});

app.get('/guild/:guildId/status', async (req, res) => {
    const { guildId } = req.params;

    try {
        if (!DISCORD_CONFIG.botToken) {
            return res.json({
                bot_installed: false,
                error: 'Bot token non configuré',
                member_count: 0
            });
        }

        console.log(`🔍 Vérification statut bot sur guild ${guildId}...`);

        const response = await axios.get(
            `${DISCORD_CONFIG.discordApiUrl}/guilds/${guildId}`,
            { headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true) }
        );

        console.log(`✅ Bot installé sur guild ${guildId}`);

        res.json({
            bot_installed: true,
            guild: response.data,
            member_count: response.data.approximate_member_count || response.data.member_count || 0
        });

    } catch (error) {
        if (error.response?.status === 403) {
            console.log(`❌ Bot non autorisé sur guild ${guildId} (403 Forbidden)`);
            res.json({ bot_installed: false, error: 'Bot non autorisé' });
        } else if (error.response?.status === 404) {
            console.log(`❌ Guild ${guildId} non trouvé ou bot non membre (404 Not Found)`);
            res.json({ bot_installed: false, error: 'Guild non trouvé ou bot non membre' });
        } else {
            console.error('❌ Erreur vérification bot:', error.response?.data || error.message);
            res.json({
                bot_installed: false,
                error: 'Impossible de vérifier',
                details: error.response?.status
            });
        }
    }
});

app.post('/auth/logout', (req, res) => {
    console.log('🚪 Déconnexion utilisateur...');
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erreur déconnexion:', err);
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        console.log('✅ Déconnexion réussie');
        res.json({ success: true });
    });
});

// ========== ROUTES STATIQUES ==========

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'configurateur.html'));
});

// ========== GESTION DES ERREURS ==========

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err.stack);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// ========== DÉMARRAGE DU SERVEUR ==========

app.listen(PORT, () => {
    console.log(`
🚀 Serveur YAKO Configurateur démarré !

📱 URL: http://localhost:${PORT}
🔐 Discord OAuth: http://localhost:${PORT}/auth/discord
🛠️ API Status: http://localhost:${PORT}/api/auth/status

${!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.clientSecret ?
        `⚠️  CONFIGURATION REQUISE:
📝 Créez un fichier .env avec vos clés Discord
🔗 Guide: https://discord.com/developers/applications
` : '✅ Configuration Discord OK'}

🔧 Debug activé - Consultez la console pour les logs détaillés
    `);
});

module.exports = app;