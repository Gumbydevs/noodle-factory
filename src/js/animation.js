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

// Card animation handling
function handleCardClick(card) {
    if (card.classList.contains('unplayable')) return;
    
    // First, remove all existing animations and transformations
    card.style.cssText = '';
    card.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max');
    
    // Force a reflow to ensure clean animation state
    void card.offsetWidth;
    
    // Remove any existing event listeners
    card.removeEventListener('animationend', hideCard);
    
    // Set up the card for playing animation
    card.dataset.selected = 'true';
    card.classList.add('played');
    card.style.zIndex = '100';
    
    // Function to hide the card after animation
    function hideCard() {
        card.style.display = 'none';
        card.removeEventListener('animationend', hideCard);
    }
    
    // Add event listener for animation end
    card.addEventListener('animationend', hideCard, { once: true });
    
    // Start the animation on next frame, ensuring mobile browsers have time to process
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if ('ontouchstart' in window) {
                // Mobile devices: simpler animation
                card.style.transform = 'scale(0.8) translateY(-20px)';
                card.style.opacity = '0';
                card.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';
            } else {
                // Desktop: full animation
                card.style.animation = 'selectedCardVanish 0.8s ease-out forwards';
            }
        });
    });
}

// Handle cards that weren't selected
function handleUnselectedCards(cards) {
    cards.forEach(card => {
        if (!card.dataset.selected) {
            // Remove chaos animations first
            card.style.cssText = '';
            card.classList.remove('chaos-level-1', 'chaos-level-2', 'chaos-level-3', 'chaos-level-max');
            void card.offsetHeight;
            
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
    card.style.animation = '';
    card.style.transform = '';
    card.style.display = '';
    card.classList.remove('played');
    card.removeAttribute('data-selected');
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

function setupCardAnimations() {
    // Observe for new cards being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('card')) {
                        addCardHoverEffects(node);
                    }
                });
            }
        });
    });

    // Start observing the cards container
    const cardsContainer = document.getElementById('cards-container');
    if (cardsContainer) {
        observer.observe(cardsContainer, {
            childList: true,
            subtree: true
        });
    }
}

function addCardHoverEffects(card) {
    // Add initial state
    card.style.transform = 'translateY(20px)';
    card.style.opacity = '0';
    card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';

    // Force reflow
    void card.offsetWidth;

    // Animate in
    card.style.transform = 'translateY(0)';
    card.style.opacity = '1';

    // Add hover animations
    card.addEventListener('mouseenter', () => {
        if (!card.classList.contains('unplayable')) {
            card.style.transform = 'translateY(-5px)';
        }
    });

    card.addEventListener('mouseleave', () => {
        if (!card.classList.contains('unplayable')) {
            card.style.transform = 'translateY(0)';
        }
    });
}

function setNoodleRollEnabled(enabled) {
    noodleRollEnabled = enabled;
}

export { 
    triggerNoodleRoll, 
    randomizeNoodle,
    handleCardClick,
    handleUnselectedCards,
    resetCardState,
    setNoodleRollEnabled,
    setupGameTransitions
};