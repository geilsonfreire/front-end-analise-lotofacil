// Importando o serviço de API
import apiService from "../services/apiServices";

// Inicializa um objeto para armazenar as contagens de cada configuração
const configurationCounts = {
    "8 Par - 7 Ímpar": 0,
    "7 Par - 8 Ímpar": 0,
    "6 Par - 9 Ímpar": 0,
    "9 Par - 6 Ímpar": 0,
    "5 Par - 10 Ímpar": 0,
    "10 Par - 5 Ímpar": 0,
    "4 Par - 11 Ímpar": 0,
    "11 Par - 4 Ímpar": 0,
    "3 Par - 12 Ímpar": 0,
    "12 Par - 3 Ímpar": 0,
    "2 Par - 13 Ímpar": 0,
    "13 Par - 2 Ímpar": 0,
    "1 Par - 14 Ímpar": 0,
    "14 Par - 1 Ímpar": 0,
};

// Função para analisar os números de um sorteio e atualizar as contagens
const analyzeOddEven = (numbers) => {
    if (!numbers || numbers.length === 0) {
        console.warn("Sorteio inválido ou vazio:", numbers);
        return;
    }

    // Converte as dezenas para números
    const convertedNumbers = numbers.map((num) => parseInt(num, 10));

    // Conta os números ímpares e pares
    const oddCount = convertedNumbers.filter((num) => num % 2 !== 0).length;
    const evenCount = convertedNumbers.length - oddCount;

    // Gera a chave da configuração
    const key = `${evenCount} Par - ${oddCount} Ímpar`;

    // Incrementa a contagem se a chave existir no objeto
    if (configurationCounts[key] !== undefined) {
        configurationCounts[key]++;
    } else {
        console.warn(`Configuração não encontrada: ${key}`);
    }
};

// Função principal para processar todos os resultados
export const processResults = async () => {
    try {
        // Obtém todos os resultados da API
        const results = await apiService.getAllResults();

        if (!results || results.length === 0) {
            console.error("Nenhum resultado foi retornado pela API.");
            return;
        }

        // Processa cada sorteio
        results.forEach((result) => {
            if (!result || !result.dezenas || !Array.isArray(result.dezenas)) {
                console.warn("Sorteio inválido encontrado:", result);
                return;
            }
            analyzeOddEven(result.dezenas); // Analisa os números do sorteio
        });

        // Exibe as contagens no console
        console.log("Contagens de formações de pares e ímpares:");
        console.table(configurationCounts); // Exibe como tabela

        return configurationCounts; // Retorna os resultados para uso externo
    } catch (error) {
        console.error("Erro ao processar os resultados:", error.message);
        return null;
    }
};

// Exporta as contagens para uso externo, se necessário
export default configurationCounts;