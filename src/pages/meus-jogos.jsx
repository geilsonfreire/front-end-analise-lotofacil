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

    const verificarJogoUnico = (novoJogo, jogosAnteriores, resultadosAnteriores) => {
        // Ordena o novo jogo uma vez
        const novoJogoOrdenado = [...novoJogo].sort((a, b) => a - b);

        // Verifica se o jogo já existe nos jogos gerados
        const jogoExisteGerados = jogosAnteriores.some(jogo =>
            JSON.stringify([...jogo].sort((a, b) => a - b)) === JSON.stringify(novoJogoOrdenado)
        );

        // Verifica se o jogo já saiu em resultados anteriores
        const jogoExisteResultados = resultadosAnteriores.some(resultado => {
            const numerosDoResultado = resultado.dezenas.map(Number).sort((a, b) => a - b);
            return JSON.stringify(numerosDoResultado) === JSON.stringify(novoJogoOrdenado);
        });

        return !jogoExisteGerados && !jogoExisteResultados;
    };

    const gerarJogos = async () => {
        try {
            setLoading(true);
            const resultados = await ApiServices.getAllResults();
            let jogos = [];
            const numerosSorteados = new Set(resultados.flatMap(resultado => resultado.dezenas.map(Number)));

            // Critério 2: Selecionar 3 dezenas quentes
            const dezenasQuentes = []; // Adicione lógica para determinar as 3 dezenas quentes

            // Critério 3: Selecionar a dezena com o menor intervalo de atraso
            const menorAtraso = 11; // Adicione lógica para determinar a dezena com menor intervalo de atraso

            // Critério 4: Selecionar 4 dezenas com maior número de atraso
            const maioresAtrasos = []; // Adicione lógica para determinar as 4 dezenas com maior atraso

            // Critério 5: Selecionar as 3 sequências mais comuns
            const sequenciasComuns = []; // Adicione lógica para determinar as sequências mais comuns

            // Critério 6: Selecionar 9 dezenas do concurso anterior
            const concursoAnterior = []; // Adicione lógica para pegar as 9 dezenas do concurso anterior

            let tentativas = 0;
            while (jogos.length < 30 && tentativas < 1000) {
                const novoJogo = [];

                // Adicione as dezenas conforme os critérios
                novoJogo.push(...dezenasQuentes);
                novoJogo.push(menorAtraso);
                novoJogo.push(...maioresAtrasos);
                novoJogo.push(...sequenciasComuns.flat());
                novoJogo.push(...concursoAnterior);

                // Verifica se o jogo é único e não contém números já sorteados
                const isUnique = verificarJogoUnico(novoJogo, jogos, resultados);
                const isValidLength = novoJogo.length === 15;
                const hasNoSorteados = !novoJogo.some(num => numerosSorteados.has(num));

                // Log para depuração
                console.log(`Tentativa ${tentativas + 1}:`, {
                    novoJogo,
                    isUnique,
                    isValidLength,
                    hasNoSorteados,
                });

                if (isUnique && isValidLength && hasNoSorteados) {
                    jogos.push(novoJogo);
                    console.log(`Jogo adicionado: ${novoJogo}`);
                }

                tentativas++;
            }

            if (jogos.length < 30) {
                toast.warn("Não foi possível gerar 30 jogos únicos.");
            } else {
                toast.success("Jogos gerados com sucesso!");
            }

            const jogosOrdenados = jogos.map(jogo => [...jogo].sort((a, b) => a - b));
            setJogosGerados(jogosOrdenados);
            localStorage.setItem('jogosLotofacil', JSON.stringify(jogosOrdenados));
        } catch (error) {
            toast.error("Erro ao gerar jogos!");
            console.error(error);
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