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

const Menu = () => {

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
        <nav className="group sticky top-0 flex h-screen w-20 flex-col overflow-y-auto rounded-r-3xl border-r border-fuchsia-400/20 bg-linear-to-b from-violet-950 via-purple-900 to-fuchsia-900 py-5 shadow-2xl shadow-violet-950/25 transition-[width] duration-300 hover:w-60">
            <Link to="/">
                <img className="ml-4 w-12 rounded-full ring-1 ring-white/30 transition duration-300 hover:scale-105 hover:ring-white/80" src={Logo} alt="Logo da pagina" />
            </Link>

            <ul id="mainMenu" className="mt-10 flex w-full flex-col gap-2 px-2">
                <Icon
                    to="/"
                    icon={<MdSpaceDashboard />}
                    title="DashBoard"
                />
            
                <Icon
                    to="/analise-clusters"
                    icon={<GrAnalytics />}
                    title="Analise Clusters"
                />
               
                <Icon
                    to="/meus-jogos"
                    icon={<TbClover />}
                    title="Meus Jogos"
                />   
            </ul>
        </nav>
    )
}

const Icon = ({ to, icon, title, onClick }) => ( // Icon component
    <li>
        <Link className="flex items-center gap-4 rounded-xl px-4 py-3 text-xl text-violet-100 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300" to={to} title={title} onClick={onClick} >
            {icon}
            <span className="w-0 overflow-hidden whitespace-nowrap text-sm font-medium tracking-wide opacity-0 transition-all duration-300 group-hover:w-36 group-hover:opacity-100">{title}</span>
        </Link>
    </li>
);

Icon.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

export default Menu
