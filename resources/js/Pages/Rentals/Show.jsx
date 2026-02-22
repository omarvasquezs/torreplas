import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, KeyRound, Zap, CheckCircle, RotateCcw, PlusCircle, AlertTriangle } from 'lucide-react';

const PAYMENT_STATUS_LABELS = { pending: 'Pendiente', paid: 'Pagado', overdue: 'Vencido' };
const PAYMENT_STATUS_COLORS = {
    paid:    'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const CONTRACT_COLORS = {
    active:    'bg-green-500/20 text-green-400',
    suspended: 'bg-yellow-500/20 text-yellow-400',
    ended:     'bg-gray-500/20 text-gray-400',
};

export default function RentalShow({ rental, overdue }) {
    const [showPayModal, setShowPayModal] = useState(false);
    const [payingId, setPayingId] = useState(null);
    const [payForm, setPayForm] = useState({ paid_date: new Date().toISOString().slice(0,10), payment_method: 'efectivo', reference: '', notes: '' });
    const [showGenModal, setShowGenModal] = useState(false);
    const [genForm, setGenForm] = useState({
        period: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })(),
        amount: rental.monthly_fee,
    });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        description: rental.description,
        address: rental.address ?? '',
        monthly_fee: rental.monthly_fee,
        end_date: rental.end_date ?? '',
        payment_day: rental.payment_day,
        status: rental.status,
        notes: rental.notes ?? '',
    });

    function openPayModal(payment) {
        setPayingId(payment.id);
        setPayForm({ paid_date: new Date().toISOString().slice(0,10), payment_method: 'efectivo', reference: '', notes: '' });
        setShowPayModal(true);
    }

    function submitPayment(e) {
        e.preventDefault();
        router.post(route('rentals.payments.register', payingId), payForm, {
            onSuccess: () => setShowPayModal(false),
        });
    }

    function revertPayment(payment) {
        if (!confirm('¿Revertir este pago?')) return;
        router.post(route('rentals.payments.revert', payment.id));
    }

    function submitGenerate(e) {
        e.preventDefault();
        router.post(route('rentals.generate-payment', rental.id), genForm, {
            onSuccess: () => setShowGenModal(false),
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        router.put(route('rentals.update', rental.id), editForm, {
            onSuccess: () => setShowEditModal(false),
        });
    }

    function destroyRental() {
        if (!confirm('¿Eliminar este contrato? Se eliminan todos sus cobros.')) return;
        router.delete(route('rentals.destroy', rental.id));
    }

    return (
        <DashboardLayout>
            <Head title={`Alquiler — ${rental.client?.name}`} />

            {/* Back */}
            <Link href={route('rentals.index')}
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={16} /> Volver a Alquileres
            </Link>

            {/* Contract Header */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <KeyRound size={22} className="text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-xl font-bold text-white">{rental.client?.name}</h1>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${CONTRACT_COLORS[rental.status]}`}>
                                    {rental.status === 'active' ? 'Activo' : rental.status === 'suspended' ? 'Suspendido' : 'Finalizado'}
                                </span>
                                {overdue > 0 && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                        <AlertTriangle size={12} /> {overdue} vencido{overdue > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-300 mt-1">{rental.description}</p>
                            {rental.address && <p className="text-gray-400 text-sm">{rental.address}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-gray-400">Canon mensual</p>
                            <p className="text-2xl font-bold text-green-400">S/ {Number(rental.monthly_fee).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-700/50 pt-4">
                    <div><span className="text-gray-400">Inicio:</span> <span className="text-white ml-1">{rental.start_date}</span></div>
                    <div><span className="text-gray-400">Fin:</span> <span className="text-white ml-1">{rental.end_date ?? 'Indefinido'}</span></div>
                    <div><span className="text-gray-400">Vence día:</span> <span className="text-white ml-1">{rental.payment_day} de cada mes</span></div>
                    <div><span className="text-gray-400">Registrado por:</span> <span className="text-white ml-1">{rental.user?.name}</span></div>
                </div>
                {rental.notes && (
                    <p className="mt-3 text-sm text-gray-400 border-t border-gray-700/50 pt-3">{rental.notes}</p>
                )}

                <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={() => setShowGenModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors">
                        <PlusCircle size={15} /> Generar cobro
                    </button>
                    <button onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        Editar contrato
                    </button>
                    <button onClick={destroyRental}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-700/50 flex items-center justify-between">
                    <h2 className="font-semibold text-white">Historial de cobros</h2>
                    <span className="text-sm text-gray-400">{rental.payments?.length ?? 0} cobros</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700/50 text-gray-400 text-xs uppercase">
                                <th className="text-left px-4 py-3">Período</th>
                                <th className="text-left px-4 py-3">Vencimiento</th>
                                <th className="text-right px-4 py-3">Monto S/</th>
                                <th className="text-left px-4 py-3">Estado</th>
                                <th className="text-left px-4 py-3">Fecha pago</th>
                                <th className="text-left px-4 py-3">Método</th>
                                <th className="text-left px-4 py-3">Referencia</th>
                                <th className="text-center px-4 py-3">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/30">
                            {(!rental.payments || rental.payments.length === 0) && (
                                <tr><td colSpan={8} className="text-center py-10 text-gray-500">Sin cobros generados. Use "Generar cobro" para crear uno.</td></tr>
                            )}
                            {rental.payments?.map(p => (
                                <tr key={p.id} className="hover:bg-gray-700/20 transition-colors">
                                    <td className="px-4 py-3 font-mono text-white">{p.period}</td>
                                    <td className="px-4 py-3 text-gray-300">{p.due_date}</td>
                                    <td className="px-4 py-3 text-right font-mono text-green-400">{Number(p.amount).toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLORS[p.status]}`}>
                                            {PAYMENT_STATUS_LABELS[p.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{p.paid_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-400 capitalize">{p.payment_method ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.reference ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        {p.status !== 'paid' ? (
                                            <button onClick={() => openPayModal(p)}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs hover:bg-green-500/30 transition-colors mx-auto">
                                                <CheckCircle size={13} /> Registrar
                                            </button>
                                        ) : (
                                            <button onClick={() => revertPayment(p)}
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-700/50 text-gray-400 rounded-lg text-xs hover:bg-gray-700 transition-colors mx-auto">
                                                <RotateCcw size={13} /> Revertir
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Register Payment Modal */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Registrar pago</h2>
                            <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={submitPayment} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Fecha de pago *</label>
                                <input type="date" value={payForm.paid_date} onChange={e => setPayForm({...payForm, paid_date: e.target.value})} required
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Método de pago</label>
                                <select value={payForm.payment_method} onChange={e => setPayForm({...payForm, payment_method: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="deposito">Depósito</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="yape">Yape / Plin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nro. operación / referencia</label>
                                <input value={payForm.reference} onChange={e => setPayForm({...payForm, reference: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Notas</label>
                                <textarea value={payForm.notes} onChange={e => setPayForm({...payForm, notes: e.target.value})} rows={2}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowPayModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
                                <button type="submit" className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                                    Confirmar pago
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Generate Payment Modal */}
            {showGenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Generar cobro</h2>
                            <button onClick={() => setShowGenModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={submitGenerate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Período (mes) *</label>
                                <input type="month" value={genForm.period} onChange={e => setGenForm({...genForm, period: e.target.value})} required
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Monto S/ (deja vacío para usar el canon)</label>
                                <input type="number" step="0.01" min="0" value={genForm.amount} onChange={e => setGenForm({...genForm, amount: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowGenModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
                                    Generar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Contract Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Editar contrato</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={submitEdit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Descripción *</label>
                                <input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Canon mensual S/ *</label>
                                    <input type="number" step="0.01" min="0" value={editForm.monthly_fee} onChange={e => setEditForm({...editForm, monthly_fee: e.target.value})} required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Día vencimiento *</label>
                                    <input type="number" min="1" max="28" value={editForm.payment_day} onChange={e => setEditForm({...editForm, payment_day: e.target.value})} required
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Fecha fin</label>
                                    <input type="date" value={editForm.end_date} onChange={e => setEditForm({...editForm, end_date: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Estado</label>
                                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                                        className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                                        <option value="active">Activo</option>
                                        <option value="suspended">Suspendido</option>
                                        <option value="ended">Finalizado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Notas</label>
                                <textarea value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={2}
                                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancelar</button>
                                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
