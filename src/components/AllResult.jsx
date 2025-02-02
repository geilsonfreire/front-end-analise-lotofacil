import { useEffect, useState } from 'react';
import apiService from "../services/apiServices";
import { Link } from 'react-router-dom';

// Import Css
import '../style/AllResult.css';

import { BsInfoCircle } from "react-icons/bs";

const AllResult = () => {
    const [resultados, setResultados] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await apiService.getAllResults();
                setResultados(response);
            } catch (error) {
                console.error("Erro ao buscar os resultados:", error);
                setError("Erro ao buscar os resultados.");
            }
        };

        fetchResults();
    }, []);

    const calcularSoma = (dezenas) => dezenas.reduce((acc, num) => acc + Number(num), 0);
    const contarImpares = (dezenas) => dezenas.filter(num => num % 2 !== 0).length;
    const contarPares = (dezenas) => dezenas.filter(num => num % 2 === 0).length;

    return (
        <section className="conteiner-section">
            <div className="box-shadown">
                <div className="title-result-info">
                    <h1>Todos os Resultados</h1>
                </div>
                {error && <p>{error}</p>}
                {resultados.length > 0 && (
                    <div className="result-info-table scroll-y">
                        <table>
                            <thead>
                                <div className="info">
                                    <Link to="/soma-sorteios" > 
                                        <BsInfoCircle /> SOMAS
                                    </Link>
                                    <Link to="/analise-impa-par" > 
                                        <BsInfoCircle /> IMPAR / PAR
                                    </Link>
                                </div>

                                <tr>
                                    <th>Concurso</th>
                                    <th>Dezenas</th>
                                    <th>Soma</th>
                                    <th>Ímpares</th>
                                    <th>Pares</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.map((resultado, index) => (
                                    <tr key={index}>
                                        <td>{resultado.concurso}</td>
                                        <td>{resultado.dezenas.join(', ')}</td>
                                        <td>{calcularSoma(resultado.dezenas)}</td>
                                        <td>{contarImpares(resultado.dezenas)}</td>
                                        <td>{contarPares(resultado.dezenas)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllResult;
