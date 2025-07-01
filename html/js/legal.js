document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector(".nav-menu");
    const navItems = document.querySelectorAll(".legal-nav-item");
    const sections = document.querySelectorAll(".legal-section");

    // Navbar scroll effect
    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
    });

    // Toggle menu mobile
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    // Navigation entre les sections
    navItems.forEach((item, index) => {
        item.addEventListener("click", (e) => {
            e.preventDefault();

            // Changer onglet actif
            navItems.forEach(el => el.classList.remove("active"));
            item.classList.add("active");

            // Afficher la bonne section
            sections.forEach(s => s.classList.remove("active"));
            if (sections[index]) {
                sections[index].classList.add("active");

                // Scroll vers le haut de la section avec un petit offset
                window.scrollTo({
                    top: sections[index].offsetTop - 100,
                    behavior: "smooth"
                });
            }
        });
    });

    // Section par défaut
    if (sections.length > 0) {
        sections[0].classList.add("active");
        navItems[0].classList.add("active");
    }
});
