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
    ended:     'bg-gray-500/20 text-gray-600',
};

export default function RentalShow({ rental, overdue, nextReceiptNumber }) {
    const [showPayModal, setShowPayModal] = useState(false);
    const [payingPayment, setPayingPayment] = useState(null);
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
        setPayingPayment(payment);
        setPayForm({ paid_date: new Date().toISOString().slice(0,10), payment_method: 'efectivo', reference: '', notes: '' });
        setShowPayModal(true);
    }

    function submitPayment(e) {
        e.preventDefault();
        router.post(route('rentals.payments.register', payingPayment.id), payForm, {
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
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} /> Volver a Alquileres
            </Link>

            {/* Contract Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
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
                            <p className="text-gray-700 mt-1">{rental.description}</p>
                            {rental.address && <p className="text-gray-600 text-sm">{rental.address}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-xs text-gray-600">Canon mensual</p>
                            <p className="text-2xl font-bold text-green-400">S/ {Number(rental.monthly_fee).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-gray-200 pt-4">
                    <div><span className="text-gray-600">Inicio:</span> <span className="text-white ml-1">{rental.start_date}</span></div>
                    <div><span className="text-gray-600">Fin:</span> <span className="text-white ml-1">{rental.end_date ?? 'Indefinido'}</span></div>
                    <div><span className="text-gray-600">Vence día:</span> <span className="text-white ml-1">{rental.payment_day} de cada mes</span></div>
                    <div><span className="text-gray-600">Registrado por:</span> <span className="text-white ml-1">{rental.user?.name}</span></div>
                </div>
                {rental.notes && (
                    <p className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-3">{rental.notes}</p>
                )}

                <div className="mt-4 flex gap-2 flex-wrap">
                    <button onClick={() => setShowGenModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm hover:bg-indigo-500/30 transition-colors">
                        <PlusCircle size={15} /> Generar cobro
                    </button>
                    <button onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                        Editar contrato
                    </button>
                    <button onClick={destroyRental}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
                        Eliminar
                    </button>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-semibold text-white">Historial de cobros</h2>
                    <span className="text-sm text-gray-600">{rental.payments?.length ?? 0} cobros</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-600 text-xs uppercase">
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
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-white">{p.period}</td>
                                    <td className="px-4 py-3 text-gray-700">{p.due_date}</td>
                                    <td className="px-4 py-3 text-right font-mono text-green-400">{Number(p.amount).toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${PAYMENT_STATUS_COLORS[p.status]}`}>
                                            {PAYMENT_STATUS_LABELS[p.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700">{p.paid_date ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 capitalize">{p.payment_method ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.reference ?? '—'}</td>
                                    <td className="px-4 py-3 text-center">
                                        {p.status !== 'paid' ? (
                                            <button onClick={() => openPayModal(p)}
                                                className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs hover:bg-green-500/30 transition-colors mx-auto">
                                                <CheckCircle size={13} /> Registrar
                                            </button>
                                        ) : (
                                            <button onClick={() => revertPayment(p)}
                                                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-100 transition-colors mx-auto">
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

            {/* Register Payment Modal — Recibo de Alquiler */}
            {showPayModal && payingPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-[1px] p-4" onClick={e => e.target === e.currentTarget && setShowPayModal(false)}>
                    <div className="rental-receipt-modal w-full max-w-xl shadow-[0_18px_50px_rgba(0,0,0,0.20)] rounded-2xl overflow-hidden border border-gray-300" style={{fontFamily: 'sans-serif', colorScheme: 'light'}}>

                        {/* ── Receipt Header ── */}
                        <div className="flex items-stretch">
                            <div className="flex-1 bg-[#e05a5a] flex items-center justify-center px-6 py-5">
                                <span className="text-white text-[34px] font-extrabold tracking-wide uppercase leading-none">Recibo de Alquiler</span>
                            </div>
                            <div className="bg-[#e05a5a] flex items-center px-4 border-l-2 border-white/30">
                                <div className="text-right">
                                    <span className="text-white font-bold text-sm">N°</span>
                                    <div className="receipt-number-badge bg-white font-bold text-base px-3 py-1 rounded mt-1 min-w-[96px] text-center font-mono tracking-wider border border-gray-300 shadow-sm">
                                        {payingPayment.receipt_number ?? nextReceiptNumber}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Receipt Body ── */}
                        <form onSubmit={submitPayment} className="bg-white border-x border-b border-gray-300 px-6 pt-6 pb-6 space-y-4" style={{backgroundColor: '#ffffff', color: '#1f2937'}}>

                            {/* Row: Fecha + Cantidad */}
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Fecha:</label>
                                    <input type="date" value={payForm.paid_date}
                                        onChange={e => setPayForm({...payForm, paid_date: e.target.value})} required
                                        className="w-full bg-white border-0 border-b border-dashed border-gray-400 text-gray-800 text-sm py-1 focus:outline-none focus:border-[#e05a5a]" style={{backgroundColor:'#fff', colorScheme:'light'}} />
                                </div>
                                <div className="shrink-0">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block text-right">Cantidad de:</label>
                                    <div className="bg-[#e05a5a] text-white font-bold text-lg px-4 py-1 rounded text-right min-w-[130px]">
                                        S/ {Number(payingPayment.amount).toFixed(2)}
                                    </div>
                                </div>
                            </div>

                            {/* Row: Recibí de */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Recibí de:</label>
                                <div className="w-full border-b border-dashed border-gray-400 text-gray-800 text-sm py-1">
                                    {rental.client?.name}
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <textarea
                                    value={payForm.notes}
                                    onChange={e => setPayForm({...payForm, notes: e.target.value})}
                                    placeholder="Observaciones adicionales…"
                                    rows={2}
                                    className="w-full bg-white border border-dashed border-gray-300 text-gray-800 text-sm px-3 py-2 rounded focus:outline-none focus:border-[#e05a5a] resize-none placeholder-gray-400" style={{backgroundColor:'#fff'}} />
                            </div>

                            {/* Row: Por concepto de renta */}
                            <div>
                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Por concepto de renta:</label>
                                <div className="w-full border-b border-dashed border-gray-400 text-gray-700 text-sm py-1">
                                    {rental.description}{rental.address ? ` — ${rental.address}` : ''}
                                </div>
                            </div>

                            {/* Row: Período */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Período (mes):</label>
                                    <div className="w-full border-b border-dashed border-gray-400 text-gray-700 text-sm py-1 font-mono">
                                        {payingPayment.period}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Fecha de vencimiento:</label>
                                    <div className="w-full border-b border-dashed border-gray-400 text-gray-700 text-sm py-1">
                                        {payingPayment.due_date}
                                    </div>
                                </div>
                            </div>

                            {/* Row: Método + Referencia */}
                            <div className="flex gap-6 items-start pt-1">
                                {/* Radio buttons */}
                                <div className="space-y-1.5">
                                    {['efectivo','cheque','transferencia','deposito','yape'].map(m => (
                                        <label key={m} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="payment_method" value={m}
                                                checked={payForm.payment_method === m}
                                                onChange={() => setPayForm({...payForm, payment_method: m})}
                                                className="accent-[#e05a5a] w-3.5 h-3.5" />
                                            <span className="text-sm text-gray-700 capitalize">{m === 'yape' ? 'Yape / Plin' : m.charAt(0).toUpperCase() + m.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                                {/* Reference */}
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Nro. operación / referencia:</label>
                                    <input value={payForm.reference}
                                        onChange={e => setPayForm({...payForm, reference: e.target.value})}
                                        placeholder="Nro. operación…"
                                        className="w-full bg-white border-b border-dashed border-gray-400 text-gray-800 text-sm py-1 focus:outline-none focus:border-[#e05a5a] placeholder-gray-400" style={{backgroundColor:'#fff'}} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                                <button type="button" onClick={() => setShowPayModal(false)}
                                    className="px-4 py-2 text-gray-500 hover:text-gray-800 text-sm transition-colors">Cancelar</button>
                                <button type="submit"
                                    className="px-6 py-2 bg-[#e05a5a] hover:bg-[#c94a4a] text-white rounded-lg text-sm font-semibold transition-colors">
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
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-sm shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-white">Generar cobro</h2>
                            <button onClick={() => setShowGenModal(false)} className="text-gray-600 hover:text-gray-900">✕</button>
                        </div>
                        <form onSubmit={submitGenerate} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Período (mes) *</label>
                                <input type="month" value={genForm.period} onChange={e => setGenForm({...genForm, period: e.target.value})} required
                                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Monto S/ (deja vacío para usar el canon)</label>
                                <input type="number" step="0.01" min="0" value={genForm.amount} onChange={e => setGenForm({...genForm, amount: e.target.value})}
                                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowGenModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancelar</button>
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
                    <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-white">Editar contrato</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">✕</button>
                        </div>
                        <form onSubmit={submitEdit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Descripción *</label>
                                <input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} required
                                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Canon mensual S/ *</label>
                                    <input type="number" step="0.01" min="0" value={editForm.monthly_fee} onChange={e => setEditForm({...editForm, monthly_fee: e.target.value})} required
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Día vencimiento *</label>
                                    <input type="number" min="1" max="28" value={editForm.payment_day} onChange={e => setEditForm({...editForm, payment_day: e.target.value})} required
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Fecha fin</label>
                                    <input type="date" value={editForm.end_date} onChange={e => setEditForm({...editForm, end_date: e.target.value})}
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Estado</label>
                                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                                        <option value="active">Activo</option>
                                        <option value="suspended">Suspendido</option>
                                        <option value="ended">Finalizado</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Notas</label>
                                <textarea value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} rows={2}
                                    className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm resize-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">Cancelar</button>
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
