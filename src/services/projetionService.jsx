import { getUnrealizedDraws } from "../utils/projetionsAnalyzer";
import apiService from "./apiServices";

export const updateUnrealizedDraws = async () => {
    try {
        // Obtém os sorteios realizados da API
        const realizedDraws = await apiService.getAllResults();

        if (!realizedDraws || realizedDraws.length === 0) {
            console.warn("Nenhum sorteio foi encontrado.");
            return [];
        }

        // Calcula os sorteios não realizados
        const unrealizedDraws = getUnrealizedDraws(realizedDraws.map((draw) => draw.dezenas));

        // Subtrai os sorteios realizados dos sorteios não realizados
        const updatedUnrealizedDraws = subtractRealizedDraws(unrealizedDraws, realizedDraws);

        console.log("Projeção de sorteios não realizados:");
        console.table(updatedUnrealizedDraws); // Exibe os resultados no console

        return updatedUnrealizedDraws;
    } catch (error) {
        console.error("Erro ao atualizar os sorteios não realizados:", error.message);
        return [];
    }
};

const subtractRealizedDraws = (unrealizedDraws, realizedDraws) => {
    const realizedDrawsSet = new Set(realizedDraws.map(draw => draw.dezenas.sort().join(',')));
    return unrealizedDraws.filter(draw => !realizedDrawsSet.has(draw.dezenas.sort().join(',')));
};