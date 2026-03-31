import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Download, Trash2, FileText } from 'lucide-react';

function formatMoney(v) {
    return Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const STATUS_LABELS = { draft: 'Borrador', sent: 'Enviada', accepted: 'Aceptada', rejected: 'Rechazada' };
const STATUS_COLORS = {
    draft:    'bg-gray-100 text-gray-600',
    sent:     'bg-blue-100 text-blue-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function QuotationShow({ quotation }) {
    function confirmDelete() {
        if (confirm('¿Eliminar esta cotización definitivamente?')) {
            router.delete(route('quotations.destroy', quotation.id));
        }
    }

    return (
        <DashboardLayout>
            <Head title={`Cotización ${quotation.quote_number}`} />

            <div className="max-w-4xl space-y-5">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={route('quotations.index')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 transition">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{quotation.quote_number}</h1>
                            <p className="text-sm text-gray-500">{quotation.issue_date}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[quotation.status] ?? STATUS_COLORS.draft}`}>
                            {STATUS_LABELS[quotation.status] ?? quotation.status}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <a href={route('quotations.pdf', quotation.id)} target="_blank"
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition">
                            <Download size={15} /> Descargar PDF
                        </a>
                        <button onClick={confirmDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition">
                            <Trash2 size={15} /> Eliminar
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
                        <h2 className="text-xs font-semibold uppercase text-gray-400 mb-3">Cliente</h2>
                        {quotation.client ? (
                            <>
                                <p className="font-semibold text-gray-900 dark:text-white">{quotation.client.name}</p>
                                <p className="text-sm text-gray-500">{quotation.client.document_type}: {quotation.client.document_number}</p>
                                {quotation.attention && <p className="text-sm text-gray-500 mt-1">Atención: {quotation.attention}</p>}
                            </>
                        ) : (
                            <p className="text-gray-400 italic text-sm">Sin cliente asignado</p>
                        )}
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 space-y-1.5">
                        <h2 className="text-xs font-semibold uppercase text-gray-400 mb-3">Datos del Documento</h2>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Preparado por</span><span className="font-medium text-gray-900 dark:text-white">{quotation.user?.name ?? '—'}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Válida hasta</span><span className="font-medium text-gray-900 dark:text-white">{quotation.valid_until ?? '—'}</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Creado</span><span className="font-medium text-gray-900 dark:text-white">{quotation.created_at?.slice(0, 10)}</span></div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-700 text-xs uppercase text-gray-500 dark:text-gray-300">
                                <tr>
                                    <th className="px-5 py-3 text-left">#</th>
                                    <th className="px-5 py-3 text-left">Descripción</th>
                                    <th className="px-5 py-3 text-right">Cantidad</th>
                                    <th className="px-5 py-3 text-right">P. Unit.</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {quotation.items.map((item, i) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                                        <td className="px-5 py-3 text-gray-900 dark:text-white">{item.description}</td>
                                        <td className="px-5 py-3 text-right">{Number(item.quantity).toFixed(2)}</td>
                                        <td className="px-5 py-3 text-right">S/ {formatMoney(item.unit_price)}</td>
                                        <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">S/ {formatMoney(item.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                        <div className="w-64 space-y-1.5 text-sm">
                            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>S/ {formatMoney(quotation.subtotal)}</span></div>
                            <div className="flex justify-between text-gray-500"><span>IGV (18%)</span><span>S/ {formatMoney(quotation.tax)}</span></div>
                            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-slate-600 font-bold text-lg text-gray-900 dark:text-white">
                                <span>Total</span><span>S/ {formatMoney(quotation.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {quotation.notes && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
                        <p className="text-xs font-semibold uppercase text-yellow-600 dark:text-yellow-400 mb-1">Condiciones / Observaciones</p>
                        <p>{quotation.notes}</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
