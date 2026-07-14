// Imports Bibliotecas
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Imports Css
// Imports Services / Coomponents
import ApiServices from "../services/apiServices";
import ResultLatest from "../components/resultLatest";

const MeusJogos = () => {
    // Constante que armazena os jogos gerados e os armazena no localStorage
    const [jogosGerados, setJogosGerados] = useState(() => {
        const jogosLocalStorage = localStorage.getItem('jogosLotofacil');
        return jogosLocalStorage ? JSON.parse(jogosLocalStorage) : [];
    });

    const [loading, setLoading] = useState(false);
    const [resultadoConcurso, setResultadoConcurso] = useState([]);


    // Função para lidar com a mudança de concurso
   const handleConcursoChange = async (concurso) => {
        try {

            const resultData = await ApiServices.getResultByContestNumber(concurso);

            if (!resultData) return;

            setResultadoConcurso(
                resultData.dezenas.map(Number)
            );

        } catch (error) {

            console.error("Erro ao buscar resultado:", error);

            toast.error("Erro ao buscar resultado!");

        }
    };

    // Carregar o último resultado quando o componente montar
    useEffect(() => {
        const carregarUltimoResultado = async () => {
            try {
                const ultimoSorteio = await ApiServices.getLatestResult();

                if (ultimoSorteio) {
                    setResultadoConcurso(ultimoSorteio.dezenas.map(Number));
                }

            } catch (error) {
                console.error("Erro ao buscar último resultado:", error);
                toast.error("Erro ao buscar último resultado!");
            }
        };

        carregarUltimoResultado();
    }, []);
    
    // Função para verificar se o jogo é único
    const verificarJogoUnico = (novoJogo, jogosAnteriores, resultados) => {
        // Ordena o novo jogo para comparar
        const novoJogoOrdenado = [...novoJogo].sort((a, b) => a - b);
        // Verifica se o jogo já foi gerado anteriormente
        const jogoExisteGerados = jogosAnteriores.some(jogo =>
            JSON.stringify([...jogo].sort((a, b) => a - b)) === JSON.stringify(novoJogoOrdenado)
        );
        // Verifica se o jogo já foi sorteado dentre os resultados ja realisado da lotofacil
        const jogoExisteResultados = resultados.some(resultado => {
            const numerosDoResultado = resultado.dezenas.map(Number).sort((a, b) => a - b);
            return JSON.stringify(numerosDoResultado) === JSON.stringify(novoJogoOrdenado);
        });
        // Retorna verdadeiro se o jogo não existir em nenhum dos casos
        return !jogoExisteGerados && !jogoExisteResultados;
    };


    // Função para processar os ciclos
    const processarCiclos = (dados) => {
        // Ordena do mais antigo para o mais recente
        dados.sort((a, b) => a.concurso - b.concurso);
        // Inicializa o ciclo atual
        let ciclosCalculados = [];
        let cicloAtual = {
            numero: 1,
            concursos: [],
            dezenasAusentes: new Set(
                [...Array(25).keys()].map(i => (i + 1).toString().padStart(2, '0'))
            )
        };
        // Itera sobre os dados para processar os ciclos
        for (let i = 0; i < dados.length; i++) {
            const concurso = dados[i];
            const dezenasSorteadas = new Set(
                concurso.dezenas.map(d => d.toString().padStart(2, '0'))
            );

            // Remove as dezenas sorteadas da lista de ausentes
            cicloAtual.dezenasAusentes = new Set(
                [...cicloAtual.dezenasAusentes].filter(d => !dezenasSorteadas.has(d))
            );
            // Adiciona o concurso ao ciclo atual
            cicloAtual.concursos.push({
                ...concurso,
                dezenasAusentes: new Set(cicloAtual.dezenasAusentes)
            });
            // Verifica se o ciclo atual foi concluído
            if (cicloAtual.dezenasAusentes.size === 0) {
                cicloAtual.duracao = cicloAtual.concursos.length;
                ciclosCalculados.push({ ...cicloAtual });
                cicloAtual = {
                    numero: cicloAtual.numero + 1,
                    concursos: [],
                    dezenasAusentes: new Set(
                        [...Array(25).keys()].map(i => (i + 1).toString().padStart(2, '0'))
                    )
                };
            }
        }
        // Verifica se o ciclo atual foi concluído
        if (cicloAtual.concursos.length > 0) {
            cicloAtual.duracao = cicloAtual.concursos.length;
            ciclosCalculados.push({ ...cicloAtual });
        }
        // Retorna o último ciclo calculado
        return ciclosCalculados[ciclosCalculados.length - 1];
    };

    // Função para remover duplicatas
    const removerDuplicatas = (array) => {
        return Array.from(new Set(array));
    };

    // Função para gerar jogos
    const gerarJogos = async () => {
        try {
            setLoading(true);
            const resultados = await ApiServices.getAllResults();
            // Processa o ciclo atual para obter dezenas ausentes
            const cicloProcessado = processarCiclos([...resultados]);
           
            const dezenasAusentesCiclo = [...cicloProcessado.dezenasAusentes].map(Number);
            // Inicializa o array de jogos
            let jogos = [];
            
            let tentativas = 0;

            const maxTentativas = 100;

            // Função para gerar um novo jogo
            const gerarNovoJogo = (tentativas = 0) => {
                if (tentativas > 100) return null;

                // Combina todas as dezenas e remove duplicatas
                let novoJogo = [...dezenasAusentesCiclo];

                novoJogo = removerDuplicatas(novoJogo);

                // Adiciona dezenas aleatórias ao novo jogo
                const numerosDisponiveis = Array.from(
                    { length: 25 }, (_, i) => i + 1)
                    .filter(num => !novoJogo.includes(num));

                while (novoJogo.length < 15 && numerosDisponiveis.length > 0) {
                    const randomIndex = Math.floor(Math.random() * numerosDisponiveis.length);
                    novoJogo.push(numerosDisponiveis[randomIndex]);
                    numerosDisponiveis.splice(randomIndex, 1);
                }
                
                // Verifica se o novo jogo tem 7 pares e 8 ímpares ou vice-versa
                const pares = novoJogo.filter(num => num % 2 === 0).length;
                const impares = novoJogo.length - pares;
                // Retorna o novo jogo ordenado se atender aos critérios
                if ((pares === 7 && impares === 8) || (pares === 8 && impares === 7)) {
                    return novoJogo.sort((a, b) => a - b);
                } else {
                    return gerarNovoJogo(tentativas + 1);
                }
            };
            // Gera os 7 jogos
            while (jogos.length < 7 && tentativas < maxTentativas) {
                const novoJogo = gerarNovoJogo();
                // Verifica se o novo jogo é único e tem 15 dezenas
                if (
                    novoJogo && verificarJogoUnico(novoJogo, jogos, resultados) && novoJogo.length === 15) {
                    jogos.push(novoJogo);
                }
                // Incrementa as tentativas
                tentativas++;
            }
            // Verifica se foram gerados jogos suficientes
            if (jogos.length === 0) {
                toast.error("Não foi possível gerar nenhum jogo!");
                return;
            }
            // Verifica se foram gerados menos de 7 jogos
            if (jogos.length < 7) {
                toast.warn(`Foram gerados apenas ${jogos.length} jogos únicos.`);
            } else {
                toast.success("7 jogos gerados com sucesso!");
            }
            // Atualiza os jogos gerados e salva no localStorage
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
                                        {jogo.map((numero, numIndex) => { // Adicione numIndex para garantir chaves únicas
                                            const numeroAcertado = resultadoConcurso.includes(numero);
                                            return (
                                                <div
                                                    key={`${index}-${numero}-${numIndex}`} // Use index, numero e numIndex para garantir chaves únicas
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
