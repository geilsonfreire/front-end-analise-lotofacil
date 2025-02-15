import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiService from "../services/apiServices";

const AnaliseCiclos = () => {
    const [ciclos, setCiclos] = useState([]);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await apiService.getAllResults();

                if (Array.isArray(response)) {
                    // Ordena os concursos do mais antigo para o mais recente
                    const dadosOrdenados = response.sort((a, b) => a.concurso - b.concurso);
                    processarCiclos(dadosOrdenados);
                } else {
                    console.warn("Os dados recebidos não são um array:", response);
                }
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
                toast.error("Erro ao carregar os resultados da Lotofácil.");
            }
        };

        fetchResults();
    }, []);

    const processarCiclos = (dados) => {
        let ciclosCalculados = [];
        let cicloAtual = {
            numero: 1,
            concursos: [],
            dezenasAusentes: new Set([...Array(25).keys()].map(i => (i + 1).toString().padStart(2, '0')))
        };

        for (let i = 0; i < dados.length; i++) {
            const concurso = dados[i];
            const dezenasSorteadas = new Set(concurso.dezenas || []);

            cicloAtual.concursos.push({
                ...concurso,
                dezenasAusentes: new Set([...cicloAtual.dezenasAusentes].filter(d => !dezenasSorteadas.has(d)))
            });

            cicloAtual.dezenasAusentes = new Set([...cicloAtual.dezenasAusentes].filter(d => !dezenasSorteadas.has(d)));

            if (cicloAtual.dezenasAusentes.size === 0) {
                cicloAtual.duracao = cicloAtual.concursos.length;
                ciclosCalculados.push({ ...cicloAtual });

                cicloAtual = {
                    numero: cicloAtual.numero + 1,
                    concursos: [],
                    dezenasAusentes: new Set([...Array(25).keys()].map(i => (i + 1).toString().padStart(2, '0')))
                };
            }
        }

        if (cicloAtual.concursos.length > 0) {
            cicloAtual.duracao = cicloAtual.concursos.length;
            ciclosCalculados.push({ ...cicloAtual });
        }
        setCiclos(ciclosCalculados);
    };

    return (
        <main className="Container-Geral">
            <div className="box-shadown">
                <div className="title-result-info">
                    <h1>Análise dos Ciclos de Dezenas</h1>
                </div>

                <div className="result-info-table scroll-y">
                    <table>
                        <thead>
                            <tr>
                                <th>Concurso</th>
                                <th>Ciclo</th>
                                <th>Duração do Ciclo</th>
                                <th>Dezenas Ausentes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ciclos.length === 0 ? (
                                <tr>
                                    <td colSpan="4">Nenhum dado disponível</td>
                                </tr>
                            ) : (
                                ciclos.map((ciclo) =>
                                    ciclo.concursos.map((concurso, idx) => (
                                        <tr key={`${ciclo.numero}-${concurso.concurso}`}>
                                            <td>{concurso.concurso}</td>
                                            <td className={idx === 0 ? "ciclo-highlight" : ""}>
                                                {idx === 0 ? ciclo.numero : ""}
                                            </td>
                                            <td className={idx === ciclo.concursos.length - 1 ? "duracao-highlight" : ""}>
                                                {idx === ciclo.concursos.length - 1 ? ciclo.duracao : ""}
                                            </td>
                                            <td>
                                                {[...concurso.dezenasAusentes]
                                                    .sort((a, b) => a - b)
                                                    .join(", ")}
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
};

export default AnaliseCiclos;