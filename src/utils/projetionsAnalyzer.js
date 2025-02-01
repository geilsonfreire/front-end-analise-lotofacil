export const getUnrealizedDraws = (realizedDraws) => {
    const allPossibleDraws = generateAllPossibleDraws();
    const realizedDrawsSet = new Set(realizedDraws.map(draw => draw.sort().join(',')));

    const unrealizedDraws = allPossibleDraws.filter(draw => !realizedDrawsSet.has(draw.sort().join(',')));

    return unrealizedDraws.map(draw => ({
        dezenas: draw,
        even: draw.filter(num => num % 2 === 0).length,
        odd: draw.filter(num => num % 2 !== 0).length
    }));
};

const generateAllPossibleDraws = () => {
    const allDraws = [];
    const generateCombinations = (arr, n, start, curr) => {
        if (curr.length === n) {
            allDraws.push([...curr]);
            return;
        }
        for (let i = start; i <= arr.length - (n - curr.length); i++) {
            curr.push(arr[i]);
            generateCombinations(arr, n, i + 1, curr);
            curr.pop();
        }
    };

    const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
    generateCombinations(numbers, 15, 0, []);
    return allDraws;
};
