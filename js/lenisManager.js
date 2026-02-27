(function () {
  class LenisManager {
    static _instance = null;

    static getInstance(options = {}) {
      if (!LenisManager._instance) {
        LenisManager._instance = new LenisManager(options);
      }
      return LenisManager._instance;
    }

    constructor(options = {}) {
      if (LenisManager._instance) return LenisManager._instance;

      const defaults = {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: true,

        // scroll fix maybe
        wheelMultiplier: 2.0,

        touchMultiplier: 1.0,
      };

      this.options = Object.assign({}, defaults, options);
      this.lenis = new Lenis(this.options);

      // backwards compatibility
      window.lenis = this.lenis;

      LenisManager._instance = this;
    }

    bindGSAP(gsap, ScrollTrigger) {
      if (!gsap || !ScrollTrigger) {
        throw new Error("bindGSAP requires gsap and ScrollTrigger");
      }

      ScrollTrigger.normalizeScroll(true);
      ScrollTrigger.config({ ignoreMobileResize: true });

      this.lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop: (value) => {
          if (arguments.length) {
            this.lenis.scrollTo(value, { immediate: true });
          } else {
            return window.scrollY || document.documentElement.scrollTop;
          }
        },
        getBoundingClientRect: () => ({
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }),
      });

      ScrollTrigger.addEventListener("refresh", () => {
        if (this.lenis.resize) this.lenis.resize();
      });

      ScrollTrigger.refresh();
    }

    start() {
      this.lenis.start();
    }

    stop() {
      this.lenis.stop();
    }

    scrollTo(target, opts = {}) {
      this.lenis.scrollTo(target, opts);
    }

    destroy() {
      this.lenis.destroy();
      LenisManager._instance = null;
      if (window.lenis === this.lenis) delete window.lenis;
    }
  }

  // global lenis
  window.LenisManager = LenisManager;
})();