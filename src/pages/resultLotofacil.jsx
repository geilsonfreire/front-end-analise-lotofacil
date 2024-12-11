// Imports Bibliotecas
// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// Imports Css
import "../style/resultLotofacil.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";


// Importando o componente



const ResultLotofacil = () => {

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>Result -<span> Lotofácil</span></h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="Concurso aqui!" />
                    <button>
                        <MdOutlineSearch />
                        Buscar
                    </button>
                </div>
            </section>

        </main >
    );
};

export default ResultLotofacil