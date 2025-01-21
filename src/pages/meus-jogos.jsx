// Imports Bibliotecas
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Imports Css
import "../style/meus-jogos.css";

// Imports Services / Coomponents
import ApiServices from "../services/apiServices";
import ResultLatest from "../components/resultLotofacil"

const MeusJogos = () => {
    const [jogosGerados, setJogosGerados] = useState(() => {
        const jogosLocalStorage = localStorage.getItem('jogosLotofacil');
        return jogosLocalStorage ? JSON.parse(jogosLocalStorage) : [];
    });
    const [loading, setLoading] = useState(false);
    const [currentConcurso, setCurrentConcurso] = useState(null);
    const [resultadoConcurso, setResultadoConcurso] = useState([]);

    // Função buscar último resultado
    const buscarUltimoResultado = async () => {
        try {
            const resultados = await ApiServices.getAllResults();
            if (resultados && resultados.length > 0) {
                // Garantir que estamos pegando o resultado mais recente
                const ultimoSorteio = resultados[0];
                setResultadoConcurso(ultimoSorteio.dezenas.map(Number));
            }
        } catch (error) {
            console.error("Erro ao buscar último resultado:", error);
            toast.error("Erro ao buscar último resultado!");
        }
    };

    // Função para lidar com a mudança de concurso
    const handleConcursoChange = async (concurso) => {
        try {
            const resultData = await ApiServices.getResultByContestNumber(concurso);
            if (resultData) {
                setResultadoConcurso(resultData.dezenas.map(Number));
                setCurrentConcurso(concurso);
            }
        } catch (error) {
            console.error("Erro ao buscar resultado do concurso:", error);
            toast.error("Erro ao buscar resultado do concurso!");
        }
    };

    // Carregar o último resultado quando o componente montar
    useEffect(() => {
        buscarUltimoResultado();
    }, []); // Execute apenas uma vez ao montar

    // Atualizar quando o concurso atual mudar
    useEffect(() => {
        if (currentConcurso) {
            handleConcursoChange(currentConcurso);
        }
    }, [currentConcurso]);

    // Função para verificar se o jogo é único
    const verificarJogoUnico = (novoJogo, jogosAnteriores, resultados) => {
        const novoJogoOrdenado = [...novoJogo].sort((a, b) => a - b);

        const jogoExisteGerados = jogosAnteriores.some(jogo =>
            JSON.stringify([...jogo].sort((a, b) => a - b)) === JSON.stringify(novoJogoOrdenado)
        );

        const jogoExisteResultados = resultados.some(resultado => {
            const numerosDoResultado = resultado.dezenas.map(Number).sort((a, b) => a - b);
            return JSON.stringify(numerosDoResultado) === JSON.stringify(novoJogoOrdenado);
        });

        return !jogoExisteGerados && !jogoExisteResultados;
    };

    // Função para calcular as dezenas quentes
    const calcularDezenasQuentes = (resultados) => {
        const frequencia = Array(25).fill(0);

        resultados.forEach(resultado => {
            resultado.dezenas.forEach(dezena => {
                frequencia[dezena - 1] += 1;
            });
        });

        return frequencia
            .map((freq, idx) => ({ dezena: idx + 1, frequencia: freq }))
            .sort((a, b) => b.frequencia - a.frequencia)
            .slice(0, 3)
            .map(item => item.dezena);
    };

    // Função para calcular os maiores atrasos
    const calcularMaioresAtrasos = (resultados) => {
        const totalConcursos = resultados.length;
        const atrasoAtual = Array(25).fill(totalConcursos);

        resultados.forEach((resultado, idx) => {
            resultado.dezenas.forEach((dezena) => {
                atrasoAtual[dezena - 1] = idx;
            });
        });

        const dezenasComAtraso = atrasoAtual.map((ultimoIndice, idx) => ({
            dezena: idx + 1,
            atraso: totalConcursos - ultimoIndice - 1
        }));

        return dezenasComAtraso
            .sort((a, b) => b.atraso - a.atraso)
            .slice(0, 3)
            .map(item => item.dezena);
    };

    // Função para gerar jogos
    const gerarJogos = async () => {
        try {
            setLoading(true);
            const resultados = await ApiServices.getAllResults();
            let jogos = [];

            const dezenasQuentes = calcularDezenasQuentes(resultados);
            const menorAtraso = 11;
            const valoresPermitidos = [
                179, 181, 182, 183, 184, 185, 186, 187,
                188, 189, 190, 191, 192, 193, 194, 195,
                196, 197, 198, 199, 201, 202, 203, 204,
                206, 207, 208, 209, 212, 213,
            ];
            const maioresAtrasos = calcularMaioresAtrasos(resultados);

            let tentativas = 0;
            const maxTentativas = 100;

            const gerarNovoJogo = (tentativas = 0) => {
                if (tentativas > 100) return null;

                const novoJogo = [menorAtraso, ...maioresAtrasos];

                dezenasQuentes.forEach(dezena => {
                    if (!novoJogo.includes(dezena)) novoJogo.push(dezena);
                });

                const numerosDisponiveis = Array.from({ length: 25 }, (_, i) => i + 1)
                    .filter(num => !novoJogo.includes(num));

                while (novoJogo.length < 15 && numerosDisponiveis.length > 0) {
                    const randomIndex = Math.floor(Math.random() * numerosDisponiveis.length);
                    novoJogo.push(numerosDisponiveis[randomIndex]);
                    numerosDisponiveis.splice(randomIndex, 1);
                }

                const somaDezenas = novoJogo.reduce((acc, num) => acc + num, 0);
                if (!valoresPermitidos.includes(somaDezenas)) return gerarNovoJogo(tentativas + 1);

                const pares = novoJogo.filter(num => num % 2 === 0).length;
                const impares = novoJogo.length - pares;

                if ((pares === 7 && impares === 8) || (pares === 8 && impares === 7)) {
                    return novoJogo.sort((a, b) => a - b);
                } else {
                    return gerarNovoJogo(tentativas + 1);
                }
            };

            while (jogos.length < 7 && tentativas < maxTentativas) {
                const novoJogo = gerarNovoJogo();

                if (novoJogo && verificarJogoUnico(novoJogo, jogos, resultados) && novoJogo.length === 15) {
                    jogos.push(novoJogo);
                }

                tentativas++;
            }

            if (jogos.length === 0) {
                toast.error("Não foi possível gerar nenhum jogo!");
                return;
            }

            if (jogos.length < 7) {
                toast.warn(`Foram gerados apenas ${jogos.length} jogos únicos.`);
            } else {
                toast.success("7 jogos gerados com sucesso!");
            }

            setJogosGerados(jogos);
            localStorage.setItem('jogosLotofacil', JSON.stringify(jogos));

        } catch (error) {
            console.error("Erro ao gerar jogos:", error);
            toast.error("Erro ao gerar jogos!");
        } finally {
            setLoading(false);
        }
    };

    // Função para contar pares e ímpares
    const contarParesImpares = (jogo) => {
        const pares = jogo.filter(n => n % 2 === 0).length;
        const impares = jogo.length - pares;
        return { pares, impares };
    };

    // Função para contar acertos
    const contarAcertos = (jogo) => {
        return jogo.filter(numero => resultadoConcurso.includes(numero)).length;
    };

    // Função para calcular a soma das dezenas
    const calcularSoma = (jogo) => {
        return jogo.reduce((acc, num) => acc + num, 0);
    };

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Meus -<span> Jogos</span></h1>
                </div>
            </section>

            <section className="conteiner-section">
                < ResultLatest onConcursoChange={handleConcursoChange} />
                <div className="title-result-info">
                    <h1>Gerador de Jogos</h1>
                </div>

                <div className="gerador-jogos">
                    <button
                        className="btn-gerar"
                        onClick={gerarJogos}
                        disabled={loading}
                    >
                        {loading ? 'Gerando...' : 'Gerar Jogos'}
                    </button>
                </div>

                {jogosGerados.length > 0 && (
                    <div className="jogos-container">
                        {jogosGerados.map((jogo, index) => {
                            const { pares, impares } = contarParesImpares(jogo);
                            const acertos = contarAcertos(jogo);
                            const soma = calcularSoma(jogo); // Calcula a soma das dezenas
                            return (
                                <div key={index} className="jogo-box">
                                    <div className="jogo-titulo">
                                        Jogo {index + 1}
                                        <span className="jogo-info">
                                            ({pares} pares, {impares} ímpares)
                                            <span className="acertos-info">
                                                {acertos} acertos
                                            </span>
                                            <span className="soma-info">
                                                Soma: {soma}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="numeros-container">
                                        {jogo.map((numero) => {
                                            const numeroAcertado = resultadoConcurso.includes(numero);
                                            console.log(`Número ${numero} acertado: ${numeroAcertado}`); // Debug
                                            return (
                                                <div
                                                    key={numero}
                                                    className={`numero-bolinha ${numeroAcertado ? 'numero-acertado' : ''}`}
                                                >
                                                    {numero}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
};

export default MeusJogos;