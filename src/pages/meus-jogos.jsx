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

    const gerarJogo = (qtdPares) => {
        const numeros = Array.from({ length: 25 }, (_, i) => i + 1);
        const pares = numeros.filter(n => n % 2 === 0);
        const impares = numeros.filter(n => n % 2 !== 0);
        let jogo = [];

        // Seleciona números pares
        for (let i = 0; i < qtdPares; i++) {
            const indexPar = Math.floor(Math.random() * pares.length);
            jogo.push(pares.splice(indexPar, 1)[0]);
        }

        // Seleciona números ímpares
        const qtdImpares = 15 - qtdPares;
        for (let i = 0; i < qtdImpares; i++) {
            const indexImpar = Math.floor(Math.random() * impares.length);
            jogo.push(impares.splice(indexImpar, 1)[0]);
        }

        return jogo.sort((a, b) => a - b);
    };

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

            // Gerar 15 jogos com 7 pares e 8 ímpares
            while (jogos.length < 15) {
                const novoJogo = gerarJogo(7);
                if (verificarJogoUnico(novoJogo, jogos, resultados)) {
                    jogos.push(novoJogo);
                }
            }

            // Gerar 15 jogos com 8 pares e 7 ímpares
            while (jogos.length < 30) {
                const novoJogo = gerarJogo(8);
                if (verificarJogoUnico(novoJogo, jogos, resultados)) {
                    jogos.push(novoJogo);
                }
            }

            // Ordena cada jogo antes de salvar
            const jogosOrdenados = jogos.map(jogo => [...jogo].sort((a, b) => a - b));

            setJogosGerados(jogosOrdenados);
            localStorage.setItem('jogosLotofacil', JSON.stringify(jogosOrdenados));
            toast.success("Jogos gerados com sucesso!");
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
                < ResultLatest / >
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