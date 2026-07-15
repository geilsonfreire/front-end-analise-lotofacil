// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Imports Css


// Imports de Icones

// Importando o componente
import apiServices from "../services/apiServices";

const initialConjuntosSoma = {
    "7 ímpares / 8 pares": {},
    "8 ímpares / 7 pares": {},
    "6 pares / 9 ímpares": {}
};

const SomaSorteios = () => {
    const [analysis, setAnalysis] = useState({
        somaContagens: [],
        conjuntosSoma: initialConjuntosSoma
    });

    const { somaContagens, conjuntosSoma } = analysis;

    // Função para calcular a soma e contagem
    const calculateSum = (dezenas) => dezenas.reduce((acc, num) => acc + Number(num), 0);

    useEffect(() => {
        let isMounted = true;

        const loadResults = async () => {
            try {
                const response = await apiServices.getAllResults();
                const sorteiosArray = response.map(item => item.dezenas.map(Number));

                const somaMap = {};
                const conjuntos = {
                    "7 ímpares / 8 pares": {},
                    "8 ímpares / 7 pares": {},
                    "6 pares / 9 ímpares": {}
                };

                sorteiosArray.forEach(dezenas => {
                    const soma = calculateSum(dezenas);
                    somaMap[soma] = (somaMap[soma] || 0) + 1;

                    const pares = dezenas.filter(num => num % 2 === 0).length;
                    const impares = dezenas.length - pares;

                    if (pares === 8 && impares === 7) {
                        conjuntos["7 ímpares / 8 pares"][soma] = (conjuntos["7 ímpares / 8 pares"][soma] || 0) + 1;
                    } else if (pares === 7 && impares === 8) {
                        conjuntos["8 ímpares / 7 pares"][soma] = (conjuntos["8 ímpares / 7 pares"][soma] || 0) + 1;
                    } else if (pares === 6 && impares === 9) {
                        conjuntos["6 pares / 9 ímpares"][soma] = (conjuntos["6 pares / 9 ímpares"][soma] || 0) + 1;
                    }
                });

                const somaContagem = Object.entries(somaMap)
                    .map(([soma, contagem]) => ({
                        soma: Number(soma),
                        contagem
                    }))
                    .sort((a, b) => b.contagem - a.contagem);

                if (isMounted) {
                    setAnalysis({
                        somaContagens: somaContagem,
                        conjuntosSoma: conjuntos
                    });
                }

                toast.success("Resultados carregados com sucesso!");
            } catch (error) {
                console.error("Erro ao buscar os resultados:", error);
                toast.error("Erro ao buscar os resultados.");
            }
        };

        void loadResults();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Análise da soma da dezenas de todos os concursos</h1>
                    </div>
                    <>
                        <div className="result-info-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Soma Sorteio já ocorrido</th>
                                        <th>Contagem da Soma sorteios já ocorridos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {somaContagens.length === 0 ? (
                                        <tr>
                                            <td colSpan="5">Nenhum resultado disponível.</td>
                                        </tr>
                                    ) : (
                                        somaContagens.map(({ soma, contagem }, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td>{soma}</td>
                                                    <td>{contagem}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                </div>
            </section>

            {Object.entries(conjuntosSoma).map(([conjunto, somas], index) => (
                <section className="conteiner-section" key={index}>
                    <div className="box-shadown">
                        <div className="title-result-info">
                            <h1>Somas dos Sorteios - {conjunto}</h1>
                        </div>
                        <>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Soma das Dezenas</th>
                                            <th>Contagem das Somas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(somas)
                                            .sort((a, b) => b[1] - a[1]) // Ordena pela contagem em ordem decrescente
                                            .map(([soma, contagem], subIndex) => (
                                                <tr key={subIndex}>
                                                    <td>{soma}</td>
                                                    <td>{contagem}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    </div>
                </section>
            ))}
        </main>
    );
};

export default SomaSorteios;