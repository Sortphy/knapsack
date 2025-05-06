/**
 * Recursive Dynamic Programming with memoization for the Knapsack Problem
 * Uses a top-down approach with caching
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items that maximize value
 */
function dynamicProgrammingRecursiveKnapsack(items, capacity) {
  const n = items.length;
  let steps = 0;
  
  // Create a cache object (hashtable) for memoization
  // We'll use a string key "i_c" where i is the item index and c is the remaining capacity
  const memo = {};
  
  // Define the recursive function with memoization
  function knapsackRecursive(i, remainingCapacity) {
    steps++;
    
    // Base case: no items left or no capacity
    if (i === 0 || remainingCapacity === 0) {
      return { value: 0, selected: [] };
    }
    
    // Create a key for the memo cache
    const key = `${i}_${remainingCapacity}`;
    
    // Check if we've already solved this subproblem (memoization)
    if (memo[key]) {
      return memo[key];
    }
    
    const currentItem = items[i - 1];
    
    // If current item is too heavy, skip it
    if (currentItem.weight > remainingCapacity) {
      return memo[key] = knapsackRecursive(i - 1, remainingCapacity);
    }
    
    // Try two options: include current item or skip it
    // Option 1: Skip current item
    const skipItem = knapsackRecursive(i - 1, remainingCapacity);
    
    // Option 2: Include current item
    const includeItemResult = knapsackRecursive(i - 1, remainingCapacity - currentItem.weight);
    const includeItem = {
      value: includeItemResult.value + currentItem.value,
      selected: [...includeItemResult.selected, currentItem]
    };
    
    // Choose the better option
    const result = includeItem.value > skipItem.value ? includeItem : skipItem;
    
    // Store the result in the memo cache
    memo[key] = result;
    
    return result;
  }
  
  // Call the recursive function to solve the problem
  const result = knapsackRecursive(n, capacity);
  
  return result.selected;
}

export default dynamicProgrammingRecursiveKnapsack; 