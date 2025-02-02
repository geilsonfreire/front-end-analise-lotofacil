// Imports Bibliotecas
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

// Imports Css
import '../style/AdminDashBoard.css'

// Imports Componenets
import ResultLatest from "../components/resultLatest";
import AllResult from "../components/AllResult";
import AnaliseEspelhado from "../components/analiseEspelhados";


// Imports Hooks
import { useProjectionsStats } from '../hooks/useProjectionsStats';
import apiService from "../services/apiServices";

// imports icons and images
import { GrAnalytics } from "react-icons/gr";
import { BsInfoCircle } from "react-icons/bs";

const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];

const AdminDashBoard = () => {
    const { loading, error } = useProjectionsStats();
    const [hasLoaded, setHasLoaded] = useState(false);
    const [frequencias, setFrequencias] = useState([]);
    const [fibonacciError, setFibonacciError] = useState(null);
    const [palindromoFrequencias, setPalindromoFrequencias] = useState([]);
    const [palindromoError, setPalindromoError] = useState(null);
    const [quentes, setQuentes] = useState([]);
    const [frias, setFrias] = useState([]);
    const [quentesFriasError, setQuentesFriasError] = useState(null);
    const [atrasos, setAtrasos] = useState([]);
    const [atrasosError, setAtrasosError] = useState(null);

    const palindromoNumbers = useMemo(() => [11, 22], []);


    useEffect(() => {
        if (!loading && !error && !hasLoaded) {
            toast.success("Dados carregados com sucesso!");
            setHasLoaded(true);
        }
    }, [loading, error, hasLoaded]);

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

                setFrequencias(fibonacciFrequency);
                if (!fibonacciError) {
                    toast.success("Análise de Fibonacci carregada com sucesso!");
                }
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

                setPalindromoFrequencias(palindromoFrequency);
                if (!palindromoError) {
                    toast.success("Análise de Palíndromos carregada com sucesso!");
                }
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


    // Renderiza mensagem de erro
    if (error) {
        return <div className="error-message">Erro ao carregar dados: {error}</div>;
    }

    return (
        <>
            <main>
                <div className="Title">
                    <h1>Dash<span>Board</span></h1>
                </div>

                <section className='Container-dashborder'>
                    <ResultLatest />
                    <div className='grafil-cards'>

                        {/* Card de Números Fibonacci */}
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Nº Fibonacci</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="result-info-table">
                                {fibonacciError && <p>{fibonacciError}</p>}
                                {frequencias.length > 0 && (
                                    <table>
                                        <thead>
                                            <tr>
                                                {fibonacciNumbers.map((num, index) => (
                                                    <th key={index}>Dez {num}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                {fibonacciNumbers.map((num, index) => (
                                                    <td key={index}>{frequencias[num - 1]}</td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="more-details">
                                <Link to="/analise-fibonacci">
                                    <BsInfoCircle /> Mais detalhes
                                </Link>
                            </div>
                        </div>

                        {/* Card de Números Palíndromos */}
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Nº Palíndromos</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Dezena</th>
                                            <th>Frequência</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {palindromoNumbers.map((num, index) => (
                                            <tr key={index}>
                                                <td>{num}</td>
                                                <td>{palindromoFrequencias[num - 1]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="more-details">
                                <Link to="/analise-palindromos">
                                    <BsInfoCircle /> Mais detalhes
                                </Link>
                            </div>
                        </div>

                        {/* Card de Dezenas Quentes e Frias */}
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Dez Quentes e Frias</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="result-info-table">
                                {quentesFriasError && <p>{quentesFriasError}</p>}
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Quentes</th>
                                            <th>QNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quentes.map(({ num, freq }, index) => (
                                            <tr key={index}>
                                                <td>{num}</td>
                                                <td>{freq}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Frias</th>
                                            <th>QNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {frias.map(({ num, freq }, index) => (
                                            <tr key={index}>
                                                <td>{num}</td>
                                                <td>{freq}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="more-details">
                                <Link to="/dezenas-quentes">
                                    <BsInfoCircle /> Mais detalhes
                                </Link>
                            </div>
                        </div>

                        {/* Card de Atrasos */}
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Maiores Atrasos</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="result-info-table">
                                {atrasosError && <p>{atrasosError}</p>}
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Dezena</th>
                                            <th>Atraso Atual</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {atrasos.map(({ num, atraso }, index) => (
                                            <tr key={index}>
                                                <td>{num}</td>
                                                <td>{atraso}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="more-details">
                                <Link href="/dezenas-quentes">
                                    <BsInfoCircle /> Mais detalhes
                                </Link>
                            </div>
                        </div>

                        {/*Dezenas Espelhadas */}
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Dezenas Espelhadas</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <AnaliseEspelhado />
                        </div>

                    </div>
                    <section className="Container-dashborder">
                        <div className="grafil-cards1">
                            <div className="grafil-card">
                                <AllResult />
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </>
    )
}

export default AdminDashBoard
