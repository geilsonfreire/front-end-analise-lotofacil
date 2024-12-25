// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


// Imports Css
import "../style/resultLotofacil.css";

// Imports de Icones



// Importando o componente
import apiServices from "../services/apiServices";
import { processResults } from "../utils/analiyzeOddEven";  



const ResultLotofacil = () => {
    // Estado para armazenar os resultados
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState(null);



    // Busca todos os sorteios da API
    useEffect(() => {
        const fetchSorteios = async () => {
            try {
                const allResults = await apiServices.getAllResults();

                // Processa os resultados para análise
                const analysisResult = await processResults(allResults);
                setAnalysis(analysisResult); // Define os resultados da análise
            } catch (error) {
                console.error("Erro ao buscar os sorteios:", error.message);
                toast.error("Erro ao buscar dados da API.");
            } finally {
                setLoading(false);
            }
        };
        fetchSorteios();
    }, []);

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Análise -<span> Impar - Par</span></h1>
                </div>
            </section>

            <section className="analise-result">
                <div className="latest-result-info-header">
                    <h1>Análise de Quantitativo / Impares & Pares</h1>
                </div>

                <div className="possibility-result-info-body">
                    {loading ? (
                        <p>Carregando dados...</p>
                    ) : analysis ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Pares</th>
                                    <th>Ímpares</th>
                                    <th>Quantidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(analysis).map(([key, count], index) => {
                                    const [even, odd] = key.match(/\d+/g); // Extrai pares e ímpares da descrição
                                    return (
                                        <tr key={index}>
                                            <td>{key}</td>
                                            <td>{even}</td>
                                            <td>{odd}</td>
                                            <td>{count}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <span>Estamos recalculando e carregando os dados de análise.</span>
                    )}
                </div>
            </section>

        </main >
    );
};

export default ResultLotofacil