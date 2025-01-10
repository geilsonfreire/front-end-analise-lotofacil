import apiServices from "../services/apiServices";

export const fetchSorteios = async (setResultsCallback) => {
    try {
        const allResults = await apiServices.getAllResults();
        setResultsCallback(allResults);
    } catch (error) {
        console.error("Erro ao buscar os sorteios:", error.message);
        throw error;
    }
};
