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

        console.log("Projeção de sorteios não realizados:");
        console.table(unrealizedDraws); // Exibe os resultados no console

        return unrealizedDraws;
    } catch (error) {
        console.error("Erro ao atualizar os sorteios não realizados:", error.message);
        return [];
    }
};