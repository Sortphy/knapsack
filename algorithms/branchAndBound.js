/**
 * Branch and Bound algorithm for the Knapsack Problem
 * Uses upper bounds to prune search tree branches
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items that maximize value
 */
function branchAndBoundKnapsack(items, capacity) {
  // Sort items by descending ratio (helps bounding)
  const sortedItems = [...items].sort((a, b) => {
    return (b.value / b.weight) - (a.value / a.weight);
  });
  
  let bestValue = 0;
  let bestCombination = [];
  
  function bound(level, currentValue, currentWeight) {
    // Upper bound using fractional knapsack
    let boundVal = currentValue;
    let totalWeight = currentWeight;
    
    for (let i = level; i < sortedItems.length; i++) {
      if (totalWeight + sortedItems[i].weight <= capacity) {
        totalWeight += sortedItems[i].weight;
        boundVal += sortedItems[i].value;
      } else {
        const remain = capacity - totalWeight;
        boundVal += sortedItems[i].value * (remain / sortedItems[i].weight);
        break;
      }
    }
    
    return boundVal;
  }
  
  function branch(level, currentValue, currentWeight, combination) {
    if (currentWeight > capacity) return;
    
    if (level === sortedItems.length) {
      if (currentValue > bestValue) {
        bestValue = currentValue;
        bestCombination = combination.slice();
      }
      return;
    }
    
    if (bound(level, currentValue, currentWeight) < bestValue) return; // prune
    
    // Explore including current item
    combination.push(sortedItems[level]);
    branch(level + 1, currentValue + sortedItems[level].value, 
           currentWeight + sortedItems[level].weight, combination);
    combination.pop();
    
    // Explore excluding current item
    branch(level + 1, currentValue, currentWeight, combination);
  }
  
  branch(0, 0, 0, []);
  
  return bestCombination;
}

export default branchAndBoundKnapsack; 