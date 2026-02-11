document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.querySelector(".suitcase-zoom-trigger");
  const backoutBtn = document.querySelector(".passport-backout-btn");
  const suitcase = document.querySelector("#scene-jungle .suitcase");
  const sceneJungle = document.querySelector("#scene-jungle");
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
    !sceneJungle ||
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
  const isMobileViewport = () => window.matchMedia("(max-width: 768px)").matches;

  function createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) {
      element.className = className;
    }
    if (textContent) {
      element.textContent = textContent;
    }
    return element;
  }

  const overlayRoot = createElement("div", "passport-text-overlay");
  const uiOverlayRoot = createElement("div", "passport-ui-overlay");
  const createOverlayBox = () => {
    const box = createElement("div", "passport-text-box");
    const photoFrame = createElement("div", "passport-text-box-photo-frame");
    const photo = createElement("img", "passport-text-box-photo");
    photo.alt = "";
    photoFrame.appendChild(photo);
    const name = createElement("p", "passport-text-box-name");
    const team = createElement("p", "passport-text-box-team");
    const link = createElement("a", "passport-text-box-link", "LinkedIn");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    box.appendChild(photoFrame);
    box.appendChild(name);
    box.appendChild(team);
    box.appendChild(link);
    overlayRoot.appendChild(box);
    return { box, photoFrame, photo, name, team, link };
  };
  const overlayLeft = createOverlayBox();
  const overlayRight = createOverlayBox();
  const overlayPrevBtn = createElement("button", "passport-overlay-nav passport-overlay-nav-prev", "<");
  const overlayNextBtn = createElement("button", "passport-overlay-nav passport-overlay-nav-next", ">");
  const overlayIndex = createElement("div", "passport-overlay-index");
  const overlayBackoutBtn = createElement("button", "passport-overlay-backout", "Back out");
  overlayPrevBtn.type = "button";
  overlayNextBtn.type = "button";
  overlayBackoutBtn.type = "button";
  uiOverlayRoot.appendChild(overlayPrevBtn);
  uiOverlayRoot.appendChild(overlayNextBtn);
  uiOverlayRoot.appendChild(overlayIndex);
  uiOverlayRoot.appendChild(overlayBackoutBtn);
  sceneJungle.appendChild(overlayRoot);
  sceneJungle.appendChild(uiOverlayRoot);

  passportBg.style.perspective = "800px";
  passportBg.style.transformStyle = "preserve-3d";
  [leftPage, rightPage].forEach((page) => {
    page.style.backfaceVisibility = "hidden";
    page.style.transformStyle = "preserve-3d";
  });

  const setNavVisibility = (visible) => {
    const opacity = "0";
    const pointerEvents = "none";
    prevBtn.style.opacity = opacity;
    nextBtn.style.opacity = opacity;
    pageIndex.style.opacity = opacity;
    prevBtn.style.pointerEvents = pointerEvents;
    nextBtn.style.pointerEvents = pointerEvents;
  };

  const isBlankString = (value) => typeof value !== "string" || value.trim() === "";
  const isPageEmpty = (pageData) =>
    !pageData ||
    (isBlankString(pageData.name) &&
      isBlankString(pageData.team) &&
      isBlankString(pageData.picture) &&
      isBlankString(pageData.linkedin));

  const setOverlayBoxContent = (overlayBox, pageData) => {
    const safeData = pageData || {};
    overlayBox.name.textContent = safeData.name || "";
    overlayBox.team.textContent = safeData.team || "";
    const picture = typeof safeData.picture === "string" ? safeData.picture.trim() : "";
    if (picture) {
      overlayBox.photo.src = picture;
      overlayBox.photoFrame.style.visibility = "visible";
    } else {
      overlayBox.photo.removeAttribute("src");
      overlayBox.photoFrame.style.visibility = "hidden";
    }

    if (isPageEmpty(safeData)) {
      overlayBox.link.removeAttribute("href");
      overlayBox.link.classList.add("is-missing");
      overlayBox.link.setAttribute("aria-disabled", "true");
      overlayBox.link.tabIndex = -1;
      overlayBox.link.style.display = "none";
      return;
    }

    overlayBox.link.style.display = "inline-block";

    const linkedin = typeof safeData.linkedin === "string" ? safeData.linkedin.trim() : "";
    const hasLinkedinUrl = /^https?:\/\//i.test(linkedin);
    overlayBox.link.textContent = "LinkedIn";
    if (hasLinkedinUrl) {
      overlayBox.link.href = linkedin;
      overlayBox.link.classList.remove("is-missing");
      overlayBox.link.setAttribute("aria-disabled", "false");
      overlayBox.link.tabIndex = 0;
    } else {
      overlayBox.link.removeAttribute("href");
      overlayBox.link.classList.add("is-missing");
      overlayBox.link.setAttribute("aria-disabled", "true");
      overlayBox.link.tabIndex = -1;
    }
  };

  const positionOverlayBox = (overlayBox, sourcePage) => {
    const rect = sourcePage.getBoundingClientRect();
    const sceneRect = sceneJungle.getBoundingClientRect();
    overlayBox.box.style.left = `${rect.left - sceneRect.left}px`;
    overlayBox.box.style.top = `${rect.top - sceneRect.top}px`;
    overlayBox.box.style.width = `${rect.width}px`;
    overlayBox.box.style.height = `${rect.height}px`;
  };

  const updateOverlayPositions = () => {
    if (!isZoomed) {
      return;
    }
    positionOverlayBox(overlayLeft, leftPage);
    positionOverlayBox(overlayRight, rightPage);
    positionOverlayControl(overlayPrevBtn, prevBtn);
    positionOverlayControl(overlayNextBtn, nextBtn);
    positionOverlayControl(overlayIndex, pageIndex, false);
    positionOverlayControl(overlayBackoutBtn, backoutBtn, false);
  };

  const positionOverlayControl = (overlayEl, sourceEl, matchSize = true) => {
    const rect = sourceEl.getBoundingClientRect();
    const sceneRect = sceneJungle.getBoundingClientRect();
    overlayEl.style.left = `${rect.left - sceneRect.left}px`;
    overlayEl.style.top = `${rect.top - sceneRect.top}px`;
    if (matchSize) {
      overlayEl.style.width = `${rect.width}px`;
      overlayEl.style.height = `${rect.height}px`;
    } else {
      overlayEl.style.width = "auto";
      overlayEl.style.height = "auto";
    }
  };

  const showOverlay = () => {
    overlayRoot.classList.add("active");
    uiOverlayRoot.classList.add("active");
    updateNavState();
    updateOverlayPositions();
    // Reposition after paint to avoid stale rects during zoom completion.
    requestAnimationFrame(() => {
      updateOverlayPositions();
      requestAnimationFrame(updateOverlayPositions);
    });
  };

  const hideOverlay = () => {
    overlayRoot.classList.remove("active");
    uiOverlayRoot.classList.remove("active");
  };

  const updateOverlayContent = () => {
    const spread = spreads[currentSpreadIndex];
    if (!spread || !spread.left || !spread.right) {
      setOverlayBoxContent(overlayLeft, null);
      setOverlayBoxContent(overlayRight, null);
      return;
    }
    setOverlayBoxContent(overlayLeft, getPageDataForElement(spread, leftPage));
    setOverlayBoxContent(overlayRight, getPageDataForElement(spread, rightPage));
    overlayIndex.textContent = `${currentSpreadIndex + 1} / ${spreads.length}`;
  };

  const setZoomState = (nextZoomed) => {
    isZoomed = nextZoomed;
    suitcase.classList.toggle("is-zoomed", isZoomed);
    setNavVisibility(isZoomed && spreads.length > 1);
    const zoomScale = isMobileViewport() ? 2.2 : 4;
    const zoomY = isMobileViewport() ? 110 : 220;

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
      scale: isZoomed ? zoomScale : 1,
      x: 0,
      y: isZoomed ? zoomY : 0,
      ease: "power2.inOut",
      onComplete: () => {
        if (isZoomed) {
          updateOverlayContent();
          showOverlay();
          updateOverlayPositions();
        } else {
          hideOverlay();
        }
      },
    });

    hideOverlay();
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

    if (!isPageEmpty(pageData)) {
      const hasLinkedinUrl =
        typeof pageData.linkedin === "string" &&
        /^https?:\/\//i.test(pageData.linkedin.trim());
      if (hasLinkedinUrl) {
        const linkedin = createElement("a", "passport-card-link", "LinkedIn");
        linkedin.href = pageData.linkedin.trim();
        linkedin.target = "_blank";
        linkedin.rel = "noopener noreferrer";
        wrapper.appendChild(linkedin);
      } else {
        const linkedinMissing = createElement("span", "passport-card-link is-missing", "LinkedIn");
        wrapper.appendChild(linkedinMissing);
      }
    }

    target.appendChild(wrapper);
  };

  const updateNavState = () => {
    const total = spreads.length;
    pageIndex.textContent = `${currentSpreadIndex + 1} / ${total}`;
    prevBtn.disabled = currentSpreadIndex === 0;
    nextBtn.disabled = currentSpreadIndex >= total - 1;
    prevBtn.style.opacity = "0";
    nextBtn.style.opacity = "0";
    pageIndex.style.opacity = "0";
    prevBtn.style.pointerEvents = "none";
    nextBtn.style.pointerEvents = "none";
    overlayPrevBtn.disabled = prevBtn.disabled;
    overlayNextBtn.disabled = nextBtn.disabled;
    overlayPrevBtn.style.opacity = prevBtn.disabled ? "0.75" : isZoomed && total > 1 ? "1" : "0";
    overlayNextBtn.style.opacity = nextBtn.disabled ? "0.75" : isZoomed && total > 1 ? "1" : "0";
    overlayIndex.style.opacity = isZoomed && total > 1 ? "1" : "0";
  };

  const renderSpread = (index) => {
    const spread = spreads[index];
    if (!spread || !spread.left || !spread.right) {
      return;
    }

    renderPage(leftPage, spread.right);
    renderPage(rightPage, spread.left);
    updateNavState();
    updateOverlayContent();
    updateOverlayPositions();
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
    if (isZoomed) {
      hideOverlay();
    }
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
              if (isZoomed) {
                updateOverlayContent();
                showOverlay();
                updateOverlayPositions();
              }
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

  window.addEventListener("resize", () => {
    if (isZoomed) {
      updateOverlayContent();
      updateOverlayPositions();
    }
  });

  overlayNextBtn.addEventListener("click", () => {
    if (!isZoomed) {
      return;
    }
    animateSpreadChange(currentSpreadIndex + 1, 1);
  });

  overlayPrevBtn.addEventListener("click", () => {
    if (!isZoomed) {
      return;
    }
    animateSpreadChange(currentSpreadIndex - 1, -1);
  });

  overlayBackoutBtn.addEventListener("click", () => {
    if (isZoomed) {
      setZoomState(false);
    }
  });
});
