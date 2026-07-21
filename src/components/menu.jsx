// Import Bibliotecas
import { useEffect } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Import icon, img assets
import Logo from "../assets/img/logo.png";

// Import icon
import { MdSpaceDashboard } from "react-icons/md";
import { TbClover } from "react-icons/tb";
import { GrAnalytics } from "react-icons/gr";
import { RiBarChart2Fill } from "react-icons/ri";

const Menu = ({ isOpen, onClose }) => {

    useEffect(() => {
        const mainMenuLi = document.getElementById("mainMenu").querySelectorAll("li");

        const changeActive = (event) => {
            mainMenuLi.forEach(n => n.classList.remove("active"));
            event.currentTarget.classList.add("active");
        };

        mainMenuLi.forEach(n => n.addEventListener("click", changeActive));

        return () => {
            mainMenuLi.forEach(n => n.removeEventListener("click", changeActive));
        };
    }, []);

    return (
        <>
            <div className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 sm:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <nav className={`group fixed left-0 top-0 z-40 flex h-full w-[10vw] min-w-18 max-w-22.5 flex-col overflow-y-auto rounded-r-3xl border-r border-fuchsia-400/20 bg-linear-to-b from-violet-950 via-purple-900 to-fuchsia-900 py-5 shadow-2xl shadow-violet-950/25 transition-transform duration-300 sm:sticky sm:top-0 sm:h-screen sm:w-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 sm:flex`}>
                <div className="flex items-center justify-between px-3 sm:justify-center">
                    <Link to="/">
                        <img className="w-12 rounded-full ring-1 ring-white/30 transition duration-300 hover:scale-105 hover:ring-white/80" src={Logo} alt="Logo da pagina" />
                    </Link>
                    <button type="button" className="sm:hidden rounded-xl bg-white/10 px-3 py-2 text-white transition hover:bg-white/20" onClick={onClose}>
                        Fechar
                    </button>
                </div>

                <ul id="mainMenu" className="mt-10 flex w-full flex-col gap-2 px-2">
                    <Icon
                        to="/"
                        icon={<MdSpaceDashboard />}
                        title="DashBoard"
                        onClick={onClose}
                    />
                
                    <Icon
                        to="/analise-clusters"
                        icon={<GrAnalytics />}
                        title="Analise Clusters"
                        onClick={onClose}
                    />
                   
                    <Icon
                        to="/analise-dezenas-sorteio-anterior"
                        icon={<RiBarChart2Fill />}
                        title="Dezenas Repetidas"
                        onClick={onClose}
                    />

                    <Icon
                        to="/meus-jogos"
                        icon={<TbClover />}
                        title="Meus Jogos"
                        onClick={onClose}
                    />   
                </ul>
            </nav>
        </>
    )
}

const Icon = ({ to, icon, title, onClick }) => ( // Icon component
    <li>
        <Link className="flex items-center gap-3 rounded-xl px-4 py-3 text-xl text-violet-100 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300" to={to} title={title} onClick={onClick} >
            <span className="text-2xl text-violet-100">{icon}</span>
            <span className="hidden sm:inline w-full overflow-hidden whitespace-nowrap text-sm font-medium tracking-wide transition-all duration-300">{title}</span>
        </Link>
    </li>
);

Menu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

Icon.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

export default Menu
