import { useState, useEffect } from 'react';
import { updateUnrealizedDraws } from "../services/projetionService";
import { toast } from "react-toastify";

export const useProjectionsStats = () => {
    const [stats, setStats] = useState({
        sevenEvenEightOdd: { total: 0, rate: 0 },
        eightEvenSevenOdd: { total: 0, rate: 0 },
        sixEvenNineOdd: { total: 0, rate: 0 },
        totalProjections: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProjectionsStats = async () => {
            try {
                setLoading(true);
                const data = await updateUnrealizedDraws();

                if (!isMounted) return;

                const sevenEven = data.filter(p => p.even === 7 && p.odd === 8).length;
                const eightEven = data.filter(p => p.even === 8 && p.odd === 7).length;
                const sixEven = data.filter(p => p.even === 6 && p.odd === 9).length;

                // Calculando o total apenas das 3 projeções específicas
                const totalSpecific = sevenEven + eightEven + sixEven;

                setStats({
                    sevenEvenEightOdd: {
                        total: sevenEven,
                        rate: ((sevenEven / totalSpecific) * 100).toFixed(1) // Reduzido para 1 casa decimal
                    },
                    eightEvenSevenOdd: {
                        total: eightEven,
                        rate: ((eightEven / totalSpecific) * 100).toFixed(1) // Reduzido para 1 casa decimal
                    },
                    sixEvenNineOdd: {
                        total: sixEven,
                        rate: ((sixEven / totalSpecific) * 100).toFixed(1) // Reduzido para 1 casa decimal
                    },
                    totalProjections: totalSpecific // Agora é a soma das 3 projeções específicas
                });
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                    toast.error("Erro ao carregar estatísticas das projeções");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProjectionsStats();

        return () => {
            isMounted = false;
        };
    }, []);

    return { stats, loading, error };
}; 