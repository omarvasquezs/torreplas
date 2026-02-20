import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

export default function UsersIndex({ users, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('users.index'), { search }, { preserveState: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este usuario?')) {
            router.delete(route('users.destroy', id));
        }
    }

    return (
        <DashboardLayout>
            <Head title="Usuarios" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Usuarios</h1>
                        <p className="text-gray-400 text-sm mt-1">Gestión de usuarios del sistema</p>
                    </div>
                    <Link href={route('users.create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium">
                        <Plus size={16} /> Nuevo Usuario
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Buscar por nombre o email..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Buscar</button>
                </form>

                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900/50">
                            <tr className="text-gray-400 text-left">
                                <th className="px-4 py-3 font-medium">Usuario</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Rol</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {users.data.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No hay usuarios</td></tr>
                            )}
                            {users.data.map(u => (
                                <tr key={u.id} className="hover:bg-gray-700/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-white font-medium">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{u.email}</td>
                                    <td className="px-4 py-3">
                                        {u.role
                                            ? <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">{u.role.label}</span>
                                            : <span className="text-gray-500 text-xs">Sin rol</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        {u.is_active !== false
                                            ? <span className="flex items-center gap-1 text-green-400 text-xs"><UserCheck size={12}/> Activo</span>
                                            : <span className="flex items-center gap-1 text-red-400 text-xs"><UserX size={12}/> Inactivo</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Link href={route('users.edit', u.id)} className="p-1.5 rounded hover:bg-indigo-600/20 text-indigo-400 transition">
                                                <Edit size={14} />
                                            </Link>
                                            <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.links && (
                        <div className="px-4 py-3 border-t border-gray-700/50 flex gap-1">
                            {users.links.map((link, i) => (
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
