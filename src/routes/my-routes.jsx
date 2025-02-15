// Import Bibliotecas
import { Route, Routes } from "react-router-dom";
import { StrictMode } from "react";

// Import Componentes
import Home from '../pages/home.jsx';
import AdminDashBoard from "../pages/AdminDashBoard.jsx";
import MeusJogos from '../pages/meus-jogos.jsx';
import AnaliseImpaPar from '../components/analiseImparPar.jsx';
import DezenasQuentes from "../components/dezenasQuentes.jsx";
import SomaSorteios from "../components/somaSorteio.jsx";
import AnaliseClusters from "../pages/analiseClusters.jsx";
import AnaliseFibonacci from "../components/analiseFibonacci.jsx";
import AnalisePalindromos from "../components/analisePalindromos.jsx";
import AnaliseCiclos from "../components/analiseCiclos.jsx";

const MyRoutes = () => {
    return (
        <StrictMode>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route index element={<AdminDashBoard />} />
                    <Route path="/meus-jogos" element={<MeusJogos />} />
                    <Route path="/analise-impa-par" element={<AnaliseImpaPar />} />
                    <Route path="/dezenas-quentes" element={<DezenasQuentes />} />
                    <Route path="/soma-sorteios" element={<SomaSorteios />} />
                    <Route path="/analise-clusters" element={<AnaliseClusters />} />
                    <Route path="/analise-fibonacci" element={<AnaliseFibonacci />} />
                    <Route path="/analise-palindromos" element={<AnalisePalindromos />} />
                    <Route path="/analise-ciclos" element={<AnaliseCiclos />} />
                </Route>
            </Routes>
        </StrictMode>
    );
}

export default MyRoutes;