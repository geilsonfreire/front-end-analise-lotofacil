// Import Bibliotecas
import { Route, Routes } from "react-router-dom";
import { StrictMode } from "react";

// Import Componentes
import Home from '../pages/home.jsx';
import AdminDashBoard from "../pages/AdminDashBoard.jsx";
import ResultLotofafil from '../pages/resultlotofacil.jsx';
import MeusJogos from '../pages/meus-jogos.jsx';



const MyRoutes = () => {
    return (
        <StrictMode>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route index  element={<AdminDashBoard />} />
                    <Route path="/result-lotofacil" element={<ResultLotofafil />} />
                    <Route path="/meus-jogos" element={<MeusJogos />} />
                </Route>
            </Routes>
        </StrictMode>
    );
}

export default MyRoutes;