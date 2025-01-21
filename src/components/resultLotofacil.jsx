// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


// Imports Css
import "../style/resultLotofacil.css";

// Imports de Icones
import { BsArrowRightCircle, BsArrowLeftCircle } from "react-icons/bs";



// Importando o componente
import apiServices from "../services/apiServices";
import { calculateCombinations } from "../utils/mathPossibility";
import { calculateOddEven } from "../utils/oddEvenAnalyzer";



const ResultLotofacil = () => {
    // Estado para armazenar os resultados
    const [latestResult, setLatestResult] = useState(null);
    const [sorteios, setSorteios] = useState([]);
    const [currentConcurso, setCurrentConcurso] = useState(null);

    // Calcula as combinações
    const totalCombinations = calculateCombinations(25, 15);


    // Combine os dois useEffects em um só
    useEffect(() => {
        const loadData = async () => {
            const loadingToast = toast.info("Carregando dados...", { autoClose: false });
            try {
                // Chamar apiServices diretamente ao invés de usar fetchSorteios
                const [allResults, latestResultData] = await Promise.all([
                    apiServices.getAllResults(),
                    apiServices.getLatestResult()
                ]);

                // Atualizar os estados diretamente
                setSorteios(allResults);

                if (latestResultData) {
                    setLatestResult(latestResultData);
                    setCurrentConcurso(latestResultData.concurso);
                    toast.success("Dados carregados com sucesso!");
                } else {
                    toast.error("Erro ao carregar os dados.");
                }

            } catch (error) {
                console.error("Erro na requisição:", error);
                toast.error("Erro na comunicação com o servidor.");
            } finally {
                toast.dismiss(loadingToast);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (latestResult) {
            setCurrentConcurso(latestResult.concurso);
        }
    }, [latestResult]);

    const handlePreviousConcurso = async () => {
        if (currentConcurso > 1) {
            const newConcurso = currentConcurso - 1;
            await updateConcursoData(newConcurso);
        }
    };

    const handleNextConcurso = async () => {
        const newConcurso = currentConcurso + 1;
        await updateConcursoData(newConcurso);
    };

    const updateConcursoData = async (concurso) => {
        const loadingToast = toast.info("Carregando dados...", { autoClose: false });
        try {
            const resultData = await apiServices.getResultByContestNumber(concurso);
            if (resultData) {
                setLatestResult(resultData);
                setCurrentConcurso(concurso);
                toast.success("Dados carregados com sucesso!");
            } else {
                toast.error("Erro ao carregar os dados.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    // Calcula o restante de possibilidades (dinâmico)
    const remainingCombinations = totalCombinations - sorteios.length;

    // Verifica a quantidade de sorteios com sequências repetidas
    const countRepeatedSequences = () => {
        const seenSequences = new Set(); // Armazena sequências únicas
        let repeatedCount = 0;

        sorteios.forEach((sorteio) => {
            const sortedDezenas = sorteio.dezenas.sort().join(","); // Ordena e une as dezenas
            if (seenSequences.has(sortedDezenas)) {
                repeatedCount += 1; // Incrementa se a sequência já foi vista
            } else {
                seenSequences.add(sortedDezenas); // Adiciona sequência única
            }
        });

        return repeatedCount;
    };

    const repeatedCount = countRepeatedSequences();


    return (
        <main className="Container-Geral">

            <section className="latest-result">
                {latestResult ? (
                    <>
                        <div className="box-shadown">
                            <div className="title-result-info">
                                <h1>Ultimo Resultado</h1>
                                <p>Data do concurso: <span>{latestResult.data || "N/A"}</span></p>
                                <p>Data do próximo concurso: <span>{latestResult.dataProximoConcurso || "N/A"}</span></p>
                                <div className="concurso-navigation">
                                    <button
                                        onClick={handlePreviousConcurso}>
                                        <BsArrowLeftCircle />
                                    </button>
                                    <h2 className="concurso-number">
                                        <span>{currentConcurso || "N/A"}</span>
                                    </h2>
                                    <button
                                        onClick={handleNextConcurso}>
                                        <BsArrowRightCircle />
                                    </button>
                                </div>
                            </div>

                            <div className="latest-result-info-body">
                                <div className="data-result-latest">
                                    <h2>Concurso: - <span>{latestResult.concurso || "N/A"}</span></h2>
                                    <h2>Local do sorteio: - <span>{latestResult.local || "N/A"}</span></h2>
                                    <div className="local-ganhadores">
                                        <h2>Local dos Ganhadores:</h2>
                                        <div className="local-ganhadores-info">
                                            {latestResult.localGanhadores && latestResult.localGanhadores.length > 0 ? (
                                                <span>[
                                                    {latestResult.localGanhadores.map((ganhador, index) => (
                                                        <span key={index}>
                                                            {ganhador.municipio}
                                                            {index < latestResult.localGanhadores.length - 1 ? ' - ' : ''}
                                                        </span>
                                                    ))}
                                                    ]</span>
                                            ) : (
                                                <span>Dados não informados</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="container-dezenas">
                                    <div className="dezenas">
                                        {latestResult.dezenas && latestResult.dezenas.length > 0 ? (
                                            latestResult.dezenas.map((dezena, index) => (
                                                <span key={index}>{dezena}</span>
                                            ))
                                        ) : (
                                            <span>Dezenas não identificadas</span>
                                        )}
                                    </div>

                                    <div className="odd-even">
                                        {latestResult && latestResult.dezenas ? (
                                            (() => {
                                                const { even, odd } = calculateOddEven(latestResult.dezenas);
                                                const somaDezenas = latestResult.dezenas.reduce((acc, curr) => acc + Number(curr), 0);
                                                return (
                                                    <>
                                                        <p>O sorteio contém:</p>
                                                        <span>{even}</span>
                                                        <p>pares e</p>
                                                        <span>{odd}</span>
                                                        <p>ímpares.</p>
                                                        <p>Soma:</p>
                                                        <span>{somaDezenas}</span>
                                                    </>

                                                );
                                            })()
                                        ) : (
                                            <p>Não há dados disponíveis para análise.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="box-shadown">
                            <div className="result-info-table">

                                <div className="box-analise">
                                    <h2>Análise de concursos realizados / Não Realizados</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Descrição</th>
                                                <th>Quantidade</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Total de possibilidades de jogos</td>
                                                <td>{totalCombinations.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Total de sorteios já realizados</td>
                                                <td>{sorteios.length.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Possibilidades restantes</td>
                                                <td>{remainingCombinations.toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <td>Sorteios com sequências repetidas</td>
                                                <td>{repeatedCount.toLocaleString()}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="box-premiacoes">
                                    <h2>Premiações:</h2>
                                    {latestResult.premiacoes && latestResult.premiacoes.length > 0 ? (
                                        <table className="premiacoes-table">
                                            <thead>
                                                <tr>
                                                    <th>Descrição</th>
                                                    <th>Ganhadores</th>
                                                    <th>Valor do Prêmio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {latestResult.premiacoes.map((premiacao, index) => (
                                                    <tr key={index}>
                                                        <td>{premiacao.descricao}</td>
                                                        <td>{premiacao.ganhadores}</td>
                                                        <td>R$ {premiacao.valorPremio.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <span>N/A</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <h1>Nenhum resultado disponível.</h1>
                )}
            </section>



        </main>
    );
};

export default ResultLotofacil