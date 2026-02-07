document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.querySelector(".suitcase-zoom-trigger");
  const backoutBtn = document.querySelector(".passport-backout-btn");
  const suitcase = document.querySelector("#scene-jungle .suitcase");
  const plane = document.querySelector("#scene-jungle .plane");
  const passportBg = document.querySelector(".passport-background");
  const leftPage = document.querySelector(".passport-page-left");
  const rightPage = document.querySelector(".passport-page-right");

  if (
    !trigger ||
    !backoutBtn ||
    !suitcase ||
    !plane ||
    !passportBg ||
    !leftPage ||
    !rightPage ||
    typeof gsap === "undefined"
  ) {
    return;
  }

  let isZoomed = false;
  let spreads = [];
  let currentSpreadIndex = 0;
  let isAnimating = false;
  let activeFlipUnderlay = null;

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.textContent = "<";
  prevBtn.setAttribute("aria-label", "Previous page");
  prevBtn.style.position = "absolute";
  prevBtn.style.right = "2px";
  prevBtn.style.top = "2px";
  prevBtn.style.width = "6px";
  prevBtn.style.height = "6px";
  prevBtn.style.padding = "0";
  prevBtn.style.border = "none";
  prevBtn.style.borderRadius = "3px";
  prevBtn.style.background = "transparent";
  prevBtn.style.color = "#0d3d8a";
  prevBtn.style.fontSize = "0.12rem";
  prevBtn.style.fontWeight = "700";
  prevBtn.style.lineHeight = "1";
  prevBtn.style.display = "flex";
  prevBtn.style.alignItems = "center";
  prevBtn.style.justifyContent = "center";
  prevBtn.style.cursor = "pointer";
  prevBtn.style.opacity = "0";
  prevBtn.style.pointerEvents = "none";
  prevBtn.style.zIndex = "6";
  prevBtn.style.transform = "rotate(-180deg)";

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.textContent = ">";
  nextBtn.setAttribute("aria-label", "Next page");
  nextBtn.style.position = "absolute";
  nextBtn.style.left = "2px";
  nextBtn.style.top = "2px";
  nextBtn.style.width = "6px";
  nextBtn.style.height = "6px";
  nextBtn.style.padding = "0";
  nextBtn.style.border = "none";
  nextBtn.style.borderRadius = "3px";
  nextBtn.style.background = "transparent";
  nextBtn.style.color = "#0d3d8a";
  nextBtn.style.fontSize = "0.12rem";
  nextBtn.style.fontWeight = "700";
  nextBtn.style.lineHeight = "1";
  nextBtn.style.display = "flex";
  nextBtn.style.alignItems = "center";
  nextBtn.style.justifyContent = "center";
  nextBtn.style.cursor = "pointer";
  nextBtn.style.opacity = "0";
  nextBtn.style.pointerEvents = "none";
  nextBtn.style.zIndex = "6";
  nextBtn.style.transform = "rotate(-180deg)";

  const pageIndex = document.createElement("div");
  pageIndex.style.position = "absolute";
  pageIndex.style.left = "50%";
  pageIndex.style.bottom = "1px";
  pageIndex.style.transform = "translateX(-50%) rotate(-180deg)";
  pageIndex.style.fontSize = "0.16rem";
  pageIndex.style.color = "#e7f0ff";
  pageIndex.style.zIndex = "6";
  pageIndex.style.opacity = "0";
  pageIndex.style.pointerEvents = "none";
  pageIndex.textContent = "1 / 1";

  passportBg.appendChild(prevBtn);
  passportBg.appendChild(nextBtn);
  passportBg.appendChild(pageIndex);
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

  const renderPage = (target, pageData) => {
    target.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.padding = "3px";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.boxSizing = "border-box";
    wrapper.style.overflow = "hidden";
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.transform = "rotate(180deg)";
    wrapper.style.transformOrigin = "center";

    if (pageData.picture) {
      const imageFrame = document.createElement("div");
      imageFrame.style.width = "52%";
      imageFrame.style.aspectRatio = "4 / 5";
      imageFrame.style.margin = "0 auto 2px";
      imageFrame.style.borderRadius = "3px";
      imageFrame.style.overflow = "hidden";
      imageFrame.style.flexShrink = "0";

      const img = document.createElement("img");
      img.src = pageData.picture;
      img.alt = "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      imageFrame.appendChild(img);
      wrapper.appendChild(imageFrame);
    }

    if (pageData.name) {
      const name = document.createElement("p");
      name.textContent = pageData.name;
      name.style.margin = "2px 0 1px";
      name.style.fontSize = "0.2rem";
      name.style.lineHeight = "1.1";
      name.style.color = "#0d3d8a";
      name.style.fontWeight = "700";
      wrapper.appendChild(name);
    }

    if (pageData.team) {
      const team = document.createElement("p");
      team.textContent = pageData.team;
      team.style.margin = "0";
      team.style.fontSize = "0.16rem";
      team.style.lineHeight = "1.15";
      team.style.color = "#10295a";
      wrapper.appendChild(team);
    }

    if (pageData.linkedin) {
      const linkedin = document.createElement("a");
      linkedin.href = pageData.linkedin;
      linkedin.target = "_blank";
      linkedin.rel = "noopener noreferrer";
      linkedin.textContent = "LinkedIn";
      linkedin.style.display = "inline-block";
      linkedin.style.marginTop = "auto";
      linkedin.style.fontSize = "0.14rem";
      linkedin.style.lineHeight = "1.1";
      linkedin.style.color = "#0d3d8a";
      linkedin.style.textDecoration = "underline";
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
      duration: 0.22,
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
          duration: 0.26,
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
            linkedin: "https://www.linkedin.com",
          },
          right: {
            picture: "assets/boat.svg",
            name: "Meet the Team",
            team: "Community",
            linkedin: "https://www.linkedin.com",
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
