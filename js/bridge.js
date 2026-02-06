document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  // Store reference to the horizontal scroll trigger for checking progress
  let horizontalScrollTrigger = null;

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
      onUpdate: (self) => {
        horizontalScrollTrigger = self;
        
        // Position bridge scroll only when actually *entering* the bridge zone from outside
        const bridgeContainer = document.querySelector(".bridge-scroll-container");
        if (bridgeContainer) {
          const currentProgress = self.progress;
          const inBridgeZone = currentProgress >= 0.9 && currentProgress <= 0.99;
          const wasInBridgeZone = lastProgress >= 0.9 && lastProgress <= 0.99;
          const enteredFromRiver = !wasInBridgeZone && lastProgress < 0.9 && inBridgeZone;
          const enteredFromJungle = !wasInBridgeZone && lastProgress > 0.99 && inBridgeZone;
          
          // Only set scroll position when crossing into the bridge zone from river or jungle
          if (enteredFromRiver) {
            bridgeContainer.scrollTop = 0;
          }
          if (enteredFromJungle) {
            bridgeContainer.scrollTop = bridgeContainer.scrollHeight;
          }
          
          lastProgress = currentProgress;
        }
      },
    },
  });

  horizontalTimeline.to(".horizontal-track", {
    xPercent: -50,
    ease: "none",
    duration: 2,
  });

  horizontalTimeline.to({}, { duration: 0.15 });
  
  // Check if we're fully in the bridge panel (horizontal scroll complete)
  const isFullyInBridgePanel = () => {
    if (!horizontalScrollTrigger) return false;
    // Progress of 1 means fully scrolled to bridge panel
    // Use a threshold slightly less than 1 for smoother transition
    return horizontalScrollTrigger.progress >= 0.95;
  };

  // Track previous progress to detect crossing into bridge zone
  let lastProgress = 0;

  // log autoscroller
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
        x: -300, // end off screen
        duration: randomDuration,
        ease: "none",
        repeat: -1,
        delay: randomDelay,
      },
    );
  });

  // ============ BRIDGE FUNCTIONALITY ============

  // Load FAQ planks from data/faq.json
  const bridgePlanksContainer = document.getElementById("bridge-planks");
  if (bridgePlanksContainer) {
    fetch("data/faq.json")
      .then((res) => res.json())
      .then((faq) => {
        faq.forEach((item, i) => {
          const plank = document.createElement("div");
          plank.className = "bridge-plank-container";
          plank.dataset.question = String(i + 1);
          plank.innerHTML = `
            <div class="plank-inner">
              <div class="plank-front">
                <img src="assets/bridge-plank.svg" class="bridge-plank-img" alt="Bridge Plank" />
                <div class="bridge-question"></div>
              </div>
              <div class="plank-back">
                <img src="assets/bridge-plank.svg" class="bridge-plank-img" alt="Bridge Plank" />
                <div class="bridge-answer"></div>
              </div>
            </div>
          `;
          plank.querySelector(".bridge-question").textContent = item.q;
          plank.querySelector(".bridge-answer").innerHTML = item.a;
          bridgePlanksContainer.appendChild(plank);
        });
      })
      .catch((err) => console.error("Failed to load FAQ:", err));
  }

  // Plank flip on click (event delegation so dynamically added planks work)
  const bridgeContainer = document.querySelector(".bridge-container");
  if (bridgeContainer) {
    bridgeContainer.addEventListener("click", (e) => {
      const plank = e.target.closest(".bridge-plank-container");
      if (plank) plank.classList.toggle("flipped");
    });
  }

  // Bridge scroll container - pause lenis when scrolling inside
  const bridgeScrollContainer = document.querySelector(".bridge-scroll-container");
  
  if (bridgeScrollContainer) {
    let isInsideBridge = false;
    let lenisWasStarted = false;

    // Check if bridge scroll container has more content to scroll
    const hasMoreToScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = bridgeScrollContainer;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
      return { atTop, atBottom, canScroll: scrollHeight > clientHeight };
    };

    // Handle mouse enter/leave for bridge container
    bridgeScrollContainer.addEventListener("mouseenter", () => {
      isInsideBridge = true;
      lenisWasStarted = false;
    });

    bridgeScrollContainer.addEventListener("mouseleave", () => {
      isInsideBridge = false;
      lenisWasStarted = false;
      // Resume lenis when leaving the bridge area
      if (window.lenis) {
        window.lenis.start();
      }
    });

    // Handle wheel events on the bridge scroll container
    bridgeScrollContainer.addEventListener("wheel", (e) => {
      if (!isInsideBridge) return;

      // Don't capture scroll if we're not fully in the bridge panel yet
      if (!isFullyInBridgePanel()) {
        if (window.lenis) {
          window.lenis.start();
        }
        return;
      }

      const { atTop, atBottom, canScroll } = hasMoreToScroll();
      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      // Check if we're at a boundary trying to scroll out
      const atBoundaryScrollingOut = (scrollingDown && atBottom) || (scrollingUp && atTop);

      // If at boundary scrolling out, let lenis handle it
      if (atBoundaryScrollingOut || !canScroll) {
        if (!lenisWasStarted && window.lenis) {
          window.lenis.start();
          lenisWasStarted = true;
        }
        // Don't stop propagation - let the event bubble to lenis
        return;
      }

      // We have content to scroll through - stop lenis and handle internally
      lenisWasStarted = false;
      e.stopPropagation();
      if (window.lenis) {
        window.lenis.stop();
      }
    }, { passive: false });

    // Handle touch events for mobile
    let touchStartY = 0;
    
    bridgeScrollContainer.addEventListener("touchstart", (e) => {
      touchStartY = e.touches[0].clientY;
      isInsideBridge = true;
      lenisWasStarted = false;
    }, { passive: true });

    bridgeScrollContainer.addEventListener("touchmove", (e) => {
      if (!isInsideBridge) return;

      // Don't capture scroll if we're not fully in the bridge panel yet
      if (!isFullyInBridgePanel()) {
        if (window.lenis) {
          window.lenis.start();
        }
        return;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      const { atTop, atBottom, canScroll } = hasMoreToScroll();
      const scrollingDown = deltaY > 0;
      const scrollingUp = deltaY < 0;

      // Check if we're at a boundary trying to scroll out
      const atBoundaryScrollingOut = (scrollingDown && atBottom) || (scrollingUp && atTop);

      // If at boundary scrolling out, let lenis handle it
      if (atBoundaryScrollingOut || !canScroll) {
        if (!lenisWasStarted && window.lenis) {
          window.lenis.start();
          lenisWasStarted = true;
        }
        return;
      }

      // We have content to scroll through - stop lenis and handle internally
      lenisWasStarted = false;
      e.stopPropagation();
      if (window.lenis) {
        window.lenis.stop();
      }
    }, { passive: false });

    bridgeScrollContainer.addEventListener("touchend", () => {
      isInsideBridge = false;
      lenisWasStarted = false;
      if (window.lenis) {
        window.lenis.start();
      }
    }, { passive: true });
  }
});
