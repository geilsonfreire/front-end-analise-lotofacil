import { toast } from "react-toastify";
import apiServices from "../services/apiServices";

export const fetchSorteios = async (setResultsCallback) => {
    const loadingToast = toast.info("Carregando sorteios da API...", { autoClose: false });
    try {
        const allResults = await apiServices.getAllResults();
        setResultsCallback(allResults);
        toast.success("Sorteios carregados com sucesso!");
    } catch (error) {
        console.error("Erro ao buscar os sorteios:", error.message);
        toast.error("Erro ao buscar dados da API.");
    } finally {
        toast.dismiss(loadingToast);
    }
};
