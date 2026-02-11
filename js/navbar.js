document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("navToggle");
  const drawer = document.getElementById("navDrawer");
  const backdrop = document.getElementById("navBackdrop");

  const openMenu = () => {
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
  };

  toggle.addEventListener("click", () => {
    document.body.classList.contains("nav-open") ? closeMenu() : openMenu();
  });

  backdrop.addEventListener("click", closeMenu);

  // Close the menu when a link is clicked and scroll to the section
  drawer.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href");
      const target = document.querySelector(id);

      // Close the menu after click
      closeMenu();

      if (!target) return;

      // Smooth scroll to the section
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
});