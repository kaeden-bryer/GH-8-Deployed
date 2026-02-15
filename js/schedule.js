document.addEventListener("DOMContentLoaded", () => {
    const scrollers = document.querySelectorAll(".stripe-layer");
    const isMobile = window.matchMedia("max-width: 768px").matches;

    scrollers.forEach((el) => {
        let isMouseInside = false;
        
        el.addEventListener(
            "wheel",
            (e) => {

                // no scroll logic for mobile
                if (isMobile) {
                    return;
                }

                const delta = e.deltaY;

                // const atTop = el.scrollTop <= 0;
                // const atBottom =
                    // el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

                const scrollingUp = delta < 0;
                const scrollingDown = delta > 0;
                
                // const canScrollUp = !atTop;
                // const canScrollDown = !atBottom;

                const shouldConsume =
                    (scrollingDown || scrollingUp);
                
                // Stop Lenis when scrolling inside the table
                if (window.lenis && !isMouseInside) {
                    window.lenis.stop();
                    isMouseInside = true;
                }

                if (shouldConsume) {
                    e.preventDefault();
                    e.stopPropagation();
                    el.scrollTop += delta;
                } else if (window.lenis && isMouseInside) {
                    // At boundary - restart Lenis
                    window.lenis.start();
                    isMouseInside = false;
                }
            },
            { passive: false }
        );
    });
});