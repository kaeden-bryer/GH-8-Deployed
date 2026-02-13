document.addEventListener("DOMContentLoaded", () => {
  const scrollers = document.querySelectorAll(".stripe-layer");
  const mobileMQ = window.matchMedia("(max-width: 768px)");

  scrollers.forEach((el) => {
    // desktop scrolling
    el.addEventListener(
      "wheel",
      (e) => {
        if (mobileMQ.matches) return;
        e.preventDefault();
        e.stopPropagation();
        el.scrollTop += e.deltaY;
      },
      { passive: false }
    );

    // mobile scrolling
    let lastY = 0;

    el.addEventListener(
      "touchstart",
      (e) => {
        if (!mobileMQ.matches) return;
        lastY = e.touches[0].clientY;
      },
      { passive: true }
    );

    el.addEventListener(
      "touchmove",
      (e) => {
        if (!mobileMQ.matches) return;

        const y = e.touches[0].clientY;
        const delta = lastY - y; // + = scroll down, - = scroll up
        lastY = y;

        if (!delta) return;

        // stop native page scrolling for this gesture
        e.preventDefault();
        e.stopPropagation();

        const max = el.scrollHeight - el.clientHeight;
        const prev = el.scrollTop;

        // apply to towel first
        const next = Math.max(0, Math.min(max, prev + delta));
        el.scrollTop = next;

        // leftover goes to page
        const consumed = next - prev;
        const remaining = delta - consumed;

        if (remaining !== 0) {
          const targetY = window.scrollY + remaining;

          if (window.lenis && typeof window.lenis.scrollTo === "function") {
            window.lenis.scrollTo(targetY, { immediate: true });
          } else {
            window.scrollTo(0, targetY);
          }
        }
      },
      { passive: false }
    );
  });
});
