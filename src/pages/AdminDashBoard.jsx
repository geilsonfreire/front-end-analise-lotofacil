// Imports Bibliotecas
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

// Imports Componenets
import ResultLatest from "../components/resultLatest";
import AllResult from "../components/AllResult";
import AnaliseCiclos from "../components/analiseCiclos";


// Imports Hooks

import apiService from "../services/apiServices";

// imports icons and images
import { BsInfoCircle } from "react-icons/bs";

const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];

const AdminDashBoard = () => {


    const [fibonacciError, setFibonacciError] = useState(null);
    const [palindromoError, setPalindromoError] = useState(null);
    const [quentes, setQuentes] = useState([]);
    const [frias, setFrias] = useState([]);
    const [quentesFriasError, setQuentesFriasError] = useState(null);
    const [atrasos, setAtrasos] = useState([]);
    const [atrasosError, setAtrasosError] = useState(null);

    const palindromoNumbers = useMemo(() => [11, 22], []);

    const handleConcursoChange = (newConcurso) => {
        console.log("Concurso changed to:", newConcurso);
    };

    useEffect(() => {
        const fetchFibonacciAnalysis = async () => {
            try {
                const response = await apiService.getAllResults();
                const sorteiosArray = response.map(item => item.dezenas.map(Number));

                const fibonacciFrequency = Array(25).fill(0);

                sorteiosArray.forEach(dezenas => {
                    dezenas.forEach(num => {
                        if (fibonacciNumbers.includes(num)) {
                            fibonacciFrequency[num - 1] += 1;
                        }
                    });
                });
            } catch (error) {
                console.error("Erro ao buscar os dados de Fibonacci:", error);
                setFibonacciError("Erro ao buscar os dados de Fibonacci.");
                toast.error("Erro ao buscar os dados de Fibonacci.");
            }
        };

        fetchFibonacciAnalysis();
    }, [fibonacciError]);

    useEffect(() => {
        const fetchPalindromoAnalysis = async () => {
            try {
                const response = await apiService.getAllResults();
                const sorteiosArray = response.map(item => item.dezenas.map(Number));

                const palindromoFrequency = Array(25).fill(0);

                sorteiosArray.forEach(dezenas => {
                    dezenas.forEach(num => {
                        if (palindromoNumbers.includes(num)) {
                            palindromoFrequency[num - 1] += 1;
                        }
                    });
                });
            } catch (error) {
                console.error("Erro ao buscar os dados de Palíndromos:", error);
                setPalindromoError("Erro ao buscar os dados de Palíndromos.");
                toast.error("Erro ao buscar os dados de Palíndromos.");
            }
        };

        fetchPalindromoAnalysis();
    }, [palindromoError, palindromoNumbers]);

    useEffect(() => {
        const fetchQuentesFrias = async () => {
            try {
                const response = await apiService.getAllResults();
                const sorteiosArray = response.map(item => item.dezenas.map(Number));

                const frequency = Array(25).fill(0);

                sorteiosArray.forEach(dezenas => {
                    dezenas.forEach(num => {
                        frequency[num - 1] += 1;
                    });
                });

                const sortedFrequency = frequency
                    .map((freq, index) => ({ num: index + 1, freq }))
                    .sort((a, b) => b.freq - a.freq);

                setQuentes(sortedFrequency.slice(0, 3));
                setFrias(sortedFrequency.slice(-3));
                if (!quentesFriasError) {
                    toast.success("Análise de Dezenas Quentes e Frias carregada com sucesso!");
                }
            } catch (error) {
                console.error("Erro ao buscar os dados de Dezenas Quentes e Frias:", error);
                setQuentesFriasError("Erro ao buscar os dados de Dezenas Quentes e Frias.");
                toast.error("Erro ao buscar os dados de Dezenas Quentes e Frias.");
            }
        };

        fetchQuentesFrias();
    }, [quentesFriasError]);

    useEffect(() => {
        const fetchAtrasos = async () => {
            try {
                const response = await apiService.getAllResults();
                const sorteiosArray = response.map(item => item.dezenas.map(Number));

                const lastAppearance = Array(25).fill(-1);
                const currentAtrasos = Array(25).fill(0);

                sorteiosArray.forEach((dezenas, index) => {
                    dezenas.forEach(num => {
                        const numIndex = num - 1;
                        lastAppearance[numIndex] = index;
                    });
                });

                lastAppearance.forEach((lastIndex, numIndex) => {
                    if (lastIndex !== -1) {
                        currentAtrasos[numIndex] = sorteiosArray.length - lastIndex - 1;
                    }
                });

                const sortedAtrasos = currentAtrasos
                    .map((atraso, index) => ({ num: index + 1, atraso }))
                    .sort((a, b) => b.atraso - a.atraso)
                    .slice(0, 4);

                setAtrasos(sortedAtrasos);
                if (!atrasosError) {
                    toast.success("Análise de Atrasos carregada com sucesso!");
                }
            } catch (error) {
                console.error("Erro ao buscar os dados de Atrasos:", error);
                setAtrasosError("Erro ao buscar os dados de Atrasos.");
                toast.error("Erro ao buscar os dados de Atrasos.");
            }
        };

        fetchAtrasos();
    }, [atrasosError]);



    return (
        <>
            <main className="w-full p-0">
                <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Visão geral</p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Dash<span className="text-fuchsia-600">board</span></h1>
                </div>

                <section className='w-full overflow-hidden flex flex-col gap-8'>
                    <ResultLatest onConcursoChange={handleConcursoChange} />
                    <div className="flex w-full gap-5 rounded-2xl border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-2 py-2">

                        {/* Card de Dezenas Quentes e Frias */}
                        <div className="p-2 flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-violet-100 rounded-t-2xl bg-linear-to-r from-violet-950 to-fuchsia-700 px-4 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                                <h2 className="mt-1 text-lg font-bold text-white">Dez Quentes e Frias</h2>
                            </div>
                            <div className="max-h-[60vh] overflow-auto mt-4 grid gap-2 sm:grid-cols-2">
                                {quentesFriasError && <p>{quentesFriasError}</p>}
                                <table className="w-full border-separate border-spacing-0 text-sm border-2 border-slate-200 rounded-2xl">
                                    <thead className="text-left sticky top-0 z-10">
                                        <tr className="text-violet-950">
                                            <th className="rounded-t-xl bg-slate-50 px-3 py-2">QUENTE</th>
                                            <th className="rounded-t-xl bg-slate-50 px-3 py-2">QNT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                                        {quentes.map(({ num, freq }, index) => (
                                            <tr key={index}>
                                                <td className="rounded-t-xl bg-slate-50 px-3 py-2">{num}</td>
                                                <td className="rounded-t-xl bg-slate-50 px-3 py-2">{freq}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <table className="w-full border-separate border-spacing-0 text-sm border-2 border-slate-200 rounded-2xl">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="text-violet-950 border">
                                            <th className="rounded-t-xl bg-slate-50 px-3 py-2">FRIAS</th>
                                            <th className="rounded-t-xl bg-slate-50 px-3 py-2">QNT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                                        {frias.map(({ num, freq }, index) => (
                                            <tr key={index}>
                                                <td className="rounded-t-xl bg-slate-50 px-3 py-2">{num}</td>
                                                <td className="rounded-t-xl bg-slate-50 px-3 py-2">{freq}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-5">
                                <Link className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-fuchsia-600" to="/dezenas-quentes">
                                    <BsInfoCircle /> Mais detalhes
                                </Link>
                            </div>
                        </div>

                        {/* Card de Atrasos */}
                        <div className="p-2 flex w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-violet-100 rounded-t-2xl bg-linear-to-r from-violet-950 to-fuchsia-700 px-4 py-2">
                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                                <h2 className="mt-1 text-lg font-bold text-white">Maiores Atrasos</h2>
                            </div>
                            <div className="max-h-[60vh] overflow-auto mt-4">
                                {atrasosError && <p>{atrasosError}</p>}
                                <table className="w-full border-separate border-spacing-0 text-sm border-2 border-slate-200 rounded-2xl">
                                    <thead className="text-left sticky top-0 z-10">
                                        <tr className="text-violet-950">
                                            <th className="rounded-t-xl bg-slate-50 px-3 py-2">Dezena</th>
                                            <th className="rounded-t-xl bg-slate-50 px-3 py-2">Atraso Atual</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                                        {atrasos.map(({ num, atraso }, index) => (
                                            <tr key={index}>
                                                <td className="rounded-t-xl bg-slate-50 px-3 py-2">{num}</td>
                                                <td className="rounded-t-xl bg-slate-50 px-3 py-2">{atraso}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-5">
                                <Link className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-fuchsia-600" to="/dezenas-quentes">
                                    <BsInfoCircle /> Mais detalhes
                                </Link>
                            </div>
                        </div>

                    </div>
                    <section className="space-y-6">
                        <AllResult />
                        <AnaliseCiclos />
                    </section>
                </section>
            </main>
        </>
    )
}

export default AdminDashBoard
