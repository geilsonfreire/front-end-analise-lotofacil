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
            <section className="latest-result">
                <h1>Ultimo Resultado <span>Data: { }</span></h1>
                <div className="latest-result-value">
                    <div className="data-result-latest">
                        <h2>Concurso - <span>{ }</span></h2>
                        <h2>Ganhadores - <span>{ }</span></h2>
                        <h2>Local Dos Ganhadores - <span>{ }</span></h2>
                        <h2>Acumulou - <span>{ }</span></h2>
                    </div>
                    <div className="dezenas">
                        <span>01</span>
                        <span>02</span>
                        <span>03</span>
                        <span>04</span>
                        <span>05</span>
                        <span>06</span>
                        <span>07</span>
                        <span>08</span>
                        <span>09</span>
                        <span>10</span>
                        <span>11</span>
                        <span>12</span>
                        <span>13</span>
                        <span>14</span>
                        <span>15</span>
                    </div>
                </div>

            </section>

        </main >
    );
};

export default ResultLotofacil