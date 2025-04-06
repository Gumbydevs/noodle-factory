// Define some sample events
const events = [
  {
    text: "The noodle pot is bubbling over!",
    left: {
      text: "Stir it vigorously",
      effect: (state) => { state.spiceLevel += 1; state.noodletude -= 1; }
    },
    right: {
      text: "Let it boil",
      effect: (state) => { state.spiceLevel -= 1; state.noodletude += 1; }
    }
  },
  {
    text: "A mysterious ingredient appears!",
    left: {
      text: "Inspect it closely",
      effect: (state) => { state.ingredients += 1; }
    },
    right: {
      text: "Throw it in the pot",
      effect: (state) => { state.spiceLevel += 2; }
    }
  },
  {
    text: "Your workers are feeling lazy!",
    left: {
      text: "Motivate them with noodles",
      effect: (state) => { state.noodletude += 2; }
    },
    right: {
      text: "Force them to work harder",
      effect: (state) => { state.noodletude -= 2; }
    }
  }
];

// Function to trigger a random event
function triggerRandomEvent(state) {
  const event = events[Math.floor(Math.random() * events.length)];
  return event;
}

// Export the events and the trigger function
export { events, triggerRandomEvent };