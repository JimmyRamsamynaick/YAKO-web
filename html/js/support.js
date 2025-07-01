// Menu hamburger
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Fermer menu au clic sur un lien
document.querySelectorAll('.nav-link').forEach(link =>
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    })
);

// Navbar sticky effet ombre
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// FAQ Toggle
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Fermer toutes les autres FAQ
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Ouvrir/fermer la FAQ cliquée
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Message de confirmation après envoi du formulaire
const form = document.querySelector('form[action*="formspree"]');
if (form) {
    form.addEventListener('submit', function() {
        setTimeout(() => {
            alert('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
        }, 100);
    });
}