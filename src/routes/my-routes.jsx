// Import Bibliotecas
import { Route, Routes } from "react-router-dom";
import { StrictMode } from "react";

// Import Componentes
import Home from '../pages/home.jsx';
import AdminProducts from "../pages/adminProducts.jsx";
import AdminDashBoard from "../pages/AdminDashBoard.jsx";



const MyRoutes = () => {
    return (
        <StrictMode>
            <Routes>
                <Route path="/" element={<Home />}>
                    <Route index  element={<AdminDashBoard />} />
                    <Route path="/adminEstoques" element={<AdminProducts />} />
                </Route>
            </Routes>
        </StrictMode>
    );
}

export default MyRoutes;