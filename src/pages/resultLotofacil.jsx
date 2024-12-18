// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Imports Css
import "../style/resultLotofacil.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";


// Importando o componente
import apiServices from "../services/apiServices";
import { calculateCombinations } from "../utils/mathPossibility";


const ResultLotofacil = () => {
    // Estado para armazenar os resultados
    const [latestResult, setLatestResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sorteios, setSorteios] = useState([]);

    // Calcula as combinações
    const totalCombinations = calculateCombinations(25, 15);

    // Busca todos os sorteios da API
    useEffect(() => {
        const fetchSorteios = async () => {
            try {
                const allResults = await apiServices.getAllResults();
                setSorteios(allResults);
            } catch (error) {
                console.error("Erro ao buscar os sorteios:", error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSorteios();
    }, []);
    // Calcula o restante de possibilidades (dinâmico)
    const remainingCombinations = totalCombinations - sorteios.length;
   

    // Função para buscar o último resultado
    const fetchLatestResult = async () => {
        try {
            const latestResult = await apiServices.getLatestResult(); // Chama a API
            if (latestResult) {
                setLatestResult(latestResult);
            } else {
                toast.error("Erro ao carregar o último resultado.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            setLoading(false);
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
                {loading ? (
                    <h1>Carregando...</h1> // Exibe enquanto carrega
                ) : latestResult ? (
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

                            <div className="dezenas">
                                {latestResult.dezenas && latestResult.dezenas.length > 0 ? (
                                    latestResult.dezenas.map((dezena, index) => (
                                        <span key={index}>{dezena}</span>
                                    ))
                                ) : (
                                    <span>N/A</span> // Caso não haja dezenas
                                )}
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
                                <span>N/A</span>
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
                    <h1>Nenhum resultado disponível.</h1> // Caso não haja dados
                )}
            </section>

            <section className="analise-result">
                <div className="latest-result-info-header">
                    <h1>Análise de Possibilidades / Probabilidades </h1>
                </div>

                <div className="possibility-result-info-body">
                    {loading ? (
                        <p>Carregando dados...</p>
                    ) : (
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
                            </tbody>
                        </table>
                    )}
                </div>

            </section>

        </main >
    );
};

export default ResultLotofacil