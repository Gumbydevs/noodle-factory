let noodleRollEnabled = true;

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
        // More dramatic selected card animation
        const angle = -45 + Math.random() * 90;
        const finalY = -60 - Math.random() * 40;
        
        card.style.setProperty('--start-x', `${startX}px`);
        card.style.setProperty('--start-y', `${startY}px`);
        card.style.setProperty('--vanish-angle', `${angle}deg`);
        card.style.setProperty('--vanish-y', `${finalY}px`);
        
        requestAnimationFrame(() => {
            card.style.animation = 'selectedCardVanish 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
        });
    } else {
        // More dramatic unselected card animation
        const angle = Math.random() * 360;
        const distance = 80 + Math.random() * 120;
        const dx = Math.cos(angle * Math.PI / 180) * distance;
        const dy = Math.sin(angle * Math.PI / 180) * distance;
        
        card.style.setProperty('--fade-x', `${dx}px`);
        card.style.setProperty('--fade-y', `${dy}px`);
        card.style.setProperty('--fade-rot', `${-90 + Math.random() * 180}deg`);
        
        requestAnimationFrame(() => {
            card.style.animation = 'unselectedCardVanish 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards';
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
            
            // Add played class and shrink animation
            card.classList.add('played');
            card.style.animation = 'shrinkFadeAway 0.5s ease-out forwards';
            
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

export { 
    triggerNoodleRoll, 
    randomizeNoodle,
    addCardHoverEffects,
    handleCardClick,
    handleUnselectedCards,
    resetCardState,
    setNoodleRollEnabled,
    setupGameTransitions
};