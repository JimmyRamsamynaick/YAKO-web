// server.js - Serveur Node.js pour l'authentification Discord
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

// Vérifier les variables d'environnement
if (!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.clientSecret) {
    console.error('❌ Variables Discord manquantes ! Vérifiez votre fichier .env');
    process.exit(1);
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || `http://localhost:${PORT}`,
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

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

// Vérifier si l'utilisateur a les permissions d'admin sur un serveur
function hasAdminPermissions(permissions) {
    const permissionsInt = parseInt(permissions);
    // ADMINISTRATOR (0x8) ou MANAGE_GUILD (0x20)
    return (permissionsInt & 0x8) === 0x8 || (permissionsInt & 0x20) === 0x20;
}

// Headers pour les appels à l'API Discord
function getDiscordHeaders(token, isBot = false) {
    return {
        'Authorization': isBot ? `Bot ${token}` : `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// ========== ROUTES D'AUTHENTIFICATION ==========

// Générer l'URL d'authentification Discord
app.get('/auth/discord', (req, res) => {
    const state = Math.random().toString(36).substring(2);
    req.session.oauthState = state;

    const authUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${DISCORD_CONFIG.clientId}&` +
        `redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(DISCORD_CONFIG.scope)}&` +
        `state=${state}`;

    res.json({ authUrl });
});

// Callback Discord OAuth2
app.get('/auth/discord/callback', async (req, res) => {
    const { code, state } = req.query;

    // Vérifier le state pour la sécurité
    if (!state || state !== req.session.oauthState) {
        return res.redirect('/?error=invalid_state');
    }

    if (!code) {
        return res.redirect('/?error=no_code');
    }

    try {
        console.log('🔄 Échange du code Discord...');

        // Échanger le code contre un token d'accès
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

        const { access_token, token_type, refresh_token } = tokenResponse.data;
        console.log('✅ Token d\'accès obtenu');

        // Récupérer les informations utilisateur
        const userResponse = await axios.get(`${DISCORD_CONFIG.discordApiUrl}/users/@me`, {
            headers: getDiscordHeaders(access_token)
        });

        console.log(`👤 Utilisateur connecté: ${userResponse.data.username}#${userResponse.data.discriminator}`);

        // Récupérer les serveurs de l'utilisateur
        const guildsResponse = await axios.get(`${DISCORD_CONFIG.discordApiUrl}/users/@me/guilds`, {
            headers: getDiscordHeaders(access_token)
        });

        // Filtrer les serveurs où l'utilisateur est admin
        const adminGuilds = guildsResponse.data.filter(guild =>
            hasAdminPermissions(guild.permissions)
        );

        console.log(`🏰 ${adminGuilds.length} serveur(s) avec permissions admin trouvé(s)`);

        // Enrichir les données des serveurs avec les informations du bot
        const enrichedGuilds = await Promise.all(
            adminGuilds.map(async (guild) => {
                try {
                    // Vérifier si le bot est présent sur ce serveur
                    const botGuildResponse = await axios.get(
                        `${DISCORD_CONFIG.discordApiUrl}/guilds/${guild.id}`,
                        { headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true) }
                    );

                    return {
                        ...guild,
                        yakoInstalled: true,
                        memberCount: botGuildResponse.data.approximate_member_count
                    };
                } catch (error) {
                    // Le bot n'est pas sur ce serveur
                    return {
                        ...guild,
                        yakoInstalled: false,
                        memberCount: guild.approximate_member_count || 0
                    };
                }
            })
        );

        // Sauvegarder en session
        req.session.user = userResponse.data;
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;
        req.session.adminGuilds = enrichedGuilds;

        // Supprimer le state utilisé
        delete req.session.oauthState;

        // Rediriger vers le frontend avec succès
        res.redirect('/?success=true');

    } catch (error) {
        console.error('❌ Erreur OAuth Discord:', error.response?.data || error.message);
        res.redirect('/?error=auth_failed');
    }
});

// ========== ROUTES API ==========

// Vérifier l'état de connexion
app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({
            isConnected: true,
            user: req.session.user,
            guilds: req.session.adminGuilds || []
        });
    } else {
        res.json({ isConnected: false });
    }
});

// Récupérer les détails d'un serveur spécifique
app.get('/api/guild/:guildId', async (req, res) => {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'Non authentifié' });
    }

    try {
        const { guildId } = req.params;

        // Vérifier que l'utilisateur a accès à ce serveur
        const hasAccess = req.session.adminGuilds?.some(guild => guild.id === guildId);
        if (!hasAccess) {
            return res.status(403).json({ error: 'Accès refusé à ce serveur' });
        }

        console.log(`🔍 Récupération des détails pour le serveur ${guildId}`);

        // Récupérer les détails du serveur via le bot
        const [guildResponse, channelsResponse, rolesResponse] = await Promise.all([
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

        res.json({
            guild: guildResponse.data,
            channels: channelsResponse.data,
            roles: rolesResponse.data
        });

    } catch (error) {
        console.error('❌ Erreur récupération serveur:', error.response?.data || error.message);

        if (error.response?.status === 403) {
            res.status(403).json({
                error: 'Le bot YAKO n\'est pas présent sur ce serveur ou n\'a pas les permissions nécessaires'
            });
        } else {
            res.status(500).json({ error: 'Erreur lors de la récupération des données du serveur' });
        }
    }
});

// Vérifier si YAKO est présent sur un serveur
app.get('/api/guild/:guildId/yako-status', async (req, res) => {
    try {
        const { guildId } = req.params;

        // Vérifier via l'API Bot
        const response = await axios.get(
            `${DISCORD_CONFIG.discordApiUrl}/guilds/${guildId}`,
            { headers: getDiscordHeaders(DISCORD_CONFIG.botToken, true) }
        );

        res.json({
            yakoInstalled: true,
            guildData: response.data
        });

    } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 404) {
            res.json({ yakoInstalled: false });
        } else {
            console.error('❌ Erreur vérification YAKO:', error.response?.data || error.message);
            res.json({ yakoInstalled: false, error: 'Impossible de vérifier' });
        }
    }
});

// Inviter le bot sur un serveur
app.post('/api/guild/:guildId/invite-bot', async (req, res) => {
    const { guildId } = req.params;

    // Générer le lien d'invitation
    const permissions = '8'; // Permissions administrateur (à ajuster selon vos besoins)
    const inviteUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${DISCORD_CONFIG.clientId}&` +
        `permissions=${permissions}&` +
        `guild_id=${guildId}&` +
        `response_type=code&` +
        `scope=bot%20applications.commands`;

    res.json({ inviteUrl });
});

// Déconnexion
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Erreur déconnexion:', err);
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.json({ success: true });
    });
});

// ========== ROUTES STATIQUES ==========

// Servir les fichiers statiques
app.use(express.static('.'));

// Route principale pour le configurateur
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'configurateur.html'));
});

// Redirection pour compatibilité
app.get('/configurator', (req, res) => {
    res.redirect('/');
});

// ========== GESTION DES ERREURS ==========

app.use((err, req, res, next) => {
    console.error('❌ Erreur serveur:', err.stack);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

// ========== DÉMARRAGE DU SERVEUR ==========

app.listen(PORT, () => {
    console.log(`
🚀 Serveur YAKO Configurateur démarré !

📱 URL: http://localhost:${PORT}
🔐 Discord OAuth: http://localhost:${PORT}/auth/discord
🛠️ API Status: http://localhost:${PORT}/api/auth/status

${!DISCORD_CONFIG.clientId || !DISCORD_CONFIG.clientSecret ?
        `⚠️  Configuration requise:
📝 Créez un fichier .env avec:
   DISCORD_CLIENT_ID=votre_client_id
   DISCORD_CLIENT_SECRET=votre_client_secret
   DISCORD_BOT_TOKEN=votre_bot_token
   DISCORD_REDIRECT_URI=http://localhost:${PORT}/auth/discord/callback
   SESSION_SECRET=votre_session_secret
` : '✅ Configuration Discord OK'}
    `);
});

module.exports = app;