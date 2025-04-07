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
    const noodleBody = document.querySelector('.noodle-body');
    const noodleTop = document.querySelector('.noodle-body-top');
    const svg = document.querySelector('.noodle-worm');
    
    // Generate random size
    const thickness = Math.random() * 5 + 1;
    const length = Math.random() * 200 + 60;
    const midX = length / 2;
    
    // Reset animation and position
    svg.classList.remove('moving');
    
    // Adjust viewBox and paths
    svg.setAttribute('viewBox', `0 0 ${Math.max(180, length + 20)} 60`);
    
    const basePath = `M5,30 Q${midX-25},10 ${midX},30 T${length},30`;
    const animationPath = `M5,30 Q${midX-25},50 ${midX},30 T${length},30`;
    
    // Set attributes
    noodleBody.setAttribute('stroke-width', thickness);
    noodleTop.setAttribute('stroke-width', Math.max(1, thickness - 2));
    
    [noodleBody, noodleTop].forEach(path => {
        path.setAttribute('d', basePath);
        const animate = path.querySelector('animate');
        animate.setAttribute('values', `${basePath};
                                     ${animationPath};
                                     ${basePath}`);
    });

    // Start the movement animation after setting new size
    requestAnimationFrame(() => {
        svg.classList.add('moving');
    });
}

let noodleTimeout;

function scheduleNextNoodle() {
    if (noodleTimeout) {
        clearTimeout(noodleTimeout);
    }
    
    const minDelay = 30000; // 30 seconds
    const maxDelay = 90000; // 90 seconds
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    noodleTimeout = setTimeout(() => {
        randomizeNoodle();
        scheduleNextNoodle();
    }, delay);
}

// Start the cycle
window.addEventListener('load', () => {
    randomizeNoodle();  // Show first noodle immediately
    scheduleNextNoodle();  // Schedule next one with delay
});

export { triggerNoodleRoll, randomizeNoodle };