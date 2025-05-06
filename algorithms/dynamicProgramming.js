/**
 * Dynamic Programming algorithm for the Knapsack Problem
 * Uses a bottom-up tabulation approach
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items that maximize value
 */
function dynamicProgrammingKnapsack(items, capacity) {
  const n = items.length;
  let steps = 0;
  // Create dp table: rows for items and columns for weight capacities
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    for (let w = 0; w <= capacity; w++) {
      steps++;
      if (item.weight > w) {
        dp[i][w] = dp[i - 1][w];
      } else {
        dp[i][w] = Math.max(
          dp[i - 1][w],
          dp[i - 1][w - item.weight] + item.value
        );
      }
    }
  }
  
  // Reconstruction to get selected items
  let res = dp[n][capacity];
  let w = capacity;
  const selected = [];
  for (let i = n; i > 0 && res > 0; i--) {
    steps++;
    if (res !== dp[i - 1][w]) {
      const item = items[i - 1];
      selected.push(item);
      res -= item.value;
      w -= item.weight;
    }
  }

  return selected;
}

export default dynamicProgrammingKnapsack; 