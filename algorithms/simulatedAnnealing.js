/**
 * Simulated Annealing algorithm for the Knapsack Problem
 * Mimics the annealing process in metallurgy to find near-optimal solutions
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on simulated annealing
 */
function simulatedAnnealingKnapsack(items, capacity) {
  // Parameters for SA
  let temperature = 100;
  const coolingRate = 0.95;
  const iterationsPerTemp = 50;
  const n = items.length;
  
  // Generate an initial random solution (binary vector)
  function randomSolution() {
    return Array.from({ length: n }, () => Math.random() < 0.5 ? 1 : 0);
  }
  
  // Compute fitness for SA (if overweight, fitness = 0)
  function solutionFitness(sol) {
    let weight = 0, value = 0;
    for (let i = 0; i < n; i++) {
      if (sol[i] === 1) {
        weight += items[i].weight;
        value += items[i].value;
      }
    }
    return weight <= capacity ? value : 0;
  }
  
  // Generate neighbor by flipping one random bit
  function getNeighbor(sol) {
    const neighbor = sol.slice();
    const index = Math.floor(Math.random() * n);
    neighbor[index] = 1 - neighbor[index];
    return neighbor;
  }
  
  let currentSolution = randomSolution();
  let currentFitness = solutionFitness(currentSolution);
  let bestSolution = currentSolution.slice();
  let bestFitness = currentFitness;
  
  while (temperature > 1) {
    for (let i = 0; i < iterationsPerTemp; i++) {
      const neighbor = getNeighbor(currentSolution);
      const neighborFitness = solutionFitness(neighbor);
      const delta = neighborFitness - currentFitness;
      if (delta > 0 || Math.exp(delta / temperature) > Math.random()) {
        currentSolution = neighbor;
        currentFitness = neighborFitness;
      }
      if (currentFitness > bestFitness) {
        bestSolution = currentSolution.slice();
        bestFitness = currentFitness;
      }
    }
    temperature *= coolingRate;
  }
  
  const selected = [];
  for (let i = 0; i < n; i++) {
    if (bestSolution[i] === 1) {
      selected.push(items[i]);
    }
  }
  
  return selected;
}

export default simulatedAnnealingKnapsack; 