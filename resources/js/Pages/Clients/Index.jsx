import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Edit, Trash, Plus, Search, User } from 'lucide-react';

export default function Index({ clients, filters }) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('clients.index'), { preserveState: true });
    };

    return (
        <DashboardLayout>
            <Head title="Clientes" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clientes</h1>
                    <p className="text-gray-500 dark:text-gray-400">Gestione su cartera de clientes y créditos.</p>
                </div>
                <Link
                    href={route('clients.create')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-600/20 transition-all"
                >
                    <Plus size={18} />
                    Nuevo Cliente
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <form onSubmit={handleSearch} className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={data.search}
                        onChange={(e) => setData('search', e.target.value)}
                        placeholder="Buscar por nombre o documento..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </form>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 uppercase text-xs font-semibold text-gray-900 dark:text-white">
                            <tr>
                                <th className="px-6 py-4">Cliente / Razón Social</th>
                                <th className="px-6 py-4">Documento</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4 text-center">Crédito</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {clients.data.length > 0 ? (
                                clients.data.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <User size={16} />
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {client.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                {client.document_type}: {client.document_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span>{client.phone || '-'}</span>
                                                <span className="text-xs text-gray-400">{client.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {client.credit_limit > 0 ? (
                                                <span className="text-green-600 font-medium">
                                                    S/ {parseFloat(client.credit_limit).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('clients.edit', client.id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-blue-600 transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <Link
                                                    href={route('clients.destroy', client.id)}
                                                    method="delete"
                                                    as="button"
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition-colors"
                                                >
                                                    <Trash size={16} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron clientes.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {clients.links && (
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-slate-700 px-6 py-4">
                        <div className="flex gap-1">
                            {clients.links.map((link, i) => (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="px-3 py-1 text-sm text-gray-400"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
