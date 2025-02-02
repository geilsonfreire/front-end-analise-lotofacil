// Import Bibliotecas
import { useEffect } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Import icon, img assets
import Logo from "../assets/img/logo.png";

// Import CSS
import "../style/menu.css";

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
        <nav className="Menu-lateral">
            <Link to="/">
                <img src={Logo} alt="Logo da pagina" />
            </Link>

            <ul id="mainMenu">
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
        <Link to={to} title={title} onClick={onClick} >
            {icon}
            <span className="icon-text">{title}</span>
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
