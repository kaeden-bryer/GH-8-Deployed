document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  let mm = gsap.matchMedia();

  // placement coordinates for the frog within the asset
  const frogX = 30;
  const frogY = 36;

  // --- desktop animation ---
  mm.add("(min-width: 769px)", () => {
    // sizing values
    const startScale = 4;
    const midScale = 0.7; // zoom level for showing the full boat

    // calculate position to center view on the frog
    const startX = (50 - frogX) * startScale;
    const startY = (50 - frogY) * startScale;

    // shift slightly left to accommodate text on the right
    const midX = -10;
    const midY = 0;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scene-intro",
        start: "top top",
        end: "+=5000", // scroll duration for the intro sequence
        scrub: 1,
        pin: true,
      },
    });

    // zoom out from frog to half boat
    tl.fromTo(
      ".intro-scale-wrapper",
      {
        scale: startScale,
        xPercent: startX,
        yPercent: startY,
        rotation: 0.01,
      },
      {
        scale: midScale,
        xPercent: midX,
        yPercent: midY,
        rotation: 0,
        ease: "power2.inOut",
        force3D: true,
        duration: 0.7,
      },
    )
      // fade in the title text
      .to(
        ".intro-title-container",
        { opacity: 1, duration: 0.3, ease: "power1.out" },
        "<80%",
      )

      // zoom out further to tiny boat off-screen
      .to(".intro-scale-wrapper", {
        scale: 0.25,
        xPercent: 10,
        yPercent: -20,
        ease: "power1.inOut",
        duration: 0.5,
      })
      // fade out text as boat shrinks
      .to(
        ".intro-title-container",
        {
          opacity: 0,
          duration: 0.5,
          ease: "power1.out",
        },
        "<",
      );
  });

  // mobile animation
  mm.add("(max-width: 768px)", () => {
    const startScale = 5;
    const midScale = 1;

    const startX = (50 - frogX) * startScale;
    const startY = (50 - frogY) * startScale;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#scene-intro",
        start: "top top",
        end: "+=5000",
        scrub: 1,
        pin: true,
      },
    });

    // mobile zoom out
    tl.fromTo(
      ".intro-scale-wrapper",
      {
        scale: startScale,
        xPercent: startX,
        yPercent: startY,
        rotation: 0.01,
      },
      {
        scale: midScale,
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        ease: "power2.inOut",
        force3D: true,
        duration: 2,
      },
    )
      .to(
        ".intro-title-container",
        { opacity: 1, duration: 0.5, ease: "power1.out" },
        "<80%",
      )

      // mobile shrink
      .to(".intro-scale-wrapper", {
        scale: 0.4,
        ease: "power1.inOut",
        duration: 2,
      })
      .to(
        ".intro-title-container",
        {
          opacity: 0,
          duration: 0.5,
          ease: "power1.out",
        },
        "<",
      );
  });
});
