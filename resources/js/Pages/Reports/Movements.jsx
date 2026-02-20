import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

const TYPE_LABELS = { entrada:'Entrada', salida:'Salida', ajuste:'Ajuste', transferencia:'Transferencia' };
const TYPE_COLORS = {
    entrada:'bg-green-500/20 text-green-400',
    salida:'bg-red-500/20 text-red-400',
    ajuste:'bg-blue-500/20 text-blue-400',
    transferencia:'bg-purple-500/20 text-purple-400',
};
const TYPE_ICONS = { entrada:<ArrowDown size={14}/>, salida:<ArrowUp size={14}/>, transferencia:<RefreshCw size={14}/> };

export default function ReportsMovements({ movements, filters, warehouses, products }) {
    const [from,      setFrom     ] = useState(filters?.from       ?? '');
    const [to,        setTo       ] = useState(filters?.to         ?? '');
    const [type,      setType     ] = useState(filters?.type       ?? '');
    const [warehouseId, setWarehouse] = useState(filters?.warehouse_id ?? '');
    const [productId, setProduct  ] = useState(filters?.product_id  ?? '');

    function apply() {
        router.get(route('reports.movements'), { from, to, type, warehouse_id: warehouseId, product_id: productId }, { preserveScroll: true });
    }

    return (
        <DashboardLayout>
            <Head title="Reporte de Movimientos" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('reports.index')}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Reporte de Movimientos</h1>
                        <p className="text-gray-400 text-sm">Entradas y salidas de inventario</p>
                    </div>
                </div>

                {/* Filters */}
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
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                            <option value="ajuste">Ajuste</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    {warehouses?.length > 0 && (
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Almacén</label>
                            <select value={warehouseId} onChange={e => setWarehouse(e.target.value)}
                                className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                                <option value="">Todos</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    )}
                    {products?.length > 0 && (
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Producto</label>
                            <select value={productId} onChange={e => setProduct(e.target.value)}
                                className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                                <option value="">Todos</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={apply}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        Aplicar
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <h2 className="text-white font-semibold">Movimientos</h2>
                        <span className="text-gray-400 text-sm">{movements?.total ?? 0} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-left p-3">Tipo</th>
                                    <th className="text-left p-3">Producto</th>
                                    <th className="text-left p-3">Almacén</th>
                                    <th className="text-right p-3">Cantidad</th>
                                    <th className="text-left p-3">Motivo</th>
                                    <th className="text-left p-3">Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements?.data?.length ? movements.data.map(m => (
                                    <tr key={m.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                        <td className="p-3 text-gray-400 text-xs">{m.created_at?.split('T')[0]}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[m.type] ?? 'bg-gray-500/20 text-gray-400'}`}>
                                                {TYPE_ICONS[m.type]}
                                                {TYPE_LABELS[m.type] ?? m.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-300">{m.product?.name ?? '—'}</td>
                                        <td className="p-3 text-gray-400">{m.warehouse?.name ?? '—'}</td>
                                        <td className={`p-3 text-right font-bold ${m.type === 'entrada' ? 'text-green-400' : m.type === 'salida' ? 'text-red-400' : 'text-gray-300'}`}>
                                            {m.type === 'entrada' ? '+' : m.type === 'salida' ? '-' : ''}{m.quantity}
                                        </td>
                                        <td className="p-3 text-gray-400 text-xs">{m.reason ?? '—'}</td>
                                        <td className="p-3 text-gray-400 text-xs">{m.user?.name ?? '—'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Sin resultados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {movements?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap">
                            {movements.links.map((l, i) => (
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
