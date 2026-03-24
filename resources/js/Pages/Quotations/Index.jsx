import React, { useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Trash2, Printer } from 'lucide-react';

function formatMoney(value) {
    return Number(value || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function QuotationsIndex({ clients = [], products = [] }) {
    const [form, setForm] = useState({
        quote_number: `COT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        issue_date: new Date().toISOString().slice(0, 10),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        client_id: '',
        attention: '',
        notes: 'Precios incluyen IGV. Vigencia sujeta a disponibilidad de stock.',
    });

    const [items, setItems] = useState([
        { product_id: '', description: '', quantity: 1, unit_price: 0 },
    ]);

    const selectedClient = useMemo(
        () => clients.find((client) => String(client.id) === String(form.client_id)),
        [clients, form.client_id]
    );

    const subtotal = useMemo(
        () => items.reduce((acc, row) => acc + (Number(row.quantity) || 0) * (Number(row.unit_price) || 0), 0),
        [items]
    );

    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    function updateItem(index, key, value) {
        setItems((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };
            return next;
        });
    }

    function onProductChange(index, productId) {
        const product = products.find((row) => String(row.id) === String(productId));
        updateItem(index, 'product_id', productId);
        if (product) {
            updateItem(index, 'description', product.name);
            updateItem(index, 'unit_price', product.price || 0);
        }
    }

    function addRow() {
        setItems((prev) => [...prev, { product_id: '', description: '', quantity: 1, unit_price: 0 }]);
    }

    function removeRow(index) {
        setItems((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <DashboardLayout>
            <Head title="Cotización" />

            {/* Print-only styles */}
            <style>{`
                @media print {
                    /* Hide everything except the quotation content */
                    body > *:not(#app) { display: none !important; }
                    nav, aside, header, .no-print, [data-sidebar], button { display: none !important; }
                    #quotation-print { display: block !important; }

                    /* Reset body for clean print */
                    body { background: white !important; color: black !important; font-size: 11pt; }

                    .print-only { display: block !important; }
                    .print-hide { display: none !important; }

                    .quotation-card { box-shadow: none !important; border: 1px solid #ddd !important; }
                    .quotation-table th { background: #eee !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .quotation-totals { border: 1px solid #ddd !important; }
                    .quotation-header { border-bottom: 2px solid #4f46e5 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    a[href], button { display: none !important; }
                    select, input, textarea { border: none !important; background: transparent !important; }
                    @page { margin: 1.5cm; size: A4; }
                }
                @media screen {
                    .print-only { display: none; }
                }
            `}</style>

            <div id="quotation-print" className="max-w-6xl mx-auto space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 no-print">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cotización</h1>
                        <p className="text-sm text-gray-600">Formato referencial para compartir propuestas comerciales.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium"
                    >
                        <Printer size={16} /> Imprimir / PDF
                    </button>
                </div>

                {/* Print header — only visible when printing */}
                <div className="print-only quotation-header" style={{ borderBottom: '2px solid #4f46e5', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#312e81' }}>TORREPLAS SAC</div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>Lima, Perú</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>Cotización</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>{form.quote_number}</div>
                        </div>
                    </div>
                </div>

                <div className="quotation-card bg-white border border-gray-200 rounded-xl p-4 md:p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">N° Cotización</label>
                            <input
                                value={form.quote_number}
                                onChange={(event) => setForm((prev) => ({ ...prev, quote_number: event.target.value }))}
                                className="w-full rounded-lg border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Fecha Emisión</label>
                            <input
                                type="date"
                                value={form.issue_date}
                                onChange={(event) => setForm((prev) => ({ ...prev, issue_date: event.target.value }))}
                                className="w-full rounded-lg border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Válida hasta</label>
                            <input
                                type="date"
                                value={form.valid_until}
                                onChange={(event) => setForm((prev) => ({ ...prev, valid_until: event.target.value }))}
                                className="w-full rounded-lg border-gray-300 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Atención</label>
                            <input
                                value={form.attention}
                                onChange={(event) => setForm((prev) => ({ ...prev, attention: event.target.value }))}
                                placeholder="Nombre de contacto"
                                className="w-full rounded-lg border-gray-300 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Cliente</label>
                            <select
                                value={form.client_id}
                                onChange={(event) => setForm((prev) => ({ ...prev, client_id: event.target.value }))}
                                className="w-full rounded-lg border-gray-300 text-sm"
                            >
                                <option value="">Seleccionar cliente…</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                            {selectedClient ? `${selectedClient.document_type}: ${selectedClient.document_number}` : 'Sin documento de cliente seleccionado'}
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="quotation-table min-w-[760px] w-full text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-3 py-2 text-left">Producto</th>
                                    <th className="px-3 py-2 text-left">Descripción</th>
                                    <th className="px-3 py-2 text-right">Cantidad</th>
                                    <th className="px-3 py-2 text-right">P. Unit.</th>
                                    <th className="px-3 py-2 text-right">Importe</th>
                                    <th className="px-3 py-2 text-center no-print">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((row, index) => (
                                    <tr key={index} className="border-t border-gray-200">
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.product_id}
                                                onChange={(event) => onProductChange(index, event.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm"
                                            >
                                                <option value="">Seleccionar…</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>{product.code} - {product.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                value={row.description}
                                                onChange={(event) => updateItem(index, 'description', event.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={row.quantity}
                                                onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={row.unit_price}
                                                onChange={(event) => updateItem(index, 'unit_price', event.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm text-right"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right font-medium">S/ {formatMoney((Number(row.quantity) || 0) * (Number(row.unit_price) || 0))}</td>
                                        <td className="px-3 py-2 text-center no-print">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(index)}
                                                disabled={items.length === 1}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-start gap-4 flex-wrap">
                        <button
                            type="button"
                            onClick={addRow}
                            className="no-print inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                        >
                            <Plus size={16} /> Agregar ítem
                        </button>

                        <div className="quotation-totals w-full md:w-72 bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span>S/ {formatMoney(subtotal)}</span></div>
                            <div className="flex justify-between"><span>IGV (18%)</span><span>S/ {formatMoney(igv)}</span></div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-base"><span>Total</span><span>S/ {formatMoney(total)}</span></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Observaciones / Condiciones</label>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                            className="w-full rounded-lg border-gray-300 text-sm"
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
