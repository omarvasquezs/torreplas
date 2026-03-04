import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { Plus, FileText, Clock3, CheckCircle2, XCircle } from 'lucide-react';

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

export default function MyRequests({ requests, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [status, setStatus] = useState(filters?.status || '');

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'permiso_temporal',
        reason: '',
        start_date: '',
        end_date: '',
        return_date: '',
        goce_haber: false,
        attachment: null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('hr.my-requests.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    }

    function filterByStatus(next) {
        setStatus(next);
        router.get(route('hr.my-requests'), { status: next || undefined }, { preserveState: true, replace: true });
    }

    return (
        <DashboardLayout>
            <Head title="Mis Permisos" />

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mis permisos y licencias</h1>
                        <p className="text-sm text-gray-600">Registra y consulta el estado de tus solicitudes.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                    >
                        <Plus size={16} /> Nueva solicitud
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button onClick={() => filterByStatus('')} className={`px-3 py-1.5 rounded-lg text-sm ${status === '' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>Todos</button>
                    <button onClick={() => filterByStatus('pending')} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${status === 'pending' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}><Clock3 size={14}/>Pendiente</button>
                    <button onClick={() => filterByStatus('approved')} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${status === 'approved' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}><CheckCircle2 size={14}/>Aprobado</button>
                    <button onClick={() => filterByStatus('rejected')} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${status === 'rejected' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}><XCircle size={14}/>Rechazado</button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">Tipo</th>
                                    <th className="px-4 py-3 text-left">Rango de fechas</th>
                                    <th className="px-4 py-3 text-left">Retorno</th>
                                    <th className="px-4 py-3 text-left">Estado</th>
                                    <th className="px-4 py-3 text-left">Comentario RRHH</th>
                                    <th className="px-4 py-3 text-left">Adjunto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requests.data.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No tienes solicitudes registradas.</td></tr>
                                )}
                                {requests.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/60">
                                        <td className="px-4 py-3 font-medium text-gray-900">{TYPES[item.type] || item.type}</td>
                                        <td className="px-4 py-3 text-gray-700">{item.start_date} → {item.end_date}</td>
                                        <td className="px-4 py-3 text-gray-700">{item.return_date || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[item.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {STATUS[item.status] || item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{item.admin_comment || '—'}</td>
                                        <td className="px-4 py-3">
                                            {item.attachment_path ? (
                                                <a href={`/storage/${item.attachment_path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                                                    <FileText size={14}/> Ver
                                                </a>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Nueva solicitud</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800">✕</button>
                        </div>
                        <form onSubmit={submit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Tipo de permiso *</label>
                                    <select value={data.type} onChange={(e) => setData('type', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm">
                                        {Object.entries(TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                    </select>
                                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                                </div>
                                <div className="flex items-end">
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <input type="checkbox" checked={data.goce_haber} onChange={(e) => setData('goce_haber', e.target.checked)} className="rounded border-gray-300" />
                                        Goce de haber
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Sustentación *</label>
                                <textarea value={data.reason} onChange={(e) => setData('reason', e.target.value)} rows={3} className="w-full rounded-lg border-gray-300 text-sm" />
                                {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Fecha inicio *</label>
                                    <input type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                                    {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Fecha fin *</label>
                                    <input type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                                    {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Fecha retorno</label>
                                    <input type="date" value={data.return_date} onChange={(e) => setData('return_date', e.target.value)} className="w-full rounded-lg border-gray-300 text-sm" />
                                    {errors.return_date && <p className="text-red-500 text-xs mt-1">{errors.return_date}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Adjunto (PDF/imagen)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setData('attachment', e.target.files[0])} className="w-full rounded-lg border-gray-300 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-2" />
                                {errors.attachment && <p className="text-red-500 text-xs mt-1">{errors.attachment}</p>}
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
                                <button type="submit" disabled={processing} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Guardar solicitud</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
