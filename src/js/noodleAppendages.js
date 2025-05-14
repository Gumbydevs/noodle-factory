/**
 * Noodle Appendages System
 * Adds dynamic noodle arms to cards when chaos level exceeds 60
 */

// Store references to cards that have appendages to avoid duplicates
const cardsWithAppendages = new Set();

// Configuration for appendage appearance chances
const APPENDAGE_CONFIG = {
    minChaos: 60,           // Minimum chaos level to start showing appendages
    checkInterval: 2000,    // Longer interval for less frequent checks
    chancePerCard: 0.11,    // Even lower base chance for more randomness
    maxAppendages: 6,       // Default max appendages per card (one on each side)
    growDuration: 1000,      // Time to grow an appendage
    strokeWidthMin: 0.5,    // Even thinner minimum thickness (was 0.7)
    strokeWidthMax: 3.2,    // Reduced maximum thickness (was 3)
    minBaseHeight: 40,      // Increased minimum base height (was 25)
    maxBaseHeight: 120,     // Increased maximum base height for longer noodles (was 60)
    wiggliness: 8.5,        // Factor for how squiggly the noodles are
    offsetFromCard: 9,     // Negative value to ensure appendage overlaps with card
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
        const emptyCardChance = effectiveChance * 1.2; // Reduced multiplier for more randomness
        
        // Try to add appendages to empty cards first - more randomized approach
        emptyCards.forEach(card => {
            // Further restrict chance - only about 30% of cards will get arms on any given check
            // This creates more variety in which cards have appendages
            if (Math.random() < 0.3 && Math.random() < emptyCardChance) {
                // Always add both appendages to create the proper pair effect
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
      // Enhanced height calculation for longer noodles with more variation
    const chaosFactor = 1.2 + ((chaosLevel - APPENDAGE_CONFIG.minChaos) / 30); // 1.2-2.5 (increased range)
    const heightRandomizer = sharedHeightFactor * 0.7 + (Math.random() * 0.3); // Use shared factor but add some randomness
    const heightBase = APPENDAGE_CONFIG.minBaseHeight + 
        heightRandomizer * (APPENDAGE_CONFIG.maxBaseHeight - APPENDAGE_CONFIG.minBaseHeight);
    const height = heightBase * chaosFactor; // Taller overall
    
    // Make left and right arms less symmetrical for more organic feel
    // Get the opposite arm if it exists
    const oppositeSide = side === 'left' ? 'right' : 'left';
    const oppositeArm = card.querySelector(`.noodle-appendage-${oppositeSide}`);
    
    // Random width, but much thinner than before to match the bottom noodle animation
    let width;
    if (oppositeArm && oppositeArm.style.width) {
        const oppositeWidth = parseInt(oppositeArm.style.width);
        // Small variation between arms to keep them looking like a pair
        width = oppositeWidth + (Math.random() * 4 - 2); // Smaller variation of +/-2px
    } else {
        // Much thinner overall width (was 12-22, now 6-14)
        width = 6 + Math.floor(Math.random() * 8);
    }
      // Randomize vertical positioning - increased range for more variety
    const verticalPosition = 20 + Math.floor(Math.random() * 35); // 20-55% from bottom
    
    // Randomize the height independently for each appendage
    // Multiply by a random factor to ensure greater variation between cards
    const randomHeightMultiplier = 0.85 + (Math.random() * 0.3); // 0.85-1.15 random multiplier
    const finalHeight = height * randomHeightMultiplier;
    
    appendage.style.height = `${finalHeight}px`;
    appendage.style.width = `${width}px`;
    appendage.style.bottom = `${verticalPosition}%`; // More randomized vertical positioning// Apply the offset to make the appendage base closer to the card
    // Make offset value more positive since original is negative (-3)
    // Since APPENDAGE_CONFIG.offsetFromCard is -3, we need to use a less negative value
    const closerOffset = APPENDAGE_CONFIG.offsetFromCard + 3; // Move 3px closer to card edge
    if (APPENDAGE_CONFIG.offsetFromCard) {
        appendage.style.left = side === 'left' ? `${closerOffset}px` : '';
        appendage.style.right = side === 'right' ? `${closerOffset}px` : '';
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
 * @param {number} curviness - How curvy the noodle should be (controls wiggle amount)
 * @param {string} side - Either 'left' or 'right'
 * @returns {string} - SVG markup
 */
function createNoodleSVG(width, height, curviness, side) {
    // Random stroke width (much thinner now to look like the bottom noodle)
    const strokeWidth = APPENDAGE_CONFIG.strokeWidthMin + 
        Math.random() * (APPENDAGE_CONFIG.strokeWidthMax - APPENDAGE_CONFIG.strokeWidthMin);
      // Create a wavy noodle path similar to the noodleRoll animation
    const centerX = width/2;
    const midY = height/2;
    
    // Direction of initial curve (opposite to the side of attachment for natural look)
    const initialDirection = side === 'left' ? 1 : -1;
    
    // Calculate a more gentle curviness that won't cause clipping
    // Reduce the curviness to avoid aggressive curves
    const gentleCurviness = Math.min(curviness * 0.5, width * 0.4);
    
    // Create a spaghetti-like curve with gentler curves to avoid clipping
    // Using a simpler curve that stays within the container bounds
    const pathData = `M ${centerX},${height} ` + 
                    `Q${centerX + (initialDirection * gentleCurviness)},${height - height/3} ` +
                    `${centerX},${midY} ` + 
                    `Q${centerX - (initialDirection * gentleCurviness * 0.7)},${height/4} ` +
                    `${centerX},0`;
    
    // Add padding to the viewBox to ensure the curve doesn't get clipped
    // Make the viewBox wider to accommodate the curves
    const viewBoxWidth = width * 1.5;
    const viewBoxHeight = height;
    const viewBoxX = -(viewBoxWidth - width) / 2; // Center the wider viewBox    // Create much more distinct animation paths for very noticeable wiggling
    // First animation state - stronger curve in one direction
    const animPath1 = `M ${centerX},${height} ` + 
                      `Q${centerX + (initialDirection * gentleCurviness * 1.7)},${height - height/3} ` +
                      `${centerX - (initialDirection * gentleCurviness * 0.6)},${midY} ` + 
                      `Q${centerX - (initialDirection * gentleCurviness * 1.5)},${height/4} ` +
                      `${centerX},0`;
    
    // Second animation state - stronger curve in the opposite direction
    const animPath2 = `M ${centerX},${height} ` + 
                      `Q${centerX + (initialDirection * gentleCurviness * 0.4)},${height - height/2.5} ` +
                      `${centerX + (initialDirection * gentleCurviness * 1)},${midY} ` + 
                      `Q${centerX - (initialDirection * gentleCurviness * 0.3)},${height/3} ` +
                      `${centerX},0`;
    
    // Create SVG with the animated path - much more pronounced wiggling and faster animation
    return `
        <svg viewBox="${viewBoxX} 0 ${viewBoxWidth} ${viewBoxHeight}" xmlns="http://www.w3.org/2000/svg">
            <path d="${pathData}" stroke-width="${strokeWidth}" stroke-linecap="round" fill="none" stroke="#FFD700">
                <animate attributeName="d" 
                         values="${pathData};${animPath1};${pathData};${animPath2};${pathData}" 
                         dur="0.9s" 
                         repeatCount="indefinite" />
            </path>
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
