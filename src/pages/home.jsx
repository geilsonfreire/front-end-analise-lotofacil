// Import Bibliotecas
import { Outlet } from 'react-router-dom';

// Import Images


// Import Components
import Menu from "../components/menu";
import Header from "../components/header";


const Home = () => {
    // Renderiza o componente jsx
    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <div className="shrink-0">
                <Menu />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                <Header />
                <main id='Fund' className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Home;
