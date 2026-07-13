// Imports Bibliotecas
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";

// Imports Css
import '../style/AdminDashBoard.css'

// Imports Componenets
import ResultLatest from "../components/resultLatest";
import AllResult from "../components/AllResult";
import AnaliseCiclos from "../components/analiseCiclos";


// Imports Hooks

import apiService from "../services/apiServices";

// imports icons and images
import { GrAnalytics } from "react-icons/gr";
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
            <main>
                <div className="Title">
                    <h1>Dash<span>Board</span></h1>
                </div>

                <section className='Container-dashborder'>
                    <ResultLatest onConcursoChange={handleConcursoChange} />
                    <div className='grafil-cards'>

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

                    </div>
                    <section className="Container-dashborder">
                        <div className="grafil-cards1">
                            <div className="grafil-card">
                                <AllResult />
                                <AnaliseCiclos />
                            </div>
                            <div className="grafil-card">
                            </div>
                        </div>
                    </section>
                </section>
            </main>
        </>
    )
}

export default AdminDashBoard
