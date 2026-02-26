import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { DollarSign, Lock, Unlock, Eye, Plus, Building, CreditCard } from 'lucide-react';

function OpenCashModal({ cashRegister, onClose }) {
    const { data, setData, post, processing, errors } = useForm({ opening_balance: '' });

    function submit(e) {
        e.preventDefault();
        post(route('cash.open', cashRegister.id), { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-96 space-y-4">
                <h2 className="text-white font-bold text-lg">Apertura de Caja: {cashRegister.name}</h2>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Saldo inicial (S/)</label>
                        <input type="number" step="0.01" value={data.opening_balance} onChange={e => setData('opening_balance', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0.00" autoFocus />
                        {errors.opening_balance && <p className="text-red-400 text-xs mt-1">{errors.opening_balance}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            Abrir Caja
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AddBankModal({ onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        bank_name: '', account_number: '', account_type: 'corriente', currency: 'PEN', current_balance: '0',
    });

    function submit(e) {
        e.preventDefault();
        post(route('bank.store'), { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl border border-gray-200 p-6 w-96 space-y-4">
                <h2 className="text-white font-bold text-lg">Nueva Cuenta Bancaria</h2>
                <form onSubmit={submit} className="space-y-3">
                    {[
                        ['Banco', 'bank_name', 'text', 'BCP, Interbank...'],
                        ['N° Cuenta', 'account_number', 'text', '1941234567890'],
                        ['Saldo inicial (S/)', 'current_balance', 'number', '0.00'],
                    ].map(([label, name, type, placeholder]) => (
                        <div key={name}>
                            <label className="block text-sm text-gray-600 mb-1">{label}</label>
                            <input type={type} value={data[name]} onChange={e => setData(name, e.target.value)} placeholder={placeholder}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-white text-sm focus:outline-none" />
                            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                        </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                            <select value={data.account_type} onChange={e => setData('account_type', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-white text-sm">
                                <option value="corriente">Corriente</option>
                                <option value="ahorros">Ahorros</option>
                                <option value="mancomunada">Mancomunada</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Moneda</label>
                            <select value={data.currency} onChange={e => setData('currency', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-white text-sm">
                                <option value="PEN">PEN</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            Guardar
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CashIndex({ cashRegisters, bankAccounts }) {
    const [openModal, setOpenModal] = useState(null); // cashRegister object
    const [showBankModal, setShowBankModal] = useState(false);

    function closeCash(id) {
        if (confirm('¿Cerrar caja?')) {
            router.post(route('cash.close', id));
        }
    }

    const totalCash = cashRegisters.filter(c => c.is_open).reduce((s, c) => s + parseFloat(c.current_balance || 0), 0);
    const totalBank = bankAccounts.reduce((s, b) => s + parseFloat(b.current_balance || 0), 0);

    return (
        <DashboardLayout>
            <Head title="Caja y Bancos" />
            {openModal && <OpenCashModal cashRegister={openModal} onClose={() => setOpenModal(null)} />}
            {showBankModal && <AddBankModal onClose={() => setShowBankModal(false)} />}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Caja y Bancos</h1>
                        <p className="text-gray-600 text-sm mt-1">Control de efectivo y cuentas bancarias</p>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total en Caja</p>
                        <p className="text-white text-2xl font-bold mt-1">S/ {totalCash.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Total en Bancos</p>
                        <p className="text-white text-2xl font-bold mt-1">S/ {totalBank.toFixed(2)}</p>
                    </div>
                </div>

                {/* Cash Registers */}
                <div>
                    <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <DollarSign size={18} className="text-green-400" /> Cajas Registradoras
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cashRegisters.map(cr => (
                            <div key={cr.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-white font-medium">{cr.name}</p>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cr.is_open ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/50 text-gray-600'}`}>
                                        {cr.is_open ? 'Abierta' : 'Cerrada'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-xs">Saldo actual</p>
                                    <p className="text-white text-xl font-bold">S/ {parseFloat(cr.current_balance || 0).toFixed(2)}</p>
                                </div>
                                {cr.user && <p className="text-gray-500 text-xs">Asignada a: {cr.user.name}</p>}
                                <div className="flex gap-2">
                                    {cr.is_open ? (
                                        <>
                                            <Link href={route('cash.show', cr.id)}
                                                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg text-xs transition">
                                                <Eye size={13} /> Ver movimientos
                                            </Link>
                                            <button onClick={() => closeCash(cr.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs transition">
                                                <Lock size={13} /> Cerrar
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={() => setOpenModal(cr)}
                                            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg text-xs transition">
                                            <Unlock size={13} /> Abrir caja
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bank Accounts */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <Building size={18} className="text-blue-400" /> Cuentas Bancarias
                        </h2>
                        <button onClick={() => setShowBankModal(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs transition">
                            <Plus size={13} /> Agregar cuenta
                        </button>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {bankAccounts.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">No hay cuentas bancarias registradas</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-white/80">
                                    <tr className="text-gray-600 text-left">
                                        <th className="px-4 py-3 font-medium">Banco</th>
                                        <th className="px-4 py-3 font-medium">N° Cuenta</th>
                                        <th className="px-4 py-3 font-medium">Tipo</th>
                                        <th className="px-4 py-3 font-medium">Moneda</th>
                                        <th className="px-4 py-3 font-medium text-right">Saldo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {bankAccounts.map(ba => (
                                        <tr key={ba.id} className="hover:bg-gray-100/30">
                                            <td className="px-4 py-3 text-white font-medium">{ba.bank_name}</td>
                                            <td className="px-4 py-3 font-mono text-gray-700 text-xs">{ba.account_number}</td>
                                            <td className="px-4 py-3 text-gray-600 capitalize">{ba.account_type}</td>
                                            <td className="px-4 py-3 text-gray-600">{ba.currency}</td>
                                            <td className="px-4 py-3 text-right text-white font-medium">
                                                {ba.currency === 'USD' ? '$' : 'S/'} {parseFloat(ba.current_balance).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
