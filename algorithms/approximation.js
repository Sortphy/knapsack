/**
 * Approximation algorithm for the Knapsack Problem
 * A simple heuristic sorting by value (ignoring weight)
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on approximation approach
 */
function approximationKnapsack(items, capacity) {
  // A simple heuristic: sort by value descending (ignoring weight) and add items
  const sortedItems = [...items].sort((a, b) => {
    return b.value - a.value;
  });
  
  let totalWeight = 0;
  const selected = [];
  
  for (const item of sortedItems) {
    if (totalWeight + item.weight <= capacity) {
      selected.push(item);
      totalWeight += item.weight;
    }
  }
  
  return selected;
}

export default approximationKnapsack; 