import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from "../services/apiServices";


const fibonacciNumbers = [1, 2, 3, 5, 8, 13, 21];

const AnaliseFibonacci = () => {
    const [frequencias, setFrequencias] = useState([]);
    const [frequenciaPorSorteio, setFrequenciaPorSorteio] = useState([]);
    const [error, setError] = useState(null);

    const fetchFibonacciAnalysis = useCallback(async () => {
        try {
            const response = await apiService.getAllResults();
            const sorteiosArray = response.map(item => item.dezenas.map(Number));

            const fibonacciFrequency = Array(25).fill(0);
            const fibonacciCountPerDraw = Array(16).fill(0); // Máximo de 15 dezenas por sorteio

            sorteiosArray.forEach(dezenas => {
                let count = 0;
                dezenas.forEach(num => {
                    if (fibonacciNumbers.includes(num)) {
                        fibonacciFrequency[num - 1] += 1;
                        count += 1;
                    }
                });
                fibonacciCountPerDraw[count] += 1;
            });

            setFrequencias(fibonacciFrequency);
            setFrequenciaPorSorteio(fibonacciCountPerDraw);

            if (!error) {
                toast.success("Análise de Fibonacci carregada com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao buscar os dados de Fibonacci:", error);
            setError("Erro ao buscar os dados de Fibonacci.");
            toast.error("Erro ao buscar os dados de Fibonacci.");
        }
    }, [error]);

    useEffect(() => {
        fetchFibonacciAnalysis();
    }, [fetchFibonacciAnalysis]);

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Análise de Números Fibonacci</h1>
                    </div>
                    {error && <p>{error}</p>}
                    {frequencias.length > 0 && (
                        <>
                            <div className="result-info-table">
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
                            </div>
                        </>
                    )}
                </div>
            </section>

            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Análise de Frequência</h1>
                    </div>
                    {error && <p>{error}</p>}
                    {frequenciaPorSorteio.length > 0 && (
                        <>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Quantidade de Dezenas Fibonacci</th>
                                            <th>Frequência</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {frequenciaPorSorteio.map((freq, index) => (
                                            <tr key={index}>
                                                <td>{index}</td>
                                                <td>{freq}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AnaliseFibonacci;
