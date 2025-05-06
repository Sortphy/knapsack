/**
 * Brute Force algorithm for the Knapsack Problem
 * Checks all possible combinations of items
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Object} - Result with bestValue, bestCombination, steps and allCombinations
 */
function bruteForceKnapsack(items, capacity) {
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
        currentValue += items[j].value;
        currentWeight += items[j].weight;
        combination.push(items[j]);
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
      bestCombination = combination;
    }
  }
  return { bestValue, bestCombination, steps, allCombinations };
}

export default bruteForceKnapsack; 