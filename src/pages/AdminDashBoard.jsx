// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Imports Css
import '../style/AdminDashBoard.css'

// Imports Componenets
import ResultLatest from "../components/resultLotofacil"
import AnaliseEspelhado from "../components/analiseEspelhados";

// Imports Hooks
import { useProjectionsStats } from '../hooks/useProjectionsStats';

// imports icons and images
import { GrAnalytics } from "react-icons/gr";
import { BsGraphUpArrow } from "react-icons/bs";


const AdminDashBoard = () => {
    const { stats, loading, error } = useProjectionsStats();
    const [hasLoaded, setHasLoaded] = useState(false); // Novo estado para controlar se os dados foram carregados

    useEffect(() => {
        if (!loading && !error && !hasLoaded) {
            toast.success("Dados carregados com sucesso!");
            setHasLoaded(true); // Atualiza o estado para indicar que os dados foram carregados
        }
    }, [loading, error, hasLoaded]);

    // Função auxiliar para formatar números
    const formatNumber = (value) => {
        return value?.toLocaleString("pt-BR") || "0";
    };

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
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Total de Projeções (7P/8I)</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="total-number">
                                <h2>
                                    {loading
                                        ? "Carregando..."
                                        : formatNumber(stats.sevenEvenEightOdd.total)}
                                </h2>
                                {!loading && (
                                    <i><BsGraphUpArrow />
                                        <span>{stats.sevenEvenEightOdd.rate}%</span>
                                    </i>
                                )}
                            </div>
                        </div>
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Total de Projeções (8P/7I)</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="total-number">
                                <h2>
                                    {loading
                                        ? "Carregando..."
                                        : formatNumber(stats.eightEvenSevenOdd.total)}
                                </h2>
                                {!loading && (
                                    <i><BsGraphUpArrow />
                                        <span>{stats.eightEvenSevenOdd.rate}%</span>
                                    </i>
                                )}
                            </div>
                        </div>
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Total de Projeções (6P/9I)</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="total-number">
                                <h2>
                                    {loading
                                        ? "Carregando..."
                                        : formatNumber(stats.sixEvenNineOdd.total)}
                                </h2>
                                {!loading && (
                                    <i><BsGraphUpArrow />
                                        <span>{stats.sixEvenNineOdd.rate}%</span>
                                    </i>
                                )}
                            </div>
                        </div>
                        <div className="grafil-card">
                            <div className="total-text">
                                <span>Total de Projeções</span>
                                <i><GrAnalytics /></i>
                            </div>
                            <div className="total-number">
                                <h2>
                                    {loading
                                        ? "Carregando..."
                                        : formatNumber(stats.totalProjections)}
                                </h2>
                                {!loading && (
                                    <i><BsGraphUpArrow />
                                        <span>100%</span>
                                    </i>
                                )}
                            </div>
                        </div>
                        <AnaliseEspelhado />
                    </div>
                    <section className="Container-dashborder">
                      
                    </section>
                </section>
            </main>
        </>
    )
}

export default AdminDashBoard
