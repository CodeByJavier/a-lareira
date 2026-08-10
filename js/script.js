const menuToggle = document.querySelector(".navbar__toggle");
const menu = document.querySelector(".navbar__menu");

menuToggle.addEventListener("click", () => {

    menu.classList.toggle("navbar__menu--open");

    const isOpen = menu.classList.contains("navbar__menu--open");

    menuToggle.textContent = isOpen ? "✕" : "☰";

    menuToggle.setAttribute("aria-expanded", isOpen);

});

const menuLinks = document.querySelectorAll(".navbar__menu a");

menuLinks.forEach((link) => {

    link.addEventListener("click", () => {

        menu.classList.remove("navbar__menu--open");

        menuToggle.textContent = "☰";

        menuToggle.setAttribute("aria-expanded", "false");

    });

});