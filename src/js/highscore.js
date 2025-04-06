export const updateHighScore = (turns) => {
    const currentHigh = localStorage.getItem('noodleFactoryHighScore') || 0;
    if (turns > currentHigh) {
        localStorage.setItem('noodleFactoryHighScore', turns);
        return turns;
    }
    return currentHigh;
};

export const getHighScore = () => {
    return localStorage.getItem('noodleFactoryHighScore') || 0;
};