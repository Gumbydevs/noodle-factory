function triggerNoodleRoll() {
    const noodle = document.getElementById('noodle-tumbleweed');
    
    // Only trigger if noodle isn't currently rolling
    if (!noodle.classList.contains('rolling')) {
        noodle.classList.remove('hidden');
        noodle.classList.add('rolling');
        
        // Reset after animation completes
        setTimeout(() => {
            noodle.classList.remove('rolling');
            noodle.classList.add('hidden');
        }, 4000);
    }
}

// Randomly trigger the noodle roll
function startRandomNoodleRolls() {
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every 5 seconds
            triggerNoodleRoll();
        }
    }, 5000);
}

// Start the random rolls when the page loads
window.addEventListener('load', startRandomNoodleRolls);

export { triggerNoodleRoll };