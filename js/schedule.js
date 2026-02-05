document.addEventListener("DOMContentLoaded", () => {
    const scrollers = document.querySelectorAll(".stripe-layer");

    scrollers.forEach((el) => {
        el.addEventListener(
            "wheel",
        (e) => {
            const delta = e.deltaY;

            const atTop = el.scrollTop <= 0;
            const atBottom =
                el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

            const scrollingUp = delta < 0;
            const scrollingDown = delta > 0;
            
            const canScrollUp = !atTop;
            const canScrollDown = !atBottom;

            const shouldConsume =
                (scrollingUp && canScrollUp) || (scrollingDown && canScrollDown);

            if (shouldConsume) {
                e.preventDefault();
                el.scrollTop += delta;
          }
        }, { passive: false }
    );
  });
});
