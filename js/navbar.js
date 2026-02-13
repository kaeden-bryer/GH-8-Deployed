document.addEventListener("DOMContentLoaded", () => {
  const toggleNav = document.querySelector(".toggle-nav");
  const navLinks = document.querySelector(".nav-links");

  toggleNav.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // close menu on link click (mobile)
  navLinks.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");

      // allow external links to work normally
      if (!href || !href.startsWith("#")) return;

      e.preventDefault();
      navLinks.classList.remove("active");

      // sponsors and faq bug fix
      if ((href === "#sponsors" || href === "#faq") && window.ScrollTrigger) {
        const st = ScrollTrigger.getById("hscroll");
        if (st) {
          const y = href === "#sponsors" ? st.start + 2 : st.end - 2;

          if (window.lenis && typeof window.lenis.scrollTo === "function") {
            window.lenis.scrollTo(y);
          } else {
            window.scrollTo({ top: y, behavior: "smooth" });
          }
          return;
        }
      }

      // scroll to sections
      const target = document.querySelector(href);
      if (!target) return;

      if (window.lenis && typeof window.lenis.scrollTo === "function") {
        window.lenis.scrollTo(target);
      } else {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
});