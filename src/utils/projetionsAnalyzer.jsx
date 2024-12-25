import { generateCombinations } from "./possibilityCombinations";
import { calculateOddEven } from "./oddEvenAnalyzer";

export const getUnrealizedDraws = (realizedDraws, totalNumbers = 25, drawSize = 15) => {
    // Gera todas as combinações possíveis
    const allCombinations = generateCombinations(
        Array.from({ length: totalNumbers }, (_, i) => i + 1), // Gera um array [1, 2, ..., 25]
        drawSize
    );

    // Converte os sorteios realizados em strings para comparação
    const realizedDrawStrings = new Set(realizedDraws.map((draw) => draw.sort().join(",")));

    // Filtra as combinações não realizadas
    const unrealizedDraws = allCombinations.filter(
        (combo) => !realizedDrawStrings.has(combo.sort().join(","))
    );

    // Retorna as combinações restantes com análises de pares e ímpares
    return unrealizedDraws.map((combo) => ({
        dezenas: combo,
        ...calculateOddEven(combo),
    }));
};