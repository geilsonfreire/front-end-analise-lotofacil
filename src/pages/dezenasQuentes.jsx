// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";



// Imports Css
import "../style/dezenasQuentes.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";


// Importando o componente de serviço
import apiService from "../services/apiServices";




const DezenasQuentes = () => {
    // Estado para armazenar os resultados
    const [frequencias, setFrequencias] = useState(null);
    const [error, setError] = useState(null);
    const [topQuentes, setTopQuentes] = useState([]);
    const [intervalosAtraso, setIntervalosAtraso] = useState([]);
    const [maiorAtraso, setMaiorAtraso] = useState(null);
    const [atrasoAtual, setAtrasoAtual] = useState([]);


    // Função para calcular a frequência das dezenas
    const calcularFrequenciaDezenas = (resultados) => {
        const frequencia = Array(25).fill(0); // Array de 25 posições com valores iniciais 0

        resultados.forEach((resultado) => {
            resultado.dezenas.forEach((dezena) => {
                frequencia[dezena - 1] += 1; // Incrementa a posição correspondente
            });
        });

        return frequencia;
    };


    // Função para calcular o maior atraso e o atraso atual de cada dezena
    const calcularIntervalosAtraso = (resultados) => {
        let ultimaOcorrencia = Array(25).fill(-1); // Armazena o último sorteio onde cada dezena apareceu
        let maiorAtraso = Array(25).fill(0); // Maior intervalo de atraso para cada dezena

        resultados.forEach((resultado, idx) => {
            resultado.dezenas.forEach((dezena) => {
                if (ultimaOcorrencia[dezena - 1] !== -1) {
                    // Calcula o intervalo de atraso
                    const intervalo = (idx - 1) - ultimaOcorrencia[dezena - 1];

                    // Verifica se o intervalo calculado é maior que o maior já registrado
                    if (intervalo > maiorAtraso[dezena - 1]) {
                        maiorAtraso[dezena - 1] = intervalo;
                    }
                }

                // Atualiza a última ocorrência da dezena
                ultimaOcorrencia[dezena - 1] = idx;
            });
        });

        return maiorAtraso;
    };
    
    // Função para calcular o atraso atual de cada dezena (levando em consideração os últimos concursos)
    const calcularAtrasoAtual = (resultados) => {

        const totalConcursos = resultados.length;  // Número total de sorteios
        const atrasoAtual = Array(25).fill(0); // Array de 25 posições com valores iniciais 0

        resultados.forEach((resultado, idx) => {
            resultado.dezenas.forEach((dezena) => {
                // Atualiza o atraso de cada dezena com base no último concurso em que foi sorteada
                if (atrasoAtual[dezena - 1] === 0) {
                    // Se for o primeiro sorteio que a dezena aparece, atribui o atraso correto
                    atrasoAtual[dezena - 1] = totalConcursos - idx;
                }
            });
        });

        // Calcula o atraso de cada dezena
        atrasoAtual.forEach((atraso, dezenaIdx) => {
            // Verifica se a dezena apareceu, se não apareceu, o atraso será o total de sorteios
            if (atraso === 0) {
                atrasoAtual[dezenaIdx] = totalConcursos;
            } else {
                atrasoAtual[dezenaIdx] = totalConcursos - atraso; // Atraso é a diferença entre o total de sorteios e a última vez que a dezena apareceu
            }
        });

        return atrasoAtual;
    };


    // Função para buscar os resultados e calcular as frequências e intervalos
    useEffect(() => {
        const fetchResults = async () => {
            const loadingToast = toast.loading("Carregando dados...");
            setError(null);
            try {
                // Busca os resultados da API
                const resultados = await apiService.getAllResults(); // Obtém todos os resultados

                // Calcula a frequência das dezenas
                const frequencia = calcularFrequenciaDezenas(resultados); // Calcula a frequência
                setFrequencias(frequencia);

                // Calcula o maior atraso
                const maiorAtraso = calcularIntervalosAtraso(resultados);
                setIntervalosAtraso(maiorAtraso); // Aqui, você está chamando setIntervalosAtraso para atualizar o estado

                // Calcula o atraso atual
                const atrasoAtual = calcularAtrasoAtual(resultados);
                setAtrasoAtual(atrasoAtual);


                // Calcula as 5 dezenas mais quentes
                const topQuentesCalculadas = frequencia
                    .map((freq, idx) => ({ dezena: idx + 1, frequencia: freq }))
                    .sort((a, b) => b.frequencia - a.frequencia)
                    .slice(0, 5);

                setTopQuentes(topQuentesCalculadas);

                // Encontra a dezena com o maior intervalo de atraso
                const maiorAtrasoGlobal = maiorAtraso.reduce((max, atraso, idx) => {
                    if (atraso > max.intervaloAtraso) {
                        return { dezena: idx + 1, intervaloAtraso: atraso };
                    }
                    return max;
                }, { dezena: null, intervaloAtraso: 0 });
                setMaiorAtraso(maiorAtrasoGlobal);

                toast.update(loadingToast, {
                    render: "Dados carregados com sucesso!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar os dados.");
                toast.update(loadingToast, {
                    render: "Erro ao carregar os dados!",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        };

        fetchResults();
    }, []);


    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>
                        Dezenas <span>Quentes</span>
                    </h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="Concurso aqui!" />
                    <button>
                        <MdOutlineSearch />
                        Buscar
                    </button>
                </div>
            </section>

            <section className="conteiner-section">
                <div className="title-result-info">
                    <h1>Dezenas e suas frequências de ocorrência</h1>
                </div>
                {error && <p>{error}</p>}
                {frequencias && (
                    <>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        {frequencias.map((_, index) => (
                                            <th key={index}>Dez {index + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {frequencias.map((frequencia, index) => (
                                            <td key={index}>{frequencia}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2>Top 5 Dezenas Mais Quentes</h2>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Posição</th>
                                        <th>Dezena</th>
                                        <th>Frequência</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topQuentes.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td> {/* Posição no ranking */}
                                            <td>Dez {item.dezena}</td> {/* Número da dezena */}
                                            <td>{item.frequencia}</td> {/* Frequência */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>


            <section className="conteiner-section">
                <div className="title-result-info">
                    <h1>Intervalo de Atraso das Dezenas</h1>
                </div>
                {error && <p>{error}</p>}
                {intervalosAtraso && intervalosAtraso.length > 0 && (
                    <>
                        <br />
                        <h2>O maior intervalo de atraso entre as Dezenas</h2>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        {intervalosAtraso && intervalosAtraso.length > 0 ? (
                                            intervalosAtraso.map((_, index) => (
                                                <th key={index}>Dez {index + 1}</th>
                                            ))
                                        ) : (
                                            <th colSpan="25">Nenhum dado disponível</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {intervalosAtraso && intervalosAtraso.length > 0 ? (
                                            intervalosAtraso.map((intervalo, index) => (
                                                <td key={index}>{intervalo}</td>
                                            ))
                                        ) : (
                                            <td colSpan="25">Nenhum dado disponível</td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2>Intervalo atual de atraso entre as Dezenas</h2>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        {atrasoAtual.length > 0 && atrasoAtual.map((_, index) => (
                                            <th key={index}>Dez {index + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {atrasoAtual.length > 0 ? (
                                            atrasoAtual.map((atraso, index) => (
                                                <td key={index}>{atraso}</td>
                                            ))
                                        ) : (
                                            <td colSpan="25">Nenhum dado disponível</td>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2>As 5 com Maior Atraso Entre as Dezenas</h2>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Dezena</th>
                                        <th>Intervalo de Atraso</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {intervalosAtraso
                                        .map((intervalo, index) => ({ dezena: index + 1, intervalo }))
                                        .sort((a, b) => b.intervalo - a.intervalo) // Ordena pelo maior intervalo
                                        .slice(0, 5) // Pega as 5 maiores
                                        .map((item, index) => {
                                            // A cada iteração, vamos atualizar o maior intervalo
                                            if (item.intervalo > maiorAtraso.intervaloAtraso) {
                                                setMaiorAtraso({ dezena: item.dezena, intervaloAtraso: item.intervalo });
                                            }

                                            return (
                                                <tr key={index}>
                                                    <td>Dez {item.dezena}</td> {/* Dezena */}
                                                    <td>{item.intervalo} sorteios</td> {/* Intervalo de atraso */}
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
};

export default DezenasQuentes