import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';

export default function SuppliersIndex({ suppliers, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('suppliers.index'), { search }, { preserveState: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este proveedor?')) {
            router.delete(route('suppliers.destroy', id));
        }
    }

    return (
        <DashboardLayout>
            <Head title="Proveedores" />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Proveedores</h1>
                        <p className="text-gray-400 text-sm mt-1">Gestión de proveedores</p>
                    </div>
                    <Link
                        href={route('suppliers.create')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        <Plus size={16} /> Nuevo Proveedor
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o RUC..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                        Buscar
                    </button>
                </form>

                {/* Table */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900/50">
                            <tr className="text-gray-400 text-left">
                                <th className="px-4 py-3 font-medium">Proveedor</th>
                                <th className="px-4 py-3 font-medium">Documento</th>
                                <th className="px-4 py-3 font-medium">Contacto</th>
                                <th className="px-4 py-3 font-medium">Persona de contacto</th>
                                <th className="px-4 py-3 font-medium w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {suppliers.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No se encontraron proveedores
                                    </td>
                                </tr>
                            )}
                            {suppliers.data.map(s => (
                                <tr key={s.id} className="hover:bg-gray-700/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                                <Building2 size={14} className="text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{s.name}</p>
                                                <p className="text-gray-500 text-xs">{s.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300 font-mono">
                                            {s.document_type}: {s.document_number}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">
                                        <p>{s.phone}</p>
                                        <p className="text-gray-500 text-xs">{s.email}</p>
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">{s.contact_person || '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Link
                                                href={route('suppliers.edit', s.id)}
                                                className="p-1.5 rounded hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition"
                                            >
                                                <Edit size={14} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="p-1.5 rounded hover:bg-red-600/20 text-red-400 hover:text-red-300 transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    {suppliers.links && (
                        <div className="px-4 py-3 border-t border-gray-700/50 flex gap-1">
                            {suppliers.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
