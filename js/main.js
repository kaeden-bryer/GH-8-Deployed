gsap.registerPlugin(ScrollTrigger);

// scroll normalization
ScrollTrigger.normalizeScroll(true);

// ignore mobile resize
ScrollTrigger.config({ ignoreMobileResize: true });

// 1. INITIALIZE LENIS
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom ease for smoother stop
  smoothWheel: true,
});

// Make lenis globally accessible
window.lenis = lenis;

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);
gsap.registerPlugin(ScrollTrigger);

// --- 4. THE "BULLETPROOF" PRELOADER ---

function initSite() {
  const preloader = document.getElementById("preloader");
  window.scrollTo(0, 0);

  gsap.to(preloader, {
    opacity: 0,
    duration: 0.8,
    onComplete: () => {
      preloader.style.display = "none";
      ScrollTrigger.refresh();
    },
  });
}

// Check for .boat-bg instead of .boat-asset
const checkInterval = setInterval(() => {
  const boat = document.querySelector(".boat-bg");

  if (boat && boat.complete && boat.naturalHeight > 0) {
    clearInterval(checkInterval);
    setTimeout(initSite, 200);
  }
}, 100);

// Fallback
setTimeout(() => {
  clearInterval(checkInterval);
  initSite();
}, 4000);

// modal logic
const modalOverlay = document.getElementById("modalOverlay");
const modalPanel = document.getElementById("modalPanel");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");

window.openModal = function (element, index) {
  modalTitle.innerText = element.getAttribute("data-title");
  modalContent.innerText = element.getAttribute("data-content");

  modalPanel.classList.remove("left-side", "right-side");

  if (index % 2 !== 0) {
    modalPanel.classList.add("left-side");
  } else {
    modalPanel.classList.add("right-side");
  }

  void modalPanel.offsetWidth;
  modalOverlay.classList.add("active");
  lenis.stop(); // stop scroll
};

window.closeModal = function () {
  modalOverlay.classList.remove("active");
  lenis.start(); // resume scroll
};

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
