import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { CheckCircle2, XCircle, Search, Clock3 } from 'lucide-react';

const TYPES = {
    compensacion_horas: 'Compensación de horas',
    descanso_medico: 'Descanso médico',
    licencia: 'Licencia',
    maternidad: 'Maternidad',
    permiso_temporal: 'Permiso temporal',
    vacaciones: 'Vacaciones',
};

const STATUS = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
};

const STATUS_STYLE = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function ManageRequests({ requests, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'pending');

    const reviewForm = useForm({ status: 'approved', admin_comment: '' });

    function applyFilters(nextSearch = search, nextStatus = status) {
        router.get(
            route('hr.requests.index'),
            {
                search: nextSearch || undefined,
                status: nextStatus || undefined,
            },
            { preserveState: true, replace: true }
        );
    }

    function reviewRequest(item, nextStatus) {
        const comment = window.prompt(`Comentario para ${item.user?.name || 'colaborador'} (${nextStatus === 'approved' ? 'Aprobar' : 'Rechazar'}):`, '');
        if (comment === null) return;

        reviewForm.setData({
            status: nextStatus,
            admin_comment: comment,
        });

        reviewForm.patch(route('hr.requests.status', item.id), {
            preserveScroll: true,
        });
    }

    return (
        <DashboardLayout>
            <Head title="Solicitudes RRHH" />

            <div className="space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Solicitudes de permisos/licencias</h1>
                    <p className="text-sm text-gray-600">Gestiona solicitudes de colaboradores desde RRHH.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters(e.currentTarget.value, status)}
                            placeholder="Buscar por colaborador..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border-gray-300 text-sm"
                        />
                    </div>
                    <select value={status} onChange={(e) => { setStatus(e.target.value); applyFilters(search, e.target.value); }} className="rounded-lg border-gray-300 text-sm md:w-48">
                        <option value="">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="approved">Aprobadas</option>
                        <option value="rejected">Rechazadas</option>
                    </select>
                    <button onClick={() => applyFilters()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">Buscar</button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-[1100px] w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">Colaborador</th>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-left">Sustentación</th>
                                    <th className="px-4 py-3 text-left">Fechas</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.data.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No hay solicitudes con los filtros seleccionados.</td></tr>
                                )}
                                {requests.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-900">{item.user?.name || '—'}</p>
                                            <p className="text-xs text-gray-500">{item.user?.email || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-gray-800">{TYPES[item.type] || item.type}</td>
                                        <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={item.reason}>{item.reason}</td>
                                        <td className="px-4 py-3 text-gray-700">
                                            <p>{item.start_date} → {item.end_date}</p>
                                            <p className="text-xs text-gray-500">Retorno: {item.return_date || '—'}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[item.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {STATUS[item.status] || item.status}
                                            </span>
                                            {item.status === 'pending' && <p className="text-xs text-gray-500 mt-1 inline-flex items-center gap-1"><Clock3 size={12}/>En revisión</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.status === 'pending' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => reviewRequest(item, 'approved')} disabled={reviewForm.processing} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs">
                                                        <CheckCircle2 size={13}/> Aprobar
                                                    </button>
                                                    <button onClick={() => reviewRequest(item, 'rejected')} disabled={reviewForm.processing} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs">
                                                        <XCircle size={13}/> Rechazar
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500">Resuelto por {item.reviewed_by?.name || 'RRHH'}</p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
