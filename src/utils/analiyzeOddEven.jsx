// Importando o serviço de API
import apiService from "../services/apiServices";
import { generateOddEvenCounts } from "../utils/oddEvenAnalyzer";

export const processResults = async () => {
    try {
        const results = await apiService.getAllResults();

        if (!results || results.length === 0) {
            console.error("Nenhum resultado foi retornado pela API.");
            return null;
        }

        // Gera as contagens acumuladas de pares e ímpares
        const analysis = generateOddEvenCounts(results);

        console.log("Contagens de formações de pares e ímpares:");
        console.table(analysis); // Exibe como tabela no console

        return analysis;
    } catch (error) {
        console.error("Erro ao processar os resultados:", error.message);
        return null;
    }
};