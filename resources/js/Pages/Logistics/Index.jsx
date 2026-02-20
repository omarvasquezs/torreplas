import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, Eye, Trash2, Truck } from 'lucide-react';

const STATUS_MAP = {
    pending:    { label: 'Pendiente',    color: 'bg-yellow-500/20 text-yellow-400' },
    in_transit: { label: 'En tránsito',  color: 'bg-blue-500/20 text-blue-400' },
    delivered:  { label: 'Entregado',    color: 'bg-green-500/20 text-green-400' },
    failed:     { label: 'Fallido',      color: 'bg-red-500/20 text-red-400' },
};

export default function LogisticsIndex({ deliveries, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('deliveries.index'), { search, status }, { preserveState: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este despacho?')) {
            router.delete(route('deliveries.destroy', id));
        }
    }

    return (
        <DashboardLayout>
            <Head title="Logística" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Logística y Distribución</h1>
                        <p className="text-gray-400 text-sm mt-1">Control de despachos y entregas</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('carriers.index')} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">
                            Transportistas
                        </Link>
                        <Link href={route('deliveries.create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium">
                            <Plus size={16} /> Nuevo Despacho
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Código, dirección, cliente..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none">
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="in_transit">En tránsito</option>
                        <option value="delivered">Entregado</option>
                        <option value="failed">Fallido</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Buscar</button>
                </form>

                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900/50">
                            <tr className="text-gray-400 text-left">
                                <th className="px-4 py-3 font-medium">Código</th>
                                <th className="px-4 py-3 font-medium">Pedido / Cliente</th>
                                <th className="px-4 py-3 font-medium">Destino</th>
                                <th className="px-4 py-3 font-medium">Transportista</th>
                                <th className="px-4 py-3 font-medium">Fecha prog.</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {deliveries.data.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay despachos</td></tr>
                            )}
                            {deliveries.data.map(d => {
                                const st = STATUS_MAP[d.status] || STATUS_MAP.pending;
                                return (
                                    <tr key={d.id} className="hover:bg-gray-700/30 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Truck size={14} className="text-indigo-400" />
                                                <span className="font-mono text-white">{d.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.order ? (
                                                <div>
                                                    <p className="text-white font-mono text-xs">{d.order.code}</p>
                                                    <p className="text-gray-400 text-xs">{d.order.client?.name}</p>
                                                </div>
                                            ) : <span className="text-gray-500">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-gray-300 max-w-48 truncate">{d.destination_address}</td>
                                        <td className="px-4 py-3 text-gray-400">{d.carrier?.name || '—'}</td>
                                        <td className="px-4 py-3 text-gray-400">{d.scheduled_date}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <Link href={route('deliveries.show', d.id)} className="p-1.5 rounded hover:bg-blue-600/20 text-blue-400 transition"><Eye size={14} /></Link>
                                                <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {deliveries.links && (
                        <div className="px-4 py-3 border-t border-gray-700/50 flex gap-1">
                            {deliveries.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'}
                                    className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
