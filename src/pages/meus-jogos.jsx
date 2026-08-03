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

    // Gera todas as 16 combinações de 15 dezenas existentes dentro de um jogo de 16
    const gerarCombinacoesDe15 = (jogo16) => {

        // Validação de entrada
        if (!Array.isArray(jogo16) || jogo16.length !== 16) {
            return [];
        }

        // Normaliza e ordena o jogo
        const jogoOrdenado = [...new Set(jogo16)]
            .map(Number)
            .sort((a, b) => a - b);

        // Garante que continuamos realmente com 16 dezenas únicas
        if (jogoOrdenado.length !== 16) {
            return [];
        }

        // Remove uma dezena por vez.
        // 16 dezenas → 16 combinações diferentes de 15.
        return jogoOrdenado.map((_, indiceRemovido) => {
            return jogoOrdenado
                .filter((_, indice) => indice !== indiceRemovido);
        });
    };
        
    // CAMADA 5: Validação de unicidade
    //
    // Regras:
    //
    // 1. Nenhuma combinação de 15 dezenas do jogo de 16
    //    pode ter sido sorteada no histórico.
    //
    // 2. Nenhuma combinação de 15 dezenas do novo jogo
    //    pode existir dentro de outro jogo nosso.
    //
    // 3. O conjunto completo de 16 dezenas também não
    //    pode ser igual a outro jogo nosso.

    const verificarJogoUnico = (novoJogo, dezenaAdicional, jogosAnteriores, resultados) => {

        // ==========================================================
        // NORMALIZA O NOVO JOGO
        // ==========================================================

        const novoJogoOrdenado = [...novoJogo]
            .map(Number)
            .sort((a, b) => a - b);

        // Monta o jogo de 16 dezenas
        const jogo16 = [
            ...novoJogoOrdenado,
            Number(dezenaAdicional)
        ].sort((a, b) => a - b);

        // ==========================================================
        // GERA AS 16 COMBINAÇÕES DE 15 DO NOVO JOGO
        // ==========================================================
         // Gera as 16 combinações possíveis de 15 dezenas
        const combinacoesNovoJogo = gerarCombinacoesDe15(jogo16);

        console.log("NOVO JOGO 15:", novoJogoOrdenado);
        console.log("DEZENA ADICIONAL:", dezenaAdicional);
        console.log("JOGO COMPLETO 16:", jogo16);
        console.log("COMBINAÇÕES NOVO JOGO:", combinacoesNovoJogo);

        // ==========================================================
        // CHAVE PADRONIZADA PARA COMPARAÇÃO
        // ==========================================================

        const criarChave = (numeros) => {
            return [...numeros]
                .map(Number)
                .sort((a, b) => a - b)
                .join("-");
        };


        // ==========================================================
        // REGRA 1
        // COMPARAÇÃO DAS 15 DEZENAS CONTRA O HISTÓRICO
        // ==========================================================

        const historicoChaves = new Set(
            resultados.map(resultado =>
                criarChave(resultado.dezenas)
            )
        );


        const combinacaoHistorica = combinacoesNovoJogo.some(
            combinacao => historicoChaves.has(
                criarChave(combinacao)
            )
        );


        // Se alguma das 16 combinações de 15 já foi sorteada
        if (combinacaoHistorica) {
            return false;
        }


        // ==========================================================
        // REGRA 2
        // COMPARAÇÃO DAS 15 DEZENAS CONTRA NOSSOS JOGOS
        // ==========================================================

        const combinacoesJogosAnteriores = jogosAnteriores.flatMap(
            jogo => {

                // Jogos antigos de 16
                if (jogo.length === 16) {
                    return gerarCombinacoesDe15(
                        jogo
                    );
                }

                // Compatibilidade com jogos antigos de 15
                if (jogo.length === 15) {
                    return [[...jogo]];
                }

                return [];
            }
        );


        const combinacaoJaGerada = combinacoesNovoJogo.some(
            combinacaoNova => {

                const chaveNova = criarChave(combinacaoNova);

                return combinacoesJogosAnteriores.some(
                    combinacaoAnterior =>
                        criarChave(combinacaoAnterior) === chaveNova
                );
            }
        );

        // Se alguma combinação de 15 já pertence
        // a um dos nossos jogos
        if (combinacaoJaGerada) {
            return false;
        }


        // ==========================================================
        // REGRA 3
        // COMPARAÇÃO DOS 16 CONTRA NOSSOS JOGOS
        // ==========================================================

        const chaveNovoJogo16 = criarChave(jogo16);


        const jogo16JaExiste = jogosAnteriores.some(
            jogo => {

                // Só compara jogos completos de 16
                if (jogo.length !== 16) {
                    return false;
                }

                return criarChave(jogo) === chaveNovoJogo16;
            }
        );


        // Jogo de 16 exatamente igual já existe
        if (jogo16JaExiste) {
            return false;
        }


        // ==========================================================
        // TODAS AS VALIDAÇÕES PASSARAM
        // ==========================================================

        return true;
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
        // Nenhuma dezena ausente
        if (absentCount === 0) {
            return 0;
        }

        // Apenas uma dezena ausente
        if (absentCount === 1) {
            return 1;
        }

        // Duas ou mais dezenas ausentes
        const minCount = Math.max(
            1,
            Math.floor(absentCount * 0.5)
        );

        const maxCount = Math.min(
            absentCount,
            Math.ceil(absentCount * 0.6)
        );

        return Math.floor(
            Math.random() * (maxCount - minCount + 1)
        ) + minCount;
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

                const usoA = controleUso.get(a) ?? 0;
                const usoB = controleUso.get(b) ?? 0;

                if (usoA !== usoB){
                    return usoA - usoB;
                }
                return ranking.indexOf(a) - ranking.indexOf(b);
            });

        return shuffleArray(candidatos).slice(0, quantidade);
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
            // CAMADA 2: histórico das combinações já utilizadas
            const selecoesAusentesGeradas = [];

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

            // Seleciona a dezena adicional do jogo de 16
            const selecionarDezenaAdicional = (jogo15) => {

                const disponiveis = todasDezenas.filter(
                    numero => !jogo15.includes(numero)
                );

                if (disponiveis.length === 0) {
                    return null;
                }

                return disponiveis[
                    Math.floor(Math.random() * disponiveis.length)
                ];
            };

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

            // CAMADA 2: Seleciona uma combinação de dezenas ausentes
            // garantindo que a mesma combinação não seja utilizada novamente.
            const selecionarAusentesUnicos = (
                pool,
                ranking,
                controleUso,
                quantidade,
                cartaoAtual
            ) => {

                const maxTentativasSelecao = 1000;

                for (let tentativa = 0; tentativa < maxTentativasSelecao; tentativa++) {

                    const selecao = selecionarDistribuido(
                        pool,
                        ranking,
                        controleUso,
                        quantidade,
                        cartaoAtual
                    );

                    if (!selecao || selecao.length !== quantidade) {
                        continue;
                    }

                    const chaveNova = [...selecao]
                        .sort((a, b) => a - b)
                        .join("-");

                    const combinacaoJaExiste = selecoesAusentesGeradas
                        .includes(chaveNova);

                    if (combinacaoJaExiste) {
                        continue;
                    }
                    // Registra a combinação somente depois de validada
                    selecoesAusentesGeradas.push(chaveNova);

                    // Atualiza o uso individual das dezenas
                    selecao.forEach(num => {

                        controleUso.set(
                            num,
                            (controleUso.get(num) ?? 0) + 1
                        );

                    });

                    return selecao;
                }
            
                return [];
            };


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
                    selecionarAusentesUnicos(
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
                        usoComplemento.set(
                            num,
                            (usoComplemento.get(num) ?? 0) + 1
                        );
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

                // ==========================================================
                // GERA O JOGO BASE DE 15
                // ==========================================================

                const novoCartao = gerarCartaoUnitario();

                if (!novoCartao || novoCartao.length !== 15) {
                    tentativas++;
                    continue;
                }


                // ==========================================================
                // SELECIONA A DEZENA ADICIONAL
                // ==========================================================

                const dezenaAdicional = selecionarDezenaAdicional(
                    novoCartao
                );

                if (!dezenaAdicional) {
                    tentativas++;
                    continue;
                }


                // ==========================================================
                // CAMADA 5: VALIDAÇÃO DE UNICIDADE
                // ==========================================================

                const jogoValido = verificarJogoUnico(
                    novoCartao,
                    dezenaAdicional,
                    jogos,
                    resultados
                );


                // ==========================================================
                // ACEITA O JOGO
                // ==========================================================

                if (jogoValido) {

                    jogos.push(novoCartao);

                    console.log(
                        `Jogo ${jogos.length} aceito:`,
                        novoCartao,
                        "| Adicional:",
                        dezenaAdicional
                    );
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
