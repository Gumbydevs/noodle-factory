let noodleRollEnabled = true;
let echoesEnabled = true;

// Echo system for consistent round visual elements with eyes and arms
function createEcho(x, y, options = {}) {
    if (!echoesEnabled) return null;
    
    // Default options with slight variations
    const defaults = {
        size: 30 + Math.random() * 20, // Base size 30-50px
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`, // Random color
        duration: 2 + Math.random() * 3, // 2-5 seconds duration
        hasInnerCircle: Math.random() > 0.5, // 50% chance of inner circle
        innerCircleSizeRatio: 0.6 + Math.random() * 0.2, // 60-80% of main circle
        innerCircleOffset: {
            x: -5 + Math.random() * 10,
            y: -5 + Math.random() * 10
        }
    };
    
    // Merge provided options with defaults
    const settings = {...defaults, ...options};
    
    // Create the echo element
    const echo = document.createElement('div');
    echo.className = 'game-echo';
    echo.style.position = 'absolute';
    echo.style.left = `${x}px`;
    echo.style.top = `${y}px`;
    echo.style.width = `${settings.size}px`;
    echo.style.height = `${settings.size}px`;
    echo.style.borderRadius = '50%';
    echo.style.backgroundColor = settings.color;
    echo.style.zIndex = '1000';
    echo.style.transition = `transform ${settings.duration * 0.5}s ease-out, opacity ${settings.duration}s ease-out`;
    echo.style.opacity = '0.9';
    
    // Create the inner structure
    let innerHtml = '';
    
    // Add inner circle if needed (for variation)
    if (settings.hasInnerCircle) {
        const innerSize = settings.size * settings.innerCircleSizeRatio;
        innerHtml += `
            <div style="
                position: absolute;
                width: ${innerSize}px;
                height: ${innerSize}px;
                background-color: ${settings.color};
                filter: brightness(1.2);
                border-radius: 50%;
                left: ${settings.innerCircleOffset.x}px;
                top: ${settings.innerCircleOffset.y}px;
                z-index: 2;
            "></div>
        `;
    }
    
    // Add eyes (always present)
    const eyeSize = settings.size * 0.15;
    const eyeDistance = settings.size * 0.25;
    innerHtml += `
        <div class="echo-eyes" style="
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 5;
        ">
            <div class="echo-eye" style="
                position: absolute;
                width: ${eyeSize}px;
                height: ${eyeSize}px;
                background-color: white;
                border-radius: 50%;
                left: calc(50% - ${eyeDistance}px - ${eyeSize/2}px);
                top: calc(40% - ${eyeSize/2}px);
            ">
                <div style="
                    position: absolute;
                    width: ${eyeSize * 0.6}px;
                    height: ${eyeSize * 0.6}px;
                    background-color: black;
                    border-radius: 50%;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                "></div>
            </div>
            <div class="echo-eye" style="
                position: absolute;
                width: ${eyeSize}px;
                height: ${eyeSize}px;
                background-color: white;
                border-radius: 50%;
                left: calc(50% + ${eyeDistance}px - ${eyeSize/2}px);
                top: calc(40% - ${eyeSize/2}px);
            ">
                <div style="
                    position: absolute;
                    width: ${eyeSize * 0.6}px;
                    height: ${eyeSize * 0.6}px;
                    background-color: black;
                    border-radius: 50%;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                "></div>
            </div>
        </div>
    `;
    
    // Add arms (always present)
    const armLength = settings.size * 0.6;
    const armWidth = settings.size * 0.1;
    innerHtml += `
        <div class="echo-arm left-arm" style="
            position: absolute;
            width: ${armWidth}px;
            height: ${armLength}px;
            background-color: ${settings.color};
            filter: brightness(0.8);
            left: 0;
            top: 50%;
            transform-origin: right center;
            transform: translateY(-50%) translateX(-100%) rotate(20deg);
            border-radius: ${armWidth/2}px;
            z-index: 3;
        "></div>
        <div class="echo-arm right-arm" style="
            position: absolute;
            width: ${armWidth}px;
            height: ${armLength}px;
            background-color: ${settings.color};
            filter: brightness(0.8);
            right: 0;
            top: 50%;
            transform-origin: left center;
            transform: translateY(-50%) translateX(100%) rotate(-20deg);
            border-radius: ${armWidth/2}px;
            z-index: 3;
        "></div>
    `;
    
    echo.innerHTML = innerHtml;
    document.body.appendChild(echo);
    
    // Force reflow
    void echo.offsetWidth;
    
    // Randomize initial arm positions
    const leftArm = echo.querySelector('.left-arm');
    const rightArm = echo.querySelector('.right-arm');
    
    if (leftArm && rightArm) {
        leftArm.style.transform = `translateY(-50%) translateX(-100%) rotate(${-30 + Math.random() * 60}deg)`;
        rightArm.style.transform = `translateY(-50%) translateX(100%) rotate(${-30 + Math.random() * 60}deg)`;
    }
    
    // Animate arms periodically
    const animateArms = () => {
        if (!echo.isConnected) return; // Stop if echo was removed
        
        if (leftArm && rightArm) {
            // Smooth transition for arm movement
            leftArm.style.transition = `transform ${0.5 + Math.random() * 0.5}s ease-in-out`;
            rightArm.style.transition = `transform ${0.5 + Math.random() * 0.5}s ease-in-out`;
            
            // Random arm positions
            leftArm.style.transform = `translateY(-50%) translateX(-100%) rotate(${-45 + Math.random() * 90}deg)`;
            rightArm.style.transform = `translateY(-50%) translateX(100%) rotate(${-45 + Math.random() * 90}deg)`;
        }
        
        // Schedule next animation if still in document
        if (echo.isConnected) {
            setTimeout(animateArms, 1000 + Math.random() * 1500);
        }
    };
    
    // Start arm animation
    setTimeout(animateArms, 500);
    
    // Start floating animation
    requestAnimationFrame(() => {
        echo.style.transform = `translate(${-50 + Math.random() * 100}px, ${-50 - Math.random() * 100}px) scale(0.9)`;
        echo.style.opacity = '0';
    });
    
    // Remove the echo after animation completes
    setTimeout(() => {
        echo.remove();
    }, settings.duration * 1000);
    
    return echo;
}

// Create multiple echoes at once
function createEchoGroup(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const offsetX = x + (-30 + Math.random() * 60);
            const offsetY = y + (-30 + Math.random() * 60);
            createEcho(offsetX, offsetY);
        }, i * 150);
    }
}

// Public function to trigger echoes from game events
function triggerEchoEffect(x, y, options = {}) {
    const count = options.count || Math.floor(3 + Math.random() * 5);
    createEchoGroup(x, y, count);
}

function setEchoesEnabled(enabled) {
    echoesEnabled = enabled;
}

function triggerNoodleRoll() {
    if (!noodleRollEnabled) return;
    
    const noodleDecoration = document.querySelector('.noodle-decoration');
    if (!noodleDecoration) return;

    // Reset animation and opacity
    noodleDecoration.style.animation = 'none';
    noodleDecoration.style.opacity = '0';

    // Force reflow
    void noodleDecoration.offsetWidth;

    // Start new animation
    noodleDecoration.style.animation = 'noodleFlyAcross 8s ease-in-out forwards';
}

function randomizeNoodle() {
    // First, remove any existing noodle
    const oldNoodle = document.querySelector('.noodle-decoration');
    if (oldNoodle) {
        oldNoodle.remove();
    }

    // Create new noodle element
    const noodleDecoration = document.createElement('div');
    noodleDecoration.className = 'noodle-decoration';
    
    // Add the SVG content with guaranteed yellow color
    noodleDecoration.innerHTML = `
        <svg class="noodle-worm" viewBox="0 0 180 60">
            <path class="noodle-body" stroke="#FFD700" stroke-width="3" fill="none">
                <animate attributeName="d" dur="1.2s" repeatCount="indefinite"/>
            </path>
            <path class="noodle-body-top" stroke="#FFD700" stroke-width="2" fill="none">
                <animate attributeName="d" dur="1.2s" repeatCount="indefinite"/>
            </path>
        </svg>
    `;
    
    document.body.appendChild(noodleDecoration);
    
    // Add this new code to remove the element after animation
    noodleDecoration.addEventListener('animationend', () => {
        noodleDecoration.remove();
    });

    const svg = noodleDecoration.querySelector('.noodle-worm');
    const noodleBody = noodleDecoration.querySelector('.noodle-body');
    const noodleTop = noodleDecoration.querySelector('.noodle-body-top');
    
    // Generate random sizes
    const thickness = Math.random() * 3 + 2;  // 2-5 thickness
    const length = Math.random() * 300 + 100;  // 100-400 length
    const speed = Math.random() * 4 + 2; // 2-6 seconds
    const size = Math.random() * 120 + 100; // 100-220px width
    
    // Apply random properties
    noodleDecoration.style.setProperty('--animation-duration', `${speed}s`);
    noodleDecoration.style.width = `${size}px`;
    
    const midX = length / 2;
    
    // Adjust viewBox and paths with new dimensions
    svg.setAttribute('viewBox', `0 0 ${Math.max(180, length + 20)} 60`);
    
    const basePath = `M5,30 Q${midX-25},10 ${midX},30 T${length},30`;
    const animationPath = `M5,30 Q${midX-25},50 ${midX},30 T${length},30`;
    
    // Set attributes with new thickness values
    noodleBody.setAttribute('stroke-width', thickness);
    noodleTop.setAttribute('stroke-width', Math.max(1, thickness * 0.6)); // Thinner top line
    
    [noodleBody, noodleTop].forEach(path => {
        path.setAttribute('d', basePath);
        const animate = path.querySelector('animate');
        animate.setAttribute('values', `${basePath};
                                     ${animationPath};
                                     ${basePath}`);
    });

    requestAnimationFrame(() => {
        svg.classList.add('moving');
    });
}

let noodleTimeout;

// Update the scheduling to ensure noodles are visible long enough
function scheduleNextNoodle() {
    if (noodleTimeout) {
        clearTimeout(noodleTimeout);
    }
    
    const minDelay = 15000;  // 15 seconds minimum
    const maxDelay = 45000;  // 45 seconds maximum
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    noodleTimeout = setTimeout(() => {
        randomizeNoodle();
        scheduleNextNoodle();
    }, delay);
}

// Update the window load event handler to show first noodle immediately
window.addEventListener('DOMContentLoaded', () => {
    randomizeNoodle();
    scheduleNextNoodle();
    setupGameTransitions();
});

// Remove any existing card animations
document.querySelectorAll('.card').forEach(card => {
    card.style.cssText = '';
    card.classList.remove('played', 'dissolving', 'clearing');
});

// Create unique animation parameters for each card
function generateRandomParameters() {
    // Increase the range of motion for floating
    const floatX1 = -8 + Math.random() * 16;  // -8px to +8px
    const floatY1 = -10 + Math.random() * 20; // -10px to +10px
    const floatX2 = -8 + Math.random() * 16;
    const floatY2 = -10 + Math.random() * 20;
    const floatX3 = -8 + Math.random() * 16;
    const floatY3 = -10 + Math.random() * 20;
    
    // Increase rotation amounts
    const rot1 = -2 + Math.random() * 4;   // -2 to +2 degrees
    const rot2 = -2 + Math.random() * 4;
    const rot3 = -1 + Math.random() * 2;
    
    // More aggressive twitch parameters
    const twitchX = 30 + Math.random() * 40;  // 30-70px
    const twitchY = -30 + Math.random() * 60; // -30 to +30px
    const twitchRot = -20 + Math.random() * 40; // -20 to +20 degrees
    
    // Faster and more varied timing
    const floatDuration = 2 + Math.random() * 1.5;  // 2-3.5s
    const twitchDuration = 4 + Math.random() * 3;   // 4-7s
    
    // More varied vanish parameters
    const vanishRot = -30 + Math.random() * 60;  // -30 to +30 degrees
    const vanishX = -60 + Math.random() * 120;   // -60 to +60px
    const vanishY = 20 + Math.random() * 40;     // 20 to 60px

    return {
        floatX1, floatY1, floatX2, floatY2, floatX3, floatY3,
        rot1, rot2, rot3,
        twitchX, twitchY, twitchRot,
        floatDuration, twitchDuration,
        vanishRot, vanishX, vanishY
    };
}

// Single source of truth for card animation handling
function addCardHoverEffects(card) {
    // Clear any existing animations and styles
    card.style.cssText = '';
    card.classList.remove('played', 'dissolving', 'clearing');
    
    // Generate random parameters
    const params = generateRandomParameters();
    
    // Set initial offset for more dynamic starting positions
    card.style.setProperty('--initial-offset-x', `${-3 + Math.random() * 6}px`);
    card.style.setProperty('--initial-offset-y', `${-3 + Math.random() * 6}px`);
    card.style.setProperty('--initial-rotation', `${-1 + Math.random() * 2}deg`);
    
    // Apply float parameters
    card.style.setProperty('--float-x1', `${params.floatX1}px`);
    card.style.setProperty('--float-y1', `${params.floatY1}px`);
    card.style.setProperty('--float-x2', `${params.floatX2}px`);
    card.style.setProperty('--float-y2', `${params.floatY2}px`);
    card.style.setProperty('--float-x3', `${params.floatX3}px`);
    card.style.setProperty('--float-y3', `${params.floatY3}px`);
    
    // Apply rotation parameters
    card.style.setProperty('--rot1', `${params.rot1}deg`);
    card.style.setProperty('--rot2', `${params.rot2}deg`);
    card.style.setProperty('--rot3', `${params.rot3}deg`);
    
    // Set twitch parameters
    card.style.setProperty('--twitch-x', `${params.twitchX}px`);
    card.style.setProperty('--twitch-y', `${params.twitchY}px`);
    card.style.setProperty('--twitch-rot', `${params.twitchRot}deg`);
    
    // Set timing parameters - ensure animations don't sync
    card.style.setProperty('--base-duration', `${params.floatDuration}s`);
    card.style.setProperty('--twitch-duration', `${params.twitchDuration}s`);
    
    // Set vanish parameters
    card.style.setProperty('--vanish-rot', `${params.vanishRot}deg`);
    card.style.setProperty('--vanish-x', `${params.vanishX}px`);
    card.style.setProperty('--vanish-y', `${params.vanishY}px`);
    
    // Force hardware acceleration
    card.style.transform = 'translate3d(0,0,0)';
    card.style.willChange = 'transform';
    card.style.backfaceVisibility = 'hidden';
    
    // Add random timing offset to prevent synchronization
    requestAnimationFrame(() => {
        card.style.animationDelay = `-${Math.random() * 4}s`;
    });
}

// Handle card selection with proper animations
function handleCardClick(card) {
    if (card.classList.contains('unplayable')) return;
    
    // Clear existing animations
    card.style.animation = 'none';
    void card.offsetWidth;
    
    // Get current position for more accurate animation
    const rect = card.getBoundingClientRect();
    const startX = rect.left;
    const startY = rect.top;
    
    if (card.dataset.selected === 'true') {
        // First add the wiggle class for initial excitement effect
        card.classList.add('wiggle-selected');
        
        // Create the smoke effect
        createSmokeEffect(card);
        
        // Delay the dissolving effect to allow wiggle animation to complete first
        setTimeout(() => {
            card.classList.add('dissolving');
            
            requestAnimationFrame(() => {
                card.style.setProperty('--tx', '0px');
                card.style.setProperty('--ty', '-60px');
                card.style.animation = 'selectedCardVanish 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
            });
        }, 700); // Longer delay to ensure wiggle animation completes
    } else {
        // Faster unselected card animation
        const angle = Math.random() * 360;
        const distance = 80 + Math.random() * 120;
        const dx = Math.cos(angle * Math.PI / 180) * distance;
        const dy = Math.sin(angle * Math.PI / 180) * distance;
        
        // Add small smoke effect for unselected cards too
        createSmokeEffect(card);
        
        card.style.setProperty('--fade-x', `${dx}px`);
        card.style.setProperty('--fade-y', `${dy}px`);
        card.style.setProperty('--fade-rot', `${-90 + Math.random() * 180}deg`);
        
        // Make unselected cards disappear faster
        requestAnimationFrame(() => {
            card.style.animation = 'unselectedCardVanish 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        });
    }
}

function handleUnselectedCards(cards) {
    cards.forEach(card => {
        if (!card.dataset.selected) {
            // Remove existing animations
            card.style.cssText = '';
            card.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max');
            void card.offsetWidth;
            
            // Add played class and shrink animation - use faster animation
            card.classList.add('played');
            card.style.animation = 'shrinkFadeAway 0.35s ease-out forwards';
            
            card.addEventListener('animationend', () => {
                card.style.display = 'none';
            }, { once: true });
        }
    });
}

// Reset card state when new cards are drawn
function resetCardState(card) {
    // Clear all animations and transforms
    card.style.cssText = '';
    card.classList.remove('played', 'dissolving');
    card.removeAttribute('data-selected');
    
    // Force reflow
    void card.offsetWidth;
    
    // Add base animations
    addCardHoverEffects(card);
}

function setupGameTransitions() {
    // Fade in game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.opacity = '0';
        gameContainer.style.transition = 'opacity 0.5s ease-in-out';
        
        // Delay to allow for initial setup
        setTimeout(() => {
            gameContainer.style.opacity = '1';
        }, 100);
    }

    // Add subtle animations to stats
    const stats = document.getElementById('stats');
    if (stats) {
        stats.style.transform = 'translateY(20px)';
        stats.style.opacity = '0';
        stats.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        
        setTimeout(() => {
            stats.style.transform = 'translateY(0)';
            stats.style.opacity = '1';
        }, 300);
    }

    // Animate each stat individually
    document.querySelectorAll('.stat').forEach((stat, index) => {
        stat.style.transform = 'translateY(20px)';
        stat.style.opacity = '0';
        stat.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
        
        setTimeout(() => {
            stat.style.transform = 'translateY(0)';
            stat.style.opacity = '1';
        }, 400 + (index * 100));
    });

    // Add hover effects for cards
    setupCardAnimations();
}

// Observe for new cards being added and apply animations
const cardObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('card')) {
                addCardHoverEffects(node);
            }
        });
    });
});

function setupCardAnimations() {
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) {
        cardObserver.observe(cardsContainer, {
            childList: true,
            subtree: true
        });
        
        // Apply to existing cards
        cardsContainer.querySelectorAll('.card').forEach(addCardHoverEffects);
    }
}

// Ensure animations are applied when DOM loads
document.addEventListener('DOMContentLoaded', setupCardAnimations);

function setNoodleRollEnabled(enabled) {
    noodleRollEnabled = enabled;
}

function createSmokeEffect(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Make fewer particles for better performance
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'smoke-particle';
        const randomOffsetX = (Math.random() - 0.5) * rect.width * 0.8;
        const randomOffsetY = (Math.random() - 0.5) * rect.height * 0.8;

        particle.style.left = `${centerX + randomOffsetX}px`;
        particle.style.top = `${centerY + randomOffsetY}px`;

        // Make particles more subtle with white color
        particle.style.background = 'rgba(255, 255, 255, 0.7)';
        particle.style.boxShadow = '0 0 5px rgba(255, 255, 255, 0.3)';

        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 50;

        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        document.body.appendChild(particle);

        requestAnimationFrame(() => {
            particle.style.animation = `smoke 0.8s ease-out forwards`;
        });

        setTimeout(() => particle.remove(), 800);
    }
}

export { 
    triggerNoodleRoll, 
    randomizeNoodle,
    addCardHoverEffects,
    handleCardClick,
    handleUnselectedCards,
    resetCardState,
    setNoodleRollEnabled,
    setupGameTransitions,
    // Export the new echo functions
    createEcho,
    createEchoGroup,
    triggerEchoEffect,
    setEchoesEnabled
};