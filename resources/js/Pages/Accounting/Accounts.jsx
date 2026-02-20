import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft, Plus, X, Pencil, Trash2 } from 'lucide-react';

const TYPE_LABELS = { asset:'Activo', liability:'Pasivo', equity:'Patrimonio', income:'Ingreso', expense:'Gasto' };
const TYPE_COLORS = { asset:'text-green-400', liability:'text-red-400', equity:'text-blue-400', income:'text-indigo-400', expense:'text-orange-400' };

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

function AccountModal({ account, accounts, onClose }) {
    const isEdit = !!account;
    const { data, setData, post, put, processing, errors } = useForm({
        code:      account?.code      ?? '',
        name:      account?.name      ?? '',
        type:      account?.type      ?? 'asset',
        parent_id: account?.parent_id ?? '',
        is_active: account?.is_active ?? true,
    });
    function submit(e) {
        e.preventDefault();
        const opts = { onSuccess: onClose };
        isEdit
            ? put(route('accounting.accounts.update', account.id), opts)
            : post(route('accounting.accounts.store'), opts);
    }
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">{isEdit ? 'Editar' : 'Nueva'} Cuenta</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-white"/></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Código <span className="text-red-400">*</span></label>
                            <input value={data.code} onChange={e => setData('code', e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm font-mono" required />
                            {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Tipo <span className="text-red-400">*</span></label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                                {Object.entries(TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Nombre <span className="text-red-400">*</span></label>
                        <input value={data.name} onChange={e => setData('name', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Cuenta padre</label>
                        <select value={data.parent_id} onChange={e => setData('parent_id', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                            <option value="">— Ninguna (cuenta raíz) —</option>
                            {accounts.filter(a => !account || a.id !== account.id).map(a => (
                                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">Cancelar</button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                            {isEdit ? 'Guardar' : 'Crear'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AccountingAccounts({ accounts, totals, filters }) {
    const [modal, setModal]   = useState(null); // null | 'new' | account object
    const [typeFilter, setTF] = useState(filters?.type ?? '');
    const [search, setSearch] = useState(filters?.search ?? '');

    function applyFilter() {
        router.get(route('accounting.accounts'), { type: typeFilter, search }, { preserveScroll: true });
    }

    function destroy(account) {
        if (!confirm(`¿Eliminar la cuenta "${account.code} — ${account.name}"?`)) return;
        router.delete(route('accounting.accounts.destroy', account.id));
    }

    return (
        <DashboardLayout>
            <Head title="Plan Contable" />
            {modal && <AccountModal account={modal === 'new' ? null : modal} accounts={accounts} onClose={() => setModal(null)} />}

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('accounting.entries')} onClick={e => { e.preventDefault(); window.history.back(); }}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"><ArrowLeft size={18}/></Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Plan Contable</h1>
                        <p className="text-gray-400 text-sm">{accounts.length} cuentas registradas</p>
                    </div>
                    <button onClick={() => setModal('new')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium">
                        <Plus size={16}/> Nueva Cuenta
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(TYPE_LABELS).map(([t, l]) => (
                        <div key={t} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
                            <p className="text-gray-400 text-xs">{l}</p>
                            <p className={`text-lg font-bold mt-1 ${TYPE_COLORS[t]}`}>S/ {fmt(totals?.[t])}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-36">
                        <label className="block text-gray-400 text-xs mb-1">Buscar</label>
                        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilter()}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" placeholder="Código o nombre..." />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Tipo</label>
                        <select value={typeFilter} onChange={e => setTF(e.target.value)}
                            className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                            <option value="">Todos</option>
                            {Object.entries(TYPE_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <button onClick={applyFilter}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">Filtrar</button>
                </div>

                {/* Table */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">Código</th>
                                    <th className="text-left p-3">Nombre</th>
                                    <th className="text-left p-3">Tipo</th>
                                    <th className="text-left p-3">Padre</th>
                                    <th className="text-right p-3">Saldo</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.length ? accounts.map(a => (
                                    <tr key={a.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                        <td className="p-3 font-mono text-indigo-400 text-xs">{a.code}</td>
                                        <td className="p-3 text-gray-300">{a.parent_id ? <span className="ml-4">↳ </span> : ''}{a.name}</td>
                                        <td className="p-3"><span className={`text-xs font-medium ${TYPE_COLORS[a.type]}`}>{TYPE_LABELS[a.type]}</span></td>
                                        <td className="p-3 text-gray-400 text-xs">{a.parent?.code ?? '—'}</td>
                                        <td className="p-3 text-right font-mono text-white text-xs">S/ {fmt(a.balance)}</td>
                                        <td className="p-3 flex gap-1 justify-end">
                                            <button onClick={() => setModal(a)}
                                                className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg"><Pencil size={14}/></button>
                                            <button onClick={() => destroy(a)}
                                                className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={14}/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay cuentas. Crea una para empezar.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
