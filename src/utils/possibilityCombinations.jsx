// Gerar todas as combinações possíveis de um array de tamanho específico
export const generateCombinations = (array, size) => {
    const results = [];

    const combine = (start, combo) => {
        if (combo.length === size) {
            results.push(combo);
            return;
        }
        for (let i = start; i < array.length; i++) {
            combine(i + 1, [...combo, array[i]]);
        }
    };

    combine(0, []);
    return results;
};