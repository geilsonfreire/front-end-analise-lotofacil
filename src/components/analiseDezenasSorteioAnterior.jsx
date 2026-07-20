import { useEffect, useMemo, useState } from 'react';
import apiServices from '../services/apiServices';

const normalizeDraw = (item) => {
    const concurso = Number(item?.concurso ?? 0);
    const dezenas = Array.isArray(item?.dezenas)
        ? item.dezenas.map((numero) => Number(numero)).sort((a, b) => a - b)
        : [];

    return { concurso, dezenas };
};

const AnaliseDezenasSorteioAnterior = () => {
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoading(true);
                const resultados = await apiServices.getAllResults();
                const dadosNormalizados = (resultados || [])
                    .map(normalizeDraw)
                    .filter((item) => Number.isFinite(item.concurso) && item.concurso > 0)
                    .sort((a, b) => a.concurso - b.concurso);

                setHistorico(dadosNormalizados);
            } catch (fetchError) {
                console.error('Erro ao carregar os sorteios:', fetchError);
                setError('Não foi possível carregar o histórico da Lotofácil.');
            } finally {
                setLoading(false);
            }
        };

        carregarDados();
    }, []);

    const analise = useMemo(() => {
        if (!historico.length) {
            return { transicoes: [], ranking: [] };
        }

        const transicoes = [];
        const ranking = Array.from({ length: 25 }, (_, index) => ({
            dezena: index + 1,
            vezesNoAnterior: 0,
            repeticoes: 0,
            probabilidade: 0,
        }));

        for (let index = 1; index < historico.length; index += 1) {
            const anterior = historico[index - 1];
            const atual = historico[index];
            const repetidas = atual.dezenas.filter((numero) => anterior.dezenas.includes(numero));

            transicoes.push({
                concurso: atual.concurso,
                concursoAnterior: anterior.concurso,
                dezenasRepetidas: repetidas.sort((a, b) => a - b),
                quantidade: repetidas.length,
            });

            ranking.forEach((item) => {
                const numero = item.dezena;
                if (anterior.dezenas.includes(numero)) {
                    item.vezesNoAnterior += 1;
                    if (atual.dezenas.includes(numero)) {
                        item.repeticoes += 1;
                    }
                }
            });
        }

        ranking.forEach((item) => {
            item.probabilidade = item.vezesNoAnterior > 0
                ? Number(((item.repeticoes / item.vezesNoAnterior) * 100).toFixed(1))
                : 0;
        });

        const rankingOrdenado = [...ranking].sort((a, b) => {
            if (b.probabilidade !== a.probabilidade) {
                return b.probabilidade - a.probabilidade;
            }
            return b.repeticoes - a.repeticoes;
        });

        return { transicoes, ranking: rankingOrdenado };
    }, [historico]);

    return (
        <section className="w-full space-y-6">
            <div className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600">Análise</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Dezenas que repetem em relação ao sorteio anterior</h2>
                <p className="mt-2 text-sm text-slate-600">
                    A análise compara cada concurso com o anterior e monta um ranking das dezenas mais propensas a repetir.
                </p>
            </div>

            {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                    Carregando histórico da Lotofácil...
                </div>
            ) : (
                <>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-5 py-4">
                            <h3 className="text-lg font-bold text-white">Concurso x dezenas repetidas</h3>
                        </div>
                        <div className="max-h-[60vh] overflow-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3">Concurso</th>
                                        <th className="px-4 py-3">Concurso anterior</th>
                                        <th className="px-4 py-3">Dezenas repetidas</th>
                                        <th className="px-4 py-3 text-center">Qtd.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analise.transicoes.map((item) => (
                                        <tr key={item.concurso} className="border-t border-slate-100 text-slate-700 hover:bg-violet-50/70">
                                            <td className="px-4 py-3 font-semibold text-violet-900">{item.concurso}</td>
                                            <td className="px-4 py-3">{item.concursoAnterior}</td>
                                            <td className="px-4 py-3">{item.dezenasRepetidas.length > 0 ? item.dezenasRepetidas.join(' • ') : 'Nenhuma'}</td>
                                            <td className="px-4 py-3 text-center font-semibold">{item.quantidade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-violet-100 bg-slate-50 px-5 py-4">
                            <h3 className="text-lg font-bold text-slate-900">Ranking das 25 dezenas</h3>
                            <p className="mt-1 text-sm text-slate-600">As 9 dezenas com maior chance de repetição em relação ao sorteio anterior aparecem destacadas abaixo.</p>
                        </div>
                        <div className="max-h-[60vh] overflow-auto">
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3">Posição</th>
                                        <th className="px-4 py-3">Dezena</th>
                                        <th className="px-4 py-3 text-center">Repetiu</th>
                                        <th className="px-4 py-3 text-center">Vezes no anterior</th>
                                        <th className="px-4 py-3 text-center">Probabilidade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analise.ranking.slice(0, 9).map((item, index) => (
                                        <tr key={item.dezena} className="border-t border-slate-100 text-slate-700 hover:bg-fuchsia-50/70">
                                            <td className="px-4 py-3 font-semibold text-violet-900">{index + 1}</td>
                                            <td className="px-4 py-3 font-semibold">{item.dezena}</td>
                                            <td className="px-4 py-3 text-center">{item.repeticoes}</td>
                                            <td className="px-4 py-3 text-center">{item.vezesNoAnterior}</td>
                                            <td className="px-4 py-3 text-center font-semibold text-emerald-700">{item.probabilidade}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
};

export default AnaliseDezenasSorteioAnterior;
