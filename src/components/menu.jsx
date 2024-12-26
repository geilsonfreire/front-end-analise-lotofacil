// Import Bibliotecas
import { useEffect } from "react";
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Import icon, img assets
import Logo from "../assets/img/logo.png";

// Import CSS
import "../style/menu.css";

// Import icon
import {
    MdSpaceDashboard,
    MdOutlineGridOn
} from "react-icons/md";
import { TbClover } from "react-icons/tb";
import { GrAnalytics } from "react-icons/gr";
import { LuProjector } from "react-icons/lu";

const Menu = () => {

    useEffect(() => {
        const mainMenuLi = document.getElementById("mainMenu").querySelectorAll("li");

        function changeActive() { /* função para mudar a classe active */
            mainMenuLi.forEach(n => n.classList.remove("active")); /* removendo a classe active */
            this.classList.add("active"); /* adicionando a classe active */
        }
        mainMenuLi.forEach((n) => n.addEventListener("click", changeActive)); /* adicionando evento de click */
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
                    to="/result-lotofacil"
                    icon={<MdOutlineGridOn />}
                    title="Resultados"
                />
                <Icon
                    to="/analise-impa-par"
                    icon={<GrAnalytics />}
                    title="Analise Impa / Par"
                />
                <Icon
                    to="/sorteios-nao-realizados"
                    icon={<LuProjector />}
                    title="Sorteios nao realizados"
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
