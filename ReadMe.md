# 🚀 YAKO – Bot Discord Administrateur Ultime

<div align="center"> 

[![Licence MIT](https://img.shields.io/badge/Licence-MIT-green.svg)](LICENSE) [![Invite YAKO](https://img.shields.io/badge/Inviter%20YAKO-Discord-5865F2?logo=discord)](https://discord.com/oauth2/authorize?client_id=1141863040795545610&permissions=8&integration_type=0&scope=bot) [![Support sur Discord](https://img.shields.io/badge/Support-Discord-7289DA?logo=discord)](https://discord.gg/UTrYfA3n58)

</div>
YAKO est le bot d’administration Discord conçu pour vous offrir **puissance**, **simplicité** et **flexibilité**. Que vous soyez un petit serveur de jeu ou une grande communauté, YAKO met à votre disposition des outils de modération avancés, une gestion de rôles fine et des statistiques claires.

---

## 📖 Table des matières

- [🔍 Démo en ligne](#-démo-en-ligne)
- [🛠️ Technologies](#️-technologies)
- [✨ Fonctionnalités clés](#-fonctionnalités-clés)
- [📂 Structure du projet](#-structure-du-projet)
- [💻 Installation & Usage](#-installation--usage)
- [⚙️ Personnalisation & Configuration](#️-personnalisation--configuration)
- [📜 Commandes principales](#-commandes-principales)
- [🆘 Support & Contribution](#-support--contribution)
- [⚖️ Licence](#️-licence)

---

## 🔍 Démo en ligne

> 🌐  https://jimmyramsamynaick.github.io/YAKO-web/index.html
>
> *Découvrez immédiatement le design animé, le menu sticky, le mockup Discord et les CTA intégrés.*

---

## 🛠️ Technologies

- **HTML5**
- **CSS3** avec Custom Properties pour un theming facile
- **JavaScript Vanilla** (ES6+)
- **Font Awesome** pour les icônes
- **Google Fonts (Inter)**
- **Git & GitHub** pour le versioning
- **Navigateur moderne** (Chrome, Firefox, Edge, Safari)

---

## ✨ Fonctionnalités clés

1. 🎨 **Palette de couleurs modulable**
    - Thème sombre par défaut via `:root { … }` dans `style.css`.
    - Variables CSS pour changer le branding en quelques secondes.

2. 📌 **Navigation sticky & responsive**
    - Menu fixe en haut, effet blur & ombre au scroll.
    - Menu hamburger animé pour mobile.

3. 🌈 **Hero section immersive**
    - Fond radial + formes flottantes animées (`@keyframes float`).
    - Titre gradient clip, sous-titre, stats dynamiques.

4. 🖥️ **Mockup Discord intégré**
    - Aperçu réaliste d’une conversation bot/utilisateur.
    - Styles monospaces, embeds, tags “BOT”.

5. ✨ **Animations au scroll**
    - Intersection Observer pour fade-in & slide-up sur les cards.

6. 🔗 **Boutons CTA optimisés**
    - Gradient, hover transform & ombre, invitation instantanée.

7. 🏗️ **Structure claire & modulable**
    - Séparation HTML / CSS / JS.
    - Classes prêtes pour étendre sections “Features”, “Commands”, “Support”, “Legal”.

---

## 📂 Structure du projet

```bash
├── index.html          # Page principale (landing page)
├── css/
│   └── style.css       # Variables + styles globaux et composants
├── js/
│   └── script.js       # Menu hamburger, scroll effects, clipboard
├── LICENSE             # Licence open-source MIT
└── README.md           # Documentation projet
```

```bash
💻 Installation & Usage
Cloner le dépôt
bash
git clone https://github.com/votre-utilisateur/yako-landing.git
cd yako-landing
Ouvrir la page
Double-cliquez sur index.html
Ou lancez un server local (Live Server, python -m http.server, etc.)
Tester les fonctionnalités
Scrollez pour voir le navbar sticky & les animations
Cliquez sur le hamburger en mobile
Invitez YAKO via le lien “Inviter YAKO”

⚙️ Personnalisation & Configuration
Thème Modifiez les couleurs globales dans css/style.css sous :root { … }.
Sections Ajoutez/retirez les <section id="…"> pour “Features”, “Commands”, “Support”, “Legal”.
Mockup Discord Ajustez .discord-mockup pour simuler d’autres commandes, embeds, avatars.
Scripts
copyToClipboard(text) → fonction de copie vers le presse-papier
Intersection Observer → threshold modifiable
Navbar scroll threshold dans script.js
Fonts & Icons Changez la source Google Fonts ou Font Awesome selon vos préférences. 

📜 Commandes principales
Exemples de commandes disponibles sur YAKO :
Commande	Description
/ban <user>	Bannir un membre avec logs automatiques
/kick <user>	Expulser un membre
/mute <user>	Muet temporaire
/roles	Gérer les rôles via réactions
/stats	Afficher les statistiques du serveur
/config	Accéder au panneau de configuration rapide
```
Pour la liste complète, visitez la section Commandes de la page. \
🆘 Support & Contribution \
💬 Support Discord : Rejoignez notre serveur \
🐞 Bugs & Issues : Ouvrez une issue sur GitHub \
🤝 Contribuer : Forkez le repo, créez une branche, faites un PR \
Merci aux contributeurs pour leur temps et leurs idées ! \
⚖️ Licence \
Ce projet est distribué sous la licence MIT. Voir le fichier LICENSE pour plus de détails. \
Développé avec ❤️ par la communauté YAKO – 2025