import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiService from "../services/apiServices";


const palindromos = [11, 22];

const AnalisePalindromos = () => {
    const [frequencias, setFrequencias] = useState([]);
    const [frequenciaPorSorteio, setFrequenciaPorSorteio] = useState([]);
    const [juntos, setJuntos] = useState(0);
    const [separados, setSeparados] = useState(0);
    const [error, setError] = useState(null);

    const fetchPalindromosAnalysis = useCallback(async () => {
        try {
            const response = await apiService.getAllResults();
            const sorteiosArray = response.map(item => item.dezenas.map(Number));

            const palindromosFrequency = Array(25).fill(0);
            const palindromosCountPerDraw = Array(16).fill(0); // Máximo de 15 dezenas por sorteio
            let juntosCount = 0;
            let separadosCount = 0;

            sorteiosArray.forEach(dezenas => {
                let count = 0;
                let palindromosNoSorteio = 0;
                dezenas.forEach(num => {
                    if (palindromos.includes(num)) {
                        palindromosFrequency[num - 1] += 1;
                        count += 1;
                        palindromosNoSorteio += 1;
                    }
                });
                palindromosCountPerDraw[count] += 1;
                if (palindromosNoSorteio > 1) {
                    juntosCount += 1;
                } else if (palindromosNoSorteio === 1) {
                    separadosCount += 1;
                }
            });

            setFrequencias(palindromosFrequency);
            setFrequenciaPorSorteio(palindromosCountPerDraw);
            setJuntos(juntosCount);
            setSeparados(separadosCount);

            if (!error) {
                toast.success("Análise de Palíndromos carregada com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao buscar os dados de Palíndromos:", error);
            setError("Erro ao buscar os dados de Palíndromos.");
            toast.error("Erro ao buscar os dados de Palíndromos.");
        }
    }, [error]);

    useEffect(() => {
        fetchPalindromosAnalysis();
    }, [fetchPalindromosAnalysis]);

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Análise de Números Palíndromos</h1>
                    </div>
                    {error && <p>{error}</p>}
                    {frequencias.length > 0 && (
                        <>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            {palindromos.map((num, index) => (
                                                <th key={index}>Dez {num}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {palindromos.map((num, index) => (
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
                                            <th>Quantidade de Dezenas Palíndromos</th>
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

            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Palíndromos Juntos e Separados</h1>
                    </div>
                    {error && <p>{error}</p>}
                    <div className="result-info-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Critério</th>
                                    <th>Frequência</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Juntos</td>
                                    <td>{juntos}</td>
                                </tr>
                                <tr>
                                    <td>Separados</td>
                                    <td>{separados}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AnalisePalindromos;
