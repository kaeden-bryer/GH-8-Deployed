document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // horizontal scroll
  let horizontalTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: "#horizontal-scroll-wrapper",
      start: "top top",
      end: "+=2000",
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      fastScrollEnd: true,
      preventOverlaps: true,
      invalidateOnRefresh: true,
    },
  });

  horizontalTimeline.to(".horizontal-track", {
    xPercent: -50,
    ease: "none",
    duration: 2,
  });

  horizontalTimeline.to({}, { duration: 0.15 });

  // log autoscroller
  const logs = document.querySelectorAll(".log-item");
  const trackWidth = window.innerWidth * 2;

  logs.forEach((log) => {
    const randomDuration = 10 + Math.random() * 8;
    const randomDelay = Math.random() * 5;

    gsap.fromTo(
      log,
      {
        x: trackWidth + 200, // start off screen
      },
      {
        x: -350, // end off screen
        duration: randomDuration,
        ease: "none",
        repeat: -1,
        delay: randomDelay,
      },
    );
  });
});
