// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


// Imports Css
import "../style/resultLotofacil.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";


// Importando o componente
import apiServices from "../services/apiServices";
import { fetchSorteios } from "../utils/fetchSorteios";
import { calculateCombinations } from "../utils/mathPossibility";
import { calculateOddEven } from "../utils/oddEvenAnalyzer";



const ResultLotofacil = () => {
    // Estado para armazenar os resultados
    const [latestResult, setLatestResult] = useState(null);
    const [sorteios, setSorteios] = useState([]);

    // Calcula as combinações
    const totalCombinations = calculateCombinations(25, 15);
   
   
    useEffect(() => {
        fetchSorteios(setSorteios);
    }, []);

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


    // Função para buscar o último resultado
    const fetchLatestResult = async () => {
        const loadingToast = toast.info("Carregando último resultado...", { autoClose: false });
        try {
            const latestResult = await apiServices.getLatestResult(); // Chama a API
            if (latestResult) {
                setLatestResult(latestResult);
                toast.success("Último resultado carregado com sucesso!");
            } else {
                toast.error("Erro ao carregar o último resultado.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    // useEffect para buscar o resultado ao montar o componente
    useEffect(() => {
        fetchLatestResult();
    }, []);



    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Result -<span> Lotofácil</span></h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="Concurso aqui!" />
                    <button>
                        <MdOutlineSearch />
                        Buscar
                    </button>
                </div>
            </section>

            <section className="latest-result">
                {latestResult ? (
                    <>
                        <div className="latest-result-info-header">
                            <h1>Ultimo Resultado</h1>
                            <p>Data do concurso: <span>{latestResult.data || "N/A"}</span></p>
                            <p>Data do próximo concurso: <span>{latestResult.dataProximoConcurso || "N/A"}</span></p>
                        </div>

                        <div className="latest-result-info-body">
                            <div className="data-result-latest">
                                <h2>Concurso: - <span>{latestResult.concurso || "N/A"}</span></h2>
                                <h2>Local do sorteio: - <span>{latestResult.local || "N/A"}</span></h2>
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
                                            return (
                                                <>
                                                    <p>O sorteio contém:</p>
                                                    <span>{even}</span>
                                                    <p>pares e</p>
                                                    <span>{odd}</span>
                                                    <p>ímpares.</p>
                                                </>
                                            );
                                        })()
                                    ) : (
                                        <p>Não há dados disponíveis para análise.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="local-ganhadores">
                            <h2>Local dos Ganhadores:</h2>
                            <div className="local-ganhadores-info">
                                {latestResult.localGanhadores && latestResult.localGanhadores.length > 0 ? (
                                    latestResult.localGanhadores.map((ganhador, index) => (
                                        <p key={index}>
                                            <span>{ganhador.municipio}</span>
                                        </p>
                                    ))
                                ) : (
                                    <span>Dados não informados</span>
                                )}
                            </div>
                        </div>

                        <div className="premiacoes">
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
                    </>
                ) : (
                    <h1>Nenhum resultado disponível.</h1>
                )}
            </section>

            <section className="analise-result">
                <div className="latest-result-info-header">
                    <h1>Análise de Possibilidades / Probabilidades </h1>
                </div>

                <div className="possibility-result-info-body">
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

            </section>

        </main>
    );
};

export default ResultLotofacil