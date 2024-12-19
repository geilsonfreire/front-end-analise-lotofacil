// Importando a biblioteca Axios
import axios from "axios";

// URL base da API
const BASE_URL = "https://loteriascaixa-api.herokuapp.com/api/lotofacil";

// Cache para armazenar dados temporariamente
let cache = {
    allResults: null,
    latestResult: null,
    contestResults: {},
    lastUpdate: null, // Armazena a última atualização (timestamp)
};

// Função para verificar se o cache está válido (dados atualizados)
const isCacheValid = () => {
    if (!cache.lastUpdate) return false; // Cache nunca foi atualizado
    const now = new Date();
    const lastUpdate = new Date(cache.lastUpdate);
    return now.getDate() === lastUpdate.getDate(); // Verifica se está no mesmo dia
};

// Função para converter a data de 'DD/MM/YYYY' para 'YYYY-MM-DD'
const convertDate = (dateString) => {
    try {
        const [day, month, year] = dateString.split("/");
        return `${year}-${month}-${day}`;
    } catch {
        console.error(`Erro ao converter a data: ${dateString}`);
        return null;
    }
};

// Função para obter todos os resultados da Lotofácil
const getAllResults = async () => {
    if (cache.allResults && isCacheValid()) {
        console.log("Usando dados do cache: todos os resultados");
        return cache.allResults; // Retorna os dados do cache
    }

    try {
        const response = await axios.get(BASE_URL);
        cache.allResults = response.data; // Atualiza o cache
        cache.lastUpdate = new Date().toISOString(); // Atualiza o timestamp
        return response.data;
    } catch (error) {
        console.error(`Erro ao obter os resultados: ${error.message}`);
        throw new Error("Não foi possível obter os resultados.");
    }
};

// Função para obter o resultado do último concurso
const getLatestResult = async () => {
    if (cache.latestResult && isCacheValid()) {
        console.log("Usando dados do cache: último resultado");
        return cache.latestResult; // Retorna os dados do cache
    }

    const url = `${BASE_URL}/latest`;
    try {
        const response = await axios.get(url);
        cache.latestResult = response.data; // Atualiza o cache
        cache.lastUpdate = new Date().toISOString(); // Atualiza o timestamp
        return response.data;
    } catch (error) {
        console.error(`Erro ao obter o resultado do último concurso: ${error.message}`);
        throw new Error("Não foi possível obter o último resultado.");
    }
};

// Função para obter o resultado de um concurso específico
const getResultByContestNumber = async (contestNumber) => {
    if (cache.contestResults[contestNumber] && isCacheValid()) {
        console.log(`Usando dados do cache: concurso ${contestNumber}`);
        return cache.contestResults[contestNumber]; // Retorna os dados do cache
    }

    const url = `${BASE_URL}/${contestNumber}`;
    try {
        const response = await axios.get(url);
        cache.contestResults[contestNumber] = response.data; // Atualiza o cache
        cache.lastUpdate = new Date().toISOString(); // Atualiza o timestamp
        return response.data;
    } catch (error) {
        console.error(
            `Erro ao obter o resultado do concurso ${contestNumber}: ${error.message}`
        );
        throw new Error(`Não foi possível obter o resultado do concurso ${contestNumber}.`);
    }
};

// Exporta as funções para serem utilizadas em outros arquivos
export default { getAllResults, getLatestResult, getResultByContestNumber, convertDate };