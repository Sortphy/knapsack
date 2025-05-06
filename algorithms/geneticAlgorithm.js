/**
 * Genetic Algorithm for the Knapsack Problem
 * Simulates evolution to find near-optimal solutions
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on genetic algorithm
 */
function geneticAlgorithmKnapsack(items, capacity) {
  // Parameters for GA
  const populationSize = 50;
  const generations = 100;
  const mutationRate = 0.05;
  const n = items.length;

  // Create an initial population (each individual is an array of 0s and 1s)
  function createIndividual() {
    return Array.from({ length: n }, () => Math.random() < 0.5 ? 1 : 0);
  }
  
  let population = Array.from({ length: populationSize }, createIndividual);
  
  // Fitness function: if overweight, assign 0 fitness; otherwise, use total value.
  function fitness(individual) {
    let totalWeight = 0;
    let totalValue = 0;
    for (let i = 0; i < n; i++) {
      if (individual[i] === 1) {
        totalWeight += items[i].weight;
        totalValue += items[i].value;
      }
    }
    return totalWeight <= capacity ? totalValue : 0;
  }
  
  // Selection: tournament selection
  function selectIndividual() {
    const tournamentSize = 3;
    let best = null;
    for (let i = 0; i < tournamentSize; i++) {
      const ind = population[Math.floor(Math.random() * populationSize)];
      if (best === null || fitness(ind) > fitness(best)) {
        best = ind;
      }
    }
    return best.slice();
  }
  
  // Crossover: single-point crossover
  function crossover(parent1, parent2) {
    const crossoverPoint = Math.floor(Math.random() * n);
    return parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
  }
  
  // Mutation: flip bit with some probability
  function mutate(individual) {
    return individual.map(bit => Math.random() < mutationRate ? 1 - bit : bit);
  }
  
  let bestIndividual = null;
  let bestIndividualFitness = 0;
  
  // Evolve population
  for (let gen = 0; gen < generations; gen++) {
    const newPopulation = [];
    for (let i = 0; i < populationSize; i++) {
      const parent1 = selectIndividual();
      const parent2 = selectIndividual();
      let child = crossover(parent1, parent2);
      child = mutate(child);
      newPopulation.push(child);
      const childFitness = fitness(child);
      if (childFitness > bestIndividualFitness) {
        bestIndividualFitness = childFitness;
        bestIndividual = child.slice();
      }
    }
    population = newPopulation;
  }
  
  // Convert bestIndividual into a set of items
  const selected = [];
  for (let i = 0; i < n; i++) {
    if (bestIndividual[i] === 1) {
      selected.push(items[i]);
    }
  }
  
  return selected;
}

export default geneticAlgorithmKnapsack; 