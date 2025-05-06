/**
 * FPTAS (Fully Polynomial Time Approximation Scheme) for the Knapsack Problem
 * Provides a (1-ε)-approximation with polynomial running time
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on the FPTAS approach
 */
function fptasKnapsack(items, capacity) {
  // User defined epsilon for approximation precision. Smaller epsilon -> more accurate and slower.
  const epsilon = 0.2; // You can allow user to change this via an input
  const n = items.length;
  const maxValue = Math.max(...items.map(i => i.value));
  
  // Scaling factor
  const K = (epsilon * maxValue) / n;
  
  // Scale item values
  const scaledValues = items.map(item => {
    return Math.floor(item.value / K);
  });
  
  // DP based on scaled values
  const sumScaled = scaledValues.reduce((acc, cur) => {
    return acc + cur;
  }, 0);
  
  const dp = Array(n + 1).fill(0).map(() => Array(sumScaled + 1).fill(Infinity));
  dp[0][0] = 0;
  
  for (let i = 1; i <= n; i++) {
    const weight = items[i - 1].weight;
    const valueScaled = scaledValues[i - 1];
    for (let j = 0; j <= sumScaled; j++) {
      if (j < valueScaled) {
        dp[i][j] = dp[i - 1][j];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i - 1][j - valueScaled] + weight);
      }
    }
  }
  
  // Find the maximum scaled value that fits in capacity
  let bestScaledValue = 0;
  for (let j = 0; j <= sumScaled; j++) {
    if (dp[n][j] <= capacity) bestScaledValue = j;
  }
  
  // Now reconstruct selected items (a simple reconstruction by iterating backwards)
  const selected = [];
  let j = bestScaledValue;
  for (let i = n; i > 0; i--) {
    if (dp[i][j] !== dp[i - 1][j]) {
      selected.push(items[i - 1]);
      j -= scaledValues[i - 1];
    }
  }
  
  return selected;
}

export default fptasKnapsack; 