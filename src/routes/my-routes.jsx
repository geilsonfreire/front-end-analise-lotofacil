// Import Bibliotecas
import { Route, Routes } from "react-router-dom";
import { StrictMode } from "react";

// Import Componentes
import Home from '../pages/home.jsx';
import AdminDashBoard from "../pages/AdminDashBoard.jsx";
import MeusJogos from '../pages/meus-jogos.jsx';
import AnaliseImpaPar from '../pages/analiseImparPar.jsx';
import DezenasQuentes from "../pages/dezenasQuentes.jsx";
import SomaSorteios from "../pages/somaSorteio.jsx";
import AnaliseClusters from "../pages/analiseClusters.jsx";
import AnaliseFibonacci from "../pages/analiseFibonacci.jsx";
import AnalisePalindromos from "../pages/analisePalindromos.jsx";

const MyRoutes = () => {
    return (
        <StrictMode>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route index  element={<AdminDashBoard />} />
                    <Route path="/meus-jogos" element={<MeusJogos />} />
                    <Route path="/analise-impa-par" element={<AnaliseImpaPar />} />
                    <Route path="/dezenas-quentes" element={<DezenasQuentes />} />
                    <Route path="/soma-sorteios" element={<SomaSorteios />} />
                    <Route path="/analise-clusters" element={<AnaliseClusters />} />
                    <Route path="/analise-fibonacci" element={<AnaliseFibonacci />} />
                    <Route path="/analise-palindromos" element={<AnalisePalindromos />} />
                </Route>
            </Routes>
        </StrictMode>
    );
}

export default MyRoutes;