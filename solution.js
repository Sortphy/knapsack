// objetive:
// backpack can carry 10 weight
// what items should we carry for the most value?

class Item {
    constructor(value, weight) {
      this.value = value;
      this.weight = weight;
    }
  }


function generateRandomItems(count) {
    const items = [];
    for (let i = 0; i < count; i++) {
      const value = Math.floor(Math.random() * 10) + 1;  // 1 to 10
      const weight = Math.floor(Math.random() * 7) + 1;  // 1 to 7
      items.push(new Item(value, weight));
    }
    return items;
}


function bruteForceKnapsack(items, capacity) {
    let bestValue = 0;
    let bestCombination = [];
    const n = items.length;
    const totalCombinations = 1 << n; // equivalent to 2^n
    let tries = 0;  // variable to count the number of combinations tried
  
    // Loop through all possible combinations
    for (let i = 0; i < totalCombinations; i++) {
      tries++;
      let currentValue = 0;
      let currentWeight = 0;
      let combination = [];
  
      // Check each bit position
      for (let j = 0; j < n; j++) {
        // If the j-th bit in i is set, include items[j]
        if (i & (1 << j)) {
          currentValue += items[j].value;
          currentWeight += items[j].weight;
          combination.push(items[j]);
        }
      }
  
      // If this combination doesn't exceed the capacity and is better than the best so far, update the best
      if (currentWeight <= capacity && currentValue > bestValue) {
        bestValue = currentValue;
        bestCombination = combination;
      }
    }
    
    return { bestValue, bestCombination, tries };
}


  function main() {
    const capacity = 10;
    const items = generateRandomItems(5);
  
    console.log("Generated Items:");
    items.forEach((item, i) => {
      console.log(`Item ${i + 1}: Value = ${item.value}, Weight = ${item.weight}`);
    });
  
    const result = bruteForceKnapsack(items, capacity);
  
    console.log("\nOptimal Items to put in the Backpack:");
    result.bestCombination.forEach((item, i) => {
      console.log(`Item ${i + 1}: Value = ${item.value}, Weight = ${item.weight}`);
    });
  
    console.log(`\nTotal Best Value: ${result.bestValue}`);
    console.log(`Brute force algorithm ran ${result.tries} times.`);
}
  
  // Execute the main function
  main();
  
