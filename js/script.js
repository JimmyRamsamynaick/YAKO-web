document.addEventListener("DOMContentLoaded", () => {
    // Sélectionne le menu burger et le menu principal
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");

    // Quand on clique sur le burger, on toggle le menu
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Quand on clique sur un lien, on referme le menu
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });

    // Effet ombré sur la navbar quand on scroll
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
    });

    // (Optionnel) Animation d'apparition si tu utilises .animate
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate");
            }
        });
    });

    document.querySelectorAll(".animate").forEach(el => observer.observe(el));
});
