// We're using local implementations of the knapsack algorithms
// instead of importing them as modules to avoid potential issues

 class Item {
  constructor(value, weight, id) {
    this.value = value;
    this.weight = weight;
    this.id = id;
  }
}

// Global variables
let items = [];
let selectedItems = [];
let capacity = 10;
let optimalSolution = null;
let stepsCounter = 0;

// DOM elements
const itemsContainer = document.getElementById('items-container');
const selectedItemsContainer = document.getElementById('selected-items');
const capacityInput = document.getElementById('capacity-input');
const itemCountInput = document.getElementById('item-count');
const generateBtn = document.getElementById('generate-btn');
const solveBtn = document.getElementById('solve-btn');
const resetBtn = document.getElementById('reset-btn');
const showStepsBtn = document.getElementById('show-steps-btn');
const explainAlgorithmBtn = document.getElementById('explain-algorithm-btn');

const currentWeightSpan = document.getElementById('current-weight');
const maxCapacitySpan = document.getElementById('max-capacity');
const capacityFill = document.getElementById('capacity-fill');
const selectionValueSpan = document.getElementById('selection-value');
const selectionWeightSpan = document.getElementById('selection-weight');
const backpack = document.getElementById('backpack');
const resultPanel = document.getElementById('result-panel');
const bestValueSpan = document.getElementById('best-value');
const totalWeightSpan = document.getElementById('total-weight');
const stepsTakenSpan = document.getElementById('steps-taken');
const optimalSolutionDiv = document.getElementById('optimal-solution');
const stepsModal = document.getElementById('steps-modal');
const closeModal = document.getElementById('close-modal');
const visualStepsDiv = document.getElementById('visual-steps');
const combinationsDisplayDiv = document.getElementById('combinations-display');
const explanationModal = document.getElementById('explanation-modal');
const closeExplanationModal = document.getElementById('close-explanation-modal');
const explanationTitle = document.getElementById('explanation-title');
const algorithmExplanation = document.getElementById('algorithm-explanation');

// Initialization
initialize();

function initialize() {
  console.log("Initializing application...");
  
  // Initialize capacity
  capacity = parseInt(capacityInput.value);
  maxCapacitySpan.textContent = capacity;
  backpack.querySelector('span').textContent = `Capacidade: ${capacity}`;
  
  console.log("Initial capacity set to:", capacity);

  // Add event listeners
  generateBtn.addEventListener('click', generateItems);
  solveBtn.addEventListener('click', solveKnapsack);
  resetBtn.addEventListener('click', resetSelection);
  showStepsBtn.addEventListener('click', showAlgorithmSteps);
  closeModal.addEventListener('click', () => stepsModal.style.display = 'none');
  explainAlgorithmBtn.addEventListener('click', showAlgorithmExplanation);
  closeExplanationModal.addEventListener('click', () => explanationModal.style.display = 'none');

  capacityInput.addEventListener('change', () => {
    capacity = parseInt(capacityInput.value);
    maxCapacitySpan.textContent = capacity;
    backpack.querySelector('span').textContent = `Capacidade: ${capacity}`;
    updateCapacityBar();
    console.log("Capacity updated to:", capacity);
  });

  // Initial generation
  console.log("Generating initial items...");
  generateItems();
  
  console.log("Initialization complete");
}

function generateRandomItems(count) {
  const newItems = [];
  const usedValues = new Set();
  const usedWeights = new Set();
  
  const minValue = parseInt(document.getElementById('min-value').value);
  const maxValue = parseInt(document.getElementById('max-value').value);
  const minWeight = parseInt(document.getElementById('min-weight').value);
  const maxWeight = parseInt(document.getElementById('max-weight').value);
  
  // Validate ranges
  if (minValue > maxValue || minWeight > maxWeight) {
    alert('O valor mínimo não pode ser maior que o valor máximo!');
    return [];
  }
  
  console.log("Generating items with values between", minValue, "and", maxValue, "and weights between", minWeight, "and", maxWeight);
  
  for (let i = 0; i < count; i++) {
    let value, weight;
    let attempts = 0;
    const maxAttempts = 100; // Prevent infinite loops
    
    do {
      value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      attempts++;
    } while ((usedValues.has(value) && usedWeights.has(weight)) && attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      // If we can't find a unique combination, just use the last generated values
      value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
    }
    
    usedValues.add(value);
    usedWeights.add(weight);
    
    // Create a new item with a unique id
    const item = new Item(value, weight, i + 1);
    newItems.push(item);
    
    console.log(`Created item ${i+1}: value=${value}, weight=${weight}`);
  }
  
  console.log("Generated", newItems.length, "items");
  return newItems;
}

function validateInputs() {
  const minValue = parseInt(document.getElementById('min-value').value);
  const maxValue = parseInt(document.getElementById('max-value').value);
  const minWeight = parseInt(document.getElementById('min-weight').value);
  const maxWeight = parseInt(document.getElementById('max-weight').value);
  const itemCount = parseInt(document.getElementById('item-count').value);
  const capacity = parseInt(document.getElementById('capacity-input').value);
  const algorithm = document.getElementById('algorithm-select').value;

  // Validate value ranges
  document.getElementById('value-warning').style.display = 
    (minValue > maxValue) ? 'block' : 'none';
  document.getElementById('weight-warning').style.display = 
    (minWeight > maxWeight) ? 'block' : 'none';

  // Show warnings for large problems
  document.getElementById('items-warning').style.display = 
    (itemCount > 20) ? 'block' : 'none';
  document.getElementById('capacity-warning').style.display = 
    (capacity > 1000) ? 'block' : 'none';

  // Show algorithm-specific warnings
  let showAlgorithmWarning = false;
  if (algorithm === 'bruteforce' && itemCount > 20) {
    showAlgorithmWarning = true;
  } else if (algorithm === 'dp' && (itemCount * capacity > 1000000)) {
    showAlgorithmWarning = true;
  } else if (algorithm === 'bnb' && itemCount > 30) {
    showAlgorithmWarning = true;
  }
  document.getElementById('algorithm-warning').style.display = 
    showAlgorithmWarning ? 'block' : 'none';

  return !(minValue > maxValue || minWeight > maxWeight);
}

// Add event listeners for validation
document.getElementById('min-value').addEventListener('change', validateInputs);
document.getElementById('max-value').addEventListener('change', validateInputs);
document.getElementById('min-weight').addEventListener('change', validateInputs);
document.getElementById('max-weight').addEventListener('change', validateInputs);
document.getElementById('item-count').addEventListener('change', validateInputs);
document.getElementById('capacity-input').addEventListener('change', validateInputs);
document.getElementById('algorithm-select').addEventListener('change', validateInputs);

// Update generateItems to use validation
function generateItems() {
  // Validate inputs first
  if (!validateInputs()) {
    alert('Por favor, corrija os valores inválidos antes de gerar itens.');
    return;
  }
  
  // Get the number of items to generate
  const count = parseInt(itemCountInput.value);
  console.log(`Generating ${count} items...`);
  
  // Get the min/max values
  const minValue = parseInt(document.getElementById('min-value').value);
  const maxValue = parseInt(document.getElementById('max-value').value);
  const minWeight = parseInt(document.getElementById('min-weight').value);
  const maxWeight = parseInt(document.getElementById('max-weight').value);
  
  try {
    // Generate new random items
    items = [];
    for (let i = 0; i < count; i++) {
      // Generate random value and weight within ranges
      const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
      const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      
      // Create a new item with a unique ID
      const item = {
        id: i + 1,
        value: value,
        weight: weight
      };
      
      // Add to items array
      items.push(item);
    }
    
    console.log(`Successfully generated ${items.length} items:`, items);
    
    // Reset selected items and optimal solution
    selectedItems = [];
    optimalSolution = null;
    
    // Render the items on the page
    renderItems();
    updateSelection();
    resultPanel.style.display = 'none';
  } catch (error) {
    console.error("Error generating items:", error);
    alert("Erro ao gerar itens: " + error.message);
  }
}

function renderItems() {
  // Clear the container first
  itemsContainer.innerHTML = '';
  
  if (!items || items.length === 0) {
    itemsContainer.innerHTML = '<p>Nenhum item disponível. Gere itens primeiro.</p>';
    return;
  }
  
  console.log(`Rendering ${items.length} items:`, items);
  
  // Create a div for each item
  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item');
    itemElement.dataset.id = item.id;
    
    // Set the content of the div
    itemElement.innerHTML = `
      <div class="item-value">$${item.value}</div>
      <div class="item-weight">${item.weight} kg</div>
    `;
    
    // Add event listener for item selection
    itemElement.addEventListener('click', () => {
      toggleItemSelection(item);
    });
    
    // Append the element to the container
    itemsContainer.appendChild(itemElement);
  });
}

function toggleItemSelection(item) {
  const index = selectedItems.findIndex(i => i.id === item.id);
  if (index === -1) {
    selectedItems.push(item);
  } else {
    selectedItems.splice(index, 1);
  }
  updateSelection();
  highlightSelectedItems();
}

function highlightSelectedItems() {
  console.log("Highlighting selected items. Selected:", selectedItems, "Optimal:", optimalSolution);
  
  // Clear previous selections
  document.querySelectorAll('.item').forEach(el => {
    el.classList.remove('selected');
    el.classList.remove('in-optimal');
  });
  
  // Highlight currently selected items
  if (selectedItems && selectedItems.length > 0) {
    selectedItems.forEach(item => {
      const itemElement = document.querySelector(`.item[data-id="${item.id}"]`);
      if (itemElement) {
        itemElement.classList.add('selected');
        console.log(`Highlighted selected item ${item.id}`);
      } else {
        console.warn(`Could not find element for selected item ${item.id}`);
      }
    });
  }

  // Highlight items that belong to the optimal solution (if available)
  if (optimalSolution && Array.isArray(optimalSolution) && optimalSolution.length > 0) {
    optimalSolution.forEach(item => {
      if (!item || !item.id) {
        console.warn("Invalid item in optimal solution:", item);
        return;
      }
      const itemElement = document.querySelector(`.item[data-id="${item.id}"]`);
      if (itemElement) {
        itemElement.classList.add('in-optimal');
        console.log(`Highlighted optimal item ${item.id}`);
      } else {
        console.warn(`Could not find element for optimal item ${item.id}`);
      }
    });
  }
}

function updateSelection() {
  const currentWeight = calculateTotalWeight(selectedItems);
  const currentValue = calculateTotalValue(selectedItems);
  currentWeightSpan.textContent = currentWeight;
  selectionValueSpan.textContent = currentValue;
  selectionWeightSpan.textContent = currentWeight;
  updateCapacityBar();
  renderSelectedItems();
}

function updateCapacityBar() {
  const currentWeight = calculateTotalWeight(selectedItems);
  const percentage = Math.min((currentWeight / capacity) * 100, 100);
  capacityFill.style.width = `${percentage}%`;
  capacityFill.style.backgroundColor = (currentWeight > capacity) ? 'var(--danger)' : 'var(--primary)';
}

function renderSelectedItems() {
  selectedItemsContainer.innerHTML = '';
  if (selectedItems.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Nenhum item selecionado ainda. Clique nos itens para adicioná-los à sua mochila.';
    selectedItemsContainer.appendChild(emptyMessage);
    return;
  }
  selectedItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('item', 'selected');
    itemElement.innerHTML = `
      <div class="item-value">$${item.value}</div>
      <div class="item-weight">${item.weight} kg</div>
    `;
    selectedItemsContainer.appendChild(itemElement);
  });
}

function calculateTotalWeight(itemsList) {
  return itemsList.reduce((sum, item) => sum + item.weight, 0);
}

function calculateTotalValue(itemsList) {
  return itemsList.reduce((sum, item) => sum + item.value, 0);
}

function resetSelection() {
  selectedItems = [];
  updateSelection();
  highlightSelectedItems();
}

// ----- Provided Brute Force Method -----
function bruteForceKnapsack(items, capacity) {
  console.log("Running bruteForceKnapsack with items:", items);
  
  let bestValue = 0;
  let bestCombination = [];
  const n = items.length;
  const totalCombinations = 1 << n; // 2^n combinations
  let steps = 0;
  const allCombinations = [];
  
  for (let i = 0; i < totalCombinations; i++) {
    steps++;
    let currentValue = 0;
    let currentWeight = 0;
    let combination = [];
    
    for (let j = 0; j < n; j++) {
      steps++;
      if (i & (1 << j)) {
        // Make sure we include the full item object
        const item = items[j];
        currentValue += item.value;
        currentWeight += item.weight;
        combination.push(item);
      }
    }
    
    allCombinations.push({
      combination,
      value: currentValue,
      weight: currentWeight,
      valid: currentWeight <= capacity
    });
    
    if (currentWeight <= capacity && currentValue > bestValue) {
      bestValue = currentValue;
      bestCombination = [...combination]; // Create a copy to avoid reference issues
    }
  }
  
  console.log("Brute force complete. Best combination:", bestCombination);
  return { bestValue, bestCombination, steps, allCombinations };
}

function solveKnapsack() {
  const algorithm = document.getElementById('algorithm-select').value;
  const startTime = performance.now();
  stepsCounter = 0;
  
  // Clear any previous results
  optimalSolution = null;
  resultPanel.style.display = 'none';
  
  // Ensure all input validations pass
  if (!validateInputs()) {
    alert('Por favor, corrija os valores inválidos antes de continuar.');
    return;
  }
  
  // Check if items exist
  if (!items || items.length === 0) {
    alert('Não há itens para resolver. Por favor, gere itens primeiro.');
    return;
  }
  
  // Update capacity from input (in case it was changed)
  capacity = parseInt(capacityInput.value);
  console.log(`Solving with algorithm: ${algorithm}, capacity: ${capacity}, items:`, items);
  
  try {
    switch(algorithm) {
      case 'bruteforce':
        const result = bruteForceKnapsack(items, capacity);
        optimalSolution = result.bestCombination;
        stepsCounter = result.steps;
        break;
      case 'dp':
        optimalSolution = solveKnapsackDP();
        break;
      case 'dp_recursive':
        optimalSolution = solveKnapsackDPRecursive();
        break;
      case 'greedy':
        optimalSolution = solveKnapsackGreedy();
        break;
      case 'bnb':
        optimalSolution = solveKnapsackBnB();
        break;
      case 'ga':
        optimalSolution = solveKnapsackGA();
        break;
      case 'sa':
        optimalSolution = solveKnapsackSA();
        break;
      case 'aco':
        optimalSolution = solveKnapsackACO();
        break;
      case 'pso':
        optimalSolution = solveKnapsackPSO();
        break;
      case 'cuckoo':
        optimalSolution = solveKnapsackCuckoo();
        break;
      case 'approx':
        optimalSolution = solveKnapsackApprox();
        break;
      case 'fptas':
        optimalSolution = solveKnapsackFPTAS();
        break;
      default:
        alert('Algoritmo não encontrado!');
        return;
    }
    
    console.log("Optimal solution:", optimalSolution);
    
    // Handle case if optimalSolution is invalid
    if (!optimalSolution) {
      alert('Erro ao calcular a solução. Verifique o console para mais informações.');
      return;
    }
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    // Display results
    document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
    bestValueSpan.textContent = calculateTotalValue(optimalSolution);
    totalWeightSpan.textContent = calculateTotalWeight(optimalSolution);
    stepsTakenSpan.textContent = stepsCounter;
    
    // Show optimal solution items
    optimalSolutionDiv.innerHTML = '';
    if (optimalSolution.length === 0) {
      optimalSolutionDiv.innerHTML = '<p>Nenhum item pode ser adicionado dentro da capacidade.</p>';
    } else {
      optimalSolution.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.classList.add('in-optimal');
        itemElement.innerHTML = `
          <div class="item-value">$${item.value}</div>
          <div class="item-weight">${item.weight}kg</div>
        `;
        optimalSolutionDiv.appendChild(itemElement);
      });
    }
    
    // Show result panel
    resultPanel.style.display = 'block';
    
    // Update items visualization to highlight optimal items
    highlightSelectedItems();
  } catch (error) {
    console.error("Error solving knapsack:", error);
    alert(`Erro ao calcular a solução: ${error.message}\n\nVerifique o console para mais detalhes.`);
  }
}

// ----- 1. Dynamic Programming -----
function solveKnapsackDP() {
  const startTime = performance.now();
  const n = items.length;
  let steps = 0;
  // Create dp table: rows for items and columns for weight capacities
  const dp = Array(n + 1).fill(0).map(() => Array(capacity + 1).fill(0));
  // Table for item inclusion reconstruction
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
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue: dp[n][capacity], bestCombination: selected, steps };
  bestValueSpan.textContent = optimalSolution.bestValue;
  totalWeightSpan.textContent = calculateTotalWeight(selected);
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução DP inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${optimalSolution.bestValue}</p>
    <p>Peso Total: ${calculateTotalWeight(selected)} kg</p>
  `;
  highlightSelectedItems();
}

// ----- 2. Greedy Approach (by value/weight ratio) -----
function solveKnapsackGreedy() {
  const startTime = performance.now();
  let steps = 0;
  // Sort items by descending value/weight ratio
  const sortedItems = [...items].sort((a, b) => {
    steps++;
    return (b.value / b.weight) - (a.value / a.weight);
  });
  let currentWeight = 0;
  const selected = [];
  for (const item of sortedItems) {
    steps++;
    if (currentWeight + item.weight <= capacity) {
      selected.push(item);
      currentWeight += item.weight;
    }
  }
  const totalValue = calculateTotalValue(selected);
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue: totalValue, bestCombination: selected, steps };
  bestValueSpan.textContent = optimalSolution.bestValue;
  totalWeightSpan.textContent = currentWeight;
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução Greedy inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${totalValue}</p>
    <p>Peso Total: ${currentWeight} kg</p>
  `;
  highlightSelectedItems();
}

// ----- 3. Branch and Bound -----
function solveKnapsackBnB() {
  const startTime = performance.now();
  let steps = 0;
  // Sort items by descending ratio (helps bounding)
  const sortedItems = [...items].sort((a, b) => {
    steps++;
    return (b.value / b.weight) - (a.value / a.weight);
  });
  let bestValue = 0;
  let bestCombination = [];
  
  function bound(level, currentValue, currentWeight) {
    steps++;
    // Upper bound using fractional knapsack
    let boundVal = currentValue;
    let totalWeight = currentWeight;
    for (let i = level; i < sortedItems.length; i++) {
      steps++;
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
    steps++;
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
    branch(level + 1, currentValue + sortedItems[level].value, currentWeight + sortedItems[level].weight, combination);
    combination.pop();
    
    // Explore excluding current item
    branch(level + 1, currentValue, currentWeight, combination);
  }
  
  branch(0, 0, 0, []);
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue, bestCombination, steps };
  bestValueSpan.textContent = bestValue;
  totalWeightSpan.textContent = calculateTotalWeight(bestCombination);
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução Branch and Bound inclui os seguintes itens:</p>
    <ul>
      ${bestCombination.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${bestValue}</p>
    <p>Peso Total: ${calculateTotalWeight(bestCombination)} kg</p>
  `;
  highlightSelectedItems();
}

// ----- 4. Genetic Algorithm -----
function solveKnapsackGA() {
  const startTime = performance.now();
  let steps = 0;
  // Parameters for GA
  const populationSize = 50;
  const generations = 100;
  const mutationRate = 0.05;
  const n = items.length;

  // Create an initial population (each individual is an array of 0s and 1s)
  function createIndividual() {
    steps++;
    return Array.from({ length: n }, () => Math.random() < 0.5 ? 1 : 0);
  }
  let population = Array.from({ length: populationSize }, createIndividual);
  
  // Fitness function: if overweight, assign 0 fitness; otherwise, use total value.
  function fitness(individual) {
    steps++;
    let totalWeight = 0;
    let totalValue = 0;
    for (let i = 0; i < n; i++) {
      steps++;
      if (individual[i] === 1) {
        totalWeight += items[i].weight;
        totalValue += items[i].value;
      }
    }
    return totalWeight <= capacity ? totalValue : 0;
  }
  
  // Selection: tournament selection
  function selectIndividual() {
    steps++;
    const tournamentSize = 3;
    let best = null;
    for (let i = 0; i < tournamentSize; i++) {
      steps++;
      const ind = population[Math.floor(Math.random() * populationSize)];
      if (best === null || fitness(ind) > fitness(best)) {
        best = ind;
      }
    }
    return best.slice();
  }
  
  // Crossover: single-point crossover
  function crossover(parent1, parent2) {
    steps++;
    const crossoverPoint = Math.floor(Math.random() * n);
    return parent1.slice(0, crossoverPoint).concat(parent2.slice(crossoverPoint));
  }
  
  // Mutation: flip bit with some probability
  function mutate(individual) {
    steps++;
    return individual.map(bit => Math.random() < mutationRate ? 1 - bit : bit);
  }
  
  let bestIndividual = null;
  let bestIndividualFitness = 0;
  // Evolve population
  for (let gen = 0; gen < generations; gen++) {
    steps++;
    const newPopulation = [];
    for (let i = 0; i < populationSize; i++) {
      steps++;
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
    steps++;
    if (bestIndividual[i] === 1) {
      selected.push(items[i]);
    }
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue: bestIndividualFitness, bestCombination: selected, steps };
  bestValueSpan.textContent = optimalSolution.bestValue;
  totalWeightSpan.textContent = calculateTotalWeight(selected);
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução Algoritmo Genético inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${optimalSolution.bestValue}</p>
    <p>Peso Total: ${calculateTotalWeight(selected)} kg</p>
  `;
  highlightSelectedItems();
}

// ----- 5. Simulated Annealing -----
function solveKnapsackSA() {
  const startTime = performance.now();
  let steps = 0;
  // Parameters for SA
  let temperature = 100;
  const coolingRate = 0.95;
  const iterationsPerTemp = 50;
  const n = items.length;
  
  // Generate an initial random solution (binary vector)
  function randomSolution() {
    steps++;
    return Array.from({ length: n }, () => Math.random() < 0.5 ? 1 : 0);
  }
  
  // Compute fitness for SA (if overweight, fitness = 0)
  function solutionFitness(sol) {
    steps++;
    let weight = 0, value = 0;
    for (let i = 0; i < n; i++) {
      steps++;
      if (sol[i] === 1) {
        weight += items[i].weight;
        value += items[i].value;
      }
    }
    return weight <= capacity ? value : 0;
  }
  
  // Generate neighbor by flipping one random bit
  function getNeighbor(sol) {
    steps++;
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
    steps++;
    for (let i = 0; i < iterationsPerTemp; i++) {
      steps++;
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
  let totalWeight = 0;
  for (let i = 0; i < n; i++) {
    steps++;
    if (bestSolution[i] === 1) {
      selected.push(items[i]);
      totalWeight += items[i].weight;
    }
  }
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue: bestFitness, bestCombination: selected, steps };
  bestValueSpan.textContent = bestFitness;
  totalWeightSpan.textContent = totalWeight;
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução Simulated Annealing inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${bestFitness}</p>
    <p>Peso Total: ${totalWeight} kg</p>
  `;
  highlightSelectedItems();
}

// ----- 6. Approximation Algorithm (Simple Heuristic) -----
function solveKnapsackApprox() {
  const startTime = performance.now();
  let steps = 0;
  // A simple heuristic: sort by value descending (ignoring weight) and add items
  const sortedItems = [...items].sort((a, b) => {
    steps++;
    return b.value - a.value;
  });
  let totalWeight = 0;
  const selected = [];
  for (const item of sortedItems) {
    steps++;
    if (totalWeight + item.weight <= capacity) {
      selected.push(item);
      totalWeight += item.weight;
    }
  }
  const totalValue = calculateTotalValue(selected);
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue: totalValue, bestCombination: selected, steps };
  bestValueSpan.textContent = totalValue;
  totalWeightSpan.textContent = totalWeight;
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução Aproximação inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${totalValue}</p>
    <p>Peso Total: ${totalWeight} kg</p>
  `;
  highlightSelectedItems();
}

// ----- 7. FPTAS (Fully Polynomial Time Approximation Scheme) -----
function solveKnapsackFPTAS() {
  const startTime = performance.now();
  let steps = 0;
  // User defined epsilon for approximation precision. Smaller epsilon -> more accurate and slower.
  const epsilon = 0.2; // You can allow user to change this via an input
  const n = items.length;
  const maxValue = Math.max(...items.map(i => i.value));
  // Scaling factor
  const K = (epsilon * maxValue) / n;
  // Scale item values
  const scaledValues = items.map(item => {
    steps++;
    return Math.floor(item.value / K);
  });
  // DP based on scaled values
  const sumScaled = scaledValues.reduce((acc, cur) => {
    steps++;
    return acc + cur;
  }, 0);
  const dp = Array(n + 1).fill(0).map(() => Array(sumScaled + 1).fill(Infinity));
  dp[0][0] = 0;
  
  for (let i = 1; i <= n; i++) {
    const weight = items[i - 1].weight;
    const valueScaled = scaledValues[i - 1];
    for (let j = 0; j <= sumScaled; j++) {
      steps++;
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
    steps++;
    if (dp[n][j] <= capacity) bestScaledValue = j;
  }
  // Now reconstruct selected items (a simple reconstruction by iterating backwards)
  const selected = [];
  let j = bestScaledValue;
  for (let i = n; i > 0; i--) {
    steps++;
    if (dp[i][j] !== dp[i - 1][j]) {
      selected.push(items[i - 1]);
      j -= scaledValues[i - 1];
    }
  }
  
  const approxValue = calculateTotalValue(selected);
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { bestValue: approxValue, bestCombination: selected, steps };
  bestValueSpan.textContent = approxValue;
  totalWeightSpan.textContent = calculateTotalWeight(selected);
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução FPTAS inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total (Aproximado): $${approxValue}</p>
    <p>Peso Total: ${calculateTotalWeight(selected)} kg</p>
  `;
  highlightSelectedItems();
}

// ----- Optional: Show Algorithm Steps (For brute force method) -----
function showAlgorithmSteps() {
  const algorithm = document.getElementById('algorithm-select').value;
  stepsModal.style.display = 'flex';
  
  // Clear previous content
  visualStepsDiv.innerHTML = '';
  combinationsDisplayDiv.innerHTML = '';
  
  let algorithmName = '';
  let algorithmExplanation = '';
  
  switch(algorithm) {
    case 'bruteforce':
      algorithmName = 'Força Bruta';
      algorithmExplanation = `
        <p>O algoritmo de força bruta verifica todas as combinações possíveis de itens (2^n, onde n é o número de itens) e seleciona a combinação com o maior valor que não exceda a capacidade.</p>
        <p>Embora garanta encontrar a solução ótima, se torna ineficiente para um grande número de itens. Por exemplo, com apenas 20 itens, haveria mais de 1 milhão de combinações para verificar!</p>
      `;
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Defina o problema: ${items.length} itens, capacidade de ${capacity} kg.</p>
        <p>2. Total de combinações verificadas: ${optimalSolution.steps || 'N/A'}.</p>
        <p>3. Avaliação e seleção da melhor solução.</p>
      `;
      
      if (optimalSolution.allCombinations) {
        combinationsDisplayDiv.innerHTML = '';
        optimalSolution.allCombinations.forEach((combo, index) => {
          const combinationElement = document.createElement('div');
          combinationElement.classList.add('combination-item');
          const itemsText = combo.combination.length > 0 
            ? combo.combination.map(item => `Item ${item.id}`).join(', ')
            : 'Nenhum item';
          combinationElement.innerHTML = `
            <strong>Combinação ${index + 1}:</strong> [${itemsText}]<br>
            Valor: $${combo.value}, Peso: ${combo.weight} kg
            <strong>${combo.valid ? '✓ Válida' : '✗ Excede capacidade'}</strong>
          `;
          if (!combo.valid) {
            combinationElement.style.color = 'var(--danger)';
          } else if (combo.value === optimalSolution.bestValue) {
            combinationElement.style.backgroundColor = 'var(--warning)';
            combinationElement.style.color = 'white';
          }
          combinationsDisplayDiv.appendChild(combinationElement);
        });
      }
      break;
      
    case 'dp':
      algorithmName = 'Programação Dinâmica';
      algorithmExplanation = `
        <p>O algoritmo de programação dinâmica resolve o problema construindo uma tabela onde cada célula representa o valor máximo possível para um determinado peso e conjunto de itens.</p>
        <p>É particularmente eficiente quando a capacidade da mochila é moderada, pois sua complexidade é O(n*W), onde n é o número de itens e W é a capacidade.</p>
      `;
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Criação da tabela DP com ${items.length} itens e capacidade ${capacity}.</p>
        <p>2. Preenchimento da tabela considerando cada item e cada peso possível.</p>
        <p>3. Reconstrução da solução ótima a partir da tabela.</p>
        <p>4. Total de etapas: ${optimalSolution.steps}.</p>
      `;
      break;
      
    case 'greedy':
      algorithmName = 'Algoritmo Guloso';
      algorithmExplanation = '<p>O algoritmo guloso seleciona itens baseado na razão valor/peso, sempre escolhendo o item com a melhor razão que ainda caiba na mochila.</p>' +
        '<p>Embora seja rápido (O(n log n)), não garante a solução ótima, mas pode ser uma boa aproximação em muitos casos.</p>';
      if (!optimalSolution) {
        solveKnapsack();
      }
      const sortedItems = [...items].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
      visualStepsDiv.innerHTML = `
        <p>1. Ordenação dos itens por razão valor/peso (${sortedItems.map(i => `Item ${i.id}: ${(i.value/i.weight).toFixed(2)}`).join(', ')}).</p>
        <p>2. Seleção sequencial dos itens que cabem na mochila.</p>
        <p>3. Complexidade: O(n log n) para ordenação + O(n) para seleção.</p>
      `;
      break;
      
    case 'bnb':
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Ordenação dos itens por razão valor/peso.</p>
        <p>2. Exploração da árvore de decisão com poda de ramos.</p>
        <p>3. Uso de limites superiores para eliminar subárvores.</p>
        <p>4. Complexidade: O(2^n) no pior caso, mas geralmente melhor que força bruta.</p>
      `;
      break;
      
    case 'ga':
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Inicialização da população com 50 indivíduos.</p>
        <p>2. Avaliação de fitness para cada indivíduo.</p>
        <p>3. Seleção por torneio dos melhores indivíduos.</p>
        <p>4. Crossover e mutação para gerar nova população.</p>
        <p>5. Repetição por 100 gerações.</p>
        <p>6. Complexidade: O(populationSize * generations * n).</p>
      `;
      break;
      
    case 'sa':
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Inicialização com temperatura alta (100).</p>
        <p>2. Geração de soluções vizinhas.</p>
        <p>3. Aceitação de soluções piores com probabilidade decrescente.</p>
        <p>4. Resfriamento gradual (taxa de 0.95).</p>
        <p>5. Complexidade: O(iterationsPerTemp * log(temperature)).</p>
      `;
      break;
      
    case 'approx':
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Ordenação dos itens por valor decrescente.</p>
        <p>2. Seleção sequencial dos itens que cabem na mochila.</p>
        <p>3. Complexidade: O(n log n) para ordenação + O(n) para seleção.</p>
        <p>4. Garantia de aproximação: 1/2 do valor ótimo.</p>
      `;
      break;
      
    case 'fptas':
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Escala dos valores dos itens (ε = 0.2).</p>
        <p>2. Aplicação de programação dinâmica nos valores escalados.</p>
        <p>3. Reconstrói solução a partir da tabela DP.</p>
        <p>4. Complexidade: O(n²/ε).</p>
        <p>5. Garantia de aproximação: (1-ε) do valor ótimo.</p>
      `;
      break;
    case 'dp_recursive':
      if (!optimalSolution) {
        solveKnapsack();
      }
      visualStepsDiv.innerHTML = `
        <p>1. Preparação do cache (hashtable) para memoization.</p>
        <p>2. Início da recursão a partir do problema completo.</p>
        <p>3. Para cada chamada recursiva:</p>
        <ul>
          <li>Verificação se o resultado está no cache</li>
          <li>Se estiver, retornar imediatamente (acesso O(1))</li>
          <li>Se não estiver, calcular resultado e armazenar no cache</li>
        </ul>
        <p>4. Total de subproblemas memorizados: ${optimalSolution.memoSize || 'N/A'}</p>
        <p>5. Total de etapas: ${optimalSolution.steps}</p>
      `;
      combinationsDisplayDiv.innerHTML = `
        <p>Usando abordagem recursiva com memoization (top-down), podemos resolver o problema evitando recálculos.</p>
        <p>Cada subproblema é resolvido apenas uma vez e seu resultado é armazenado no cache.</p>
        <p>O cache é implementado como uma hashtable, garantindo acesso em tempo O(1).</p>
        <p>O algoritmo resolve o problema recursivamente, decidindo para cada item:</p>
        <ul>
          <li>Incluir o item na mochila</li>
          <li>Não incluir o item na mochila</li>
        </ul>
        <p>Escolhendo a opção que maximiza o valor total.</p>
      `;
      break;
  }
}

// Add click-outside-to-close functionality
window.addEventListener('click', (event) => {
  if (event.target === stepsModal) {
    stepsModal.style.display = 'none';
  }
});

function showAlgorithmExplanation() {
  const algorithm = document.getElementById('algorithm-select').value;
  explanationModal.style.display = 'flex';
  
  let title = '';
  let explanation = '';
  
  switch(algorithm) {
    case 'bruteforce':
      title = 'Força Bruta';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O algoritmo de Força Bruta é como tentar todas as combinações possíveis de itens na mochila, uma por uma. Imagine que você tem uma mochila e vários itens. Você tenta todas as maneiras possíveis de colocar os itens na mochila e escolhe a combinação que dá o maior valor sem exceder o peso máximo.</p>
          <div class="visual-example">
            <p>Por exemplo, com 3 itens (A, B, C), você testa:</p>
            <ul>
              <li>Nenhum item</li>
              <li>Apenas A</li>
              <li>Apenas B</li>
              <li>Apenas C</li>
              <li>A e B</li>
              <li>A e C</li>
              <li>B e C</li>
              <li>A, B e C</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Garante encontrar a solução ótima</li>
            <li>Fácil de entender e implementar</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Muito lento para muitos itens</li>
            <li>Número de combinações cresce exponencialmente (2^n)</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(2^n)</div>
      `;
      break;
      
    case 'dp':
      title = 'Programação Dinâmica';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>Imagine uma tabela onde cada célula representa o valor máximo que podemos obter com um certo peso. O algoritmo preenche esta tabela passo a passo, usando os resultados anteriores para calcular os novos.</p>
          <div class="visual-example">
            <p>Exemplo de tabela DP:</p>
            <table class="algorithm-comparison">
              <tr>
                <th>Peso</th>
                <th>0</th>
                <th>1</th>
                <th>2</th>
                <th>3</th>
              </tr>
              <tr>
                <td>Item 1</td>
                <td>0</td>
                <td>5</td>
                <td>5</td>
                <td>5</td>
              </tr>
              <tr>
                <td>Item 2</td>
                <td>0</td>
                <td>5</td>
                <td>7</td>
                <td>12</td>
              </tr>
            </table>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Garante solução ótima</li>
            <li>Mais eficiente que força bruta</li>
            <li>Bom para problemas com capacidade moderada</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Pode ser lento para capacidades muito grandes</li>
            <li>Usa mais memória que outros algoritmos</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(n*W)</div>
      `;
      break;
      
    case 'greedy':
      title = 'Algoritmo Guloso';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O algoritmo guloso é como um colecionador que sempre escolhe o item que parece mais valioso naquele momento. Ele calcula a razão valor/peso para cada item e escolhe primeiro os itens com a melhor razão.</p>
          <div class="visual-example">
            <p>Exemplo de ordenação por razão valor/peso:</p>
            <ul>
              <li>Item A: Valor $10, Peso 2kg → Razão: 5</li>
              <li>Item B: Valor $15, Peso 3kg → Razão: 5</li>
              <li>Item C: Valor $20, Peso 5kg → Razão: 4</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Muito rápido</li>
            <li>Fácil de implementar</li>
            <li>Bom para problemas grandes</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Não garante solução ótima</li>
            <li>Pode escolher itens sub-ótimos</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(n log n)</div>
      `;
      break;
      
    case 'bnb':
      title = 'Branch and Bound';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O Branch and Bound é como um explorador inteligente que procura a melhor solução em uma árvore de possibilidades. Ele usa "poda" para eliminar ramos que não podem levar a uma solução melhor que a já encontrada.</p>
          <div class="visual-example">
            <p>Exemplo de árvore de decisão com poda:</p>
            <ul>
              <li>Começa com um item (A)</li>
              <li>Ramifica em incluir ou não incluir A</li>
              <li>Calcula limites superiores para cada ramo</li>
              <li>Poda ramos que não podem melhorar a solução atual</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Garante solução ótima</li>
            <li>Mais eficiente que força bruta</li>
            <li>Poda ramos inúteis da árvore de busca</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Pode ser lento para problemas muito grandes</li>
            <li>Complexidade ainda exponencial no pior caso</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(2^n) no pior caso, mas geralmente melhor</div>
      `;
      break;
      
    case 'ga':
      title = 'Algoritmo Genético';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O Algoritmo Genético imita a evolução natural. Ele começa com uma população de soluções possíveis e as melhora através de seleção, crossover e mutação ao longo de várias gerações.</p>
          <div class="visual-example">
            <p>Exemplo de evolução:</p>
            <ul>
              <li>Geração 1: População inicial aleatória</li>
              <li>Seleção: Escolhe as melhores soluções</li>
              <li>Crossover: Combina soluções boas</li>
              <li>Mutação: Pequenas alterações aleatórias</li>
              <li>Repete por várias gerações</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Bom para problemas grandes</li>
            <li>Pode escapar de mínimos locais</li>
            <li>Paralelizável</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Não garante solução ótima</li>
            <li>Precisa ajustar parâmetros</li>
            <li>Pode ser lento para convergir</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(populationSize * generations * n)</div>
      `;
      break;
      
    case 'sa':
      title = 'Simulated Annealing';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O Simulated Annealing imita o processo de resfriamento de metais. Começa "quente" (aceitando soluções piores) e gradualmente "esfria" (tornando-se mais seletivo), permitindo escapar de mínimos locais.</p>
          <div class="visual-example">
            <p>Exemplo de processo:</p>
            <ul>
              <li>Temperatura inicial alta (100)</li>
              <li>Gera soluções vizinhas</li>
              <li>Aceita soluções piores com probabilidade decrescente</li>
              <li>Resfria gradualmente (taxa 0.95)</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Pode escapar de mínimos locais</li>
            <li>Bom para problemas grandes</li>
            <li>Fácil de implementar</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Não garante solução ótima</li>
            <li>Precisa ajustar parâmetros</li>
            <li>Pode ser lento para convergir</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(iterationsPerTemp * log(temperature))</div>
      `;
      break;
      
    case 'approx':
      title = 'Algoritmo de Aproximação';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O algoritmo de aproximação é uma abordagem simples e rápida que ordena os itens por valor e seleciona os mais valiosos que cabem na mochila. Embora não garanta a solução ótima, oferece uma garantia de qualidade.</p>
          <div class="visual-example">
            <p>Exemplo de seleção:</p>
            <ul>
              <li>Item A: Valor $20, Peso 5kg</li>
              <li>Item B: Valor $15, Peso 3kg</li>
              <li>Item C: Valor $10, Peso 2kg</li>
              <li>Seleciona por valor decrescente</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Muito rápido</li>
            <li>Garante pelo menos 50% do valor ótimo</li>
            <li>Fácil de implementar</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Não garante solução ótima</li>
            <li>Pode ser muito sub-ótimo em alguns casos</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(n log n)</div>
      `;
      break;
      
    case 'fptas':
      title = 'FPTAS (Fully Polynomial Time Approximation Scheme)';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O FPTAS é um esquema de aproximação que pode chegar arbitrariamente perto da solução ótima. Ele escala os valores dos itens e usa programação dinâmica para encontrar uma solução aproximada.</p>
          <div class="visual-example">
            <p>Exemplo de processo:</p>
            <ul>
              <li>Escala valores (ε = 0.2)</li>
              <li>Aplica DP nos valores escalados</li>
              <li>Reconstrói solução</li>
              <li>Garante (1-ε) do valor ótimo</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Pode chegar arbitrariamente perto da solução ótima</li>
            <li>Complexidade polinomial</li>
            <li>Bom para problemas grandes</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Mais complexo que outros algoritmos</li>
            <li>Precisa escolher ε cuidadosamente</li>
            <li>Pode ser lento para ε muito pequeno</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(n²/ε)</div>
      `;
      break;
    case 'dp_recursive':
      title = 'Programação Dinâmica (Recursiva)';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>A programação dinâmica recursiva com memoization resolve o problema da mochila através de uma abordagem de cima para baixo (top-down). Ela utiliza uma função recursiva que verifica se um subproblema já foi resolvido anteriormente, consultando um cache implementado como uma hashtable.</p>
          <div class="visual-example">
            <p>O algoritmo segue estes passos:</p>
            <ol>
              <li>Define uma função recursiva que calcula o valor máximo possível para um subconjunto de itens e uma capacidade restante</li>
              <li>Antes de calcular, verifica se o resultado já está armazenado no cache (memoization)</li>
              <li>Se já estiver no cache, retorna o resultado imediatamente (acesso O(1))</li>
              <li>Se não estiver no cache, calcula o resultado e o armazena para uso futuro</li>
              <li>Para cada item, decide entre duas opções: incluir o item ou não incluir</li>
            </ol>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Memoization</h3>
          <p>A memoization é a técnica que torna esta abordagem eficiente. Ela usa uma hashtable (objeto em JavaScript) para armazenar os resultados de subproblemas:</p>
          <pre>
// Cache de resultados (hashtable)
const memo = {};

// Verificação do cache
if (memo[key]) return memo[key];

// Armazenamento no cache
memo[key] = resultado;
          </pre>
          <p>Cada subproblema é identificado por uma chave única composta pelo índice do item atual e pela capacidade restante.</p>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Garante solução ótima</li>
            <li>Calcula apenas os subproblemas necessários (ao contrário da abordagem bottom-up)</li>
            <li>Fácil de entender a lógica recursiva</li>
            <li>Evita recálculos de subproblemas já resolvidos</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Pode ter sobrecarga com muitas chamadas recursivas</li>
            <li>Possível estouro de pilha para problemas muito grandes</li>
            <li>Ligeiramente menos eficiente que a versão iterativa em alguns casos</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(n*W) tempo, O(n*W) espaço</div>
      `;
      break;
    case 'aco':
      title = 'Ant Colony Optimization (ACO)';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O Algoritmo de Colônia de Formigas (ACO) é inspirado no comportamento de formigas reais buscando alimento. As formigas depositam feromônios nos caminhos que percorrem, e escolhem caminhos com mais feromônios com maior probabilidade.</p>
          <div class="visual-example">
            <p>Processo principal:</p>
            <ol>
              <li>Cada formiga constrói uma solução (seleciona itens) baseada em:</li>
              <ul>
                <li>Feromônios: preferência por itens escolhidos por outras formigas anteriormente</li>
                <li>Heurística: razão valor/peso dos itens</li>
              </ul>
              <li>Após todas as formigas construírem soluções, os feromônios são atualizados:</li>
              <ul>
                <li>Evaporação: redução gradual de todos os feromônios</li>
                <li>Depósito: adição de feromônios proporcional à qualidade das soluções</li>
              </ul>
              <li>O processo se repete por várias iterações, refinando as soluções</li>
            </ol>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Bom para problemas de otimização combinatória</li>
            <li>Explora o espaço de soluções eficientemente</li>
            <li>Pode encontrar soluções próximas do ótimo rapidamente</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Não garante solução ótima</li>
            <li>Sensível aos valores dos parâmetros (α, β, taxa de evaporação)</li>
            <li>Pode convergir prematuramente para soluções subótimas</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(iterações * num_formigas * n²)</div>
      `;
      break;
    case 'pso':
      title = 'Particle Swarm Optimization (PSO)';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O PSO é inspirado no comportamento social de grupos de animais como pássaros e peixes. Cada "partícula" representa uma solução potencial que se move pelo espaço de busca, influenciada por sua própria experiência e pela experiência do grupo.</p>
          <div class="visual-example">
            <p>Componentes principais:</p>
            <ol>
              <li>Posição: Representa uma solução (item está ou não na mochila)</li>
              <li>Velocidade: Determina como a posição muda ao longo do tempo</li>
              <li>Melhor pessoal (pBest): Melhor solução encontrada pela partícula até agora</li>
              <li>Melhor global (gBest): Melhor solução encontrada por qualquer partícula</li>
            </ol>
            <p>A cada iteração, cada partícula:</p>
            <ul>
              <li>Atualiza sua velocidade com base em:</li>
              <ul>
                <li>Inércia: tendência a continuar na mesma direção</li>
                <li>Componente cognitivo: atração para seu melhor pessoal</li>
                <li>Componente social: atração para o melhor global</li>
              </ul>
              <li>Atualiza sua posição com base na nova velocidade</li>
              <li>Avalia a nova posição e atualiza pBest/gBest se necessário</li>
            </ul>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Eficiente para otimização multimodal</li>
            <li>Fácil de implementar e paralelizar</li>
            <li>Poucos parâmetros para ajustar</li>
            <li>Bom equilíbrio entre exploração e explotação</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Não garante solução ótima</li>
            <li>Pode convergir prematuramente</li>
            <li>Para o problema da mochila, requer adaptação (conversão contínuo-discreto)</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(iterações * num_partículas * n)</div>
      `;
      break;
    case 'cuckoo':
      title = 'Cuckoo Search';
      explanation = `
        <div class="explanation-step">
          <h3>Como Funciona?</h3>
          <p>O Cuckoo Search é inspirado no comportamento parasita de algumas espécies de cucos que põem seus ovos em ninhos de outras aves. Combina o comportamento de voo de Lévy (passos aleatórios com distribuição específica) com a estratégia de abandono de ninhos.</p>
          <div class="visual-example">
            <p>Processo principal:</p>
            <ol>
              <li>Cada ninho representa uma solução potencial</li>
              <li>Geração de novas soluções:</li>
              <ul>
                <li>Voo de Lévy: movimento aleatório que favorece passos pequenos, mas ocasionalmente permite passos grandes (exploração mais ampla)</li>
              </ul>
              <li>Se a nova solução for melhor, substitui a antiga</li>
              <li>Abandono de ninhos: parte dos piores ninhos são abandonados e substituídos por novos aleatórios</li>
            </ol>
            <p>O voo de Lévy é um padrão de movimento encontrado em muitos animais na natureza, que permite exploração eficiente do espaço.</p>
          </div>
        </div>
        
        <div class="explanation-step">
          <h3>Vantagens e Desvantagens</h3>
          <p><strong>Vantagens:</strong></p>
          <ul>
            <li>Excelente para exploração global (voo de Lévy)</li>
            <li>Pode escapar de ótimos locais eficientemente</li>
            <li>Menos parâmetros para ajustar que outros algoritmos</li>
            <li>Rápida convergência para boas soluções</li>
          </ul>
          <p><strong>Desvantagens:</strong></p>
          <ul>
            <li>Mais recente e menos estudado que outros algoritmos</li>
            <li>Implementação do voo de Lévy pode ser complexa</li>
            <li>Não garante solução ótima</li>
          </ul>
        </div>
        
        <div class="complexity-badge">Complexidade: O(iterações * num_ninhos * n)</div>
      `;
      break;
  }
  
  explanationTitle.textContent = title;
  algorithmExplanation.innerHTML = explanation;
}

// Adicione o evento de clique fora do modal para fechar
window.addEventListener('click', (event) => {
  if (event.target === explanationModal) {
    explanationModal.style.display = 'none';
  }
});

// ----- Add after other algorithm implementations -----
// ----- Recursive Dynamic Programming with Memoization -----
function solveKnapsackDPRecursive() {
  const startTime = performance.now();
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
  const selected = result.selected;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  
  // Display result
  document.getElementById('execution-time').textContent = `${executionTime.toFixed(2)} ms`;
  optimalSolution = { 
    bestValue: result.value, 
    bestCombination: selected, 
    steps,
    memoSize: Object.keys(memo).length // Number of subproblems memoized
  };
  bestValueSpan.textContent = optimalSolution.bestValue;
  totalWeightSpan.textContent = calculateTotalWeight(selected);
  stepsTakenSpan.textContent = steps;
  resultPanel.style.display = 'block';
  optimalSolutionDiv.innerHTML = `
    <p>Solução DP Recursiva (com Memoization) inclui os seguintes itens:</p>
    <ul>
      ${selected.map(item => `<li>Item ${item.id}: Valor = $${item.value}, Peso = ${item.weight} kg</li>`).join('')}
    </ul>
    <p>Valor Total: $${optimalSolution.bestValue}</p>
    <p>Peso Total: ${calculateTotalWeight(selected)} kg</p>
    <p>Subproblemas memorizados: ${optimalSolution.memoSize}</p>
  `;
  highlightSelectedItems();
}

// Ant Colony Optimization implementation
function solveKnapsackACO() {
  // Algorithm parameters
  const numAnts = 20;
  const iterations = 50;
  const alpha = 1.0;  // pheromone importance
  const beta = 2.0;   // heuristic importance
  const evaporationRate = 0.5;
  const Q = 100;      // pheromone deposit factor
  
  // Initialize pheromone trails
  let pheromones = new Array(items.length).fill(1.0);
  
  // Keep track of best solution
  let bestSolution = [];
  let bestValue = 0;
  
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

// Particle Swarm Optimization implementation
function solveKnapsackPSO() {
  // Algorithm parameters
  const numParticles = 30;
  const iterations = 50;
  const w = 0.7;         // inertia weight
  const c1 = 1.5;        // cognitive coefficient
  const c2 = 1.5;        // social coefficient
  
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

// Cuckoo Search implementation
function solveKnapsackCuckoo() {
  // Algorithm parameters
  const numNests = 25;
  const iterations = 50;
  const pa = 0.25;  // probability of nest abandonment
  
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