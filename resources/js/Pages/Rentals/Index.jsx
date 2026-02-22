import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { KeyRound, PlusCircle, Zap, Users, AlertTriangle, DollarSign, Search } from 'lucide-react';

const STATUS_LABELS = { active: 'Activo', suspended: 'Suspendido', ended: 'Finalizado' };
const STATUS_COLORS = {
    active:    'bg-green-500/20 text-green-400',
    suspended: 'bg-yellow-500/20 text-yellow-400',
    ended:     'bg-gray-500/20 text-gray-400',
};

function SummaryCard({ icon: Icon, label, value, color }) {
    return (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={22} />
            </div>
            <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
}

export default function RentalsIndex({ rentals, clients, summary, filters }) {
    const { auth } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        client_id: '', description: '', address: '', monthly_fee: '',
        start_date: '', end_date: '', payment_day: 1, notes: '',
    });
    const [bulkPeriod, setBulkPeriod] = useState(() => {
        const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus]   = useState(filters?.status || '');

    function handleSubmit(e) {
        e.preventDefault();
        router.post(route('rentals.store'), form, {
            onSuccess: () => { setShowModal(false); setForm({ client_id:'', description:'', address:'', monthly_fee:'', start_date:'', end_date:'', payment_day:1, notes:'' }); },
        });
    }

    function handleBulkGenerate(e) {
        e.preventDefault();
        router.post(route('rentals.bulk-generate'), { period: bulkPeriod });
    }

    function applyFilters(e) {
        e.preventDefault();
        router.get(route('rentals.index'), { search, status }, { preserveState: true });
    }

    return (
        <DashboardLayout>
            <Head title="Alquileres" />

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                        <KeyRound size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Alquileres</h1>
                        <p className="text-sm text-gray-400">Contratos y cobros mensuales</p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <form onSubmit={handleBulkGenerate} className="flex items-center gap-2">
                        <input
                            type="month"
                            value={bulkPeriod}
                            onChange={e => setBulkPeriod(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
                        />
                        <button type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors">
                            <Zap size={16} /> Generar cobros del mes
                        </button>
                    </form>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                        <PlusCircle size={16} /> Nuevo contrato
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard icon={Users}         label="Contratos activos"  value={summary.active}           color="bg-green-500/20 text-green-400" />
                <SummaryCard icon={DollarSign}    label="Ingreso mensual S/" value={Number(summary.monthly_income).toFixed(2)} color="bg-indigo-500/20 text-indigo-400" />
                <SummaryCard icon={AlertTriangle} label="Pagos vencidos"     value={summary.overdue_payments}  color="bg-red-500/20 text-red-400" />
                <SummaryCard icon={KeyRound}      label="Cobros pendientes"  value={summary.pending_payments}  color="bg-yellow-500/20 text-yellow-400" />
            </div>

            {/* Filters */}
            <form onSubmit={applyFilters} className="flex flex-wrap gap-3 items-center">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar cliente o descripción…"
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg pl-9 pr-3 py-2 text-sm w-64" />
                </div>
                <select value={status} onChange={e => setStatus(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="suspended">Suspendidos</option>
                    <option value="ended">Finalizados</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                    Filtrar
                </button>
            </form>

            {/* Table */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase">
                                <th className="text-left px-4 py-3">Cliente</th>
                                <th className="text-left px-4 py-3">Descripción</th>
                                <th className="text-right px-4 py-3">Canon S/</th>
                                <th className="text-left px-4 py-3">Inicio</th>
                                <th className="text-left px-4 py-3">Vencim.</th>
                                <th className="text-left px-4 py-3">Estado</th>
                                <th className="text-left px-4 py-3">Cobros pend.</th>
                                <th className="text-center px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {rentals.data.length === 0 && (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Sin contratos registrados.</td></tr>
                            )}
                            {rentals.data.map(r => (
                                <tr key={r.id} className="hover:bg-gray-700/20 transition-colors">
                                    <td className="px-4 py-3 text-white font-medium">{r.client?.name}</td>
                                    <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{r.description}</td>
                                    <td className="px-4 py-3 text-right font-mono text-green-400">{Number(r.monthly_fee).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-gray-300">{r.start_date}</td>
                                    <td className="px-4 py-3 text-gray-400">{r.end_date ?? '—'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status]}`}>
                                            {STATUS_LABELS[r.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {r.payments?.length > 0
                                            ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">{r.payments.length}</span>
                                            : <span className="text-gray-500">—</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link href={route('rentals.show', r.id)}
                                            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium">
                                            Ver →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {rentals.last_page > 1 && (
                    <div className="flex justify-center gap-2 px-4 py-3 border-t border-gray-700/50">
                        {rentals.links.map((link, i) => (
                            <Link key={i} href={link.url ?? '#'}
                                className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>

            {/* New Contract Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Nuevo contrato de alquiler</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Cliente *</label>
                                    <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                                        <option value="">Seleccionar cliente…</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.document_number}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Descripción / Bien alquilado *</label>
                                    <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} required
                                        placeholder="Ej: Local comercial, Dpto 201"
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Dirección</label>
                                    <input value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Canon mensual S/ *</label>
                                    <input type="number" step="0.01" min="0" value={form.monthly_fee} onChange={e => setForm({...form, monthly_fee: e.target.value})} required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Día de vencimiento (1–28) *</label>
                                    <input type="number" min="1" max="28" value={form.payment_day} onChange={e => setForm({...form, payment_day: e.target.value})} required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Fecha inicio *</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Fecha fin (opcional)</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-400 mb-1">Notas</label>
                                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm">Cancelar</button>
                                <button type="submit"
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
                                    Crear contrato
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
