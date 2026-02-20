import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

function MovementModal({ cashRegister, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'IN', amount: '', description: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('cash.movements.store', cashRegister.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96 space-y-4">
                <h2 className="text-white font-bold text-lg">Registrar Movimiento</h2>
                <form onSubmit={submit} className="space-y-3">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[['IN', 'Ingreso', 'green'], ['OUT', 'Egreso', 'red']].map(([v, l, c]) => (
                                <button key={v} type="button" onClick={() => setData('type', v)}
                                    className={`py-2 rounded-lg text-sm font-medium transition ${data.type === v ? `bg-${c}-600 text-white` : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Monto (S/)</label>
                        <input type="number" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none" placeholder="0.00" />
                        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                        <input type="text" value={data.description} onChange={e => setData('description', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none" placeholder="Concepto del movimiento" />
                        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            Registrar
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CashShow({ cashRegister, movements }) {
    const [showModal, setShowModal] = useState(false);

    const totalIn  = movements.data.filter(m => m.type === 'IN').reduce((s, m) => s + parseFloat(m.amount), 0);
    const totalOut = movements.data.filter(m => m.type === 'OUT').reduce((s, m) => s + parseFloat(m.amount), 0);

    return (
        <DashboardLayout>
            <Head title={`Caja: ${cashRegister.name}`} />
            {showModal && <MovementModal cashRegister={cashRegister} onClose={() => setShowModal(false)} />}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('cash.index')} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{cashRegister.name}</h1>
                            <p className="text-gray-400 text-sm">
                                {cashRegister.is_open ? `Abierta desde ${cashRegister.opened_at}` : 'Cerrada'}
                            </p>
                        </div>
                    </div>
                    {cashRegister.is_open && (
                        <button onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                            <Plus size={16} /> Movimiento
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                        <p className="text-gray-400 text-sm">Saldo actual</p>
                        <p className="text-white text-xl font-bold mt-1">S/ {parseFloat(cashRegister.current_balance).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total ingresos</p>
                        <p className="text-white text-xl font-bold mt-1">S/ {totalIn.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <p className="text-red-400 text-sm">Total egresos</p>
                        <p className="text-white text-xl font-bold mt-1">S/ {totalOut.toFixed(2)}</p>
                    </div>
                </div>

                {/* Movements */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700/50">
                        <h2 className="text-white font-semibold">Movimientos</h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-900/50">
                            <tr className="text-gray-400 text-left">
                                <th className="px-4 py-3 font-medium">Tipo</th>
                                <th className="px-4 py-3 font-medium">Descripción</th>
                                <th className="px-4 py-3 font-medium">Registrado por</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {movements.data.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Sin movimientos</td></tr>
                            )}
                            {movements.data.map(m => (
                                <tr key={m.id} className="hover:bg-gray-700/30">
                                    <td className="px-4 py-3">
                                        {m.type === 'IN'
                                            ? <span className="flex items-center gap-1 text-green-400"><ArrowDownCircle size={14}/> Ingreso</span>
                                            : <span className="flex items-center gap-1 text-red-400"><ArrowUpCircle size={14}/> Egreso</span>
                                        }
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{m.description}</td>
                                    <td className="px-4 py-3 text-gray-400">{m.user?.name}</td>
                                    <td className="px-4 py-3 text-gray-400 text-xs">{m.created_at}</td>
                                    <td className={`px-4 py-3 text-right font-medium ${m.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                                        {m.type === 'IN' ? '+' : '-'} S/ {parseFloat(m.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {movements.links && (
                        <div className="px-4 py-3 border-t border-gray-700/50 flex gap-1">
                            {movements.links.map((link, i) => (
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
