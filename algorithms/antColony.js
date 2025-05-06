/**
 * Ant Colony Optimization algorithm for the Knapsack Problem
 * Simulates ants depositing pheromones on promising paths
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on ACO
 */
function antColonyKnapsack(items, capacity) {
  // Algorithm parameters
  const numAnts = 20;
  const iterations = 50;
  const alpha = 1.0;  // pheromone importance
  const beta = 2.0;   // heuristic importance
  const evaporationRate = 0.5;
  const Q = 100;      // pheromone deposit factor
  
  // Track steps for performance analysis
  let stepsCounter = 0;
  
  // Initialize pheromone trails
  let pheromones = new Array(items.length).fill(1.0);
  
  // Keep track of best solution
  let bestSolution = [];
  let bestValue = 0;
  
  // Helper function to calculate total value
  function calculateTotalValue(itemsList) {
    return itemsList.reduce((sum, item) => sum + item.value, 0);
  }
  
  for (let iter = 0; iter < iterations; iter++) {
    stepsCounter++;
    
    // Solutions found by ants in this iteration
    const antSolutions = [];
    const antValues = [];
    const antWeights = [];
    
    // Each ant constructs a solution
    for (let ant = 0; ant < numAnts; ant++) {
      const solution = [];
      let currentWeight = 0;
      
      // Available items
      const availableItems = [...items];
      
      // Ant selects items probabilistically
      while (availableItems.length > 0) {
        // Calculate probabilities for each item
        const probabilities = [];
        let probabilitySum = 0;
        
        for (let i = 0; i < availableItems.length; i++) {
          const item = availableItems[i];
          
          // If item doesn't fit, skip it
          if (currentWeight + item.weight > capacity) {
            probabilities.push(0);
            continue;
          }
          
          // Calculate heuristic value (value-to-weight ratio)
          const heuristic = item.value / item.weight;
          
          // Original index in items array
          const itemIndex = items.findIndex(originalItem => originalItem.id === item.id);
          
          // Calculate probability based on pheromone and heuristic
          const probability = Math.pow(pheromones[itemIndex], alpha) * Math.pow(heuristic, beta);
          probabilities.push(probability);
          probabilitySum += probability;
        }
        
        // If no valid items remain
        if (probabilitySum === 0) break;
        
        // Select an item using roulette wheel selection
        const randomValue = Math.random() * probabilitySum;
        let cumulativeProbability = 0;
        let selectedIndex = -1;
        
        for (let i = 0; i < probabilities.length; i++) {
          cumulativeProbability += probabilities[i];
          if (cumulativeProbability >= randomValue) {
            selectedIndex = i;
            break;
          }
        }
        
        if (selectedIndex === -1) break;
        
        // Add selected item to solution
        const selectedItem = availableItems[selectedIndex];
        solution.push(selectedItem);
        currentWeight += selectedItem.weight;
        
        // Remove selected item from available items
        availableItems.splice(selectedIndex, 1);
      }
      
      // Calculate solution value and weight
      const solutionValue = calculateTotalValue(solution);
      
      // Store solution
      antSolutions.push(solution);
      antValues.push(solutionValue);
      antWeights.push(currentWeight);
      
      // Update best solution
      if (solutionValue > bestValue) {
        bestSolution = [...solution];
        bestValue = solutionValue;
      }
    }
    
    // Evaporate pheromones
    for (let i = 0; i < pheromones.length; i++) {
      pheromones[i] *= (1 - evaporationRate);
    }
    
    // Deposit new pheromones based on solutions
    for (let ant = 0; ant < numAnts; ant++) {
      const solution = antSolutions[ant];
      const solutionValue = antValues[ant];
      
      // Each ant deposits pheromones on its path proportional to solution quality
      for (const item of solution) {
        const itemIndex = items.findIndex(originalItem => originalItem.id === item.id);
        pheromones[itemIndex] += Q * solutionValue / capacity;
      }
    }
  }
  
  return bestSolution;
}

export default antColonyKnapsack; 