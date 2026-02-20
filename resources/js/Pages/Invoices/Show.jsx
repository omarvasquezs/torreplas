import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, FileText } from 'lucide-react';

const STATUS_LABELS = {
    generated:   { label: 'Generado',     color: 'bg-blue-500/20 text-blue-400' },
    sent_sunat:  { label: 'Enviado SUNAT', color: 'bg-yellow-500/20 text-yellow-400' },
    accepted:    { label: 'Aceptado',      color: 'bg-green-500/20 text-green-400' },
    rejected:    { label: 'Rechazado',     color: 'bg-red-500/20 text-red-400' },
};

export default function InvoicesShow({ invoice }) {
    const { data, setData, put, processing } = useForm({ status: invoice.status });
    const st = STATUS_LABELS[invoice.status] || STATUS_LABELS.generated;

    function updateStatus(e) {
        e.preventDefault();
        put(route('invoices.update', invoice.id));
    }

    return (
        <DashboardLayout>
            <Head title={`Comprobante ${invoice.serie}-${invoice.number}`} />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('invoices.index')} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText size={22} className="text-indigo-400" />
                            {invoice.serie}-{invoice.number}
                        </h1>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Datos del Comprobante</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-400">Tipo</span><span className="text-white">{invoice.type}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Fecha</span><span className="text-white">{invoice.issue_date}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Total</span><span className="text-white font-bold">S/ {parseFloat(invoice.total_amount).toFixed(2)}</span></div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Cliente</h2>
                        <div className="space-y-1 text-sm">
                            <p className="text-white">{invoice.client?.name}</p>
                            <p className="text-gray-400">{invoice.client?.document_type}: {invoice.client?.document_number}</p>
                            <p className="text-gray-400">{invoice.client?.email}</p>
                        </div>
                    </div>
                </div>

                {invoice.order && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                        <h2 className="text-white font-semibold text-sm mb-3">Pedido Asociado: {invoice.order.code}</h2>
                        <table className="w-full text-sm">
                            <thead><tr className="text-gray-400"><th className="text-left py-1">Producto</th><th className="text-right py-1">Cant.</th><th className="text-right py-1">Precio</th><th className="text-right py-1">Total</th></tr></thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {invoice.order.items?.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-2 text-gray-300">{item.product?.name}</td>
                                        <td className="py-2 text-right text-gray-400">{item.quantity}</td>
                                        <td className="py-2 text-right text-gray-400">S/ {parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td className="py-2 text-right text-white">S/ {parseFloat(item.total_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Update Status */}
                <form onSubmit={updateStatus} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-1">Actualizar Estado SUNAT</label>
                        <select value={data.status} onChange={e => setData('status', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="generated">Generado</option>
                            <option value="sent_sunat">Enviado a SUNAT</option>
                            <option value="accepted">Aceptado</option>
                            <option value="rejected">Rechazado</option>
                        </select>
                    </div>
                    <button type="submit" disabled={processing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                        Actualizar
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
