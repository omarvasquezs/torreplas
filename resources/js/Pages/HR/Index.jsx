import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, Edit, Trash2, Eye, Users } from 'lucide-react';

const STATUS_MAP = {
    active:   { label: 'Activo',     color: 'bg-green-500/20 text-green-400' },
    inactive: { label: 'Inactivo',   color: 'bg-red-500/20 text-red-400' },
    on_leave: { label: 'Con licencia',color: 'bg-yellow-500/20 text-yellow-400' },
};

export default function HRIndex({ employees, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('employees.index'), { search, status }, { preserveState: true });
    }

    function handleDelete(id) {
        if (confirm('¿Eliminar este colaborador?')) {
            router.delete(route('employees.destroy', id));
        }
    }

    return (
        <DashboardLayout>
            <Head title="Recursos Humanos" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Recursos Humanos</h1>
                        <p className="text-gray-600 text-sm mt-1">Gestión de colaboradores</p>
                    </div>
                    <Link href={route('employees.create')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium">
                        <Plus size={16} /> Nuevo Colaborador
                    </Link>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        <input type="text" placeholder="Nombre, código, DNI..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none">
                        <option value="">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        <option value="on_leave">Con licencia</option>
                    </select>
                    <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Buscar</button>
                </form>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/80">
                            <tr className="text-gray-600 text-left">
                                <th className="px-4 py-3 font-medium">Colaborador</th>
                                <th className="px-4 py-3 font-medium">Cargo</th>
                                <th className="px-4 py-3 font-medium">Contacto</th>
                                <th className="px-4 py-3 font-medium">Sueldo</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium w-28">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {employees.data.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay colaboradores</td></tr>
                            )}
                            {employees.data.map(emp => {
                                const st = STATUS_MAP[emp.status] || STATUS_MAP.active;
                                return (
                                    <tr key={emp.id} className="hover:bg-gray-100/30 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {emp.first_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{emp.first_name} {emp.last_name}</p>
                                                    <p className="text-gray-500 text-xs font-mono">{emp.code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-gray-700">{emp.position}</p>
                                            <p className="text-gray-500 text-xs">{emp.department}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            <p>{emp.phone}</p>
                                            <p className="text-xs">{emp.email}</p>
                                        </td>
                                        <td className="px-4 py-3 text-white">S/ {parseFloat(emp.salary).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <Link href={route('employees.show', emp.id)} className="p-1.5 rounded hover:bg-blue-600/20 text-blue-400 transition"><Eye size={14} /></Link>
                                                <Link href={route('employees.edit', emp.id)} className="p-1.5 rounded hover:bg-indigo-600/20 text-indigo-400 transition"><Edit size={14} /></Link>
                                                <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded hover:bg-red-600/20 text-red-400 transition"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {employees.links && (
                        <div className="px-4 py-3 border-t border-gray-200 flex gap-1">
                            {employees.links.map((link, i) => (
                                <Link key={i} href={link.url || '#'}
                                    className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-600'} ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
