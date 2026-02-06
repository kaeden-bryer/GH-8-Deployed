document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.querySelector(".suitcase-zoom-trigger");
  const suitcase = document.querySelector("#scene-jungle .suitcase");

  if (!trigger || !suitcase || typeof gsap === "undefined") {
    return;
  }

  let isZoomed = false;

  trigger.addEventListener("click", () => {
    isZoomed = !isZoomed;

    gsap.to(suitcase, {
      duration: 0.9,
      scale: isZoomed ? 4.5 : 1,
      x: 0,
      y: 0,
      ease: "power2.inOut",
    });

    trigger.textContent = isZoomed ? "Back out" : "Inspect suitcase";
  });
});
