// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


// Imports Css
import "../style/analiseImpaPar.css";

// Imports de Icones



// Importando o componente
import { fetchSorteios } from "../utils/fetchSorteios";
import { processResults } from "../utils/analiyzeOddEven";  



const AnaliseImpaPar = () => {
    // Estado para armazenar os resultados
    const [analysis, setAnalysis] = useState(null);


    useEffect(() => {
        const fetchAndAnalyze = async () => {
            await fetchSorteios(async (allResults) => {
                const analysisResult = await processResults(allResults);
                setAnalysis(analysisResult);
                toast.success("Análise concluída com sucesso!");
            });
        };

        fetchAndAnalyze();
    }, []);

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Análise -<span> Ímpar - Par</span></h1>
                </div>
            </section>

            <section className="analise-result">
                <div className="latest-result-info-header">
                    <h1>Análise de Quantitativo / Ímpares & Pares</h1>
                </div>

                <div className="possibility-result-info-body">
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

export default AnaliseImpaPar