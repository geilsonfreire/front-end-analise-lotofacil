import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import apiServices from "../services/apiServices";

const Espelhados = () => {
    const [espelhados, setEspelhados] = useState([]);
    const [error, setError] = useState(null);

    const fetchEspelhados = useCallback(async () => {
        try {
            const response = await apiServices.getAllResults();
            const sorteiosArray = response.map(item => item.dezenas.map(Number));

            const espelhadosMap = new Map();

            sorteiosArray.forEach(dezenas => {
                dezenas.forEach(num => {
                    const espelhado = parseInt(num.toString().split('').reverse().join(''), 10);
                    if (num !== espelhado && dezenas.includes(espelhado)) {
                        const key = [num, espelhado].sort().join('-');
                        if (!espelhadosMap.has(key)) {
                            espelhadosMap.set(key, 0);
                        }
                        espelhadosMap.set(key, espelhadosMap.get(key) + 1);
                    }
                });
            });

            const espelhadosList = Array.from(espelhadosMap.entries()).map(([key, count]) => ({
                numeros: key.split('-').map(Number),
                count
            }));

            // Ordenar por frequência e pegar os 10 mais relevantes
            const top10Espelhados = espelhadosList.sort((a, b) => b.count - a.count).slice(0, 10);

            setEspelhados(top10Espelhados);

            if (!error) {
                toast.success("Análise dos números espelhados mais relevantes carregada com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao buscar os números espelhados:", error);
            setError("Erro ao buscar os números espelhados.");
            toast.error("Erro ao buscar os números espelhados.");
        }
    }, [error]);

    useEffect(() => {
        fetchEspelhados();
    }, [fetchEspelhados]);

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
                    {error && <p>{error}</p>}
                    {espelhados.length > 0 && (
                        <>
                            <h2>Top Números Espelhados</h2>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Números</th>
                                            <th>Frequência</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {espelhados.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.numeros.join(" e ")}</td>
                                                <td>{item.count}</td>
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

export default Espelhados;
