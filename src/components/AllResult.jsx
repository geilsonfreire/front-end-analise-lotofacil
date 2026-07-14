import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsInfoCircle } from 'react-icons/bs';
import apiService from '../services/apiServices';

const AllResult = () => {
    const [resultados, setResultados] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setResultados(await apiService.getAllResults());
            } catch (fetchError) {
                console.error('Erro ao buscar os resultados:', fetchError);
                setError('Erro ao buscar os resultados.');
            }
        };
        fetchResults();
    }, []);

    const calcularSoma = (dezenas) => dezenas.reduce((acc, num) => acc + Number(num), 0);
    const contarImpares = (dezenas) => dezenas.filter((num) => num % 2 !== 0).length;
    const contarPares = (dezenas) => dezenas.filter((num) => num % 2 === 0).length;

    return (
        <section className="w-full">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-violet-100 bg-linear-to-r from-violet-950 to-fuchsia-700 px-5 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-fuchsia-200">Histórico</p>
                    <h2 className="mt-1 text-lg font-bold text-white">Todos os resultados</h2>
                </div>
                {error && <p className="m-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{error}</p>}
                {resultados.length > 0 && (
                    <div className="max-h-[60vh] overflow-auto p-3">
                        <table className="w-full border-separate border-spacing-0 text-sm">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <th className="rounded-t-xl bg-slate-50 px-3 py-2" colSpan="5">
                                        <div className="flex justify-end gap-2">
                                    <Link className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100" to="/soma-sorteios"><BsInfoCircle /> Soma</Link>
                                    <Link className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100" to="/analise-impa-par"><BsInfoCircle /> Ímpar / Par</Link>
                                        </div>
                                    </th></tr>
                                <tr className="bg-violet-950 text-left text-[11px] font-bold uppercase tracking-wider text-violet-100">
                                    <th className="px-4 py-3">Concurso</th><th className="px-4 py-3">Dezenas</th><th className="px-4 py-3 text-center">Soma</th><th className="px-4 py-3 text-center">Ímpares</th><th className="px-4 py-3 text-center">Pares</th>
                                </tr>
                            </thead>
                            <tbody>{resultados.map((resultado, index) => (
                                <tr className="border-b border-slate-100 text-slate-600 transition hover:bg-violet-50/70" key={index}>
                                    <td className="px-4 py-3 font-semibold tabular-nums text-violet-900">{resultado.concurso}</td><td className="px-4 py-3 font-medium tracking-wide text-slate-700">{resultado.dezenas.join(', ')}</td><td className="px-4 py-3 text-center font-semibold tabular-nums">{calcularSoma(resultado.dezenas)}</td><td className="px-4 py-3 text-center tabular-nums">{contarImpares(resultado.dezenas)}</td><td className="px-4 py-3 text-center tabular-nums">{contarPares(resultado.dezenas)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
};

export default AllResult;
