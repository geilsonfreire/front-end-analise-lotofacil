// Importando a biblioteca Axios
import axios from "axios";

// URL base da API
const BASE_URL = "https://loteriascaixa-api.herokuapp.com/api/lotofacil";

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
    try {
        const response = await axios.get(BASE_URL); 
        return response.data;
    } catch (error) {
        console.error(`Erro ao obter os resultados: ${error.message}`);
        throw new Error("Não foi possível obter os resultados."); // Lança exceção
    }
};

// Função para obter o resultado do último concurso
const getLatestResult = async () => {
    const url = `${BASE_URL}/latest`;
    try {
        const response = await axios.get(url); // Faz a requisição
        return response.data; // Retorna os dados da API
    } catch (error) {
        console.error(`Erro ao obter o resultado do último concurso: ${error.message}`);
        throw new Error("Não foi possível obter o último resultado."); // Lança exceção
    }
};
console.log(getLatestResult());

// Função para obter o resultado de um concurso específico
const getResultByContestNumber = async (contestNumber) => {
    const url = `${BASE_URL}/${contestNumber}`; // Constrói a URL com o número do concurso
    try {
        const response = await axios.get(url); // Faz a requisição para a API
        return response.data; // Retorna os dados da API
    } catch (error) {
        console.error(`Erro ao obter o resultado do concurso ${contestNumber}: ${error.message}`);
        throw new Error(`Não foi possível obter o resultado do concurso ${contestNumber}.`);
    }
};


// Exporta as funções para serem utilizadas em outros arquivos
export default { getAllResults, getLatestResult, getResultByContestNumber, convertDate };