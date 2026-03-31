import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, DollarSign, CreditCard, Smartphone, Building } from 'lucide-react';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const METHOD_CONFIG = {
    efectivo:      { label: 'Efectivo',        icon: '💵', color: 'from-emerald-500 to-green-400',     text: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-200' },
    yape:          { label: 'Yape',             icon: '📱', color: 'from-violet-500 to-purple-400',     text: 'text-violet-600',   bg: 'bg-violet-50',   border: 'border-violet-200' },
    plin:          { label: 'Plin',             icon: '📲', color: 'from-sky-500 to-blue-400',          text: 'text-sky-600',      bg: 'bg-sky-50',      border: 'border-sky-200' },
    transferencia: { label: 'Transferencia',    icon: '🏦', color: 'from-amber-500 to-yellow-400',      text: 'text-amber-600',    bg: 'bg-amber-50',    border: 'border-amber-200' },
};

function getConfig(method) {
    return METHOD_CONFIG[method?.toLowerCase()] ?? {
        label: method ?? 'Otro', icon: '💳',
        color: 'from-gray-500 to-gray-400',
        text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200',
    };
}

export default function CashByMethod({ rows, grandTotal, daily, filters }) {
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to,   setTo  ] = useState(filters?.to   ?? '');

    function apply() {
        router.get(route('reports.cash-by-method'), { from, to }, { preserveScroll: true });
    }

    // Build simple bar widths
    const maxAmount = useMemo(() => Math.max(...(rows ?? []).map(r => Number(r.total_amount))), [rows]);

    return (
        <DashboardLayout>
            <Head title="Caja por Método de Pago" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={route('reports.index')} className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Caja Negra — Por Método de Pago</h1>
                        <p className="text-gray-500 text-sm">Cuánto ingresó por Yape, Plin, Efectivo y Banco</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <button onClick={apply}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
                        Aplicar
                    </button>
                </div>

                {/* Grand total banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wide">Total Período</p>
                    <p className="text-4xl font-bold mt-1">S/ {fmt(grandTotal)}</p>
                    <p className="text-indigo-200 text-xs mt-2">{filters?.from} → {filters?.to}</p>
                </div>

                {/* Method cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(rows ?? []).map(row => {
                        const cfg = getConfig(row.payment_method);
                        const pct = grandTotal > 0 ? (Number(row.total_amount) / grandTotal * 100) : 0;
                        return (
                            <div key={row.payment_method}
                                className={`bg-white dark:bg-slate-800 rounded-xl border ${cfg.border} dark:border-slate-700 p-5 space-y-3 shadow-sm`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cfg.icon}</span>
                                        <span className={`font-semibold text-sm ${cfg.text} dark:text-gray-200`}>{cfg.label}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{row.total_docs} doc{row.total_docs !== 1 ? 's' : ''}</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">S/ {fmt(row.total_amount)}</p>
                                {/* Bar */}
                                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className={`h-1.5 rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-700`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">{pct.toFixed(1)}% del total</p>
                            </div>
                        );
                    })}
                    {(!rows || rows.length === 0) && (
                        <div className="col-span-4 text-center text-gray-400 py-10">
                            Sin comprobantes en el período seleccionado.
                        </div>
                    )}
                </div>

                {/* Detail table */}
                {rows && rows.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                            <h2 className="font-semibold text-gray-900 dark:text-white">Resumen por Método</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-slate-700 text-xs uppercase text-gray-500 dark:text-gray-300">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Método</th>
                                        <th className="px-5 py-3 text-right">Comprobantes</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3 text-right">% del Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {rows.map(row => {
                                        const cfg = getConfig(row.payment_method);
                                        const pct = grandTotal > 0 ? (Number(row.total_amount) / grandTotal * 100) : 0;
                                        return (
                                            <tr key={row.payment_method} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                                <td className="px-5 py-3">
                                                    <span className="flex items-center gap-2">
                                                        <span>{cfg.icon}</span>
                                                        <span className={`font-medium ${cfg.text} dark:text-gray-200`}>{cfg.label}</span>
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right text-gray-700 dark:text-gray-300">{row.total_docs}</td>
                                                <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">S/ {fmt(row.total_amount)}</td>
                                                <td className="px-5 py-3 text-right text-gray-500">{pct.toFixed(1)}%</td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-gray-50 dark:bg-slate-700 font-bold">
                                        <td className="px-5 py-3 text-gray-900 dark:text-white">TOTAL</td>
                                        <td className="px-5 py-3 text-right text-gray-900 dark:text-white">{rows.reduce((s, r) => s + Number(r.total_docs), 0)}</td>
                                        <td className="px-5 py-3 text-right text-indigo-600 dark:text-indigo-400">S/ {fmt(grandTotal)}</td>
                                        <td className="px-5 py-3 text-right text-gray-500">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
