// Import Bibliotecas
import { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Import Images


// Import Components
import Menu from "../components/menu";
import Header from "../components/header";


const Home = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleToggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            <Menu isOpen={isMenuOpen} onClose={closeMenu} />
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
                <Header onToggleMenu={handleToggleMenu} />
                <main id='Fund' className="flex-1 p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Home;
