import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft, Plus, X, Trash2, CheckCircle, Clock } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

const EMPTY_LINE = { account_plan_id: '', description: '', debit: '', credit: '' };

function EntryModal({ accounts, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        date:        new Date().toISOString().split('T')[0],
        description: '',
        reference:   '',
        status:      'draft',
        lines:       [{ ...EMPTY_LINE }, { ...EMPTY_LINE }],
    });

    function setLine(i, field, value) {
        const lines = [...data.lines];
        lines[i] = { ...lines[i], [field]: value };
        setData('lines', lines);
    }
    function addLine()    { setData('lines', [...data.lines, { ...EMPTY_LINE }]); }
    function removeLine(i){ setData('lines', data.lines.filter((_, idx) => idx !== i)); }

    const totalDebit  = data.lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
    const totalCredit = data.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
    const balanced    = Math.abs(totalDebit - totalCredit) < 0.01;

    function submit(e) {
        e.preventDefault();
        post(route('accounting.entries.store'), { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-xl w-full max-w-3xl my-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-white font-semibold">Nuevo Asiento Contable</h3>
                    <button onClick={onClose}><X size={18} className="text-gray-600 hover:text-gray-900"/></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="col-span-2">
                            <label className="block text-gray-600 text-xs mb-1">Descripción <span className="text-red-400">*</span></label>
                            <input value={data.description} onChange={e => setData('description', e.target.value)}
                                className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Fecha <span className="text-red-400">*</span></label>
                            <input type="date" value={data.date} onChange={e => setData('date', e.target.value)}
                                className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" required />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Referencia</label>
                            <input value={data.reference} onChange={e => setData('reference', e.target.value)}
                                className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                        </div>
                    </div>

                    {/* Lines */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-gray-600 text-xs">Líneas</label>
                            <button type="button" onClick={addLine}
                                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300">
                                <Plus size={12}/> Agregar línea
                            </button>
                        </div>
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-gray-100">
                                    <tr className="text-gray-600">
                                        <th className="text-left p-2">Cuenta</th>
                                        <th className="text-left p-2">Descripción</th>
                                        <th className="text-right p-2 w-24">Débito</th>
                                        <th className="text-right p-2 w-24">Crédito</th>
                                        <th className="p-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.lines.map((line, i) => (
                                        <tr key={i} className="border-t border-gray-200">
                                            <td className="p-1">
                                                <select value={line.account_plan_id} onChange={e => setLine(i, 'account_plan_id', e.target.value)}
                                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded px-2 py-1.5 text-xs">
                                                    <option value="">— Seleccionar —</option>
                                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-1">
                                                <input value={line.description} onChange={e => setLine(i, 'description', e.target.value)}
                                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded px-2 py-1.5 text-xs" />
                                            </td>
                                            <td className="p-1">
                                                <input type="number" step="0.01" min="0" value={line.debit} onChange={e => setLine(i, 'debit', e.target.value)}
                                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded px-2 py-1.5 text-xs text-right font-mono" />
                                            </td>
                                            <td className="p-1">
                                                <input type="number" step="0.01" min="0" value={line.credit} onChange={e => setLine(i, 'credit', e.target.value)}
                                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded px-2 py-1.5 text-xs text-right font-mono" />
                                            </td>
                                            <td className="p-1 text-center">
                                                {data.lines.length > 2 && (
                                                    <button type="button" onClick={() => removeLine(i)} className="text-red-400 hover:text-red-300">
                                                        <X size={12}/>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-100/30 border-t border-gray-200">
                                    <tr>
                                        <td colSpan={2} className="p-2 text-gray-600">Total</td>
                                        <td className="p-2 text-right font-mono font-bold text-white">{fmt(totalDebit)}</td>
                                        <td className="p-2 text-right font-mono font-bold text-white">{fmt(totalCredit)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        {!balanced && totalDebit > 0 && (
                            <p className="text-red-400 text-xs mt-1">⚠ El asiento no cuadra: diferencia de {fmt(Math.abs(totalDebit - totalCredit))}</p>
                        )}
                        {errors.lines && <p className="text-red-400 text-xs mt-1">{errors.lines}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={data.status === 'posted'} onChange={e => setData('status', e.target.checked ? 'posted' : 'draft')} />
                            Contabilizar inmediatamente
                        </label>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Cancelar</button>
                            <button type="submit" disabled={processing || !balanced}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                                Guardar
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AccountingEntries({ entries, accounts, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo]     = useState(filters?.to   ?? '');
    const [status, setSt] = useState(filters?.status ?? '');

    function apply() { router.get(route('accounting.entries'), { from, to, status }, { preserveScroll: true }); }

    function postEntry(entry) {
        router.patch(route('accounting.entries.status', entry.id), { status: 'posted' });
    }
    function destroy(entry) {
        if (!confirm('¿Eliminar este asiento borrador?')) return;
        router.delete(route('accounting.entries.destroy', entry.id));
    }

    return (
        <DashboardLayout>
            <Head title="Asientos Contables" />
            {showModal && <EntryModal accounts={accounts} onClose={() => setShowModal(false)} />}

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('accounting.accounts')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><ArrowLeft size={18}/></Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Asientos Contables</h1>
                        <p className="text-gray-600 text-sm">{entries?.total ?? 0} asientos</p>
                    </div>
                    <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium">
                        <Plus size={16}/> Nuevo Asiento
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Desde</label>
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm"/>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Hasta</label>
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm"/>
                    </div>
                    <div>
                        <label className="block text-gray-600 text-xs mb-1">Estado</label>
                        <select value={status} onChange={e => setSt(e.target.value)}
                            className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                            <option value="">Todos</option>
                            <option value="draft">Borrador</option>
                            <option value="posted">Contabilizado</option>
                        </select>
                    </div>
                    <button onClick={apply} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">Filtrar</button>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-600">
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-left p-3">Descripción</th>
                                    <th className="text-left p-3">Referencia</th>
                                    <th className="text-right p-3">Total Débito</th>
                                    <th className="text-left p-3">Estado</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries?.data?.length ? entries.data.map(e => {
                                    const td = e.lines?.reduce((s, l) => s + parseFloat(l.debit  || 0), 0) ?? 0;
                                    return (
                                        <tr key={e.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 text-gray-600 text-xs">{e.date?.split('T')[0]}</td>
                                            <td className="p-3 text-gray-700">{e.description}</td>
                                            <td className="p-3 text-gray-600 text-xs">{e.reference ?? '—'}</td>
                                            <td className="p-3 text-right font-mono text-white">S/ {fmt(td)}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${e.status === 'posted' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {e.status === 'posted' ? 'Contabilizado' : 'Borrador'}
                                                </span>
                                            </td>
                                            <td className="p-3 flex gap-1 justify-end">
                                                {e.status === 'draft' && (
                                                    <>
                                                        <button onClick={() => postEntry(e)}
                                                            className="p-1.5 bg-green-500/10 hover:bg-green-500/30 text-green-400 rounded-lg" title="Contabilizar">
                                                            <CheckCircle size={14}/>
                                                        </button>
                                                        <button onClick={() => destroy(e)}
                                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={14}/></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay asientos registrados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {entries?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap">
                            {entries.links.map((l, i) => (
                                <button key={i} disabled={!l.url} onClick={() => l.url && router.get(l.url)}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                    className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-600 disabled:opacity-40'}`}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
