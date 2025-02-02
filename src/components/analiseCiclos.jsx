import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import apiService from "../services/apiServices";

const AnaliseCiclos = () => {
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comportamentoDezenas, setComportamentoDezenas] = useState([]);
    const [comportamentoNoCicloRelevante, setComportamentoNoCicloRelevante] = useState([]);

    const calcularCiclos = (resultados) => {
        const ciclos = [];
        let cicloAtual = new Set();
        let inicioCiclo = 0;

        resultados.forEach((resultado, idx) => {
            resultado.dezenas.forEach(dezena => {
                cicloAtual.add(dezena);
            });

            if (cicloAtual.size === 25) {
                ciclos.push({
                    inicio: inicioCiclo + 1,
                    fim: idx + 1,
                    duracao: idx - inicioCiclo + 1
                });
                cicloAtual.clear();
                inicioCiclo = idx + 1;
            }
        });

        return ciclos;
    };

    const calcularCiclosRelevantes = (ciclos) => {
        const duracaoCount = ciclos.reduce((acc, ciclo) => {
            acc[ciclo.duracao] = (acc[ciclo.duracao] || 0) + 1;
            return acc;
        }, {});

        const sortedDuracoes = Object.entries(duracaoCount)
            .sort((a, b) => b[1] - a[1])
            .map(([duracao, relevancia]) => ({ duracao: parseInt(duracao, 10), relevancia }));

        return sortedDuracoes;
    };

    const calcularComportamentoDezenas = (ciclos, resultados) => {
        const comportamento = Array(25).fill(0).map(() => ({
            frequencia: 0,
            ciclos: 0
        }));

        ciclos.forEach((ciclo) => {
            const dezenasNoCiclo = new Set();
            for (let i = ciclo.inicio - 1; i < ciclo.fim; i++) {
                resultados[i].dezenas.forEach(dezena => {
                    dezenasNoCiclo.add(dezena);
                    comportamento[dezena - 1].frequencia += 1;
                });
            }
            dezenasNoCiclo.forEach(dezena => {
                comportamento[dezena - 1].ciclos += 1;
            });
        });

        return comportamento;
    };

    const calcularComportamentoDezenasNoCicloRelevante = (ciclos, resultados, duracaoRelevante) => {
        const ciclosRelevantes = ciclos.filter(ciclo => ciclo.duracao === duracaoRelevante);
        const comportamento = Array(25).fill(0).map(() => ({
            concurso1: 0,
            concurso2: 0,
            concurso3: 0,
            concurso4: 0
        }));

        ciclosRelevantes.forEach(ciclo => {
            for (let i = ciclo.inicio - 1; i < ciclo.fim; i++) {
                resultados[i].dezenas.forEach(dezena => {
                    const posicao = i - (ciclo.inicio - 1);
                    if (posicao === 0) {
                        comportamento[dezena - 1].concurso1 += 1;
                    } else if (posicao === 1) {
                        comportamento[dezena - 1].concurso2 += 1;
                    } else if (posicao === 2) {
                        comportamento[dezena - 1].concurso3 += 1;
                    } else if (posicao === 3) {
                        comportamento[dezena - 1].concurso4 += 1;
                    }
                });
            }
        });

        return comportamento;
    };

    useEffect(() => {
        const fetchResults = async () => {
            const loadingToast = toast.loading("Carregando dados...");
            setError(null);
            try {
                const resultados = await apiService.getAllResults();
                const ciclosCalculados = calcularCiclos(resultados);
                const comportamentoDezenas = calcularComportamentoDezenas(ciclosCalculados, resultados);
                const duracaoRelevante = calcularCiclosRelevantes(ciclosCalculados)[0].duracao;
                const comportamentoNoCicloRelevante = calcularComportamentoDezenasNoCicloRelevante(ciclosCalculados, resultados, duracaoRelevante);
                setCiclos(ciclosCalculados);
                setComportamentoDezenas(comportamentoDezenas);
                setComportamentoNoCicloRelevante(comportamentoNoCicloRelevante);
                toast.update(loadingToast, {
                    render: "Dados carregados com sucesso!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            } catch (err) {
                setError("Erro ao buscar os resultados. Tente novamente mais tarde.");
                console.error("Erro ao buscar os resultados:", err);
                toast.update(loadingToast, {
                    render: "Erro ao carregar os dados. Tente novamente mais tarde.",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Análise dos Ciclos de Dezenas</h1>
                    </div>
                    {error && <p>{error}</p>}
                    {loading ? (
                        <div>Carregando...</div>
                    ) : (
                        <>
                            <div className="result-info-table scroll-y">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Início do Ciclo</th>
                                            <th>Fim do Ciclo</th>
                                            <th>Duração (Concursos)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ciclos.map((ciclo, index) => (
                                            <tr key={index}>
                                                <td>{ciclo.inicio}</td>
                                                <td>{ciclo.fim}</td>
                                                <td>{ciclo.duracao}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <section className="conteiner-section">
                                <div className="box-shadown">
                                    <div className="title-result-info">
                                        <h1>Todos os Ciclos Identificados</h1>
                                    </div>
                                    <div className="result-info-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Duração de Ciclo</th>
                                                    <th>Conta Ciclo</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {calcularCiclosRelevantes(ciclos).map((ciclo, index) => (
                                                    <tr key={index}>
                                                        <td>{ciclo.duracao}</td>
                                                        <td>{ciclo.relevancia}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="conteiner-section">
                                <div className="box-shadown">
                                    <div className="title-result-info">
                                        <h1>Comportamento das 25 Dezenas nos Ciclos</h1>
                                    </div>
                                    <div className="result-info-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Dezena</th>
                                                    <th>Frequência</th>
                                                    <th>Ciclos Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comportamentoDezenas.map((comportamento, index) => (
                                                    <tr key={index}>
                                                        <td>{index + 1}</td>
                                                        <td>{comportamento.frequencia}</td>
                                                        <td>{comportamento.ciclos}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                            <section className="conteiner-section">
                                <div className="box-shadown">
                                    <div className="title-result-info">
                                        <h1>Comportamento das Dezenas no Ciclo Mais Relevante</h1>
                                    </div>
                                    <div className="result-info-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Duração do Ciclo</th>
                                                    <th>Dezena</th>
                                                    <th>1ª Concurso</th>
                                                    <th>2ª Concurso</th>
                                                    <th>3ª Concurso</th>
                                                    <th>4ª Concurso</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comportamentoNoCicloRelevante.map((comportamento, index) => (
                                                    <tr key={index}>
                                                        <td>{calcularCiclosRelevantes(ciclos)[0].duracao}</td>
                                                        <td>{index + 1}</td>
                                                        <td>{comportamento.concurso1}</td>
                                                        <td>{comportamento.concurso2}</td>
                                                        <td>{comportamento.concurso3}</td>
                                                        <td>{comportamento.concurso4}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AnaliseCiclos;
