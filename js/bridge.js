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

  // float-items autoscroller
  const float_items = document.querySelectorAll(".float-item");
  const trackWidth = window.innerWidth * 2;

  float_items.forEach((float_item) => {
    const randomDuration = 10 + Math.random() * 8;
    const randomDelay = Math.random() * 5;

    gsap.fromTo(
      float_item,
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

  // Chat generated slop to get waves working bc I'm dumb
  const speedPxPerSec = 220;
  const gapPx = 1500;
  const startPad = 200;
  const endPad = 350;

  const waves = gsap.utils.toArray(".float-item.wave");

  // group waves by lane (same top)
  const lanes = waves.reduce((acc, el) => {
    const top = el.style.top || getComputedStyle(el).top;
    (acc[top] ||= []).push(el);
    return acc;
  }, {});

  Object.values(lanes).forEach((laneEls, laneIndex) => {
    const laneSpeed = speedPxPerSec * (1 + laneIndex * 0.04);

    const travel = trackWidth + startPad + endPad;
    const duration = travel / laneSpeed;

    // 🔑 lane phase offset (this is the magic)
    const lanePhase = laneIndex * gapPx * 0.6;

    laneEls.forEach((el, i) => {
      gsap.set(el, {
        x: trackWidth + startPad + i * gapPx + lanePhase,
      });
    });

    laneEls.forEach((el) => {
      gsap.to(el, {
        x: `-=${travel}`,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => {
            const v = parseFloat(x);
            const wrapped = ((v + travel) % travel) - endPad;
            return wrapped + "px";
          },
        },
      });
    });
  });
});
