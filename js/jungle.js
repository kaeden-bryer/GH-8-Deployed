document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.querySelector(".suitcase-zoom-trigger");
  const backoutBtn = document.querySelector(".passport-backout-btn");
  const suitcase = document.querySelector("#scene-jungle .suitcase");
  const plane = document.querySelector("#scene-jungle .plane");
  const passportBg = document.querySelector(".passport-background");
  const leftPage = document.querySelector(".passport-page-left");
  const rightPage = document.querySelector(".passport-page-right");
  const prevBtn = document.querySelector(".passport-nav-prev");
  const nextBtn = document.querySelector(".passport-nav-next");
  const pageIndex = document.querySelector(".passport-page-index");

  if (
    !trigger ||
    !backoutBtn ||
    !suitcase ||
    !plane ||
    !passportBg ||
    !leftPage ||
    !rightPage ||
    !prevBtn ||
    !nextBtn ||
    !pageIndex ||
    typeof gsap === "undefined"
  ) {
    return;
  }

  let isZoomed = false;
  let spreads = [];
  let currentSpreadIndex = 0;
  let isAnimating = false;
  let activeFlipUnderlay = null;
  const FLIP_OUT_DURATION = 0.22;
  const FLIP_IN_DURATION = 0.26;

  passportBg.style.perspective = "800px";
  passportBg.style.transformStyle = "preserve-3d";
  [leftPage, rightPage].forEach((page) => {
    page.style.backfaceVisibility = "hidden";
    page.style.transformStyle = "preserve-3d";
  });

  const setNavVisibility = (visible) => {
    const opacity = visible ? "1" : "0";
    const pointerEvents = visible ? "auto" : "none";
    prevBtn.style.opacity = opacity;
    nextBtn.style.opacity = opacity;
    pageIndex.style.opacity = opacity;
    prevBtn.style.pointerEvents = pointerEvents;
    nextBtn.style.pointerEvents = pointerEvents;
  };

  const setZoomState = (nextZoomed) => {
    isZoomed = nextZoomed;
    suitcase.classList.toggle("is-zoomed", isZoomed);
    setNavVisibility(isZoomed && spreads.length > 1);

    gsap.to(plane, {
      duration: 0.9,
      scale: isZoomed ? 1.9 : 1,
      x: isZoomed ? -520 : 0,
      y: isZoomed ? 300 : 0,
      opacity: isZoomed ? 0 : 1,
      ease: "power2.inOut",
      transformOrigin: "50% 50%",
    });

    gsap.to(suitcase, {
      duration: 0.9,
      scale: isZoomed ? 8 : 1,
      x: 0,
      y: isZoomed ? 220 : 0,
      ease: "power2.inOut",
    });
  };

  const createElement = (tag, className, textContent) => {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  };

  const renderPage = (target, pageData) => {
    target.innerHTML = "";

    const wrapper = createElement("div", "passport-card");

    if (pageData.picture) {
      const imageFrame = createElement("div", "passport-card-photo-frame");
      const img = createElement("img", "passport-card-photo");
      img.src = pageData.picture;
      img.alt = "";
      imageFrame.appendChild(img);
      wrapper.appendChild(imageFrame);
    }

    if (pageData.name) {
      const name = createElement("p", "passport-card-name", pageData.name);
      wrapper.appendChild(name);
    }

    if (pageData.team) {
      const team = createElement("p", "passport-card-team", pageData.team);
      wrapper.appendChild(team);
    }

    if (pageData.linkedin) {
      const linkedin = createElement("a", "passport-card-link", "LinkedIn");
      linkedin.href = pageData.linkedin;
      linkedin.target = "_blank";
      linkedin.rel = "noopener noreferrer";
      wrapper.appendChild(linkedin);
    }

    target.appendChild(wrapper);
  };

  const updateNavState = () => {
    const total = spreads.length;
    pageIndex.textContent = `${currentSpreadIndex + 1} / ${total}`;
    prevBtn.disabled = currentSpreadIndex === 0;
    nextBtn.disabled = currentSpreadIndex >= total - 1;
    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : isZoomed && total > 1 ? "1" : "0";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : isZoomed && total > 1 ? "1" : "0";
  };

  const renderSpread = (index) => {
    const spread = spreads[index];
    if (!spread || !spread.left || !spread.right) {
      return;
    }

    renderPage(leftPage, spread.right);
    renderPage(rightPage, spread.left);
    updateNavState();
  };

  const getPageDataForElement = (spread, pageElement) => {
    if (!spread || !spread.left || !spread.right) {
      return null;
    }
    if (pageElement === leftPage) {
      return spread.right;
    }
    if (pageElement === rightPage) {
      return spread.left;
    }
    return null;
  };

  const animateSpreadChange = (nextIndex, direction) => {
    if (isAnimating || nextIndex < 0 || nextIndex >= spreads.length) {
      return;
    }

    isAnimating = true;
    const nextSpread = spreads[nextIndex];
    const turningPage = direction > 0 ? leftPage : rightPage;
    const restingPage = direction > 0 ? rightPage : leftPage;
    const hingeOrigin = direction > 0 ? "right center" : "left center";
    const midRotation = direction > 0 ? 95 : -95;
    const enterRotation = direction > 0 ? -95 : 95;
    const underlayData = getPageDataForElement(nextSpread, turningPage);
    if (activeFlipUnderlay) {
      activeFlipUnderlay.remove();
      activeFlipUnderlay = null;
    }
    const flipUnderlay = turningPage.cloneNode(false);
    activeFlipUnderlay = flipUnderlay;
    flipUnderlay.style.zIndex = "3";
    flipUnderlay.style.pointerEvents = "none";
    flipUnderlay.style.opacity = "1";
    flipUnderlay.style.transformOrigin = hingeOrigin;
    flipUnderlay.style.transform = "translateY(-50%) rotateY(0deg)";
    flipUnderlay.style.backfaceVisibility = "hidden";
    flipUnderlay.style.transformStyle = "preserve-3d";
    if (underlayData) {
      renderPage(flipUnderlay, underlayData);
    }
    passportBg.insertBefore(flipUnderlay, turningPage);

    gsap.set(turningPage, {
      zIndex: 4,
      transformOrigin: hingeOrigin,
      rotateY: 0,
    });
    gsap.set(restingPage, { zIndex: 2 });

    gsap.to(turningPage, {
      duration: FLIP_OUT_DURATION,
      rotateY: midRotation,
      ease: "power2.in",
      onComplete: () => {
        currentSpreadIndex = nextIndex;
        const nextRestingData = getPageDataForElement(nextSpread, restingPage);
        const nextTurningData = getPageDataForElement(nextSpread, turningPage);
        if (nextRestingData) {
          renderPage(restingPage, nextRestingData);
        }
        updateNavState();
        gsap.set(turningPage, {
          zIndex: 4,
          transformOrigin: hingeOrigin,
          rotateY: enterRotation,
        });
        if (nextTurningData) {
          renderPage(turningPage, nextTurningData);
        }

        gsap.to(turningPage, {
          duration: FLIP_IN_DURATION,
          rotateY: 0,
          ease: "power2.out",
          onComplete: () => {
            // Promote real pages first, then hide/remove underlay on next frame
            // to avoid one-frame flashes from layer reordering.
            gsap.set([leftPage, rightPage], { zIndex: 5, rotateY: 0 });
            flipUnderlay.style.opacity = "0";
            flipUnderlay.style.visibility = "hidden";
            requestAnimationFrame(() => {
              if (flipUnderlay.parentNode) {
                flipUnderlay.remove();
              }
              if (activeFlipUnderlay === flipUnderlay) {
                activeFlipUnderlay = null;
              }
              gsap.set([leftPage, rightPage], { zIndex: 1, rotateY: 0 });
            });
            isAnimating = false;
          },
        });
      },
    });
  };

  trigger.addEventListener("click", () => {
    if (!isZoomed) {
      setZoomState(true);
    }
  });

  backoutBtn.addEventListener("click", () => {
    if (isZoomed) {
      setZoomState(false);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (!isZoomed) {
      return;
    }
    animateSpreadChange(currentSpreadIndex + 1, 1);
  });

  prevBtn.addEventListener("click", () => {
    if (!isZoomed) {
      return;
    }
    animateSpreadChange(currentSpreadIndex - 1, -1);
  });

  const loadPassportData = async () => {
    try {
      const response = await fetch("data/passport-pages.json");
      if (!response.ok) {
        throw new Error("passport data request failed");
      }

      const data = await response.json();
      if (!Array.isArray(data.pages) || data.pages.length === 0) {
        throw new Error("passport data missing pages");
      }

      spreads = data.pages.filter((spread) => spread && spread.left && spread.right);
      if (spreads.length === 0) {
        throw new Error("passport data has no valid spreads");
      }
    } catch (error) {
      console.warn("Failed to load passport page data.", error);
      spreads = [
        {
          left: {
            picture: "assets/Frog.svg",
            name: "GrizzHacks 2026",
            team: "Organizer Team",
            linkedin: "",
          },
          right: {
            picture: "assets/boat.svg",
            name: "Meet the Team",
            team: "Community",
            linkedin: "",
          },
        },
      ];
    }

    currentSpreadIndex = 0;
    renderSpread(currentSpreadIndex);
    setNavVisibility(false);
  };

  loadPassportData();
});
