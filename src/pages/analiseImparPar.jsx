// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Imports Css
import "../style/analiseImpaPar.css";

// Imports de Icones

// Importando o serviço de API e a função de processamento
import apiServices from "../services/apiServices";
import { processResults } from "../utils/analiyzeOddEven";  

const AnaliseImpaPar = () => {
    // Estado para armazenar os resultados
    const [analysis, setAnalysis] = useState(null);
    const [hasFetched, setHasFetched] = useState(false); // Estado para controlar se a função já foi chamada

    useEffect(() => {
        const fetchAndAnalyze = async () => {
            try {
                const allResults = await apiServices.getAllResults();
                const analysisResult = await processResults(allResults);
                setAnalysis(analysisResult);
                toast.success("Análise concluída com sucesso!");
            } catch (error) {
                console.error("Erro ao buscar os sorteios:", error.message);
                toast.error("Erro ao buscar os sorteios.");
            }
        };

        if (!hasFetched) {
            fetchAndAnalyze();
            setHasFetched(true); // Atualiza o estado para indicar que a função já foi chamada
        }
    }, [hasFetched]); // Adiciona hasFetched como dependência para garantir que a função seja chamada apenas uma vez

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Análise -<span> Ímpar - Par</span></h1>
                </div>
            </section>

            <section className="conteiner-section">
                <div className="title-result-info">
                    <h1>Análise de Quantitativo / Ímpares & Pares</h1>
                </div>

                <div className="result-info-table">
                    {analysis ? (
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
                        <span></span>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AnaliseImpaPar;