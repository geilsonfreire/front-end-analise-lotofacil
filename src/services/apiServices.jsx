// Import Bibliotecas
import axios from "axios";

// Configuração da API
const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    timeout:40000,
});

// Função genérica para requisições GET
const fetchData = async (endpoint) => {
    try {
        const response = await api.get(endpoint);
        console.log(`Resposta de ${endpoint}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar dados de ${endpoint}:`, error.message);
        throw error; // Opcional: Permite que o componente capture e trate o erro
    }
};

// Funções específicas para chamadas de API
export const getLoterias = () => fetchData("/loterias");
export const getConcursos = () => fetchData("/concursos");
export const getDezenas = () => fetchData("/dezenas");
export const getLocalGanhadores = () => fetchData("/local_ganhadores");
export const getPremiacoes = () => fetchData("/premiacoes");
export const getCombinedResults = () => fetchData("/combined");
export const getLatestCombinedResults = () => fetchData("/latest_combined");
