// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Imports Css
import "../style/dezenasQuentes.css";

// Importando o componente de serviço
import apiService from "../services/apiServices";

const DezenasQuentes = () => {
    // Estado para armazenar os resultados
    const [frequencias, setFrequencias] = useState(null);
    const [error, setError] = useState(null);
    const [intervalosAtraso, setIntervalosAtraso] = useState([]);
    const [atrasoAtual, setAtrasoAtual] = useState([]);
    const [sequencias, setSequencias] = useState({});
    const [loading, setLoading] = useState(true);
    const [totalConcursos, setTotalConcursos] = useState(0);
    const [estatisticasRepeticoes, setEstatisticasRepeticoes] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false); // Novo estado para controlar se os dados foram carregados

    // Função para calcular a frequência das dezenas
    const calcularFrequenciaDezenas = (resultados) => {
        const frequencia = Array(25).fill(0);

        resultados.forEach(resultado => {
            resultado.dezenas.forEach(dezena => {
                frequencia[dezena - 1] += 1;
            });
        });

        return frequencia;
    };

    // Função para calcular o maior atraso e o atraso atual de cada dezena
    const calcularIntervalosAtraso = (resultados) => {
        const ultimaOcorrencia = Array(25).fill(-1);
        const maiorAtraso = Array(25).fill(0);

        resultados.forEach((resultado, idx) => {
            resultado.dezenas.forEach(dezena => {
                if (ultimaOcorrencia[dezena - 1] !== -1) {
                    const intervalo = idx - ultimaOcorrencia[dezena - 1];
                    if (intervalo > maiorAtraso[dezena - 1]) {
                        maiorAtraso[dezena - 1] = intervalo;
                    }
                }
                ultimaOcorrencia[dezena - 1] = idx;
            });
        });

        return maiorAtraso;
    };

    // Função para calcular o atraso atual de cada dezena (levando em consideração os últimos concursos)
    const calcularAtrasoAtual = (resultados) => {
        const totalConcursos = resultados.length;
        const atrasoAtual = Array(25).fill(totalConcursos);

        resultados.forEach((resultado, idx) => {
            resultado.dezenas.forEach(dezena => {
                atrasoAtual[dezena - 1] = idx;
            });
        });

        return atrasoAtual.map(atraso => totalConcursos - atraso - 1);
    };

    // Função para buscar os resultados e calcular as frequências e intervalos
    useEffect(() => {
        const fetchResults = async () => {
            if (!hasLoaded) {
                const loadingToast = toast.loading("Carregando dados...");
                setError(null);
                try {
                    // Busca os resultados da API
                    const resultados = await apiService.getAllResults(); // Obtém todos os resultados
                    setTotalConcursos(resultados.length);

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
                    // Encontra a dezena com o maior intervalo de atraso
                    // Análise das dezenas repetidas
                    const repetidasInfo = analisarDezenasRepetidas(resultados);
                    setEstatisticasRepeticoes(repetidasInfo);

                    toast.update(loadingToast, {
                        render: "Dados carregados com sucesso!",
                        type: "success",
                        isLoading: false,
                        autoClose: 3000,
                    });
                    setHasLoaded(true); // Atualiza o estado para indicar que os dados foram carregados
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
            }
        };

        fetchResults();
    }, [hasLoaded]);

    const analisarSequencias = (sorteios) => {
        const estatisticasPorTamanho = {};

        sorteios.forEach(sorteio => {
            const dezenas = sorteio.dezenas.map(Number).sort((a, b) => a - b);
            let sequenciaAtual = [];
            const sequenciasNesteSorteio = new Set();

            dezenas.forEach((dezena, i) => {
                if (i === 0 || dezena === dezenas[i - 1] + 1) {
                    sequenciaAtual.push(dezena);
                } else {
                    if (sequenciaAtual.length >= 2) {
                        sequenciasNesteSorteio.add(sequenciaAtual.length);
                    }
                    sequenciaAtual = [dezena];
                }
            });

            if (sequenciaAtual.length >= 2) {
                sequenciasNesteSorteio.add(sequenciaAtual.length);
            }

            sequenciasNesteSorteio.forEach(tamanho => {
                if (!estatisticasPorTamanho[tamanho]) {
                    estatisticasPorTamanho[tamanho] = {
                        ocorrenciasPorConcurso: [],
                        maximo: 0,
                        minimo: Infinity,
                        media: 0
                    };
                }
                estatisticasPorTamanho[tamanho].ocorrenciasPorConcurso.push(1);
            });
        });

        Object.values(estatisticasPorTamanho).forEach(estat => {
            const totalOcorrencias = estat.ocorrenciasPorConcurso.length;
            estat.maximo = totalOcorrencias;
            estat.minimo = totalOcorrencias;
            estat.media = totalOcorrencias;
        });

        return estatisticasPorTamanho;
    };

    useEffect(() => {
        const buscarSorteios = async () => {
            try {
                setLoading(true);
                const resultados = await apiService.getAllResults();
                const estatisticasPorTamanho = analisarSequencias(resultados);
                setSequencias(estatisticasPorTamanho);
            } catch (error) {
                console.error("Erro ao buscar sorteios:", error);
            } finally {
                setLoading(false);
            }
        };

        buscarSorteios();
    }, []);

    const analisarDezenasRepetidas = (resultados) => {
        if (resultados.length < 2) return null;

        const frequenciaRepeticoes = {
            atual: {
                quantidade: 0,
                dezenas: [],
                percentual: 0
            },
            historico: Array(16).fill(0)
        };

        for (let i = 0; i < resultados.length - 1; i++) {
            const concursoAtual = resultados[i].dezenas.map(Number);
            const concursoAnterior = resultados[i + 1].dezenas.map(Number);

            const repetidas = concursoAtual.filter(dezena => concursoAnterior.includes(dezena));

            frequenciaRepeticoes.historico[repetidas.length]++;

            if (i === 0) {
                frequenciaRepeticoes.atual = {
                    quantidade: repetidas.length,
                    dezenas: repetidas.sort((a, b) => a - b),
                    percentual: ((repetidas.length / 15) * 100).toFixed(1)
                };
            }
        }

        const maisFrequente = frequenciaRepeticoes.historico
            .map((qtd, index) => ({ quantidade: index, ocorrencias: qtd }))
            .reduce((max, atual) => (atual.ocorrencias > max.ocorrencias ? atual : max));

        const totalConcursos = resultados.length - 1;
        const percentuais = frequenciaRepeticoes.historico.map(qtd =>
            ((qtd / totalConcursos) * 100).toFixed(1)
        );

        return {
            atual: frequenciaRepeticoes.atual,
            historico: frequenciaRepeticoes.historico.map((qtd, index) => ({
                quantidade: index,
                ocorrencias: qtd,
                percentual: percentuais[index]
            })).filter(item => item.ocorrencias > 0),
            maisFrequente
        };
    };

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
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
                        </>
                    )}
                </div>
            </section>

            <section className="conteiner-section">
                <div className="box-shadown">
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
                        </>
                    )}

                </div>
            </section>

            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Dezenas Sequenciadas</h1>
                    </div>

                    {loading ? (
                        <div>Carregando...</div>
                    ) : (
                        <>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Tamanho da Sequência</th>
                                            <th>Ocorrência em Concursos</th>
                                            <th>% dos Concursos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(sequencias)
                                            .sort((a, b) => b[0] - a[0]) // Ordena por tamanho decrescente
                                            .map(([tamanho, estat]) => {
                                                const percentual = ((estat.maximo / totalConcursos) * 100).toFixed(1);
                                                return (
                                                    <tr key={tamanho}>
                                                        <td>{tamanho} números</td>
                                                        <td>{estat.maximo} concursos</td>
                                                        <td>{percentual}%</td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                </div>
            </section>

            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Dezenas que se repetem em relação ao concurso anterior</h1>
                    </div>

                    {loading ? (
                        <div>Carregando...</div>
                    ) : (
                        <>
                            <div className="result-info-table repet-conatiner">

                                <div className="flex-container">
                                    <h2>Repetições no último concurso</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Quant. por repetição</th>
                                                <th>Dezenas</th>
                                                <th>% das ocorrências</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estatisticasRepeticoes?.atual && (
                                                <tr>
                                                    <td>{estatisticasRepeticoes.atual.quantidade}</td>
                                                    <td>{estatisticasRepeticoes.atual.dezenas.join(', ')}</td>
                                                    <td>{estatisticasRepeticoes.atual.percentual}%</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex-container">
                                    <h2>Histórico de repetições</h2>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Quantidade de repetições</th>
                                                <th>Ocorrências</th>
                                                <th>% dos concursos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estatisticasRepeticoes?.historico.map(item => (
                                                <tr key={item.quantidade}
                                                    className={item.quantidade === estatisticasRepeticoes.maisFrequente.quantidade ? 'destaque' : ''}>
                                                    <td>{item.quantidade} dezenas</td>
                                                    <td>{item.ocorrencias} vezes</td>
                                                    <td>{item.percentual}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default DezenasQuentes