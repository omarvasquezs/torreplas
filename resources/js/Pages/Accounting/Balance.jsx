import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

const TYPE_LABELS = { asset:'Activo', liability:'Pasivo', equity:'Patrimonio', income:'Ingreso', expense:'Gasto' };
const TYPE_BG     = { asset:'bg-green-500/10 border-green-500/20 text-green-400', liability:'bg-red-500/10 border-red-500/20 text-red-400', equity:'bg-blue-500/10 border-blue-500/20 text-blue-400', income:'bg-indigo-500/10 border-indigo-500/20 text-indigo-400', expense:'bg-orange-500/10 border-orange-500/20 text-orange-400' };

export default function AccountingBalance({ accounts, summary, filters }) {
    const [to, setTo]     = useState(filters?.to   ?? '');
    const [from, setFrom] = useState(filters?.from ?? '');

    function apply() { router.get(route('accounting.balance'), { from, to }, { preserveScroll: true }); }

    const netResult = (summary?.income ?? 0) - (summary?.expenses ?? 0);

    return (
        <DashboardLayout>
            <Head title="Balance de Cuentas" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('accounting.entries')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><ArrowLeft size={18}/></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Balance de Cuentas</h1>
                        <p className="text-gray-600 text-sm">Saldos acumulados de asientos contabilizados</p>
                    </div>
                    <button onClick={() => window.print()}
                        className="ml-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                        Imprimir / PDF
                    </button>
                </div>

                {/* Date filter */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Período desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm"/>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm"/>
                    </div>
                    <button onClick={apply} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">Aplicar</button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {Object.entries(TYPE_LABELS).map(([t, l]) => (
                        <div key={t} className={`border rounded-xl p-3 ${TYPE_BG[t]}`}>
                            <p className="text-xs opacity-70">{l}</p>
                            <p className="text-lg font-bold mt-1">S/ {fmt(summary?.[t === 'expense' ? 'expenses' : t === 'asset' ? 'assets' : t === 'liability' ? 'liabilities' : t])}</p>
                        </div>
                    ))}
                    <div className={`border rounded-xl p-3 ${netResult >= 0 ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        <p className="text-xs opacity-70">Resultado Neto</p>
                        <p className="text-lg font-bold mt-1">S/ {fmt(netResult)}</p>
                    </div>
                </div>

                {/* Accounts table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['asset','liability','equity','income','expense'].map(type => {
                        const typeAccounts = accounts.filter(a => a.type === type);
                        if (!typeAccounts.length) return null;
                        return (
                            <div key={type} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className={`px-4 py-3 border-b border-gray-200 flex justify-between items-center`}>
                                    <h2 className={`font-semibold text-sm ${TYPE_BG[type].split(' ')[2]}`}>{TYPE_LABELS[type]}</h2>
                                    <span className="text-gray-600 text-xs">{typeAccounts.length} cuentas</span>
                                </div>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-500">
                                            <th className="text-left px-4 py-2">Código</th>
                                            <th className="text-left px-4 py-2">Cuenta</th>
                                            <th className="text-right px-4 py-2">Saldo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {typeAccounts.map(a => (
                                            <tr key={a.id} className="border-b border-gray-200/20 hover:bg-gray-50">
                                                <td className="px-4 py-2 font-mono text-indigo-400">{a.code}</td>
                                                <td className="px-4 py-2 text-gray-700">{a.name}</td>
                                                <td className="px-4 py-2 text-right font-mono text-white">S/ {fmt(a.balance)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
