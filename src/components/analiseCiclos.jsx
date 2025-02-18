import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiService from "../services/apiServices";

const AnaliseCiclos = () => {
    const [ciclos, setCiclos] = useState([]);

    useEffect(() => {
        // Função para buscar os resultados da Lotofácil
        const fetchResults = async () => {
            try {
                // Salva a resposta da API na variável response
                const response = await apiService.getAllResults();
                // Verifica se a resposta é um array
                if (Array.isArray(response)) {
                    // Ordena os concursos do mais antigo para o mais recente
                    const dadosOrdenados = response.sort((a, b) => a.concurso - b.concurso);
                    // Processa os ciclos de dezenas
                    processarCiclos(dadosOrdenados);
                } else {
                    console.warn("Os dados recebidos não são um array:", response);
                }
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
                toast.error("Erro ao carregar os resultados da Lotofácil.");
            }
        };
        // Chama a função fetchResults
        fetchResults();
    }, []);

    // Função para processar os ciclos de dezenas
    const processarCiclos = (dados) => {
        // Array para armazenar os ciclos calculados inicialmente vazio
        let ciclosCalculados = [];
        // Objeto para armazenar o ciclo atual
        let cicloAtual = {
            numero: 1,
            concursos: [],
            dezenasAusentes: new Set([...Array(25).keys()].map(i => (i + 1).toString().padStart(2, '0')))
        };
        // Loop para percorrer os dados dos concursos
        for (let i = 0; i < dados.length; i++) {
            // Salva o concurso atual na variável concurso
            const concurso = dados[i];
            // Cria um conjunto com as dezenas sorteadas
            const dezenasSorteadas = new Set(concurso.dezenas || []);
            // Adiciona o concurso atual ao ciclo atual
            cicloAtual.concursos.push({
                ...concurso,
                dezenasAusentes: new Set([...cicloAtual.dezenasAusentes].filter(d => !dezenasSorteadas.has(d)))
            });
            // Atualiza o conjunto de dezenas ausentes
            cicloAtual.dezenasAusentes = new Set([...cicloAtual.dezenasAusentes].filter(d => !dezenasSorteadas.has(d)));
            // Verifica se o ciclo atual não tem dezenas ausentes
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
        // Verifica se o ciclo atual tem concursos
        if (cicloAtual.concursos.length > 0) {
            cicloAtual.duracao = cicloAtual.concursos.length;
            ciclosCalculados.push({ ...cicloAtual });
        }
        // Atualiza o estado ciclos com os ciclos calculados
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