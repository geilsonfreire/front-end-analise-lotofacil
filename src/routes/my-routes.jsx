// Import Bibliotecas
import { Route, Routes } from "react-router-dom";
import { StrictMode } from "react";

// Import Componentes
import Home from '../pages/home.jsx';
import ResultLotofafil from '../pages/resultlotofacil.jsx';
import AdminDashBoard from "../pages/AdminDashBoard.jsx";



const MyRoutes = () => {
    return (
        <StrictMode>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route index  element={<AdminDashBoard />} />
                    <Route path="/adminEstoques" element={<ResultLotofafil />} />
                </Route>
            </Routes>
        </StrictMode>
    );
}

export default MyRoutes;