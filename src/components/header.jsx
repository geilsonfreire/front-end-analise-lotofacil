// Import Bibliotecas
import { useState, useEffect } from "react";

// Import components
import MenuDropDownPerfil from "../components/MenuDropDownPerfil";


// Imports icons e imagens
import LogoPerfil from "../assets/img/Ge.jpg";
import Banner from "../assets/img/banner.png";
import {
    MdNotifications,
    MdArrowCircleDown,
    MdArrowCircleUp,
    MdMenu
} from "react-icons/md";

const Header = ({ onToggleMenu }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(PrevState => !PrevState);
    }; // Alterna o estado de aberto/fechado do dropdown   

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Verifica se o clique está fora do dropdown e do botão de abrir/fechar
            if (
                !event.target.closest('.menu-dropdow') &&
                !event.target.closest('.container-menu-dropdown')
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    return (
        <header className="Header-painel sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-xl">
            {/* <!-- Header Left --> */}
            <img className="h-9 w-auto object-contain sm:h-11" src={Banner} alt="Lotofácil" />

            {/* <!-- Header Right --> */}
            <div className="header-right flex items-center gap-3 sm:gap-5">

                <button
                    type="button"
                    className="grid h-10 w-10 items-center justify-center rounded-xl text-xl text-violet-700 transition hover:bg-violet-50 hover:text-fuchsia-600 sm:hidden"
                    onClick={onToggleMenu}
                >
                    <MdMenu />
                </button>

                <div className="hidden sm:block">
                    <div className="flex items-center gap-3">
                        <img className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-100" src={LogoPerfil} alt="User Profile" />
                        <span className="text-sm font-semibold text-slate-700">
                            Geilson Freire
                        </span>
                    </div>
                </div>

                <div className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-xl text-violet-700 transition hover:bg-violet-50 hover:text-fuchsia-600">
                    <i className="not-italic">
                        <MdNotifications />
                    </i>
                    <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">6</span>
                </div>

                <div className="menu-dropdow grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-xl text-violet-700 transition hover:bg-violet-50 hover:text-fuchsia-600"
                    onClick={toggleDropdown}

                >
                    <i className="not-italic">
                        {isDropdownOpen ? <MdArrowCircleUp /> : <MdArrowCircleDown />}
                    </i>
                </div>
                {isDropdownOpen && (
                    <MenuDropDownPerfil
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}

                    />
                )}
            </div>
        </header>
    );
};

export default Header;
