document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    window.scrollTo(0, 0);
    gsap.registerPlugin(ScrollTrigger);
    gsap.registerPlugin(ScrambleTextPlugin);
    ScrollTrigger.clearScrollMemory();

    let mm = gsap.matchMedia();

    // --- desktop animation ---
    mm.add('(min-width: 769px)', () => {
        const midScale = 0.7; // zoom level for showing the full boat
        const midX = -10;
        const midY = 0;

        // zoom out from frog to half boat
        gsap.to('.intro-scale-wrapper', {
            scale: midScale,
            xPercent: midX,
            yPercent: midY,
            rotation: 0,
            ease: 'power2.inOut',
            force3D: true,
            duration: 0,
        });

        // fade in the title text
        gsap.to(
            '.intro-title-container',
            {
                opacity: 1,
                duration: 0,
                ease: 'power1.out',
            },
            '<80%',
        );

        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#scene-intro',
                start: '1px top',
                pin: true,
                pinSpacing: true,
                scrub: 1,
            },
        });

        // zoom out
        tl.to('.intro-scale-wrapper', {
            scale: 0.25,
            xPercent: 10,
            yPercent: -20,
            ease: 'power1.inOut',
            duration: 1,
        })
            // fade out intro title
            .to(
                '.intro-title-container',
                {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power1.out',
                },
                '<',
            )
            // fade in register title
            .to('.register-title', {
                opacity: 1,
                pointerEvents: 'auto',
                duration: 1,
                ease: 'power1.out',
                onComplete: () => startFrogSurf(), // trigger frog surf here
            });
    });

    // --- mobile animation ---
    mm.add('(max-width: 768px)', () => {
        const midScale = 1;

        // mobile zoom out
        gsap.to('.intro-scale-wrapper', {
            scale: midScale,
            xPercent: 0,
            yPercent: 0,
            rotation: 0,
            ease: 'power2.inOut',
            force3D: true,
            duration: 1,
        });

        gsap.to(
            '.intro-title-container',
            {
                opacity: 1,
                duration: 0.5,
                ease: 'power1.out',
            },
            '<80%',
        );

        let tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#scene-intro',
                start: '1px top',
                scrub: 1,
                pin: true,
                pinSpacing: true,
            },
        });

        // mobile shrink
        tl.to('.intro-scale-wrapper', {
            scale: 0.2,
            yPercent: -50,
            ease: 'power1.inOut',
            duration: 2,
        })
            .to(
                '.intro-title-container',
                {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power1.out',
                },
                '<',
            )
            .to('.register-title', {
                opacity: 1,
                pointerEvents: 'auto',
                duration: 1,
                ease: 'power1.out',
            });
    });

    // --- arrow bounce ---
    gsap.to('.arrow', {
        y: 6,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
    });

    // fade in scroll indicator
    gsap.from('.scroll-indicator', {
        opacity: 0,
        y: 10,
        duration: 0.6,
        delay: 1,
    });
});
