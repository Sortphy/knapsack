/**
 * Greedy algorithm for the Knapsack Problem
 * Sorts items by value/weight ratio and selects the best ones that fit
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on greedy approach
 */
function greedyKnapsack(items, capacity) {
  // Sort items by descending value/weight ratio
  const sortedItems = [...items].sort((a, b) => {
    return (b.value / b.weight) - (a.value / a.weight);
  });
  
  let currentWeight = 0;
  const selected = [];
  
  for (const item of sortedItems) {
    if (currentWeight + item.weight <= capacity) {
      selected.push(item);
      currentWeight += item.weight;
    }
  }
  
  return selected;
}

export default greedyKnapsack; 