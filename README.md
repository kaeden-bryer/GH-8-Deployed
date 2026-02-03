# grizzlyhackerazoo, a.k.a. GrizzHacks 2026: The Beach Episode!!
# Development Guide!

Welcome to the repo. This project uses a modular structure! Please follow these guidelines to ensure consistency and performance.

---

## 1. Project Anatomy

### Finding Your Container
The site is divided into semantic `<section>` blocks. Each section represents a major scene.
* **Intro Scene (`#scene-intro`)**: Handles the initial boat zoom and title reveals.
* **Beach Scene (`#scene-beach`)**: Houses the track selection.
* **River Scene (`#horizontal-scroll-wrapper`)**: Contains the horizontal scrolling bridge and logs.

**Tip:** When adding a new feature, wrap it in a unique ID. If your asset needs to scale or move independently, wrap it in a "wrapper" div (e.g., `.intro-scale-wrapper`) so you don't accidentally warp the layout of other elements.

### Adding Assets & SVGs
1. **Place Files**: Put all images/SVGs in `/assets/`.
2. **Implementation**: 
   - Use `<img>` tags for static decorative assets.
   - Inline the `<svg>` code directly into the HTML if you need to animate specific parts (like changing a color or moving a path) via GSAP.
3. **Responsive Sizing**: Use `width: %` or `vw` instead of fixed pixels so they scale with the container.

**Tip:** Don't know how to get started? I did some basic work on the intro scene, so feel free to skim through (`intro.css`) and (`intro.js`) for some worked examples!

---

## 2. JavaScript & Logic Guidelines

### Creating a New Script
1. Create your file in `/js/` (e.g., `js/river-fx.js`).
2. Add the script tag at the bottom of `index.html` **before** `main.js`.
3. **Register Plugins**: If you use scroll effects, always start with `gsap.registerPlugin(ScrollTrigger);`.

### Coding Standards
* **Single Responsibility**: Each function should ideally only do one thing. For example, have one function to calculate math and another to apply the CSS transform.
* **Direct Comments**: Keep comments lowercase and direct. Explain *why* a specific number or offset is used.
* **Avoid "Main" Bloat**: Don't put everything in `main.js`. Keep scene-specific logic in its own file.

---

## 3. Performance & WebDev Considerations

### The "Lag" Factor
* **Scale with Caution**: Animating `scale` or `width/height` on large images causes heavy browser "reflow" and lag. 
* **Use Transforms**: Always favor `xPercent`, `yPercent`, and `scale` via GSAP/CSS transforms over `top`, `left`, or `width`. These are GPU-accelerated.
* **Will-Change**: If an element is going to be animated, add `will-change: transform;` in your CSS to prepare the browser.

### Responsive Animation
Use `gsap.matchMedia()` to create different animations for mobile and desktop. What looks good as a horizontal zoom on a monitor might need to be a vertical slide on a phone.

---

## 4. CSS Workflow
* **New Scenes**: Create a specific CSS file (e.g., `css/beach.css`) rather than cluttering `global.css`.
* **Units**: Use `clamp()` for typography so titles remain readable on all screen sizes.
* **Pointer Events**: If a title or overlay is sitting on top of a button, set `pointer-events: none;` on the overlay so the user can still click the button underneath.
