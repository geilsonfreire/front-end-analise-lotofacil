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

    // Função para calcular as 9 dezenas prioritárias do concurso anterior com base no histórico
    const getTop9FromPreviousDraw = (resultados) => {
        const historico = resultados
            .map((item) => ({
                concurso: Number(item?.concurso ?? 0),
                dezenas: Array.isArray(item?.dezenas) ? item.dezenas.map(Number).sort((a, b) => a - b) : [],
            }))
            .filter((item) => Number.isFinite(item.concurso) && item.concurso > 0)
            .sort((a, b) => a.concurso - b.concurso);

        if (historico.length < 2) {
            return [];
        }

        const ranking = Array.from({ length: 25 }, (_, index) => ({
            dezena: index + 1,
            vezesNoAnterior: 0,
            repeticoes: 0,
            probabilidade: 0,
        }));

        for (let index = 1; index < historico.length; index += 1) {
            const anterior = historico[index - 1];
            const atual = historico[index];

            ranking.forEach((item) => {
                if (anterior.dezenas.includes(item.dezena)) {
                    item.vezesNoAnterior += 1;
                    if (atual.dezenas.includes(item.dezena)) {
                        item.repeticoes += 1;
                    }
                }
            });
        }

        ranking.forEach((item) => {
            item.probabilidade = item.vezesNoAnterior > 0
                ? Number(((item.repeticoes / item.vezesNoAnterior) * 100).toFixed(1))
                : 0;
        });

        const previousDraw = historico[historico.length - 2].dezenas;

        return ranking
            .filter((item) => previousDraw.includes(item.dezena))
            .sort((a, b) => {
                if (b.probabilidade !== a.probabilidade) {
                    return b.probabilidade - a.probabilidade;
                }
                return b.repeticoes - a.repeticoes;
            })
            .slice(0, 9)
            .map((item) => item.dezena);
    };

    // Função para remover duplicatas
    const removerDuplicatas = (array) => {
        return Array.from(new Set(array));
    };

    // Embaralha um array mantendo a aleatoriedade do gerador
    const shuffleArray = (array) => {
        const shuffled = [...array];

        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
        }

        return shuffled;
    };

    // Define quantas dezenas devem entrar no núcleo do jogo, com base em uma faixa proporcional
    // entre 50% e 60% das dezenas ausentes do ciclo atual.
    const getDynamicSelectionCount = (absentCount) => {
        if (absentCount <= 0) return 0;

        const minCount = Math.max(1, Math.floor(absentCount * 0.5));
        const maxCount = Math.min(absentCount, Math.ceil(absentCount * 0.6));

        if (minCount > maxCount) {
            return minCount;
        }

        return Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    };

    // Seleciona as dezenas obrigatórias do ciclo atual e prioriza as top 9 do concurso anterior
    const pickMandatoryNumbers = (absentNums, prioritizedNums) => {
        const uniqueAbsent = removerDuplicatas(absentNums);

        if (uniqueAbsent.length === 0) {
            return [];
        }

        const prioritizedSet = new Set(prioritizedNums);
        const selectionCount = getDynamicSelectionCount(uniqueAbsent.length);

        const prioritizedAbsent = removerDuplicatas(
            prioritizedNums.filter((num) => uniqueAbsent.includes(num))
        ).sort((a, b) => prioritizedNums.indexOf(a) - prioritizedNums.indexOf(b) || a - b);

        const otherAbsent = uniqueAbsent
            .filter((num) => !prioritizedSet.has(num))
            .sort((a, b) => a - b);

        return [...prioritizedAbsent, ...shuffleArray(otherAbsent)].slice(0, selectionCount);
    };

    // Função para gerar jogos
    const gerarJogos = async () => {
        try {
            setLoading(true);
            const resultados = await ApiServices.getAllResults();
            // Processa o ciclo atual para obter dezenas ausentes
            const cicloProcessado = processarCiclos([...resultados]);
            const dezenasAusentesCiclo = [...cicloProcessado.dezenasAusentes].map(Number);
            const top9Prioritarias = getTop9FromPreviousDraw(resultados);

            // Se houver menos de 9 dezenas no top9, use apenas as disponíveis
            const dezenasPrioritarias = removerDuplicatas(top9Prioritarias).slice(0, 9);

            // Inicializa o array de jogos
            let jogos = [];
            
            let tentativas = 0;

            const maxTentativas = 100;

            // Função para gerar um novo jogo
            const gerarNovoJogo = (dezenasBase, tentativas = 0) => {
                if (tentativas > 100) return null;

                // Começa com as dezenas obrigatórias do ciclo atual, priorizando as top9 do concurso anterior
                let novoJogo = [...dezenasBase];
                novoJogo = removerDuplicatas(novoJogo);

                // Se ainda não houver 15 dezenas, adiciona números aleatórios das dezenas ausentes restantes
                const numerosDisponiveis = Array.from({ length: 25 }, (_, i) => i + 1)
                    .filter((num) => !novoJogo.includes(num));

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
                }

                return gerarNovoJogo(dezenasBase, tentativas + 1);
            };
            // Gera os 7 jogos
            while (jogos.length < 7 && tentativas < maxTentativas) {
                const dezenasIniciais = pickMandatoryNumbers(dezenasAusentesCiclo, dezenasPrioritarias);
                const novoJogo = gerarNovoJogo(dezenasIniciais);
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
                        style={{ marginLeft: '0.75rem', minWidth: '3rem', cursor: 'pointer' }}
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
                                        {jogo.map((numero, numIndex) => {
                                            const numeroAcertado = resultadoConcurso.includes(numero);
                                            return (
                                                <div
                                                    key={`${index}-${numero}-${numIndex}`}
                                                    className={`numero-bolinha ${numeroAcertado ? 'numero-acertado' : ''}`}
                                                    style={numeroAcertado ? { borderColor: '#059669', borderWidth: '4px' } : {}}
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
