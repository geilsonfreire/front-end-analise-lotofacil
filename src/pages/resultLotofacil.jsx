// Imports Bibliotecas
import {useEffect, useState} from "react";
import {toast} from "react-toastify";

// Imports Css
import "../style/resultLotofacil.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";


// Importando o componente
import { getLatestCombinedResults } from "../services/apiServices";


const ResultLotofacil = () => {
    // Estado para armazenar os resultados
    const [latestResult, setLatestResult] = useState(null); 
    const [loading, setLoading] = useState(true);

    // Função para buscar o último resultado
    const fetchLatestResult = async () => {
        setLoading(true); // Inicia o carregamento
        try {
            const data = await getLatestCombinedResults(); // Faz a requisição
            if (data && data.status === "success" && data.data.length > 0) {
                const latest = data.data[data.data.length - 1]; // Pega o último item do array
                setLatestResult(latest); // Define no estado
            } else {
                toast.warn("Nenhum resultado encontrado.");
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                toast.error("A requisição demorou demais. Tente novamente mais tarde.");
            } else {
                toast.error("Erro ao carregar os dados.");
            }
            console.error("Erro ao carregar o último resultado:", error);
        } finally {
            setLoading(false); // Finaliza o carregamento
        }
    };

    // useEffect - Carrega os dados ao montar o componente
    useEffect(() => {
        fetchLatestResult();
    }, []);


    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Result -<span> Lotofácil</span></h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="Concurso aqui!" />
                    <button>
                        <MdOutlineSearch />
                        Buscar
                    </button>
                </div>
            </section>
            <section className="latest-result">
                {loading ? (
                    <h1>Carregando...</h1> // Exibe enquanto carrega
                ) : latestResult ? (
                    <>
                        <h1>
                            Último Resultado <span>Data: {latestResult.data_concurso || "N/A"}</span>
                        </h1>
                        <div className="latest-result-value">
                            <div className="data-result-latest">
                                <h2>Concurso - <span>{latestResult.concurso || "N/A"}</span></h2>
                                <h2>Ganhadores - <span>{latestResult.ganhadores || "N/A"}</span></h2>
                                <h2>Local Dos Ganhadores - <span>{latestResult.local_ganhadores || "N/A"}</span></h2>
                                <h2>Acumulou - <span>{latestResult.acumulou ? "Sim" : "Não"}</span></h2>
                            </div>
                            <div className="dezenas">
                                {latestResult.dezenas && latestResult.dezenas.length > 0 ? (
                                    latestResult.dezenas.map((dezena, index) => (
                                        <span key={index}>{dezena}</span>
                                    ))
                                ) : (
                                    <span>N/A</span> // Caso não haja dezenas
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <h1>Nenhum resultado disponível.</h1> // Caso não haja dados
                )}
            </section>

        </main >
    );
};

export default ResultLotofacil