// Importando a biblioteca Axios
import axios from "axios";

// URL base da API
// APIs disponíveis (ordem de prioridade)
const BASE_URLS = [
   // "http://localhost:8090/api/lotofacil",
    "https://loteriascaixa-api.herokuapp.com/api/lotofacil"
];

// Faz a requisição tentando todas as APIs
const requestWithFallback = async (path = "") => {
    let lastError;

    for (const baseUrl of BASE_URLS) {
        try {
            const response = await axios.get(`${baseUrl}${path}`, {
                timeout: 5000
            });

            console.log(`✅ API utilizada: ${baseUrl}`);
            return response.data;

        } catch (error) {
            console.warn(`⚠️ API indisponível: ${baseUrl}`);
            lastError = error;
        }
    }

    throw lastError;
};


// Função para converter a data de 'DD/MM/YYYY' para 'YYYY-MM-DD'
const convertDate = (dateString) => {
    try {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month}-${day}`;
    } catch {
        console.error(`Erro ao converter a data: ${dateString}`);
        return null;
    }
};

// Função para obter todos os resultados da Lotofácil
const getAllResults = async () => {
    return await requestWithFallback();
};

// Função para obter o resultado do último concurso
const getLatestResult = async () => {
    return await requestWithFallback("/latest");
};


// Função para obter o resultado de um concurso específico
const getResultByContestNumber = async (contestNumber) => {
    return await requestWithFallback(`/${contestNumber}`);
};


// Exporta as funções para serem utilizadas em outros arquivos
export default {
    getAllResults,
    getLatestResult,
    getResultByContestNumber,
    convertDate
};;