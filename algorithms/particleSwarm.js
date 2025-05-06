/**
 * Particle Swarm Optimization algorithm for the Knapsack Problem
 * Simulates particles moving through the search space
 * @param {Array} items - Array of items with value and weight properties
 * @param {Number} capacity - Maximum capacity of the knapsack
 * @returns {Array} - Selected items based on PSO
 */
function particleSwarmKnapsack(items, capacity) {
  // Algorithm parameters
  const numParticles = 30;
  const iterations = 50;
  const w = 0.7;         // inertia weight
  const c1 = 1.5;        // cognitive coefficient
  const c2 = 1.5;        // social coefficient
  
  // Track steps for performance analysis
  let stepsCounter = 0;
  
  // Initialize particles
  const particles = [];
  let globalBest = null;
  let globalBestValue = -1;
  
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
  
  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    // Random initial position (continuous values between 0 and 1)
    const position = Array(items.length).fill(0).map(() => Math.random());
    
    // Random initial velocity
    const velocity = Array(items.length).fill(0).map(() => Math.random() * 2 - 1);
    
    const fitness = calculateFitness(position);
    
    // Personal best is initially current position
    const personalBest = [...position];
    const personalBestFitness = fitness;
    
    particles.push({
      position,
      velocity,
      fitness,
      personalBest,
      personalBestFitness
    });
    
    // Update global best
    if (fitness > globalBestValue) {
      globalBest = [...position];
      globalBestValue = fitness;
    }
  }
  
  // Main PSO loop
  for (let iter = 0; iter < iterations; iter++) {
    stepsCounter++;
    
    for (let i = 0; i < numParticles; i++) {
      const particle = particles[i];
      
      // Update velocity and position
      for (let d = 0; d < particle.position.length; d++) {
        // Cognitive component (attraction to personal best)
        const r1 = Math.random();
        const cognitive = c1 * r1 * (particle.personalBest[d] - particle.position[d]);
        
        // Social component (attraction to global best)
        const r2 = Math.random();
        const social = c2 * r2 * (globalBest[d] - particle.position[d]);
        
        // Update velocity
        particle.velocity[d] = w * particle.velocity[d] + cognitive + social;
        
        // Update position
        particle.position[d] += particle.velocity[d];
        
        // Clamp position to [0, 1]
        particle.position[d] = Math.max(0, Math.min(1, particle.position[d]));
      }
      
      // Calculate new fitness
      particle.fitness = calculateFitness(particle.position);
      
      // Update personal best
      if (particle.fitness > particle.personalBestFitness) {
        particle.personalBest = [...particle.position];
        particle.personalBestFitness = particle.fitness;
        
        // Update global best
        if (particle.fitness > globalBestValue) {
          globalBest = [...particle.position];
          globalBestValue = particle.fitness;
        }
      }
    }
  }
  
  // Convert best position to solution
  return positionToSolution(globalBest);
}

export default particleSwarmKnapsack; 