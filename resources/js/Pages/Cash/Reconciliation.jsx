import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, CheckCircle, Circle, CreditCard } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

export default function Reconciliation({ bankAccount, bankAccounts, summary }) {
    const [tab] = [null]; // just for rendering both groups

    const pending     = bankAccount?.transactions?.filter(t => !t.reconciled) ?? [];
    const reconciled  = bankAccount?.transactions?.filter(t =>  t.reconciled) ?? [];

    function toggle(transaction) {
        router.post(route('bank.reconcile', transaction.id), {}, { preserveScroll: true });
    }

    function TxRow({ tx }) {
        const isIn = tx.type === 'deposit' || tx.type === 'ingreso';
        return (
            <tr className="border-b border-gray-700/30 hover:bg-gray-700/20">
                <td className="p-3 text-gray-400 text-xs">{tx.transaction_date?.split('T')[0]}</td>
                <td className="p-3 text-gray-300 text-sm">{tx.description}</td>
                <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isIn ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tx.type ?? 'movimiento'}
                    </span>
                </td>
                <td className={`p-3 text-right font-mono text-sm ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                    {isIn ? '+' : '-'}S/ {fmt(Math.abs(tx.amount))}
                </td>
                <td className="p-3 text-center">
                    <button onClick={() => toggle(tx)} title={tx.reconciled ? 'Desmarcar' : 'Conciliar'}
                        className={`w-7 h-7 flex items-center justify-center rounded-full transition ${tx.reconciled ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-700 text-gray-400 hover:bg-green-500/20 hover:text-green-400'}`}>
                        {tx.reconciled ? <CheckCircle size={16}/> : <Circle size={16}/>}
                    </button>
                </td>
            </tr>
        );
    }

    return (
        <DashboardLayout>
            <Head title="Conciliación Bancaria" />
            <div className="flex gap-6 h-full">

                {/* Sidebar: bank accounts */}
                <aside className="w-60 shrink-0 space-y-2">
                    <p className="text-gray-500 text-xs uppercase tracking-wider px-1 mb-3">Cuentas</p>
                    {bankAccounts?.map(ba => (
                        <Link key={ba.id} href={route('bank.reconciliation', ba.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${ba.id === bankAccount?.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}`}>
                            <CreditCard size={15}/>
                            <div className="min-w-0">
                                <p className="truncate font-medium">{ba.alias ?? ba.bank_name}</p>
                                <p className="text-xs opacity-60 truncate">{ba.account_number}</p>
                            </div>
                        </Link>
                    ))}
                </aside>

                {/* Main content */}
                <div className="flex-1 space-y-6 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">Conciliación Bancaria</h1>
                            {bankAccount && <p className="text-gray-400 text-sm">{bankAccount.alias ?? bankAccount.bank_name} — {bankAccount.account_number}</p>}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <p className="text-green-400 text-xs mb-1">Conciliados</p>
                            <p className="text-2xl font-bold text-white">{summary?.reconciled_count ?? 0}</p>
                            <p className="text-green-400 text-sm mt-1">S/ {fmt(summary?.reconciled_amount)}</p>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                            <p className="text-yellow-400 text-xs mb-1">Pendientes</p>
                            <p className="text-2xl font-bold text-white">{summary?.unreconciled_count ?? 0}</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                            <p className="text-gray-400 text-xs mb-1">Total transacciones</p>
                            <p className="text-2xl font-bold text-white">{(summary?.reconciled_count ?? 0) + (summary?.unreconciled_count ?? 0)}</p>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
                            <h2 className="text-white font-semibold text-sm">Transacciones pendientes</h2>
                            <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">{pending.length}</span>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-left p-3">Descripción</th>
                                    <th className="text-left p-3">Tipo</th>
                                    <th className="text-right p-3">Monto</th>
                                    <th className="text-center p-3">Conciliar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.length ? pending.map(t => <TxRow key={t.id} tx={t}/>)
                                    : <tr><td colSpan={5} className="p-6 text-center text-gray-500">No hay transacciones pendientes 🎉</td></tr>}
                            </tbody>
                        </table>
                    </div>

                    {/* Reconciled */}
                    {reconciled.length > 0 && (
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between">
                                <h2 className="text-white font-semibold text-sm">Conciliados</h2>
                                <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">{reconciled.length}</span>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700/50 text-gray-400">
                                        <th className="text-left p-3">Fecha</th>
                                        <th className="text-left p-3">Descripción</th>
                                        <th className="text-left p-3">Tipo</th>
                                        <th className="text-right p-3">Monto</th>
                                        <th className="text-center p-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reconciled.map(t => <TxRow key={t.id} tx={t}/>)}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
