import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft, Download, Printer } from 'lucide-react';

const STATUS_LABELS = { pending:'Pendiente', paid:'Pagado', cancelled:'Cancelado' };
const STATUS_COLORS = { pending:'bg-yellow-500/20 text-yellow-400', paid:'bg-green-500/20 text-green-400', cancelled:'bg-red-500/20 text-red-400' };

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

export default function ReportsSales({ orders, summary, byClient, filters }) {
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to,   setTo  ] = useState(filters?.to   ?? '');

    function apply() {
        router.get(route('reports.sales'), { from, to }, { preserveScroll: true });
    }

    return (
        <DashboardLayout>
            <Head title="Reporte de Ventas" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href={route('reports.index')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Reporte de Ventas</h1>
                        <p className="text-gray-600 text-sm">Análisis de ventas por período</p>
                    </div>
                    <a href={`${route('reports.sales.export')}?from=${from}&to=${to}`}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">
                        <Download size={15}/> CSV
                    </a>
                    <button onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                        <Printer size={15}/> Imprimir
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <button onClick={apply}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        Aplicar
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label:'Total Ventas', value:`S/ ${fmt(summary?.total)}`,       color:'text-green-400' },
                        { label:'Pedidos',       value: summary?.count ?? 0,             color:'text-blue-400'  },
                        { label:'Cobrado',        value:`S/ ${fmt(summary?.paid)}`,       color:'text-indigo-400'},
                        { label:'Pendiente',      value:`S/ ${fmt(summary?.pending)}`,    color:'text-yellow-400'},
                    ].map(c => (
                        <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4">
                            <p className="text-gray-600 text-xs">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                        </div>
                    ))}
                </div>

                {/* Orders table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-white font-semibold">Detalle de Pedidos</h2>
                        <span className="text-gray-600 text-sm">{orders?.total ?? 0} resultados</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-600">
                                    <th className="text-left p-3">N° Pedido</th>
                                    <th className="text-left p-3">Cliente</th>
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-left p-3">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.data?.length ? orders.data.map(o => (
                                    <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3">
                                            <Link href={route('orders.show', o.id)}
                                                className="text-indigo-400 hover:underline">
                                                #{o.order_number ?? o.id}
                                            </Link>
                                        </td>
                                        <td className="p-3 text-gray-700">{o.client?.name ?? '—'}</td>
                                        <td className="p-3 text-gray-700">{o.created_at?.split('T')[0]}</td>
                                        <td className="p-3 text-right font-mono text-white">S/ {fmt(o.total)}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[o.status] ?? 'bg-gray-500/20 text-gray-600'}`}>
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
                    {/* Pagination */}
                    {orders?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap">
                            {orders.links.map((l, i) => (
                                <button key={i} disabled={!l.url}
                                    onClick={() => l.url && router.get(l.url)}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                    className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-600 disabled:opacity-40'}`} />
                            ))}
                        </div>
                    )}
                </div>

                {/* By client */}
                {byClient?.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-white font-semibold">Ventas por Cliente</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-gray-600">
                                        <th className="text-left p-3">Cliente</th>
                                        <th className="text-right p-3">Pedidos</th>
                                        <th className="text-right p-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {byClient.map(c => (
                                        <tr key={c.client_id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 text-gray-700">{c.client_name}</td>
                                            <td className="p-3 text-right text-gray-700">{c.orders_count}</td>
                                            <td className="p-3 text-right font-mono text-white">S/ {fmt(c.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
