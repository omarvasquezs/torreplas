import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const STATUS_LABELS = { pending:'Pendiente', received:'Recibido', cancelled:'Cancelado' };
const STATUS_COLORS = { pending:'bg-yellow-500/20 text-yellow-400', received:'bg-green-500/20 text-green-400', cancelled:'bg-red-500/20 text-red-400' };

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

export default function ReportsPurchases({ orders, summary, filters }) {
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to,   setTo  ] = useState(filters?.to   ?? '');

    function apply() {
        router.get(route('reports.purchases'), { from, to }, { preserveScroll: true });
    }

    return (
        <DashboardLayout>
            <Head title="Reporte de Compras" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('reports.index')}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Reporte de Compras</h1>
                        <p className="text-gray-400 text-sm">Órdenes de compra por período</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <button onClick={apply}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        Aplicar
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label:'Total Compras', value:`S/ ${fmt(summary?.total)}`,   color:'text-blue-400'   },
                        { label:'Órdenes',        value: summary?.count ?? 0,          color:'text-indigo-400' },
                        { label:'Recibido',       value:`S/ ${fmt(summary?.received)}`,color:'text-green-400'  },
                    ].map(c => (
                        <div key={c.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                            <p className="text-gray-400 text-xs">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <h2 className="text-white font-semibold">Detalle de Órdenes de Compra</h2>
                        <span className="text-gray-400 text-sm">{orders?.total ?? 0} resultados</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">N° OC</th>
                                    <th className="text-left p-3">Proveedor</th>
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-left p-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.data?.length ? orders.data.map(o => (
                                    <tr key={o.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                        <td className="p-3 text-indigo-400">#{o.id}</td>
                                        <td className="p-3 text-gray-300">{o.supplier?.name ?? '—'}</td>
                                        <td className="p-3 text-gray-300">{o.created_at?.split('T')[0]}</td>
                                        <td className="p-3 text-right font-mono text-white">S/ {fmt(o.total)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[o.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                                                {STATUS_LABELS[o.status] ?? o.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Sin resultados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {orders?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap">
                            {orders.links.map((l, i) => (
                                <button key={i} disabled={!l.url}
                                    onClick={() => l.url && router.get(l.url)}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                    className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40'}`} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
