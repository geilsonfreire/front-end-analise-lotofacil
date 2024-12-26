// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Imports Css
import "../style/projetSorteios.css";

// Imports de Icones
import { MdOutlineSearch } from "react-icons/md";

// Importando o componente
import { updateUnrealizedDraws } from "../services/projetionService";

const Projetions = () => {
    // Estado para armazenar as projeções filtradas
    const [sevenEvenEightOdd, setSevenEvenEightOdd] = useState([]);
    const [eightEvenSevenOdd, setEightEvenSevenOdd] = useState([]);
    const [sixEvenNineOdd, setSixEvenNineOdd] = useState([]);

    // Controle de carregamento (páginas)
    const [visibleSevenEvenEightOdd, setVisibleSevenEvenEightOdd] = useState([]);
    const [visibleEightEvenSevenOdd, setVisibleEightEvenSevenOdd] = useState([]);
    const [visibleSixEvenNineOdd, setVisibleSixEvenNineOdd] = useState([]);

    const rowsPerPage = 50;

    // Atualiza as projeções e realiza a filtragem inicial
    useEffect(() => {
        const fetchData = async () => {
            toast.info("Carregando projeções...", { autoClose: 3000 });
            try {
                const data = await updateUnrealizedDraws();

                // Filtros
                const sevenEven = data.filter((p) => p.even === 7 && p.odd === 8);
                const eightEven = data.filter((p) => p.even === 8 && p.odd === 7);
                const sixEven = data.filter((p) => p.even === 6 && p.odd === 9);

                setSevenEvenEightOdd(sevenEven);
                setEightEvenSevenOdd(eightEven);
                setSixEvenNineOdd(sixEven);

                // Inicia com o primeiro lote visível
                setVisibleSevenEvenEightOdd(sevenEven.slice(0, rowsPerPage));
                setVisibleEightEvenSevenOdd(eightEven.slice(0, rowsPerPage));
                setVisibleSixEvenNineOdd(sixEven.slice(0, rowsPerPage));

                toast.success("Projeções carregadas com sucesso!");
            } catch (error) {
                toast.error("Erro ao carregar as projeções.");
                console.error(error);
            }
        };

        fetchData();
    }, []);

    // Função para carregar mais dados de uma categoria
    const loadMore = (type) => {
        if (type === "sevenEvenEightOdd") {
            setVisibleSevenEvenEightOdd((prev) =>
                sevenEvenEightOdd.slice(0, prev.length + rowsPerPage)
            );
        } else if (type === "eightEvenSevenOdd") {
            setVisibleEightEvenSevenOdd((prev) =>
                eightEvenSevenOdd.slice(0, prev.length + rowsPerPage)
            );
        } else if (type === "sixEvenNineOdd") {
            setVisibleSixEvenNineOdd((prev) =>
                sixEvenNineOdd.slice(0, prev.length + rowsPerPage)
            );
        }
    };

    // Função para renderizar uma seção de resultados
    const renderSection = (title, data, visibleData, type) => (
        <section className="analise-result">
            <div className="latest-result-info-header">
                <h1>{title}</h1>
            </div>

            <div className="possibility-result-info-body projecoes">
                {data && data.length > 0 ? (
                    <>
                        <div className="projecoes-possiveis">
                            <h3>
                                Projeções não realizadas:{" "}
                                <span>{data.length.toLocaleString("pt-BR")}</span>
                            </h3>
                        </div>
                        <table className="projections-table">
                            <thead>
                                <tr>
                                    <th>Dezenas</th>
                                    <th>Pares</th>
                                    <th>Ímpares</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleData.map((projection, index) => (
                                    <tr key={index}>
                                        <td>{projection.dezenas.join(", ")}</td>
                                        <td>{projection.even}</td>
                                        <td>{projection.odd}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleData.length < data.length && (
                            <button
                                className="load-more-button"
                                onClick={() => loadMore(type)}
                            >
                                Carregar Mais
                            </button>
                        )}
                    </>
                ) : (
                    <span>Estamos recalculando e carregando os dados de análise.</span>
                )}
            </div>
        </section>
    );

    return (
        <main className="Container-Geral">
            <section className="header-filter">
                <div className="Title">
                    <h1>
                        Sorteio -<span> Não Realizado</span>
                    </h1>
                </div>
                <div className="search">
                    <input type="text" placeholder="Concurso aqui!" />
                    <button>
                        <MdOutlineSearch />
                        Buscar
                    </button>
                </div>
            </section>

            {renderSection(
                "Projeção de sorteios não realizados com 7 Pares e 8 Ímpares",
                sevenEvenEightOdd,
                visibleSevenEvenEightOdd,
                "sevenEvenEightOdd"
            )}
            {renderSection(
                "Projeção de sorteios não realizados com 8 Pares e 7 Ímpares",
                eightEvenSevenOdd,
                visibleEightEvenSevenOdd,
                "eightEvenSevenOdd"
            )}
            {renderSection(
                "Projeção de sorteios não realizados com 6 Pares e 9 Ímpares",
                sixEvenNineOdd,
                visibleSixEvenNineOdd,
                "sixEvenNineOdd"
            )}
        </main>
    );
};

export default Projetions;