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
    const [ultimoResultado, setUltimoResultado] = useState([]);

    // Função modificada para buscar último resultado
    const buscarUltimoResultado = async () => {
        try {
            const resultados = await ApiServices.getAllResults();
            if (resultados && resultados.length > 0) {
                // Garantir que estamos pegando o resultado mais recente
                const ultimoSorteio = resultados[0];
                console.log("Último resultado:", ultimoSorteio.dezenas); // Debug
                setUltimoResultado(ultimoSorteio.dezenas.map(Number));
            }
        } catch (error) {
            console.error("Erro ao buscar último resultado:", error);
            toast.error("Erro ao buscar último resultado!");
        }
    };

    // Carregar o último resultado quando o componente montar
    useEffect(() => {
        buscarUltimoResultado();
    }, []); // Execute apenas uma vez ao montar

    const verificarJogoUnico = (novoJogo, jogosAnteriores, resultados) => {
        // Ordena o novo jogo uma vez
        const novoJogoOrdenado = [...novoJogo].sort((a, b) => a - b);

        // Verifica se o jogo já existe nos jogos gerados
        const jogoExisteGerados = jogosAnteriores.some(jogo =>
            JSON.stringify([...jogo].sort((a, b) => a - b)) === JSON.stringify(novoJogoOrdenado)
        );

        // Verifica se o jogo já saiu em resultados anteriores
        const jogoExisteResultados = resultados.some(resultado => {
            const numerosDoResultado = resultado.dezenas.map(Number).sort((a, b) => a - b);
            return JSON.stringify(numerosDoResultado) === JSON.stringify(novoJogoOrdenado);
        });

        // Log para debug
        console.log('Verificando jogo:', {
            novoJogo: novoJogoOrdenado,
            existeGerados: jogoExisteGerados,
            existeResultados: jogoExisteResultados
        });

        return !jogoExisteGerados && !jogoExisteResultados;
    };

    const gerarJogos = async () => {
        try {
            setLoading(true);
            const resultados = await ApiServices.getAllResults();
            let jogos = [];

            // Pegar o último resultado
            const ultimoResultado = resultados[0];
            console.log("Último resultado:", ultimoResultado); // Debug

            // Critério 2: Pegar 9 dezenas do último concurso
            const dezenasUltimoConcurso = ultimoResultado.dezenas.map(Number);
            const noveDezenasConcursoAnterior = dezenasUltimoConcurso.slice(0, 9);
            console.log("9 dezenas do último concurso:", noveDezenasConcursoAnterior); // Debug

            // Critério 3: Dezena com menor intervalo de atraso (11)
            const menorAtraso = 11;

            let tentativas = 0;
            const maxTentativas = 100;

            const gerarNovoJogo = () => {
                const novoJogo = [];

                // Adiciona a dezena com menor intervalo de atraso
                novoJogo.push(menorAtraso);

                // Adiciona as 9 dezenas do concurso anterior
                novoJogo.push(...noveDezenasConcursoAnterior);

                // Completa o jogo até 15 dezenas com números que não foram sorteados
                const numerosDisponiveis = Array.from({ length: 25 }, (_, i) => i + 1)
                    .filter(num => !novoJogo.includes(num));

                while (novoJogo.length < 15 && numerosDisponiveis.length > 0) {
                    const randomIndex = Math.floor(Math.random() * numerosDisponiveis.length);
                    const numeroSelecionado = numerosDisponiveis[randomIndex];
                    novoJogo.push(numeroSelecionado);
                    numerosDisponiveis.splice(randomIndex, 1);
                }

                return novoJogo.sort((a, b) => a - b);
            };

            while (jogos.length < 30 && tentativas < maxTentativas) {
                const novoJogo = gerarNovoJogo();

                // Usa a função verificarJogoUnico para verificar se o jogo é único
                if (verificarJogoUnico(novoJogo, jogos, resultados) && novoJogo.length === 15) {
                    jogos.push(novoJogo);
                    console.log(`Jogo ${jogos.length} gerado:`, novoJogo);
                }

                tentativas++;
            }

            if (jogos.length === 0) {
                toast.error("Não foi possível gerar nenhum jogo!");
                return;
            }

            if (jogos.length < 30) {
                toast.warn(`Foram gerados apenas ${jogos.length} jogos únicos.`);
            } else {
                toast.success("30 jogos gerados com sucesso!");
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

    const contarParesImpares = (jogo) => {
        const pares = jogo.filter(n => n % 2 === 0).length;
        const impares = jogo.length - pares;
        return { pares, impares };
    };

    // Função para contar acertos
    const contarAcertos = (jogo) => {
        return jogo.filter(numero => ultimoResultado.includes(numero)).length;
    };

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Meus -<span> Jogos</span></h1>
                </div>
            </section>

            <section className="conteiner-section">
                < ResultLatest />
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
                            return (
                                <div key={index} className="jogo-box">
                                    <div className="jogo-titulo">
                                        Jogo {index + 1}
                                        <span className="jogo-info">
                                            ({pares} pares, {impares} ímpares) -
                                            <span className="acertos-info">
                                                {acertos} acertos
                                            </span>
                                        </span>
                                    </div>
                                    <div className="numeros-container">
                                        {jogo.map((numero) => {
                                            const numeroAcertado = ultimoResultado.includes(numero);
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