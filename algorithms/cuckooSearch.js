/**
 * Cuckoo Search algorithm for the Knapsack Problem
 * Simulates cuckoo breeding behavior with Lévy flights
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on Cuckoo Search
 */
function cuckooSearchKnapsack(items, capacity) {
  // Algorithm parameters
  const numNests = 25;
  const iterations = 50;
  const pa = 0.25;  // probability of nest abandonment
  
  // Track steps for performance analysis
  let stepsCounter = 0;
  
  // Helper function to calculate fitness
  function calculateFitness(position) {
    const binaryPosition = position.map(p => p >= 0.5 ? 1 : 0);
    
    let totalWeight = 0;
    let totalValue = 0;
    
    for (let i = 0; i < binaryPosition.length; i++) {
      if (binaryPosition[i] === 1) {
        totalWeight += items[i].weight;
        totalValue += items[i].value;
      }
    }
    
    // Penalize solutions that exceed capacity
    if (totalWeight > capacity) {
      return 0;
    }
    
    return totalValue;
  }
  
  // Helper function to convert position to solution
  function positionToSolution(position) {
    const solution = [];
    
    for (let i = 0; i < position.length; i++) {
      if (position[i] >= 0.5) {
        solution.push(items[i]);
      }
    }
    
    return solution;
  }
  
  // Lévy flight function
  function levyFlight(step = 1.0) {
    const beta = 1.5;
    
    // Implementation of Mantegna's algorithm
    const sigma_u = Math.pow((gamma(1 + beta) * Math.sin(Math.PI * beta / 2) / 
                     (gamma((1 + beta) / 2) * beta * Math.pow(2, (beta - 1) / 2))), 
                     1 / beta);
    const sigma_v = 1;
    
    const u = randomNormal(0, sigma_u);
    const v = randomNormal(0, sigma_v);
    
    const step_size = u / Math.pow(Math.abs(v), 1 / beta);
    
    return step * step_size;
  }
  
  // Approximation of the gamma function
  function gamma(z) {
    // Simple approximation for gamma function
    return Math.sqrt(2 * Math.PI / z) * Math.pow((1 / Math.E) * (z + 1 / (12 * z - 1 / (10 * z))), z);
  }
  
  // Random normal distribution using Box-Muller transform
  function randomNormal(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * std;
  }
  
  // Initialize nests (solutions)
  let nests = [];
  let bestNest = null;
  let bestFitness = -1;
  
  for (let i = 0; i < numNests; i++) {
    // Random initial position (continuous values between 0 and 1)
    const position = Array(items.length).fill(0).map(() => Math.random());
    const fitness = calculateFitness(position);
    
    nests.push({
      position,
      fitness
    });
    
    // Update best solution
    if (fitness > bestFitness) {
      bestNest = [...position];
      bestFitness = fitness;
    }
  }
  
  // Main Cuckoo Search loop
  for (let iter = 0; iter < iterations; iter++) {
    stepsCounter++;
    
    // Get a random nest
    const i = Math.floor(Math.random() * numNests);
    
    // Generate a new solution by Lévy flight
    const newPosition = [...nests[i].position];
    
    // Perform Lévy flight
    for (let j = 0; j < newPosition.length; j++) {
      newPosition[j] += levyFlight(0.1); // Scale the step size
      
      // Clamp position to [0, 1]
      newPosition[j] = Math.max(0, Math.min(1, newPosition[j]));
    }
    
    // Calculate fitness of the new solution
    const newFitness = calculateFitness(newPosition);
    
    // If the new solution is better, replace the current one
    if (newFitness > nests[i].fitness) {
      nests[i].position = newPosition;
      nests[i].fitness = newFitness;
      
      // Update best solution
      if (newFitness > bestFitness) {
        bestNest = [...newPosition];
        bestFitness = newFitness;
      }
    }
    
    // Abandon worst nests and build new ones
    // Sort nests by fitness
    nests.sort((a, b) => b.fitness - a.fitness);
    
    // Abandon pa% of worst nests
    const numToAbandon = Math.floor(pa * numNests);
    
    for (let i = numNests - numToAbandon; i < numNests; i++) {
      // Generate a new random solution
      const newPosition = Array(items.length).fill(0).map(() => Math.random());
      const newFitness = calculateFitness(newPosition);
      
      nests[i] = {
        position: newPosition,
        fitness: newFitness
      };
      
      // Update best solution
      if (newFitness > bestFitness) {
        bestNest = [...newPosition];
        bestFitness = newFitness;
      }
    }
  }
  
  // Convert best nest to solution
  return positionToSolution(bestNest);
}

export default cuckooSearchKnapsack; 