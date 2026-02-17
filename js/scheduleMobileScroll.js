// mobile scroll arrow functionality
document.addEventListener("DOMContentLoaded", () => {
    const isMobile = () => window.innerWidth <= 768;
    
    // create arrow buttons for each towel
    const towels = document.querySelectorAll(".towel");
    
    towels.forEach((towel) => {
        const footer = towel.querySelector(".towel-footer");
        const stripeLayer = towel.querySelector(".stripe-layer");
        
        if (!footer || !stripeLayer) return;
        
        // create arrow buttons
        const upArrow = document.createElement("button");
        upArrow.className = "scroll-arrow scroll-up";
        upArrow.innerHTML = "▲";
        upArrow.setAttribute("aria-label", "Scroll up");
        
        const downArrow = document.createElement("button");
        downArrow.className = "scroll-arrow scroll-down";
        downArrow.innerHTML = "▼";
        downArrow.setAttribute("aria-label", "Scroll down");
        
        // add buttons to footer
        footer.appendChild(upArrow);
        footer.appendChild(downArrow);
        
        //  scroll per click
        const scrollAmount = 100;
        
        // update button states based on scroll position
        const updateArrowStates = () => {
            if (!isMobile()) {
                upArrow.style.display = "none";
                downArrow.style.display = "none";
                return;
            }
            
            upArrow.style.display = "flex";
            downArrow.style.display = "flex";
            
            const atTop = stripeLayer.scrollTop <= 0;
            const atBottom = stripeLayer.scrollTop + stripeLayer.clientHeight >= stripeLayer.scrollHeight - 1;
            
            upArrow.classList.toggle("disabled", atTop);
            downArrow.classList.toggle("disabled", atBottom);
        };
        
        // scroll handlers
        upArrow.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            stripeLayer.scrollBy({
                top: -scrollAmount,
                behavior: "smooth"
            });
        });
        
        downArrow.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            stripeLayer.scrollBy({
                top: scrollAmount,
                behavior: "smooth"
            });
        });
        
        // listen for scroll events to update button states
        stripeLayer.addEventListener("scroll", updateArrowStates);
        
        // update on window resize
        window.addEventListener("resize", updateArrowStates);
        
        // init state
        updateArrowStates();
    });
});