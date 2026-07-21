// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from 'prop-types';

// Imports de Icones
import { BsArrowRightCircle, BsArrowLeftCircle } from "react-icons/bs";

// Importando o componente
import apiServices from "../services/apiServices";
import { calculateCombinations } from "../utils/mathPossibility";
import { calculateOddEven } from "../utils/oddEvenAnalyzer";

const ResultLotofacil = ({ onConcursoChange }) => {
    // Estado para armazenar os resultados
    const [latestResult, setLatestResult] = useState(null);
    const [sorteios, setSorteios] = useState([]);
    const [currentConcurso, setCurrentConcurso] = useState(null);
    const [dezenasRestantes, setDezenasRestantes] = useState([]);
    const [cicloAtual, setCicloAtual] = useState(null);

    // Calcula as combinações
    const totalCombinations = calculateCombinations(25, 15);

    const processarCiclos = (dados) => {
        // 1. Ordenar pelo número do concurso
        dados.sort((a, b) => a.concurso - b.concurso);

        let ciclosCalculados = [];
        let cicloAtual = {
            numero: 1,
            concursos: [],
            dezenasAusentes: new Set(
                [...Array(25).keys()].map(i => (i + 1).toString().padStart(2, '0'))
            )
        };

        for (let i = 0; i < dados.length; i++) {
            const concurso = dados[i];
            // Padroniza as dezenas
            const dezenasConvertidas = (concurso.dezenas || []).map(d =>
                d.toString().padStart(2, '0')
            );
            const dezenasSorteadas = new Set(dezenasConvertidas);

            // Remove as dezenas sorteadas da lista de ausentes
            cicloAtual.dezenasAusentes = new Set(
                [...cicloAtual.dezenasAusentes].filter(
                    d => !dezenasSorteadas.has(d)
                )
            );

            cicloAtual.concursos.push({
                ...concurso,
                dezenasAusentes: new Set(cicloAtual.dezenasAusentes)
            });

            // Se não houver mais dezenas ausentes, fecha o ciclo
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

        // Se ainda houver um ciclo em andamento
        if (cicloAtual.concursos.length > 0) {
            ciclosCalculados.push({ ...cicloAtual });
        }

        return ciclosCalculados[ciclosCalculados.length - 1];
    };

    useEffect(() => {
        const loadData = async () => {
            const loadingToast = toast.info("Carregando dados...", { autoClose: false });
            try {
                const [allResults, latestResultData] = await Promise.all([
                    apiServices.getAllResults(),
                    apiServices.getLatestResult()
                ]);

                setSorteios(allResults);

                if (latestResultData) {
                    setLatestResult(latestResultData);
                    setCurrentConcurso(latestResultData.concurso);
                    const cicloProcessado = processarCiclos(allResults);
                    setCicloAtual(cicloProcessado);
                    setDezenasRestantes([...cicloProcessado.dezenasAusentes].sort((a, b) => Number(a) - Number(b)));
                    toast.success("Dados carregados com sucesso!");
                } else {
                    toast.error("Erro ao carregar os dados.");
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                toast.error("Erro na comunicação com o servidor.");
            } finally {
                toast.dismiss(loadingToast);
            }
        };

        loadData();
    }, []);

    // Função para ir para o concurso anterior
    const handlePreviousConcurso = async () => {
        if (currentConcurso > 1) {
            const newConcurso = currentConcurso - 1;
            await updateConcursoData(newConcurso);
        }
    };

    // Função para ir para o próximo concurso
    const handleNextConcurso = async () => {
        const newConcurso = currentConcurso + 1;
        await updateConcursoData(newConcurso);
    };

    // Função para atualizar os dados do concurso
    const updateConcursoData = async (concurso) => {
        const loadingToast = toast.info("Carregando dados...", { autoClose: false });
        try {
            const resultData = await apiServices.getResultByContestNumber(concurso);
            if (resultData) {
                setLatestResult(resultData);
                setCurrentConcurso(concurso);
                onConcursoChange(concurso); // Chamar a função de callback
                toast.success("Dados carregados com sucesso!");
            } else {
                toast.error("Erro ao carregar os dados.");
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            toast.error("Erro na comunicação com o servidor.");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    // Calcula o restante de possibilidades (dinâmico)
    const remainingCombinations = totalCombinations - sorteios.length;

    // Verifica a quantidade de sorteios com sequências repetidas
    const countRepeatedSequences = () => {
        const seenSequences = new Set(); // Armazena sequências únicas
        let repeatedCount = 0;

        sorteios.forEach((sorteio) => {
            const sortedDezenas = sorteio.dezenas.sort().join(","); // Ordena e une as dezenas
            if (seenSequences.has(sortedDezenas)) {
                repeatedCount += 1; // Incrementa se a sequência já foi vista
            } else {
                seenSequences.add(sortedDezenas); // Adiciona sequência única
            }
        });

        return repeatedCount;
    };

    const repeatedCount = countRepeatedSequences();

    return (
        <main className="w-full overflow-hidden lg:flex lg:items-center lg:justify-center">

            <section className="w-full rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-4 py-4 sm:px-6">
                {latestResult ? (
                    <>
                        <div className="border-violet-100 py-4 max-w-full gap-0 sm:gap-4 lg:flex lg:flex-col lg:justify-between">
                            <div className="gap-4 lg:flex lg:justify-between">
                                <div className="space-y-4 text-center lg:text-left">
                                    <h1 className="text-2xl font-bold tracking-tight text-brand-success sm:text-3xl">Último Resultado</h1>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <p className="text-sm text-slate-200">
                                            Data do concurso: <span className="font-semibold text-brand-success">{latestResult.data || "N/A"}</span>
                                        </p>
                                        <p className="text-sm text-slate-200">
                                            Data do próximo concurso: <span className="font-semibold text-brand-success">{latestResult.dataProximoConcurso || "N/A"}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mx-auto flex w-full max-w-[18rem] items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/10 px-3 py-3 text-white backdrop-blur-sm sm:px-5 lg:mx-0">
                                    <button
                                        onClick={handlePreviousConcurso}
                                        className="rounded-full border border-white/20 bg-white/10 p-2 text-xl text-brand-success transition hover:bg-white/20"
                                    >
                                        <BsArrowLeftCircle />
                                    </button>
                                    <h2 className="concurso-number text-lg font-bold text-brand-success sm:text-xl">
                                        <span>{currentConcurso || "N/A"}</span>
                                    </h2>
                                    <button
                                        onClick={handleNextConcurso}
                                        className="rounded-full border border-white/20 bg-white/10 p-2 text-xl text-brand-success transition hover:bg-white/20"
                                    >
                                        <BsArrowRightCircle />
                                    </button>
                                </div>
                            </div>

                            <div className=" w-full lg:flex  gap-2 sm:mt-4 lg:mt-2">
                                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-xl shadow-black/20">
                                    <div className="container-dezenas ">
                                        <div className="dezenas flex flex-wrap justify-center gap-2 rounded-3xl border border-white/10 bg-slate-950/20 p-4 text-center text-lg font-semibold text-white sm:justify-start">
                                            {latestResult.dezenas && latestResult.dezenas.length > 0 ? (
                                                latestResult.dezenas.map((dezena, index) => (
                                                    <span key={index} className="inline-flex h-11 min-w-[2.2rem] items-center justify-center rounded-full bg-fuchsia-600/90 px-3 py-2 text-sm font-semibold text-white shadow-inner shadow-fuchsia-900/30">{dezena}</span>
                                                ))
                                            ) : (
                                                <span>Dezenas não identificadas</span>
                                            )}
                                        </div>

                                        <div className="flex justify-between  gap-3 rounded-3xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-200">
                                            {latestResult && latestResult.dezenas ? (
                                                (() => {
                                                    const { even, odd } = calculateOddEven(latestResult.dezenas);
                                                    const somaDezenas = latestResult.dezenas.reduce((acc, curr) => acc + Number(curr), 0);
                                                    return (
                                                        <>
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-white">Pares</p>
                                                                <span className="text-xl font-bold text-fuchsia-400">{even}</span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-medium text-white">Ímpares</p>
                                                                <span className="text-xl font-bold text-fuchsia-400">{odd}</span>
                                                            </div>
                                                            <div className="sm:col-span-2 space-y-1">
                                                                <p className="font-medium text-white">Soma</p>
                                                                <span className="text-xl font-bold text-fuchsia-400">{somaDezenas}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()
                                            ) : (
                                                <p>Não há dados disponíveis para análise.</p>
                                            )}
                                        </div>

                                        <div className="ciclos rounded-3xl border border-white/10 bg-slate-950/20 p-4 text-sm text-slate-200">
                                            <h2 className="text-base font-semibold text-white">Ciclo Atual: <span className="text-fuchsia-400">{cicloAtual?.numero || 'N/A'}</span></h2>
                                            <h2 className="mt-3 text-sm font-medium text-white">Dezenas ausentes no ciclo atual:</h2>
                                            <div className="dezenas mt-2 flex flex-wrap gap-2">
                                                {dezenasRestantes.length > 0 ? (
                                                    dezenasRestantes
                                                        .sort((a, b) => Number(a) - Number(b))
                                                        .map((dezena, index) => (
                                                            <span key={index} className="inline-flex h-9 min-w-[2.2rem] items-center justify-center rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white">{dezena}</span>
                                                        ))
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-white/10 px-3 py-2 text-sm text-white">Ciclo Completo</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="box-shadown rounded-3xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-black/10">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                        <div className="flex-1 rounded-3xl p-4 border border-black/10 shadow-xl shadow-black/10">  
                                            <h2 className="section-heading text-sm text-brand-success mb-2">Análise de Sorteios</h2>
                                            <table className="w-full border-separate border-spacing-0 text-sm">
                                                 <thead className="sticky top-0 z-10 text-sm text-brand-success bg-linear-to-r from-violet-950 to-fuchsia-700">
                                                    <tr>
                                                        <th className="rounded-t-xl border-b border-slate-200 px-3 py-2 text-left">Descrição</th>
                                                        <th className="rounded-t-xl border-b border-slate-200 px-3 py-2 text-left">QNT</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm text-white">
                                                    <tr>
                                                        <td className="p-2">Total de possibilidades de jogos</td>
                                                        <td>{totalCombinations.toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2">Total de sorteios já realizados</td>
                                                        <td>{sorteios.length.toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2">Possibilidades restantes</td>
                                                        <td>{remainingCombinations.toLocaleString()}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2">Sorteios com sequências repetidas</td>
                                                        <td>{repeatedCount.toLocaleString()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex-1 rounded-3xl p-4 border border-black/10 shadow-xl shadow-black/10">
                                            <h2 className="section-heading text-sm text-brand-success mb-2">Premiações:</h2>
                                            {latestResult.premiacoes && latestResult.premiacoes.length > 0 ? (
                                                <table className="w-full border-separate border-spacing-0 text-sm">
                                                    <thead className="sticky top-0 z-10 text-sm text-brand-success bg-linear-to-r from-violet-950 to-fuchsia-700">
                                                        <tr>
                                                            <th className="rounded-t-xl border-b border-slate-200 px-3 py-2 text-left">Descrição</th>
                                                            <th className="rounded-t-xl border-b border-slate-200 px-3 py-2 text-left">Ganhadores</th>
                                                            <th className="rounded-t-xl border-b border-slate-200 px-3 py-2 text-left">Valor do Prêmio</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="text-sm text-white ">
                                                        {latestResult.premiacoes.map((premiacao, index) => (
                                                            <tr key={index}>
                                                                <td className="p-2">{premiacao.descricao}</td>
                                                                <td className="p-2">{premiacao.ganhadores}</td>
                                                                <td className="p-2">R$ {premiacao.valorPremio.toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="text-sm text-slate-700">N/A</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </>
                ) : (
                    <h1>Nenhum resultado disponível.</h1>
                )}
            </section>
        </main>
    );
};

ResultLotofacil.propTypes = {
    onConcursoChange: PropTypes.func.isRequired,
};

export default ResultLotofacil;
