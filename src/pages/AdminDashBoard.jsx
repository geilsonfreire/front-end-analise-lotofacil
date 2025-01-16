// Immports Bibliotecas

// Imports Css
import '../style/AdminDashBoard.css'

// Imports Componenets
import ResultLatest from "../components/resultLotofacil"
import DezenasQuents from "../components/dezenasQuentes"
import { useProjectionsStats } from '../hooks/useProjectionsStats';
import SomaSorteios from '../components/somaSorteio';

// imports icons and images
import { GrAnalytics } from "react-icons/gr";
import { BsGraphUpArrow } from "react-icons/bs";


const AdminDashBoard = () => {
    const { stats, loading, error } = useProjectionsStats();

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
                    </div>
                    <ResultLatest />
                </section>


                <section className='Apexcharts'>
                    <div className="container-charts">
                        <DezenasQuents />
                        <SomaSorteios />
                    </div>

                </section>



            </main>
        </>
    )
}

export default AdminDashBoard
