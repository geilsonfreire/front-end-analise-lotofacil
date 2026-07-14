// Imports Bibiotecas
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types';

//Import icon, image
import { MdSettings, MdLogout, MdPersonAddAlt1 } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";

// Import de Componentes



const MenuDropDownPerfil = ({ isDropdownOpen, setIsDropdownOpen }) => {
    const navigate = useNavigate();

    const handleNavigate = (path) => { 
        setIsDropdownOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        navigate('/'); // Redireciona para a página inicial após logout
    };

    return (
        <div className={`container-menu-dropdown fixed right-5 top-16 z-50 w-60 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 transition ${isDropdownOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'}`}>
            <nav>
                <ul className="space-y-1">
                    <li className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-800" onClick={() => handleNavigate('/admin/perfil')}>
                        <FaUserEdit />
                        <span>Perfil</span>
                    </li>
                    <li className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-800" onClick={() => handleNavigate('/admin/adminCadastroUsuarios')}>
                        <MdPersonAddAlt1 />
                        <span>Adicionar usuario</span>
                    </li>
                    <li className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-violet-800" onClick={() => handleNavigate('/admin/adminConfig')}>
                        <MdSettings />
                        <span>Configurações</span>
                    </li>
                    <hr className="my-2 border-slate-100" />
                    <li className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50" onClick={handleLogout}>
                        <MdLogout />
                        <span>Sair</span>
                    </li>
            </ul>
        </nav>
        </div >
    )
}

MenuDropDownPerfil.propTypes = {
    isDropdownOpen: PropTypes.bool.isRequired,
    setIsDropdownOpen: PropTypes.func.isRequired,
};

export default MenuDropDownPerfil
