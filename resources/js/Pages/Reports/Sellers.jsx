import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, User } from 'lucide-react';

function fmt(n) {
    return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_LABELS = { pending: 'Pendiente', approved: 'Aprobado', delivered: 'Entregado', cancelled: 'Cancelado' };
const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    delivered: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
};

// Random color per seller name (deterministic)
function sellerColor(name = '') {
    const colors = [
        'from-indigo-500 to-blue-400',
        'from-pink-500 to-rose-400',
        'from-emerald-500 to-teal-400',
        'from-amber-500 to-orange-400',
        'from-violet-500 to-purple-400',
        'from-sky-500 to-cyan-400',
    ];
    let hash = 0;
    for (let c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(hash) % colors.length];
}

export default function Sellers({ orders, bySeller, summary, sellers, filters }) {
    const [from,   setFrom  ] = useState(filters?.from    ?? '');
    const [to,     setTo    ] = useState(filters?.to      ?? '');
    const [userId, setUserId] = useState(filters?.user_id ?? '');

    function apply() {
        router.get(route('reports.sellers'), { from, to, user_id: userId || undefined }, { preserveScroll: true });
    }

    const maxTotal = Math.max(...(bySeller ?? []).map(s => Number(s.total)), 1);

    return (
        <DashboardLayout>
            <Head title="Reporte de Vendedor" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link href={route('reports.index')} className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reporte de Vendedor</h1>
                        <p className="text-gray-500 text-sm">Ventas registradas por cada usuario del sistema</p>
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
                    <div>
                        <label className="block text-gray-500 text-xs mb-1">Vendedor</label>
                        <select value={userId} onChange={e => setUserId(e.target.value)}
                            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm">
                            <option value="">Todos</option>
                            {(sellers ?? []).map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={apply}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
                        Aplicar
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Total Ventas', value: `S/ ${fmt(summary?.total)}`, color: 'text-green-600' },
                        { label: 'N° Pedidos',   value: summary?.count ?? 0,         color: 'text-blue-600' },
                    ].map(c => (
                        <div key={c.label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                            <p className="text-gray-500 text-xs">{c.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Per-seller ranking */}
                {bySeller?.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 space-y-4 shadow-sm">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Ranking de Vendedores</h2>
                        <div className="space-y-3">
                            {bySeller.map((s, i) => {
                                const pct = Number(s.total) / maxTotal * 100;
                                const grad = sellerColor(s.seller_name);
                                return (
                                    <div key={s.user_id ?? i} className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-gray-500">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-32 text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {s.seller_name}
                                        </div>
                                        <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-3 rounded-full bg-gradient-to-r ${grad} transition-all duration-700`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="text-right min-w-28">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">S/ {fmt(s.total)}</p>
                                            <p className="text-xs text-gray-400">{s.orders_count} pedidos</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Orders table */}
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Detalle de Pedidos</h2>
                        <span className="text-gray-400 text-sm">{orders?.total ?? 0} resultados</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-700 text-xs uppercase text-gray-500 dark:text-gray-300">
                                <tr>
                                    <th className="px-5 py-3 text-left">N° Pedido</th>
                                    <th className="px-5 py-3 text-left">Vendedor</th>
                                    <th className="px-5 py-3 text-left">Cliente</th>
                                    <th className="px-5 py-3 text-left">Fecha</th>
                                    <th className="px-5 py-3 text-left">Estado</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {orders?.data?.length ? orders.data.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                        <td className="px-5 py-3 font-mono text-gray-900 dark:text-white">{o.code ?? `#${o.id}`}</td>
                                        <td className="px-5 py-3">
                                            <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-200">
                                                <User size={13} className="text-gray-400" />
                                                {o.user?.name ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{o.client?.name ?? '—'}</td>
                                        <td className="px-5 py-3 text-gray-500">{o.created_at?.split('T')[0]}</td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LABELS[o.status] ?? o.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">S/ {fmt(o.total)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Sin resultados para el período.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    {orders?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap border-t border-gray-100 dark:border-slate-700">
                            {orders.links.map((l, i) => (
                                <button key={i} disabled={!l.url}
                                    onClick={() => l.url && router.get(l.url)}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                    className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 disabled:opacity-40'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
