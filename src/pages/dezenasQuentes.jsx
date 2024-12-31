// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";



// Imports Css
import "../style/dezenasQuentes.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";


// Importando o componente de serviço
import apiService from "../services/apiServices";




const DezenasQuentes = () => {
    // Estado para armazenar os resultados
    const [frequencias, setFrequencias] = useState(null);
    const [error, setError] = useState(null);
    const [topQuentes, setTopQuentes] = useState([]);

    // Função para calcular a frequência das dezenas
    const calcularFrequenciaDezenas = (resultados) => {
        const frequencia = Array(25).fill(0); // Array de 25 posições com valores iniciais 0

        resultados.forEach((resultado) => {
            resultado.dezenas.forEach((dezena) => {
                frequencia[dezena - 1] += 1; // Incrementa a posição correspondente
            });
        });

        return frequencia;
    };

    // Função para buscar os resultados e calcular as frequências
    useEffect(() => {
        const fetchResults = async () => {
            const loadingToast = toast.loading("Carregando dados...");
            setError(null);
            try {
                const resultados = await apiService.getAllResults(); // Obtém todos os resultados
                const frequencia = calcularFrequenciaDezenas(resultados); // Calcula a frequência
                setFrequencias(frequencia);

                // Calcula as 5 dezenas mais quentes
                const topQuentesCalculadas = frequencia
                    .map((freq, idx) => ({ dezena: idx + 1, frequencia: freq }))
                    .sort((a, b) => b.frequencia - a.frequencia)
                    .slice(0, 5);

                setTopQuentes(topQuentesCalculadas);

                toast.update(loadingToast, {
                    render: "Dados carregados com sucesso!",
                    type: "success",
                    isLoading: false,
                    autoClose: 3000,
                });
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar os dados.");
                toast.update(loadingToast, {
                    render: "Erro ao carregar os dados!",
                    type: "error",
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        };

        fetchResults();
    }, []);



    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>
                        Dezenas <span>Quentes</span>
                    </h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="Concurso aqui!" />
                    <button>
                        <MdOutlineSearch />
                        Buscar
                    </button>
                </div>
            </section>

            <section className="conteiner-section">
                <div className="title-result-info">
                    <h1>Dezenas e suas frequências de ocorrência</h1>
                </div>
                {error && <p>{error}</p>}
                {frequencias && (
                    <>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        {frequencias.map((_, index) => (
                                            <th key={index}>Dez {index + 1}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {frequencias.map((frequencia, index) => (
                                            <td key={index}>{frequencia}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2>Top 5 Dezenas Mais Quentes</h2>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Posição</th>
                                        <th>Dezena</th>
                                        <th>Frequência</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topQuentes.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td> {/* Posição no ranking */}
                                            <td>Dez {item.dezena}</td> {/* Número da dezena */}
                                            <td>{item.frequencia}</td> {/* Frequência */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
};

export default DezenasQuentes