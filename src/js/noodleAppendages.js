/**
 * Noodle Appendages System
 * Adds dynamic noodle arms to cards when chaos level exceeds 60
 */

// Store references to cards that have appendages to avoid duplicates
const cardsWithAppendages = new Set();

// Configuration for appendage appearance chances
const APPENDAGE_CONFIG = {
    minChaos: 60,           // Minimum chaos level to start showing appendages
    checkInterval: 2200,    // Longer interval for less frequent checks
    chancePerCard: 0.11,    // Even lower base chance for more randomness
    maxAppendages: 2,       // Default max appendages per card (one on each side)
    growDuration: 800,      // Time to grow an appendage
    strokeWidthMin: 0.7,    // Minimum thickness of noodle (even thinner)
    strokeWidthMax: 3,      // Maximum thickness of noodle (reduced max thickness)
    minBaseHeight: 25,      // Minimum base height for appendages
    maxBaseHeight: 60,      // Maximum base height for appendages
    wiggliness: 2.5,        // Factor for how squiggly the noodles are
    offsetFromCard: -3,     // Negative value to ensure appendage overlaps with card
};

// Keep track of the check interval
let appendageCheckInterval = null;

/**
 * Start monitoring cards for potential appendage additions
 * This should be called when the game starts
 */
function startNoodleAppendageSystem() {
    // Clear any existing interval
    if (appendageCheckInterval) {
        clearInterval(appendageCheckInterval);
    }
    
    // Start a new check interval
    appendageCheckInterval = setInterval(checkForAppendageAddition, APPENDAGE_CONFIG.checkInterval);
}

/**
 * Stop the appendage system
 */
function stopNoodleAppendageSystem() {
    if (appendageCheckInterval) {
        clearInterval(appendageCheckInterval);
        appendageCheckInterval = null;
    }
}

/**
 * Check chaos level and randomly add appendages to cards
 */
function checkForAppendageAddition() {
    // Get game instance if available
    const game = window.gameInstance;
    if (!game || game.isGameOver || game.isPaused) return;
    
    // Check if chaos level is high enough
    const chaosLevel = game.state.playerStats.chaosLevel;
    if (chaosLevel < APPENDAGE_CONFIG.minChaos) {
        // If chaos dropped below threshold, remove all appendages
        removeAllAppendages();
        return;
    }
    
    // Get all visible cards (both normal cards and upgrade cards)
    const normalCards = Array.from(document.querySelectorAll('.card:not(.disappearing)'));
    const upgradeCards = Array.from(document.querySelectorAll('.upgrade-card:not(.disappearing)'));
    const allCards = [...normalCards, ...upgradeCards];
    
    // No visible cards, nothing to do
    if (allCards.length === 0) return;
    
    // Increase chance based on chaos level
    const chaosFactor = (chaosLevel - APPENDAGE_CONFIG.minChaos) / 40; // Normalized factor
    const chanceMultiplier = 1 + chaosFactor * 1.5; // Increased multiplier for more arms at higher chaos
    const effectiveChance = APPENDAGE_CONFIG.chancePerCard * chanceMultiplier;
      // Always use the default max appendages (left and right only)
    const maxAllowedAppendages = APPENDAGE_CONFIG.maxAppendages; // Always 2 (left and right)
    
    // Cards without any appendages - give them higher priority
    const emptyCards = allCards.filter(card => card.querySelectorAll('.noodle-appendage').length === 0);
    
    // Give empty cards a chance to get appendages first
    if (emptyCards.length > 0) {
        // Higher chance for empty cards but still keep it random
        const emptyCardChance = effectiveChance * 1.5;
        
        // Try to add appendages to empty cards first
        emptyCards.forEach(card => {
            // Further randomize which cards get appendages - each card has only a 50% base chance
            if (Math.random() < 0.5 && Math.random() < emptyCardChance) {
                // Add both appendages to create the pair effect
                addRandomAppendageToCard(card, chaosLevel);
            }
        });
    }
    
    // Then check all other cards that might have one appendage already or need extra tentacles
    allCards.forEach(card => {
        // Skip cards that already have max appendages for current chaos level
        const existingAppendages = card.querySelectorAll('.noodle-appendage');
        if (existingAppendages.length >= maxAllowedAppendages) return;
        
        // Random chance based on chaos
        if (Math.random() < effectiveChance) {
            addRandomAppendageToCard(card, chaosLevel);
        }
    });
}

/**
 * Add a pair of noodle appendages to a card (one on each side, with slight delay between)
 * @param {HTMLElement} card - The card element to add appendages to
 * @param {number} chaosLevel - Current chaos level
 */
function addRandomAppendageToCard(card, chaosLevel) {
    // Count existing appendages
    const existingAppendages = card.querySelectorAll('.noodle-appendage');
    const existingCount = existingAppendages.length;
    
    // Determine available positions
    const existingLeft = card.querySelector('.noodle-appendage-left');
    const existingRight = card.querySelector('.noodle-appendage-right');
    
    // If already have base appendages (left and right) and chaos level not high enough for extra tentacles, do nothing
    if (existingLeft && existingRight && chaosLevel < APPENDAGE_CONFIG.highChaosThreshold) {
        return;
    }
    
    // Generate a shared length factor for this card to keep opposing limbs similar
    // This will be used to calculate base heights for this card's appendages
    const cardHeightFactor = Math.random(); // 0-1 random factor unique to this card
    
    // If no appendages exist yet, add both left and right with a slight delay between them
    if (!existingLeft && !existingRight) {
        // Add first arm immediately
        const firstSide = Math.random() < 0.5 ? 'left' : 'right';
        createNoodleAppendage(card, firstSide, chaosLevel, cardHeightFactor);
        
        // Add second arm with slight delay (between 300-800ms)
        const delay = 300 + Math.floor(Math.random() * 500);
        setTimeout(() => {
            // Double check the card is still in the DOM
            if (card.isConnected) {
                const secondSide = firstSide === 'left' ? 'right' : 'left';
                createNoodleAppendage(card, secondSide, chaosLevel, cardHeightFactor);
            }
        }, delay);
    } 
    // If one base arm is missing, add it
    else if (!existingLeft || !existingRight) {
        // One side already has an appendage, add the other side
        const side = existingLeft ? 'right' : 'left';
        createNoodleAppendage(card, side, chaosLevel, cardHeightFactor);
    }    // We no longer add extra tentacles at high chaos levels, 
    // just stick with the base left and right arms
    else {
        // Both arms exist, nothing more to do
        return;
    }
}

/**
 * Create a noodle appendage on a card
 * @param {HTMLElement} card - The card to attach the appendage to
 * @param {string} side - Either 'left' or 'right'
 * @param {number} chaosLevel - Current chaos level
 * @param {number} sharedHeightFactor - Optional shared factor for arm length
 */
function createNoodleAppendage(card, side, chaosLevel, sharedHeightFactor = Math.random()) {
    // Create the appendage container
    const appendage = document.createElement('div');
    appendage.className = `noodle-appendage noodle-appendage-${side} growing`;
    
    // Random height based on chaos level and shared factor for more consistent opposing limbs
    const chaosFactor = 1 + ((chaosLevel - APPENDAGE_CONFIG.minChaos) / 40); // 1.0-2.0
    const heightBase = APPENDAGE_CONFIG.minBaseHeight + 
        sharedHeightFactor * (APPENDAGE_CONFIG.maxBaseHeight - APPENDAGE_CONFIG.minBaseHeight);
    const height = heightBase * chaosFactor;
    
    // Make left and right arms less symmetrical for more organic feel
    // Get the opposite arm if it exists
    const oppositeSide = side === 'left' ? 'right' : 'left';
    const oppositeArm = card.querySelector(`.noodle-appendage-${oppositeSide}`);
    
    // Random width, generally thinner than before
    let width;
    if (oppositeArm && oppositeArm.style.width) {
        const oppositeWidth = parseInt(oppositeArm.style.width);
        // Slight variation between arms but still similar
        width = oppositeWidth + (Math.random() * 8 - 4); // Small variation of +/-4px
    } else {
        // Generally thinner width
        width = 12 + Math.floor(Math.random() * 10);
    }
    
    // Randomize vertical positioning
    const verticalPosition = 25 + Math.floor(Math.random() * 20); // 25-45% from bottom
    
    appendage.style.height = `${height}px`;
    appendage.style.width = `${width}px`;
    appendage.style.bottom = `${verticalPosition}%`; // Randomized vertical positioning
    
    // Apply the offset to make the appendage base closer to the card
    if (APPENDAGE_CONFIG.offsetFromCard) {
        appendage.style.left = side === 'left' ? `${APPENDAGE_CONFIG.offsetFromCard}px` : '';
        appendage.style.right = side === 'right' ? `${APPENDAGE_CONFIG.offsetFromCard}px` : '';
    }
      // Create SVG noodle path - more curviness at higher chaos levels
    const curveFactor = Math.min(1 + (chaosLevel - APPENDAGE_CONFIG.minChaos) / 20, 2);
    // Apply wiggliness multiplier from the config
    const wigglinessMultiplier = APPENDAGE_CONFIG.wiggliness || 1;
    const curviness = (Math.random() * 15 + 5) * curveFactor * wigglinessMultiplier;
    const svg = createNoodleSVG(width, height, curviness, side);
    
    appendage.innerHTML = svg;
    card.appendChild(appendage);
    
    // Force reflow
    void appendage.offsetHeight;
    
    // Start growth animation
    const scaleDirection = side === 'left' ? '-45deg' : '45deg';
    appendage.style.transition = `transform ${APPENDAGE_CONFIG.growDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
    appendage.style.transform = `rotate(${scaleDirection}) scaleY(1)`;
    
    // Track that this card has an appendage
    cardsWithAppendages.add(card);
    
    // Remove growing class after animation completes to start wiggling
    setTimeout(() => {
        if (appendage.isConnected) { // Check if still in DOM
            appendage.classList.remove('growing');
        }
    }, APPENDAGE_CONFIG.growDuration);
}

/**
 * Create an SVG path for a noodle
 * @param {number} width - Width of the noodle
 * @param {number} height - Height of the noodle
 * @param {number} curviness - How curvy the noodle should be (not used for straight line)
 * @param {string} side - Either 'left' or 'right'
 * @returns {string} - SVG markup
 */
function createNoodleSVG(width, height, curviness, side) {
    // Random stroke width (thinner overall)
    const strokeWidth = APPENDAGE_CONFIG.strokeWidthMin + 
        Math.random() * (APPENDAGE_CONFIG.strokeWidthMax - APPENDAGE_CONFIG.strokeWidthMin);
    
    // Create a simple straight line from bottom center to top center
    const pathData = `M ${width/2},${height} L ${width/2},0`;
    
    // Create SVG with the path - just a simple straight line
    return `
        <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <path d="${pathData}" stroke-width="${strokeWidth}" stroke-linecap="round" fill="none" stroke="#FFE5B4" />
        </svg>
    `;
}

/**
 * Remove all appendages from a card
 * @param {HTMLElement} card - The card to clean
 */
function removeAppendagesFromCard(card) {
    if (!card) return;
    
    const appendages = card.querySelectorAll('.noodle-appendage');
    appendages.forEach(appendage => {
        // Animate out
        appendage.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
        appendage.style.transform = 'scaleY(0)';
        appendage.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => appendage.remove(), 300);
    });
    
    // Remove from tracking
    cardsWithAppendages.delete(card);
}

/**
 * Remove all appendages from all cards
 */
function removeAllAppendages() {
    document.querySelectorAll('.noodle-appendage').forEach(appendage => {
        // Animate out
        appendage.style.transition = 'transform 0.3s ease-in, opacity 0.3s ease-in';
        appendage.style.transform = 'scaleY(0)';
        appendage.style.opacity = '0';
        
        // Remove after animation
        setTimeout(() => appendage.remove(), 300);
    });
    
    // Clear tracking set
    cardsWithAppendages.clear();
}

/**
 * Clean up appendages from cards that are being removed
 * Should be called when a card is played or discarded
 * @param {HTMLElement} card - The card being removed
 */
function cleanupAppendagesForCard(card) {
    removeAppendagesFromCard(card);
}

/**
 * Update appendage status based on current chaos level
 * @param {number} chaosLevel - Current chaos level
 */
function updateAppendagesForChaosLevel(chaosLevel) {
    if (chaosLevel < APPENDAGE_CONFIG.minChaos) {
        removeAllAppendages();
    }
}

// Extra tentacle functionality has been removed

// Export functions to be used in game.js
window.noodleAppendages = {
    start: startNoodleAppendageSystem,
    stop: stopNoodleAppendageSystem,
    cleanup: cleanupAppendagesForCard,
    updateForChaos: updateAppendagesForChaosLevel
};
