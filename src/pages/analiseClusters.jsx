import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import apiServices from "../services/apiServices";
import "../style/somaSorteios.css";

// Função para calcular a distância euclidiana
const euclideanDistance = (a, b) => {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
};

// Função para encontrar o centroide mais próximo
const findClosestCentroid = (point, centroids) => {
    let minDistance = Infinity;
    let closestIndex = -1;
    centroids.forEach((centroid, index) => {
        const distance = euclideanDistance(point, centroid);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });
    return closestIndex;
};

// Implementação do algoritmo k-means
const kmeans = (data, k) => {
    const centroids = data.slice(0, k);
    let clusters = Array.from({ length: k }, () => []);
    let hasChanged = true;

    while (hasChanged) {
        clusters = Array.from({ length: k }, () => []);
        data.forEach(point => {
            const closestIndex = findClosestCentroid(point, centroids);
            clusters[closestIndex].push(point);
        });

        hasChanged = false;
        clusters.forEach((cluster, index) => {
            const newCentroid = cluster[0].map((_, i) => {
                return cluster.reduce((sum, point) => sum + point[i], 0) / cluster.length;
            });
            if (!newCentroid.every((val, i) => val === centroids[index][i])) {
                centroids[index] = newCentroid;
                hasChanged = true;
            }
        });
    }

    return { clusters };
};

const AnaliseClusters = () => {
    const [clusterRelevante, setClusterRelevante] = useState([]);
    const [error, setError] = useState(null);

    const fetchClusters = useCallback(async () => {
        try {
            const response = await apiServices.getAllResults();
            const sorteiosArray = response.map(item => item.dezenas.map(Number));

            // Converta os sorteios para um formato adequado para k-means
            const data = sorteiosArray.map(dezenas => dezenas);

            // Execute o algoritmo k-means
            const result = kmeans(data, 5); // 5 clusters, ajuste conforme necessário

            // Selecionar o cluster mais relevante (o maior cluster)
            const clusterMaisRelevante = result.clusters.reduce((prev, current) => (prev.length > current.length ? prev : current), []);

            setClusterRelevante(clusterMaisRelevante);

            if (!error) {
                toast.success("Cluster mais relevante carregado com sucesso!");
            }
        } catch (error) {
            console.error("Erro ao buscar os clusters:", error);
            setError("Erro ao buscar os clusters.");
            toast.error("Erro ao buscar os clusters.");
        }
    }, [error]);

    useEffect(() => {
        fetchClusters();
    }, [fetchClusters]);

    return (
        <main className="Container-Geral">
            <section className="conteiner-section">
                <div className="box-shadown">
                    <div className="title-result-info">
                        <h1>Análise de Clusters</h1>
                    </div>
                    {error && <p>{error}</p>}
                    {clusterRelevante.length > 0 && (
                        <>
                            <h2>Cluster Mais Relevante</h2>
                            <div className="result-info-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Dezenas</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clusterRelevante.map((dezenas, index) => (
                                            <tr key={index}>
                                                <td>{dezenas.join(", ")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AnaliseClusters;
