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


// RECURSIVO COM MEMOIZAMATION
function recursiveKnapsack(items, capacity) {
    // quantas vezaes a fncao foi chamada
    let calls = 0;
    
    // memoization
    // "index_remainingCapacity"
    const memo = {};
    
    // melhor combinancao
    let bestCombination = [];
    
    
    function knapsackHelper(index, remainingCapacity, currentCombination = []) {
        calls++;
        
        // se nao tiver item ou capacidade sobrando
        if (index >= items.length || remainingCapacity <= 0) {
            return 0;
        }
        
        // checar se o problema atual ja foi resolvido
        const memoKey = `${index}_${remainingCapacity}`;
        if (memo[memoKey] !== undefined) {
            return memo[memoKey].value;
        }
        
        // caso 1: pular o primeiro item
        const valueWithoutItem = knapsackHelper(
            index + 1, 
            remainingCapacity,
            [...currentCombination]
        );
        
        // caso 2: ver se é psosivel incluir o item atual
        let valueWithItem = 0;
        let combinationWithItem = [...currentCombination];
        
        if (items[index].weight <= remainingCapacity) {
            combinationWithItem.push(items[index]);
            valueWithItem = items[index].value + knapsackHelper(
                index + 1,
                remainingCapacity - items[index].weight,
                combinationWithItem
            );
        }
        
        // salva a melhor opcao
        const result = {
            value: Math.max(valueWithItem, valueWithoutItem),
            combination: valueWithItem > valueWithoutItem ? combinationWithItem : currentCombination
        };
        
        // cache
        memo[memoKey] = result;
        
        // atualizar a melhor opcao
        if (index === 0 && remainingCapacity === capacity) {
            bestCombination = result.combination;
        }
        
        return result.value;
    }
    
    // comecar a recursao do primeiro item com capacidade full
    const bestValue = knapsackHelper(0, capacity);
    
    return { bestValue, bestCombination, tries: calls };
}

function main() {
    const capacity = 10;
    const items = generateRandomItems(5);
  
    console.log("Generated Items:");
    items.forEach((item, i) => {
      console.log(`Item ${i + 1}: Value = ${item.value}, Weight = ${item.weight}`);
    });
  
    const result = recursiveKnapsack(items, capacity);
  
    console.log("\nOptimal Items to put in the Backpack:");
    result.bestCombination.forEach((item, i) => {
      console.log(`Item ${i + 1}: Value = ${item.value}, Weight = ${item.weight}`);
    });
  
    console.log(`\nTotal Best Value: ${result.bestValue}`);
    console.log(`Algorithm ran ${result.tries} times.`);
}
  

main();