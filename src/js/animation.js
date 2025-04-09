function triggerNoodleRoll() {
    const noodle = document.getElementById('noodle-tumbleweed');
    
    if (!noodle.classList.contains('rolling')) {
        // Adjusted ranges to maintain noodle-like proportions
        const lengthScale = Math.random() * 2.0 + 0.8; // 0.8x to 2.8x length (longer range)
        const thicknessScale = Math.random() * 0.6 + 0.2; // 0.2x to 0.8x thickness (thinner range)

        // Prevent non-noodle shapes by enforcing minimum length-to-thickness ratio
        const minRatio = 3; // Minimum length to thickness ratio
        const actualRatio = lengthScale / thicknessScale;
        
        // Adjust length if ratio is too small
        const finalLengthScale = actualRatio < minRatio ? 
            thicknessScale * minRatio : lengthScale;

        // Direct transform application with ratio check
        noodle.style.transform = '';  // Reset transform first
        requestAnimationFrame(() => {
            noodle.style.transform = `scaleX(${finalLengthScale}) scaleY(${thicknessScale})`;
            noodle.classList.remove('hidden');
            noodle.classList.add('rolling');
        });
        
        setTimeout(() => {
            noodle.classList.remove('rolling');
            noodle.classList.add('hidden');
            noodle.style.transform = '';
        }, 4000);
        
        // Debug output to verify variations
        console.log(`Noodle size - Length: ${finalLengthScale.toFixed(2)}x, Thickness: ${thicknessScale.toFixed(2)}x, Ratio: ${(finalLengthScale/thicknessScale).toFixed(2)}`);
    }
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
});

// Card animation handling
function handleCardClick(card) {
    if (card.classList.contains('unplayable')) return;
    
    // Remove any existing animations
    card.style.animation = 'none';
    card.offsetHeight; // Trigger reflow
    
    // Mark as selected and trigger vanish animation
    card.dataset.selected = 'true';
    card.classList.add('played');
    
    // Ensure animations complete
    card.addEventListener('animationend', () => {
        card.style.display = 'none';
    }, { once: true });
}

// Handle cards that weren't selected
function handleUnselectedCards(cards) {
    cards.forEach(card => {
        if (!card.dataset.selected) {
            card.classList.add('played');
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

export { 
    triggerNoodleRoll, 
    randomizeNoodle,
    handleCardClick,
    handleUnselectedCards,
    resetCardState
};