import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, FileText, Eye, Trash2 } from 'lucide-react';

const STATUS_LABELS = {
    generated:   { label: 'Generado',     color: 'bg-blue-500/20 text-blue-400' },
    sent_sunat:  { label: 'Enviado SUNAT', color: 'bg-yellow-500/20 text-yellow-400' },
    accepted:    { label: 'Aceptado',      color: 'bg-green-500/20 text-green-400' },
    rejected:    { label: 'Rechazado',     color: 'bg-red-500/20 text-red-400' },
};

const TYPE_LABELS = {
    factura:       'Factura',
    boleta:        'Boleta',
    nota_credito:  'Nota Crédito',
    nota_debito:   'Nota Débito',
};

export default function InvoicesIndex({ invoices, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [type,   setType]   = useState(filters?.type   || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('invoices.index'), { search, type }, { preserveState: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este comprobante?')) {
            router.delete(route('invoices.destroy', id));
        }
    }

    return (
        <DashboardLayout>
            <Head title="Facturación" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Facturación</h1>
                        <p className="text-gray-400 text-sm mt-1">Comprobantes de pago</p>
                    </div>
                    <Link href={route('invoices.create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium">
                        <Plus size={16} /> Nuevo Comprobante
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text" placeholder="Serie, número, cliente..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select value={type} onChange={e => setType(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Todos los tipos</option>
                        <option value="factura">Factura</option>
                        <option value="boleta">Boleta</option>
                        <option value="nota_credito">Nota Crédito</option>
                        <option value="nota_debito">Nota Débito</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Buscar</button>
                </form>

                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900/50">
                            <tr className="text-gray-400 text-left">
                                <th className="px-4 py-3 font-medium">Comprobante</th>
                                <th className="px-4 py-3 font-medium">Tipo</th>
                                <th className="px-4 py-3 font-medium">Cliente</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">Monto</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {invoices.data.length === 0 && (
                                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No hay comprobantes</td></tr>
                            )}
                            {invoices.data.map(inv => {
                                const st = STATUS_LABELS[inv.status] || STATUS_LABELS.generated;
                                return (
                                    <tr key={inv.id} className="hover:bg-gray-700/30 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <FileText size={14} className="text-indigo-400" />
                                                <span className="font-mono text-white">{inv.serie}-{inv.number}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{TYPE_LABELS[inv.type] || inv.type}</td>
                                        <td className="px-4 py-3 text-gray-300">{inv.client?.name || '—'}</td>
                                        <td className="px-4 py-3 text-gray-400">{inv.issue_date}</td>
                                        <td className="px-4 py-3 text-white font-medium">
                                            S/ {parseFloat(inv.total_amount).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <Link href={route('invoices.show', inv.id)} className="p-1.5 rounded hover:bg-blue-600/20 text-blue-400 transition">
                                                    <Eye size={14} />
                                                </Link>
                                                <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {invoices.links && (
                        <div className="px-4 py-3 border-t border-gray-700/50 flex gap-1">
                            {invoices.links.map((link, i) => (
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
