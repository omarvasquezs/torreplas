import React, { useMemo, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import AsyncSelect from '@/Components/AsyncSelect';
import { Plus, Trash2, Printer, Save, Eye, Download, FileText, Search, XCircle } from 'lucide-react';

function formatMoney(value) {
    return Number(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatusBadge({ status }) {
    const map = {
        draft:    'bg-gray-100 text-gray-600',
        sent:     'bg-blue-100 text-blue-700',
        accepted: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };
    const labels = { draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada', rejected: 'Rechazada' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? map.draft}`}>
            {labels[status] ?? status}
        </span>
    );
}

export default function QuotationsIndex({ quotations, filters = {} }) {
    const [tab, setTab] = useState('list'); // 'list' | 'new'
    const [search, setSearch] = useState(filters.search ?? '');

    // ── NEW QUOTATION FORM ──────────────────────────────────────────
    const [formMeta, setFormMeta] = useState({
        quote_number: `COT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        issue_date:   new Date().toISOString().slice(0, 10),
        valid_until:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        client_id:    '',
        attention:    '',
        notes:        'Precios incluyen IGV. Vigencia sujeta a disponibilidad de stock.',
    });

    const [items, setItems] = useState([
        { product_id: '', _product: null, description: '', quantity: 1, unit_price: 0 },
    ]);

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const [selectedClientObj, setSelectedClientObj] = useState(null);

    const subtotal = useMemo(
        () => items.reduce((acc, r) => acc + (Number(r.quantity) || 0) * (Number(r.unit_price) || 0), 0),
        [items]
    );
    const igv   = subtotal * 0.18;
    const total = subtotal + igv;

    function updateItem(idx, key, val) {
        setItems(prev => { const n = [...prev]; n[idx] = { ...n[idx], [key]: val }; return n; });
    }

    function onProductChange(idx, val) {
        updateItem(idx, '_product', val);
        updateItem(idx, 'product_id', val?.id || '');
        if (val) {
            updateItem(idx, 'description', val.name);
            updateItem(idx, 'unit_price', val.price || 0);
        }
    }

    function addRow()         { setItems(prev => [...prev, { product_id: '', _product: null, description: '', quantity: 1, unit_price: 0 }]); }
    function removeRow(idx)   { setItems(prev => prev.filter((_, i) => i !== idx)); }

    function saveQuotation() {
        setSaving(true);
        setErrors({});
        router.post(route('quotations.store'), {
            ...formMeta,
            items: items.map(i => ({
                product_id:  i.product_id || null,
                description: i.description,
                quantity:    Number(i.quantity),
                unit_price:  Number(i.unit_price),
            })),
        }, {
            onError: (e) => { setErrors(e); setSaving(false); },
            onSuccess: () => setSaving(false),
        });
    }

    // ── SEARCH ─────────────────────────────────────────────────────
    function handleSearch(e) {
        e.preventDefault();
        router.get(route('quotations.index'), { search }, { preserveState: true });
    }

    function confirmDelete(id) {
        if (confirm('¿Eliminar esta cotización?')) {
            router.delete(route('quotations.destroy', id), { preserveScroll: true });
        }
    }

    // ── RENDER ─────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <Head title="Cotizaciones" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cotizaciones</h1>
                    <p className="text-gray-500 dark:text-gray-400">Propuestas comerciales para tus clientes.</p>
                </div>
                <button
                    onClick={() => setTab(tab === 'new' ? 'list' : 'new')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow transition-all ${
                        tab === 'new'
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    }`}
                >
                    {tab === 'new' ? <><XCircle size={18} /> Cancelar</> : <><Plus size={18} /> Nueva Cotización</>}
                </button>
            </div>

            {/* ── NEW QUOTATION PANEL ── */}
            {tab === 'new' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Cotización</h2>

                    {/* Meta fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'N° Cotización', key: 'quote_number', type: 'text' },
                            { label: 'Fecha Emisión', key: 'issue_date', type: 'date' },
                            { label: 'Válida hasta', key: 'valid_until', type: 'date' },
                            { label: 'Atención a', key: 'attention', type: 'text', placeholder: 'Nombre de contacto' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{f.label}</label>
                                <input
                                    type={f.type}
                                    value={formMeta[f.key]}
                                    placeholder={f.placeholder ?? ''}
                                    onChange={e => setFormMeta(p => ({ ...p, [f.key]: e.target.value }))}
                                    className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm"
                                />
                                {errors[f.key] && <p className="text-red-500 text-xs mt-1">{errors[f.key]}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Client */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente</label>
                            <div className="w-full relative shadow-sm">
                                <AsyncSelect
                                    resource="clients"
                                    value={selectedClientObj}
                                    onChange={obj => {
                                        setSelectedClientObj(obj);
                                        setFormMeta(p => ({ ...p, client_id: obj?.id || '' }));
                                    }}
                                    placeholder="Buscar y seleccionar cliente..."
                                    renderOption={(item) => `${item.name} - ${item.document_number}`}
                                    renderDisplay={(item) => item ? item.name : ''}
                                    className="w-full z-20"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <div className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                                {selectedClientObj
                                    ? `${selectedClientObj.document_type || 'DOC'}: ${selectedClientObj.document_number}`
                                    : 'Sin documento de cliente'}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="overflow-x-auto border border-gray-200 dark:border-slate-600 rounded-xl">
                        <table className="min-w-[760px] w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="px-3 py-2 text-left">Producto</th>
                                    <th className="px-3 py-2 text-left">Descripción</th>
                                    <th className="px-3 py-2 text-right w-24">Cantidad</th>
                                    <th className="px-3 py-2 text-right w-28">P. Unit.</th>
                                    <th className="px-3 py-2 text-right w-28">Importe</th>
                                    <th className="px-3 py-2 text-center w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((row, idx) => (
                                    <tr key={idx} className="border-t border-gray-200 dark:border-slate-600">
                                        <td className="px-3 py-2">
                                            <div className="w-full relative">
                                                <AsyncSelect
                                                    resource="products"
                                                    value={row._product}
                                                    onChange={val => onProductChange(idx, val)}
                                                    placeholder="Buscar..."
                                                    renderOption={(item) => `${item.name} (${item.code || 'S/C'})`}
                                                    renderDisplay={(item) => item ? item.name : ''}
                                                    className="w-full z-10"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input value={row.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input type="number" min="1" value={row.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm text-right" />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input type="number" step="0.01" min="0" value={row.unit_price} onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm text-right" />
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">
                                            S/ {formatMoney((Number(row.quantity)||0) * (Number(row.unit_price)||0))}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button type="button" onClick={() => removeRow(idx)} disabled={items.length === 1}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30">
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap justify-between items-start gap-4">
                        <button type="button" onClick={addRow}
                            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700">
                            <Plus size={15} /> Agregar ítem
                        </button>
                        <div className="w-full md:w-64 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl p-3 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>S/ {formatMoney(subtotal)}</span></div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>IGV (18%)</span><span>S/ {formatMoney(igv)}</span></div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-500 font-bold text-base text-gray-900 dark:text-white"><span>Total</span><span>S/ {formatMoney(total)}</span></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Observaciones / Condiciones</label>
                        <textarea rows={3} value={formMeta.notes} onChange={e => setFormMeta(p => ({ ...p, notes: e.target.value }))}
                            className="w-full rounded-lg border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
                    </div>

                    {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}

                    <div className="flex gap-3">
                        <button type="button" onClick={saveQuotation} disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            <Save size={16} /> {saving ? 'Guardando…' : 'Guardar Cotización'}
                        </button>
                        <button type="button" onClick={() => setTab('list')}
                            className="px-5 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* ── QUOTATIONS LIST ── */}
            {tab === 'list' && (
                <>
                    {/* Search */}
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <form onSubmit={handleSearch} className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar por número o cliente…"
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </form>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                                <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs font-semibold text-gray-700 dark:text-white uppercase">
                                    <tr>
                                        <th className="px-5 py-3">N° Cotización</th>
                                        <th className="px-5 py-3">Cliente</th>
                                        <th className="px-5 py-3">Fecha</th>
                                        <th className="px-5 py-3">Válida hasta</th>
                                        <th className="px-5 py-3">Estado</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {quotations.data.length > 0 ? quotations.data.map(q => (
                                        <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-5 py-3 font-mono font-semibold text-gray-900 dark:text-white">{q.quote_number}</td>
                                            <td className="px-5 py-3 text-gray-800 dark:text-gray-200">{q.client?.name ?? <span className="text-gray-400 italic">Sin cliente</span>}</td>
                                            <td className="px-5 py-3">{q.issue_date}</td>
                                            <td className="px-5 py-3">{q.valid_until ?? '—'}</td>
                                            <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
                                            <td className="px-5 py-3 text-right font-bold text-gray-900 dark:text-white">S/ {formatMoney(q.total)}</td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link href={route('quotations.show', q.id)} title="Ver detalle"
                                                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg text-blue-600 transition">
                                                        <Eye size={15} />
                                                    </Link>
                                                    <a href={route('quotations.pdf', q.id)} target="_blank" title="Descargar PDF"
                                                        className="p-1.5 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg text-indigo-600 transition">
                                                        <Download size={15} />
                                                    </a>
                                                    <button onClick={() => confirmDelete(q.id)} title="Eliminar"
                                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg text-red-500 transition">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                                                <FileText className="mx-auto mb-2 opacity-30" size={36} />
                                                No hay cotizaciones guardadas. Haz clic en <strong>Nueva Cotización</strong> para comenzar.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}
