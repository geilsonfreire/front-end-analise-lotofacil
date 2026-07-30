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
    
    // CAMADA 5: Validação de Unicidade Rígida
    // Garante que o jogo é único entre os 7 da cartela E nunca foi sorteado no histórico da Lotofácilo
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

    // CAMADA 1: Calcula as 9 dezenas FIXAS do ÚLTIMO concurso com base no histórico estatístico
    const getRankingDezenas = (resultados) => {
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

        // Pega as dezenas do ÚLTIMO concurso sorteado (o mais recente)
        return ranking.sort((a, b) => {
            if (b.probabilidade !== a.probabilidade) {
                return b.probabilidade - a.probabilidade;
            }
            return b.repeticoes - a.repeticoes;
        });

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

    // CAMADA 2: Define quantas dezenas devem entrar no núcleo do jogo, com base em uma faixa proporcional
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

    // Função para selecionar dezenas distribuídas com base no ranking e controle de uso
    const selecionarDistribuido = (
        pool,
        ranking,
        controleUso,
        quantidade,
        cartaoAtual
    ) => {

        const candidatos = pool
            .filter(num => !cartaoAtual.includes(num))
            .sort((a, b) => {

                const usoA = controleUso.get(a);
                const usoB = controleUso.get(b);

                if (usoA !== usoB)
                    return usoA - usoB;

                return ranking.indexOf(a) - ranking.indexOf(b);

            });

        const escolhidas =
            shuffleArray(candidatos)
                .slice(0, quantidade);

        escolhidas.forEach(num => {

            controleUso.set(
                num,
                controleUso.get(num) + 1
            );

        });

        return escolhidas;

    };

    // Função para gerar jogos
    const gerarJogos = async () => {
        try {
            setLoading(true);
            const resultados = await ApiServices.getAllResults();

            if (!resultados || resultados.length === 0) {
                toast.error("Não foi possível carregar o histórico de sorteios.");
                return;
            }

            // Identifica o Último Concurso
            const historicoOrdenado = [...resultados].sort((a, b) => b.concurso - a.concurso);
            const ultimoConcurso = historicoOrdenado[0];
            const dezenasUltimoConcurso = ultimoConcurso.dezenas.map(Number);

            // Processa o ciclo para obter as ausentes
            const cicloProcessado = processarCiclos([...resultados]);
            const dezenasAusentesCiclo = [...cicloProcessado.dezenasAusentes].map(Number);
            const usoAusentes = new Map(dezenasAusentesCiclo.map(num => [num, 0]));

            // CAMADA 1: Trava 8 ou 9 Dezenas FIXAS (Estatisticamente superiores do último sorteio)
            const rankingCompleto = getRankingDezenas(resultados);
            const rankingDezenas = rankingCompleto.map(item => item.dezena);
            const quantidadeFixas = Math.random() < 0.5 ? 8 : 9;

            const dezenasFixas9 = rankingCompleto
                .filter(item =>
                    dezenasUltimoConcurso.includes(item.dezena)
                )

                .slice(0, quantidadeFixas)

                .map(item => item.dezena);


            // Universo de dezenas (1 a 25)
            const todasDezenas = Array.from({ length: 25 }, (_, i) => i + 1);

            // Dezenas que NÃO saíram no último concurso (10 dezenas)
            const dezenasForaDoConcursoAtual = todasDezenas.filter(
                (num) => !dezenasUltimoConcurso.includes(num)
            );
            // CAMADA 3: Pool das dezenas de complemento (ranking + distribuição)
            const poolComplemento = rankingCompleto
                .filter(item => dezenasForaDoConcursoAtual.includes(item.dezena))
                .map(item => item.dezena);

            // Controle de utilização das dezenas do complemento
            const usoComplemento = new Map(
                poolComplemento.map(num => [num, 0])
            );

            let jogos = [];
            let tentativas = 0;
            const maxTentativas = 500;

            // Função de construção unitária do cartão
            const gerarCartaoUnitario = () => {
                // CAMADA 1: Inicia obrigatoriamente com as 9 dezenas fixas
                let cartao = [...dezenasFixas9];

                // CAMADA 2: Seleciona dezenas ausentes do ciclo priorizando o ranking estatístico
                const quantidadeAusentes =
                    getDynamicSelectionCount(
                        dezenasAusentesCiclo.length
                    );

                const ausentesEscolhidas =
                    selecionarDistribuido(
                        dezenasAusentesCiclo,
                        rankingDezenas,
                        usoAusentes,
                        quantidadeAusentes,
                        cartao
                    );

                ausentesEscolhidas.forEach(num => {
                    if (!cartao.includes(num))
                        cartao.push(num);

                });

                // CAMADA 3: Completa o cartão usando distribuição equilibrada
                const quantidadeComplemento =
                    15 - cartao.length;

                const complemento = selecionarDistribuido(
                    poolComplemento,
                    rankingDezenas,
                    usoComplemento,
                    quantidadeComplemento,
                    cartao
                );

                complemento.forEach(num => {
                    if (!cartao.includes(num)) {
                        cartao.push(num);
                    }
                });

                // Fallback de segurança (Caso o universo da Camada 3 se esgoste antes de completar 15)
                if (cartao.length < 15) {
                    const restoDisponivel = todasDezenas.filter((num) => !cartao.includes(num));
                    const restoEmbaralhado = shuffleArray(restoDisponivel);
                    for (const num of restoEmbaralhado) {
                        if (cartao.length === 15) break;
                        cartao.push(num);
                    }
                };

                // CAMADA 4: Filtro Estrito de Paridade (7 Pares / 8 Ímpares ou 8 Pares / 7 Ímpares)
                const pares = cartao.filter((num) => num % 2 === 0).length;
                const impares = 15 - pares;

                if ((pares === 7 && impares === 8) || (pares === 8 && impares === 7)) {
                    return cartao.sort((a, b) => a - b);
                };

                return null; // Cartão rejeitado pelo filtro de paridade
            };

            // Loop de geração com validação de unicidade (CAMADA 5)
            while (jogos.length < 15 && tentativas < maxTentativas) {
                const novoCartao = gerarCartaoUnitario();

                // CAMADA 5: Validação de Unicidade
                if (

                    novoCartao &&
                    novoCartao.length === 15 &&
                    verificarJogoUnico(novoCartao, jogos, resultados)

                ){

                    novoCartao
                        .filter(num => usoAusentes.has(num))
                        .forEach(num => {

                            usoAusentes.set(
                                num,
                                usoAusentes.get(num) + 1
                            );

                        });

                    novoCartao
                        .filter(num => usoComplemento.has(num))
                        .forEach(num => {

                            usoComplemento.set(
                                num,
                                usoComplemento.get(num) + 1
                            );

                        });

                    jogos.push(novoCartao);

                }
                tentativas++;
            }

            // Tratamento de Feedbacks
            if (jogos.length === 0) {
                toast.error("Não foi possível gerar nenhum jogo com os critérios estabelecidos!");
                return;
            }

            if (jogos.length < 15) {
                toast.warn(`Foram gerados apenas ${jogos.length} jogos únicos.`);
            } else {
                toast.success("15 jogos gerados com sucesso respeitando as 5 camadas!");
            }

            // Atualiza estado e envia para a memória do navegador
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
