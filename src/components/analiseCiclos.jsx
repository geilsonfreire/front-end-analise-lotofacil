import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiService from "../services/apiServices";

const AnaliseCiclos = () => {
    const [ciclos, setCiclos] = useState([]);

    // Função para processar os ciclos de dezenas
    function processarCiclos(dados) {
        const dadosOrdenados = [...dados].sort(
            (a, b) => Number(a.concurso) - Number(b.concurso)
        );

        const todasDezenas = new Set(
            Array.from({ length: 25 }, (_, i) =>
                String(i + 1).padStart(2, "0")
            )
        );

        const ciclosCalculados = [];

        let cicloAtual = {
            numero: 1,
            concursos: [],
            dezenasAusentes: new Set(todasDezenas),
        };

        for (const concurso of dadosOrdenados) {
            const dezenasSorteadas = new Set(
                (concurso.dezenas || []).map((dezena) =>
                    String(dezena).padStart(2, "0")
                )
            );

            // Remove as dezenas sorteadas do conjunto de ausentes
            for (const dezena of dezenasSorteadas) {
                cicloAtual.dezenasAusentes.delete(dezena);
            }

            // Guarda o estado do ciclo DEPOIS deste concurso
            cicloAtual.concursos.push({
                ...concurso,
                dezenasAusentes: new Set(cicloAtual.dezenasAusentes),
            });

            // Se todas as 25 dezenas já apareceram,
            // o ciclo termina neste concurso.
            if (cicloAtual.dezenasAusentes.size === 0) {
                cicloAtual.duracao = cicloAtual.concursos.length;

                ciclosCalculados.push({
                    ...cicloAtual,
                    concursos: [...cicloAtual.concursos],
                    dezenasAusentes: new Set(cicloAtual.dezenasAusentes),
                });

                // Inicia o próximo ciclo
                cicloAtual = {
                    numero: cicloAtual.numero + 1,
                    concursos: [],
                    dezenasAusentes: new Set(todasDezenas),
                };
            }
        }

        // Se existe um ciclo em andamento,
        // adiciona também ao histórico.
        if (cicloAtual.concursos.length > 0) {
            cicloAtual.duracao = cicloAtual.concursos.length;

            ciclosCalculados.push({
                ...cicloAtual,
                concursos: [...cicloAtual.concursos],
                dezenasAusentes: new Set(cicloAtual.dezenasAusentes),
            });
        }

        setCiclos(ciclosCalculados);
    }

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await apiService.getAllResults();

                if (!Array.isArray(response)) {
                    console.warn(
                        "Os dados recebidos não são um array:",
                        response
                    );
                    return;
                }

                const dadosOrdenados = [...response].sort(
                    (a, b) => Number(a.concurso) - Number(b.concurso)
                );

                processarCiclos(dadosOrdenados);

            } catch (error) {
                console.error(
                    "Erro ao buscar resultados:",
                    error
                );

                toast.error(
                    "Erro ao carregar os resultados da Lotofácil."
                );
            }
        };

        fetchResults();
    }, []);

    // ESTATÍSTICAS BÁSICAS
    const calcularMedia = (valores) => {
        if (!valores || valores.length === 0) return 0;

        const soma = valores.reduce(
            (total, valor) => total + Number(valor),
            0
        );

        return soma / valores.length;
    };

    const calcularMediana = (valores) => {
        if (!valores || valores.length === 0) return 0;

        const ordenados = [...valores]
            .map(Number)
            .sort((a, b) => a - b);

        const meio = Math.floor(ordenados.length / 2);

        if (ordenados.length % 2 === 0) {
            return (
                (ordenados[meio - 1] + ordenados[meio]) / 2
            );
        }

        return ordenados[meio];
    };

    const calcularModa = (valores) => {
        if (!valores || valores.length === 0) return [];

        const frequencias = valores.reduce((acc, valor) => {
            acc[valor] = (acc[valor] || 0) + 1;
            return acc;
        }, {});

        const maiorFrequencia = Math.max(
            ...Object.values(frequencias)
        );

        return Object.entries(frequencias)
            .filter(
                ([, frequencia]) =>
                    frequencia === maiorFrequencia
            )
            .map(([valor]) => Number(valor));
    };
    
    // QUANTIDADE DE CICLOS QUE ALCANÇARAM CADA POSIÇÃO
    const calcularCiclosPorPosicao = (ciclos) => {
        const quantidade = {};

        ciclos.forEach((ciclo) => {
            ciclo.concursos.forEach((_, index) => {
                const posicao = index + 1;

                quantidade[posicao] =
                    (quantidade[posicao] || 0) + 1;
            });
        });

        return quantidade;
    };
   
    // Função para calcular a frequência das dezenas ausentes por posição no ciclo
    const calcularFrequenciaDezenasAusentes = (ciclos) => {
        const frequencia = {};
        ciclos.forEach(ciclo => {
            ciclo.concursos.forEach((concurso, idx) => {
                if (!frequencia[idx + 1]) {
                    frequencia[idx + 1] = {};
                }
                concurso.dezenasAusentes.forEach(dezena => {
                    frequencia[idx + 1][dezena] = (frequencia[idx + 1][dezena] || 0) + 1;
                });
            });
        });
        return frequencia;
    };

    // PERCENTUAL DE AUSÊNCIA
    // DEZENA × POSIÇÃO DO CICLO
    const calcularPercentualDezenasPorPosicao = (
        frequenciaDezenasPorPosicao,
        ciclosPorPosicao
    ) => {
        const percentual = {};

        for (let dezena = 1; dezena <= 25; dezena++) {
            percentual[dezena] = {};

            const posicoes =
                frequenciaDezenasPorPosicao[dezena] || {};

            Object.keys(ciclosPorPosicao).forEach((posicao) => {
                const frequencia =
                    posicoes[posicao] || 0;

                const totalCiclos =
                    ciclosPorPosicao[posicao] || 0;

                percentual[dezena][posicao] =
                    totalCiclos > 0
                        ? Number(
                            (
                                (frequencia / totalCiclos) *
                                100
                            ).toFixed(2)
                        )
                        : 0;
            });
        }

        return percentual;
    };

    // Função para calcular as durações mais relevantes
    const calcularDuracoesRelevantes = (ciclos) => {
        const duracoes = ciclos.map(ciclo => ciclo.duracao);
        const frequenciaDuracoes = duracoes.reduce((acc, duracao) => {
            acc[duracao] = (acc[duracao] || 0) + 1;
            return acc;
        }, {});
        const duracoesRelevantes = Object.entries(frequenciaDuracoes)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        return duracoesRelevantes;
    };


    // Função para calcular a frequência das dezenas ausentes em relação à posição no ciclo
    const calcularFrequenciaDezenasPorPosicao = (ciclos) => {
        const frequencia = {};
        ciclos.forEach(ciclo => {
            ciclo.concursos.forEach((concurso, idx) => {
                concurso.dezenasAusentes.forEach(dezena => {
                    if (!frequencia[dezena]) {
                        frequencia[dezena] = {};
                    }
                    frequencia[dezena][idx + 1] = (frequencia[dezena][idx + 1] || 0) + 1;
                });
            });
        });
        return frequencia;
    };

     // ==========================================================
    // PROBABILIDADE CONDICIONAL
    //
    // P(Ausente na posição atual
    //   | Ausente na posição anterior)
    // ==========================================================
    const calcularProbabilidadeCondicional = (
        frequenciaDezenasPorPosicao
    ) => {
        const probabilidades = {};

        for (let dezena = 1; dezena <= 25; dezena++) {
            probabilidades[dezena] = {};

            const posicoes =
                frequenciaDezenasPorPosicao[dezena] || {};

            const todasPosicoes = Object.keys(posicoes)
                .map(Number)
                .sort((a, b) => a - b);

            todasPosicoes.forEach((posicao) => {
                if (posicao === 1) {
                    probabilidades[dezena][posicao] = 100;
                    return;
                }

                const frequenciaAnterior =
                    posicoes[posicao - 1] || 0;

                const frequenciaAtual =
                    posicoes[posicao] || 0;

                probabilidades[dezena][posicao] =
                    frequenciaAnterior > 0
                        ? Number(
                            (
                                (frequenciaAtual /
                                    frequenciaAnterior) *
                                100
                            ).toFixed(2)
                        )
                        : 0;
            });
        }

        return probabilidades;
    };

     // ==========================================================
    // PERFIL ESTATÍSTICO DAS 25 DEZENAS
    // ==========================================================
    const calcularPerfilEstatisticoDezenas = (
        frequenciaDezenasPorPosicao,
        percentualDezenasPorPosicao,
        probabilidadeCondicional
    ) => {
        const perfil = [];

        for (let dezena = 1; dezena <= 25; dezena++) {
            const frequencias = Object.values(
                frequenciaDezenasPorPosicao[dezena] || {}
            );

            const percentuais = Object.values(
                percentualDezenasPorPosicao[dezena] || {}
            );

            const condicionais = Object.values(
                probabilidadeCondicional[dezena] || {}
            ).filter((valor) => valor !== 100);

            perfil.push({
                dezena,

                mediaFrequencia: Number(
                    calcularMedia(frequencias).toFixed(2)
                ),

                medianaFrequencia: Number(
                    calcularMediana(frequencias).toFixed(2)
                ),

                modaFrequencia:
                    calcularModa(frequencias),

                mediaPercentual: Number(
                    calcularMedia(percentuais).toFixed(2)
                ),

                medianaPercentual: Number(
                    calcularMediana(percentuais).toFixed(2)
                ),

                mediaCondicional: Number(
                    calcularMedia(condicionais).toFixed(2)
                ),
            });
        }

        return perfil;
    };

    // ==========================================================
    // RANKING HISTÓRICO DAS DEZENAS
    // ==========================================================
    const calcularRankingDezenas = (
        percentualDezenasPorPosicao,
        probabilidadeCondicional,
        frequenciaDezenasPorPosicao
    ) => {
        const ranking = [];

        for (let dezena = 1; dezena <= 25; dezena++) {
            const percentuais = Object.values(
                percentualDezenasPorPosicao[dezena] || {}
            );

            const condicionais = Object.values(
                probabilidadeCondicional[dezena] || {}
            ).filter((valor) => valor !== 100);

            const frequencias = Object.values(
                frequenciaDezenasPorPosicao[dezena] || {}
            );

            const mediaPercentual =
                calcularMedia(percentuais);

            const mediaCondicional =
                calcularMedia(condicionais);

            const mediaFrequencia =
                calcularMedia(frequencias);

            ranking.push({
                dezena,

                mediaPercentual: Number(
                    mediaPercentual.toFixed(2)
                ),

                mediaCondicional: Number(
                    mediaCondicional.toFixed(2)
                ),

                mediaFrequencia: Number(
                    mediaFrequencia.toFixed(2)
                ),

                // Score inicial.
                // Depois podemos sofisticar.
                score: Number(
                    (
                        mediaPercentual * 0.6 +
                        mediaCondicional * 0.4
                    ).toFixed(2)
                ),
            });
        }

        return ranking.sort(
            (a, b) => b.score - a.score
        );
    };

    const duracoesRelevantes = calcularDuracoesRelevantes(ciclos);
    const frequenciaDezenasAusentes = calcularFrequenciaDezenasAusentes(ciclos);
    const frequenciaDezenasPorPosicao = calcularFrequenciaDezenasPorPosicao(ciclos);

    // ==========================================================
    // NOVAS MÉTRICAS ESTATÍSTICAS
    // ==========================================================
    const ciclosPorPosicao =
        calcularCiclosPorPosicao(ciclos);

    const percentualDezenasPorPosicao =
        calcularPercentualDezenasPorPosicao(
            frequenciaDezenasPorPosicao,
            ciclosPorPosicao
        );

    const probabilidadeCondicional =
        calcularProbabilidadeCondicional(
            frequenciaDezenasPorPosicao
        );

    const perfilEstatisticoDezenas =
        calcularPerfilEstatisticoDezenas(
            frequenciaDezenasPorPosicao,
            percentualDezenasPorPosicao,
            probabilidadeCondicional
        );

    const rankingDezenas =
        calcularRankingDezenas(
            percentualDezenasPorPosicao,
            probabilidadeCondicional,
            frequenciaDezenasPorPosicao
        );


    // Verificar a quantidade máxima de posições identificadas
    const maxPosicoes = Object.keys(ciclosPorPosicao).length > 0 ? 
        Math.max(...Object.keys(ciclosPorPosicao).map(Number)) : 0 ;



    return (
        <section className="w-full overflow-hidden flex flex-col gap-8">
            {/* Tabela Analise dos Ciclos */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">
                <div className="border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Análise dos Ciclos de Dezenas</h2>
                </div>
                {/* Tabela com os resultados dos ciclos e dezenas ausentes */}
                <div className="cycles-card max-h-[60vh] overflow-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Concurso</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Ciclo</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Duração do Ciclo</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Dezenas Ausentes</th>
                            </tr>
                        </thead>
                        <tbody className="w-full border-separate border-spacing-0 text-sm"  >
                            {ciclos.length === 0 ? (
                                <tr>
                                    <td colSpan="4">Nenhum dado disponível</td>
                                </tr>
                            ) : (
                                [...ciclos].reverse().map((ciclo) =>
                                    [...ciclo.concursos].reverse().map((concurso, idx) => (
                                        <tr key={`${ciclo.numero}-${concurso.concurso}`}>
                                            <td>{concurso.concurso}</td>
                                            <td className={idx === 0 ? "ciclo-highlight" : ""}>
                                                {idx === 0 ? ciclo.numero : ""}
                                            </td>
                                            <td className={idx === ciclo.concursos.length - 1 ? "duracao-highlight" : ""}>
                                                {idx === ciclo.concursos.length - 1 ? ciclo.duracao : ""}
                                            </td>
                                            <td>
                                                {[...concurso.dezenasAusentes]
                                                    .sort((a, b) => a - b)
                                                    .join(", ")}
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>  

            {/* Tabela com as durações mais relevantes */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">
                <div className="border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Durações mais relevantes</h2>
                </div>
                <div className="cycles-card max-h-[60vh] overflow-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2" >Duração do Ciclo</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Frequência</th>
                            </tr>
                        </thead>
                        <tbody>
                            {duracoesRelevantes.length === 0 ? (
                                <tr>
                                    <td colSpan="2">Nenhum dado disponível</td>
                                </tr>
                            ) : (
                                duracoesRelevantes.map(([duracao, frequencia]) => (
                                    <tr key={duracao}>
                                        <td>{duracao}</td>
                                        <td>{frequencia}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div> 

            {/* Tabela com a frequência das dezenas ausentes por posição no ciclo */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">
                <div className="border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Frequência das dezenas ausentes por posição no ciclo</h2>
                </div>
                <div className="cycles-card max-h-[60vh] overflow-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Posição no Ciclo</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Dezena</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Frequência</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(frequenciaDezenasAusentes).length === 0 ? (
                                <tr>
                                    <td colSpan="3">Nenhum dado disponível</td>
                                </tr>
                            ) : (
                                Object.entries(frequenciaDezenasAusentes).map(([posicao, dezenas]) =>
                                    Object.entries(dezenas).map(([dezena, frequencia]) => (
                                        <tr key={`${posicao}-${dezena}`}>
                                            <td>{posicao}</td>
                                            <td>{dezena}</td>
                                            <td>{frequencia}</td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>  

            {/* Tabela com a frequência das dezenas ausentes em relação à posição no ciclo */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">
                <div className="border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Frequência das dezenas ausentes em relação à posição no ciclo</h2>
                </div>
                <div className="cycles-card max-h-[60vh] overflow-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="sticky top-0 z-10">
                            <tr>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Dezena</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Posição no Ciclo</th>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">Frequência</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(frequenciaDezenasPorPosicao).length === 0 ? (
                                <tr>
                                    <td colSpan="3">Nenhum dado disponível</td>
                                </tr>
                            ) : (
                                Object.entries(frequenciaDezenasPorPosicao)
                                    .sort((a, b) => a[0] - b[0])
                                    .map(([dezena, posicoes]) =>
                                        Object.entries(posicoes).map(([posicao, frequencia]) => (
                                            <tr key={`${dezena}-${posicao}`}>
                                                <td>{dezena}</td>
                                                <td>{posicao}</td>
                                                <td>{frequencia}</td>
                                            </tr>
                                        ))
                                    )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>               

            {/* Tabela de analise por posição no formato solicitado */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">
                <div className="border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Analise das dezenas ausentes por Posição</h2>
                </div>                
                
                <div className="cycles-card max-h-[60vh] overflow-auto">
                    <table className="w-full border-separate border-spacing-0 text-sm">
                        <thead className="sticky top-0 z-10">
                            {Array.from({ length: maxPosicoes }, (_, i) => (
                                <>
                                    <tr key={`posicao-${i + 1}`}>
                                        <th className=" border-violet-100 text-white bg-linear-to-r from-violet-950 to-fuchsia-700 rounded-t-xl bg-slate-50 px-3 py-2">{i + 1}ª</th>
                                    </tr>
                                    <tr>
                                        <th className="border-violet-100 text-white bg-linear-to-r from-violet-950 to-fuchsia-700 bg-slate-50 px-3 py-2">Dez:</th>
                                        {Array.from({ length: 25 }, (_, j) => (
                                            <td key={`dez-${j + 1}`} className="px-3 py-2">
                                                {j + 1}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <th className="border-violet-100 text-white bg-linear-to-r from-violet-950 to-fuchsia-700 rounded-b-xl bg-slate-50 px-3 py-2">Freq:</th>
                                        {Array.from({ length: 25 }, (_, j) => (
                                            <td key={`freq-${i + 1}-${j + 1}`} className="px-3 py-2">
                                                {frequenciaDezenasPorPosicao[j + 1] ? frequenciaDezenasPorPosicao[j + 1][i + 1] || 0 : 0}
                                            </td>
                                        ))}
                                    </tr>
                                    <br />
                                </>
                            ))}
                        </thead>
                    </table>
                </div>
            </div>

            {/* ======================================================
                PERCENTUAL DAS DEZENAS AUSENTES POR POSIÇÃO
            ====================================================== */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">

                <div className="border-violet-100 px-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                        Histórico
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-white">
                        Percentual das dezenas ausentes por posição
                    </h2>
                </div>

                <div className="cycles-card max-h-[60vh] overflow-auto">

                    <table className="w-full border-separate border-spacing-0 text-sm">

                        <thead className="sticky top-0 z-10">

                            <tr>
                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Dezena
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Posição
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Frequência
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Ciclos na Posição
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Percentual
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            {Array.from(
                                { length: 25 },
                                (_, index) => index + 1
                            ).flatMap((dezena) =>

                                Object.keys(ciclosPorPosicao)
                                    .map(Number)
                                    .sort((a, b) => a - b)
                                    .map((posicao) => {

                                        const frequencia =
                                            frequenciaDezenasPorPosicao[
                                                dezena
                                            ]?.[posicao] || 0;

                                        const percentual =
                                            percentualDezenasPorPosicao[
                                                dezena
                                            ]?.[posicao] || 0;

                                        return (

                                            <tr
                                                key={`${dezena}-${posicao}`}
                                            >

                                                <td>
                                                    {String(dezena)
                                                        .padStart(2, "0")}
                                                </td>

                                                <td>
                                                    {posicao}ª
                                                </td>

                                                <td>
                                                    {frequencia}
                                                </td>

                                                <td>
                                                    {
                                                        ciclosPorPosicao[
                                                            posicao
                                                        ]
                                                    }
                                                </td>

                                                <td className="font-semibold">
                                                    {percentual.toFixed(2)}%
                                                </td>

                                            </tr>
                                        );
                                    })
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ======================================================
                PROBABILIDADE CONDICIONAL
            ====================================================== */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">

                <div className="border-violet-100 px-4">

                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                        Estatística Avançada
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-white">
                        Probabilidade de continuar ausente
                    </h2>

                </div>

                <div className="cycles-card max-h-[60vh] overflow-auto">

                    <table className="w-full border-separate border-spacing-0 text-sm">

                        <thead className="sticky top-0 z-10">

                            <tr>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Dezena
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Posição
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Probabilidade Condicional
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {Array.from(
                                { length: 25 },
                                (_, index) => index + 1
                            ).flatMap((dezena) =>

                                Object.entries(
                                    probabilidadeCondicional[dezena] || {}
                                )
                                    .map(
                                        ([posicao, probabilidade]) => (
                                            <tr
                                                key={`${dezena}-${posicao}`}
                                            >

                                                <td>
                                                    {String(dezena)
                                                        .padStart(2, "0")}
                                                </td>

                                                <td>
                                                    {posicao}ª
                                                </td>

                                                <td className="font-semibold">
                                                    {Number(
                                                        probabilidade
                                                    ).toFixed(2)}%
                                                </td>

                                            </tr>
                                        )
                                    )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ======================================================
                PERFIL ESTATÍSTICO DAS 25 DEZENAS
            ====================================================== */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">

                <div className="px-4">

                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                        Estatística
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-white">
                        Perfil estatístico das 25 dezenas
                    </h2>

                </div>

                <div className="cycles-card max-h-[60vh] overflow-auto">

                    <table className="w-full border-separate border-spacing-0 text-sm">

                        <thead className="sticky top-0 z-10">

                            <tr>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Dezena
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Média
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Mediana
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Moda
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Média %
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Média Condicional
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {perfilEstatisticoDezenas.map((item) => (

                                <tr key={item.dezena}>

                                    <td className="font-semibold">
                                        {String(item.dezena)
                                            .padStart(2, "0")}
                                    </td>

                                    <td>
                                        {item.mediaFrequencia}
                                    </td>

                                    <td>
                                        {item.medianaFrequencia}
                                    </td>

                                    <td>
                                        {item.modaFrequencia.join(", ")}
                                    </td>

                                    <td>
                                        {item.mediaPercentual}%
                                    </td>

                                    <td>
                                        {item.mediaCondicional}%
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ======================================================
                RANKING DAS DEZENAS
            ====================================================== */}
            <div className="rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">

                <div className="px-4">

                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">
                        Ranking
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-white">
                        Ranking histórico das dezenas ausentes
                    </h2>

                </div>

                <div className="cycles-card max-h-[60vh] overflow-auto">

                    <table className="w-full border-separate border-spacing-0 text-sm">

                        <thead className="sticky top-0 z-10">

                            <tr>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    #
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Dezena
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Média %
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Média Condicional
                                </th>

                                <th className="rounded-t-xl bg-slate-50 px-3 py-2">
                                    Score
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {rankingDezenas.map(
                                (item, index) => (

                                    <tr key={item.dezena}>

                                        <td>
                                            {index + 1}
                                        </td>

                                        <td className="font-semibold">
                                            {String(item.dezena)
                                                .padStart(2, "0")}
                                        </td>

                                        <td>
                                            {item.mediaPercentual}%
                                        </td>

                                        <td>
                                            {item.mediaCondicional}%
                                        </td>

                                        <td className="font-bold">
                                            {item.score}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>
            

        </section>
    );
};

export default AnaliseCiclos;
