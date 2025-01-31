// Imports Bibliotecas
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

// Imports Css


// Imports de Icones

// Importando o componente
import apiServices from "../services/apiServices";

const SomaSorteios = () => {
    // Estado para armazenar os resultados
    const [sorteios, setSorteios] = useState([]);
    const [somaContagens, setSomaContagens] = useState([]);

    // Função para calcular a soma e contagem
    const calculateSum = (dezenas) => dezenas.reduce((acc, num) => acc + Number(num), 0);

    // Função para buscar os resultados da API
    const fetchResults = async () => {
        try {
            const response = await apiServices.getAllResults();
            // Filtra as dezenas de cada concurso e mantém cada sorteio em um array
            const sorteiosArray = response.map(item => item.dezenas.map(Number)); // Extrai as dezenas de cada sorteio

            setSorteios(sorteiosArray); // Define o array de sorteios
            toast.success("Resultados carregados com sucesso!");
        } catch (error) {
            console.error("Erro ao buscar os resultados:", error);
            toast.error("Erro ao buscar os resultados.");
        }
    };

    // Função para calcular as somas possíveis
    const calculatePossibleSums = useCallback(() => {
        const totalGames = 3268760; // Total de jogos possíveis na Lotofácil
        const possibleSums = {}; // Objeto para armazenar somas e suas contagens

        for (let i = 0; i < totalGames; i++) {
            const dezenas = Array.from({ length: 15 }, () => Math.floor(Math.random() * 25) + 1);
            const soma = calculateSum(dezenas);
            possibleSums[soma] = (possibleSums[soma] || 0) + 1;
        }

    }, []);

    useEffect(() => {
        fetchResults(); // Chama a função para buscar os resultados
    }, []);

    useEffect(() => {
        if (sorteios.length > 0) {
            const somaMap = {}; // Objeto para armazenar somas e suas contagens

            sorteios.forEach(dezenas => {
                const soma = calculateSum(dezenas); // Calcula a soma para cada sorteio
                somaMap[soma] = (somaMap[soma] || 0) + 1; // Incrementa a contagem da soma
            });

            // Converte o objeto em um array de [soma, contagem]
            const somaContagem = Object.entries(somaMap).map(([soma, contagem]) => ({
                soma: Number(soma),
                contagem
            })).sort((a, b) => b.contagem - a.contagem);

            setSomaContagens(somaContagem); // Atualiza o estado com as somas e contagens
        }
    }, [sorteios]);

    useEffect(() => {
        calculatePossibleSums(); // Chama a função para calcular as somas possíveis
    }, [calculatePossibleSums]);

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
        </main>
    );
};

export default SomaSorteios;