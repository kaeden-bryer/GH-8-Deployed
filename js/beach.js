// beach.js - handles interactive elements on the beach scene
gsap.registerPlugin(ScrollTrigger);

// volleyball physics state
const ballState = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    gravity: 0.5,
    friction: 0.98,
    bounceDamping: 0.7,
    isAnimating: false
};

// boundaries for the ball (relative to beach-page-1)
let bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
};

function initBeachInteractions() {
    const ball = document.querySelector('.beach-volleyball');
    const container = document.querySelector('.beach-page-1');
    
    if (!ball || !container) return;
    
    // calculate boundaries based on container size
    function updateBounds() {
        const containerRect = container.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        
        // keep ball within the beach-page-1 container
        bounds = {
            left: -ballRect.left + containerRect.left + 20,
            right: containerRect.right - ballRect.right - 20,
            top: -ballRect.top + containerRect.top + 20,
            bottom: containerRect.bottom - ballRect.bottom - 20
        };
    }
    
    updateBounds();
    window.addEventListener('resize', updateBounds);
    
    // hit the ball when cursor enters it
    ball.addEventListener('mouseenter', (e) => {
        hitBall(e, ball);
    });
    
    // also hit on click for mobile/touch
    ball.addEventListener('click', (e) => {
        hitBall(e, ball, 1.5); // stronger hit on click
    });
}

function hitBall(e, ball, multiplier = 1) {
    const ballRect = ball.getBoundingClientRect();
    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    
    // calculate direction away from cursor
    const dx = ballCenterX - e.clientX;
    const dy = ballCenterY - e.clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // normalize and apply force (stronger hits launch further)
    const force = (15 + Math.random() * 10) * multiplier;
    ballState.vx += (dx / distance) * force;
    ballState.vy += (dy / distance) * force - 8; // slight upward bias
    
    // start physics simulation if not already running
    if (!ballState.isAnimating) {
        ballState.isAnimating = true;
        animateBall(ball);
    }
}

function animateBall(ball) {
    // apply physics
    ballState.vy += ballState.gravity;
    ballState.vx *= ballState.friction;
    ballState.vy *= ballState.friction;
    
    // update position
    ballState.x += ballState.vx;
    ballState.y += ballState.vy;
    
    // bounce off boundaries
    if (ballState.x < bounds.left) {
        ballState.x = bounds.left;
        ballState.vx *= -ballState.bounceDamping;
    }
    if (ballState.x > bounds.right) {
        ballState.x = bounds.right;
        ballState.vx *= -ballState.bounceDamping;
    }
    if (ballState.y < bounds.top) {
        ballState.y = bounds.top;
        ballState.vy *= -ballState.bounceDamping;
    }
    if (ballState.y > bounds.bottom) {
        ballState.y = bounds.bottom;
        ballState.vy *= -ballState.bounceDamping;
    }
    
    // apply transform using gsap for smooth rendering
    gsap.set(ball, {
        x: ballState.x,
        y: ballState.y,
        rotation: ballState.x * 2 // spin based on horizontal movement
    });
    
    // continue animation if ball is still moving
    const speed = Math.abs(ballState.vx) + Math.abs(ballState.vy);
    if (speed > 0.1) {
        requestAnimationFrame(() => animateBall(ball));
    } else {
        ballState.isAnimating = false;
    }
}

// initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBeachInteractions);
} else {
    initBeachInteractions();
}
