// Imports Bibliotecas
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


// Imports Css
import "../style/somaSorteios.css";

// Imports de Icones



// Importando o componente
import apiServices from "../services/apiServices";




const SomaSorteios = () => {
    // Estado para armazenar os resultados
    const [sorteios, setSorteios] = useState([]);
    const [somaContagens, setSomaContagens] = useState([]);

    // Função para calcular a soma e contagem
    const calculateSum = (dezenas) => {
        // Converte cada string em número e soma
        const soma = dezenas.reduce((acc, num) => acc + Number(num), 0);
        return soma; // Retorna a soma
    };

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

    useEffect(() => {
        fetchResults(); // Chama a função para buscar os resultados
    }, []);

    useEffect(() => {
        if (sorteios && sorteios.length > 0) {
            const somaMap = {}; // Objeto para armazenar somas e suas contagens

            sorteios.forEach(dezenas => {
                const soma = calculateSum(dezenas); // Calcula a soma para cada sorteio
                somaMap[soma] = (somaMap[soma] || 0) + 1; // Incrementa a contagem da soma
            });

            // Converte o objeto em um array de [soma, contagem]
            const somaContagem = Object.entries(somaMap).map(([soma, contagem]) => ({
                soma: Number(soma),
                contagem
            }));

            // Ordena as somas do menor para o maior
            somaContagem.sort((a, b) => b.contagem - a.contagem);

            setSomaContagens(somaContagem); // Atualiza o estado com as somas e contagens
        } else {
            console.log("Nenhum sorteio disponível para calcular."); // Log se não houver sorteios
        }
    }, [sorteios]);

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
                                        <th>Soma Total</th>
                                        <th>Contagem da Soma</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {somaContagens.length === 0 ? (
                                        <tr>
                                            <td colSpan="2">Nenhum resultado disponível.</td>
                                        </tr>
                                    ) : (
                                        somaContagens.map(({ soma, contagem }, index) => (
                                            <tr key={index}>
                                                <td>{soma}</td>
                                                <td>{contagem}</td>
                                            </tr>
                                        ))
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

export default SomaSorteios