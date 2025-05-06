/**
 * Brute Force algorithm for the Knapsack Problem
 * Checks all possible combinations of items
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Object} - Result with bestValue, bestCombination, steps and allCombinations
 */
function bruteForceKnapsack(items, capacity) {
  console.log("bruteForceKnapsack called with items:", items, "capacity:", capacity);
  
  let bestValue = 0;
  let bestCombination = [];
  const n = items.length;
  const totalCombinations = 1 << n; // 2^n combinations
  let steps = 0;
  const allCombinations = [];
  
  for (let i = 0; i < totalCombinations; i++) {
    steps++;
    let currentValue = 0;
    let currentWeight = 0;
    let combination = [];
    for (let j = 0; j < n; j++) {
      steps++;
      if (i & (1 << j)) {
        // Make sure we're preserving the original item object with its id
        const item = items[j];
        currentValue += item.value;
        currentWeight += item.weight;
        combination.push(item);
      }
    }
    allCombinations.push({
      combination,
      value: currentValue,
      weight: currentWeight,
      valid: currentWeight <= capacity
    });
    if (currentWeight <= capacity && currentValue > bestValue) {
      bestValue = currentValue;
      // Make sure we copy the array to avoid references
      bestCombination = [...combination];
    }
  }
  
  console.log("bruteForceKnapsack returned bestCombination:", bestCombination);
  return { bestValue, bestCombination, steps, allCombinations };
}

export default bruteForceKnapsack; 