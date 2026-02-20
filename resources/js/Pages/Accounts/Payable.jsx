import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { DollarSign, X } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

function PaymentModal({ purchase, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount:         purchase ? (purchase.total - (purchase.paid_amount ?? 0)) : '',
        payment_method: 'transfer',
        reference:      '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('accounts.payable.payment', purchase.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Registrar Pago a Proveedor</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-sm text-gray-300 space-y-1">
                        <div><span className="text-gray-400">Proveedor:</span> {purchase?.supplier?.name}</div>
                        <div><span className="text-gray-400">Total OC:</span> S/ {fmt(purchase?.total)}</div>
                        <div><span className="text-gray-400">Saldo:</span>
                            <span className="text-yellow-400 font-bold ml-1">
                                S/ {fmt((purchase?.total ?? 0) - (purchase?.paid_amount ?? 0))}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Monto a pagar <span className="text-red-400">*</span></label>
                        <input type="number" step="0.01" min="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required />
                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Método de pago</label>
                        <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                            <option value="transfer">Transferencia</option>
                            <option value="cash">Efectivo</option>
                            <option value="check">Cheque</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Referencia / N° operación</label>
                        <input type="text" value={data.reference} onChange={e => setData('reference', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AccountsPayable({ purchases, summary }) {
    const [selected, setSelected] = useState(null);

    return (
        <DashboardLayout>
            <Head title="Cuentas por Pagar" />
            {selected && <PaymentModal purchase={selected} onClose={() => setSelected(null)} />}

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Cuentas por Pagar</h1>
                    <p className="text-gray-400 text-sm">Órdenes de compra pendientes de pago a proveedores</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { label:'Total a Pagar',   value:`S/ ${fmt(summary?.total_pending)}`, color:'text-red-400'    },
                        { label:'Órdenes',          value: summary?.count ?? 0,                color:'text-white'      },
                        { label:'Proveedores',      value: summary?.suppliers ?? 0,            color:'text-yellow-400' },
                    ].map(c => (
                        <div key={c.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                            <p className="text-gray-400 text-xs">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50">
                        <h2 className="text-white font-semibold">Órdenes de Compra Pendientes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">N° OC</th>
                                    <th className="text-left p-3">Proveedor</th>
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-right p-3">Pagado</th>
                                    <th className="text-right p-3">Saldo</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases?.length ? purchases.map(p => {
                                    const paid    = Number(p.paid_amount ?? 0);
                                    const pending = Number(p.total ?? 0) - paid;
                                    return (
                                        <tr key={p.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                            <td className="p-3 text-indigo-400">#{p.id}</td>
                                            <td className="p-3 text-gray-300">{p.supplier?.name ?? '—'}</td>
                                            <td className="p-3 text-gray-400 text-xs">{p.created_at?.split('T')[0]}</td>
                                            <td className="p-3 text-right font-mono text-white">S/ {fmt(p.total)}</td>
                                            <td className="p-3 text-right font-mono text-green-400">S/ {fmt(paid)}</td>
                                            <td className="p-3 text-right font-mono text-yellow-400 font-bold">S/ {fmt(pending)}</td>
                                            <td className="p-3">
                                                <button onClick={() => setSelected(p)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg text-xs">
                                                    <DollarSign size={12} /> Pagar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">No hay cuentas pendientes</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
