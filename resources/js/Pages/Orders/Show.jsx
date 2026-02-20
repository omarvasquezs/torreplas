import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft, FileText, DollarSign, X } from 'lucide-react';

const STATUS_LABELS = { pending:'Pendiente', processing:'En Proceso', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' };
const STATUS_COLORS = {
    pending:'bg-yellow-500/20 text-yellow-400',
    processing:'bg-blue-500/20 text-blue-400',
    shipped:'bg-purple-500/20 text-purple-400',
    delivered:'bg-green-500/20 text-green-400',
    cancelled:'bg-red-500/20 text-red-400',
};
const PAY_METHOD_LABELS = { cash:'Efectivo', transfer:'Transferencia', card:'Tarjeta', check:'Cheque' };

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

function PaymentModal({ order, onClose }) {
    const pending = (order?.total ?? 0) - (order?.paid_amount ?? 0);
    const { data, setData, post, processing, errors, reset } = useForm({
        amount:         pending > 0 ? pending : '',
        payment_method: 'cash',
        reference:      '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('accounts.receivable.payment', order.id), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Registrar Pago</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-4">
                    <div className="bg-gray-700/50 rounded-lg p-3 text-sm text-gray-300 space-y-1">
                        <div><span className="text-gray-400">Saldo:</span>
                            <span className="text-yellow-400 font-bold ml-1">S/ {fmt(pending)}</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Monto <span className="text-red-400">*</span></label>
                        <input type="number" step="0.01" min="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Método</label>
                        <select value={data.payment_method} onChange={e => setData('payment_method', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                            {Object.entries(PAY_METHOD_LABELS).map(([v, l]) =>
                                <option key={v} value={v}>{l}</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Referencia</label>
                        <input type="text" value={data.reference} onChange={e => setData('reference', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm">Cancelar</button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function OrderShow({ order }) {
    const [showPayment, setShowPayment] = useState(false);
    const paid    = Number(order?.paid_amount ?? 0);
    const pending = Number(order?.total ?? 0) - paid;

    return (
        <DashboardLayout>
            <Head title={`Pedido #${order?.order_number ?? order?.id}`} />
            {showPayment && <PaymentModal order={order} onClose={() => setShowPayment(false)} />}

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('orders.index')}
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Pedido #{order?.order_number ?? order?.id}
                            </h1>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs mt-1 ${STATUS_COLORS[order?.status] ?? 'bg-gray-500/20 text-gray-400'}`}>
                                {STATUS_LABELS[order?.status] ?? order?.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {pending > 0 && (
                            <button onClick={() => setShowPayment(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg text-sm">
                                <DollarSign size={16} /> Registrar Pago
                            </button>
                        )}
                        <Link href={route('invoices.create', { order_id: order?.id })}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm">
                            <FileText size={16} /> Facturar
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: client + order info */}
                    <div className="space-y-4">
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-2">
                            <h2 className="text-white font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">Cliente</h2>
                            <p className="text-white font-medium">{order?.client?.name ?? '—'}</p>
                            {order?.client?.document_number && <p className="text-gray-400 text-sm">RUC/DNI: {order.client.document_number}</p>}
                            {order?.client?.email && <p className="text-gray-400 text-sm">{order.client.email}</p>}
                            {order?.client?.phone && <p className="text-gray-400 text-sm">{order.client.phone}</p>}
                            {order?.client?.address && <p className="text-gray-400 text-sm">{order.client.address}</p>}
                        </div>

                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 space-y-2">
                            <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-3">Resumen de Pago</h2>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total</span>
                                <span className="font-mono text-white">S/ {fmt(order?.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Pagado</span>
                                <span className="font-mono text-green-400">S/ {fmt(paid)}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-gray-700 pt-2 mt-2">
                                <span className="text-gray-400 font-medium">Saldo</span>
                                <span className={`font-mono font-bold ${pending > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                                    S/ {fmt(pending)}
                                </span>
                            </div>
                        </div>

                        {/* Payments history */}
                        {order?.payments?.length > 0 && (
                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                                <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-3">Pagos Registrados</h2>
                                <div className="space-y-2">
                                    {order.payments.map(p => (
                                        <div key={p.id} className="flex justify-between text-sm">
                                            <div>
                                                <span className="text-gray-300">{PAY_METHOD_LABELS[p.payment_method] ?? p.payment_method}</span>
                                                {p.reference && <span className="text-gray-500 text-xs ml-1">({p.reference})</span>}
                                                <div className="text-gray-500 text-xs">{p.created_at?.split('T')[0]}</div>
                                            </div>
                                            <span className="font-mono text-green-400">S/ {fmt(p.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: items */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-gray-700/50">
                                <h2 className="text-white font-semibold">Productos del Pedido</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-700/50 text-gray-400">
                                            <th className="text-left p-3">Producto</th>
                                            <th className="text-right p-3">Precio</th>
                                            <th className="text-right p-3">Cant.</th>
                                            <th className="text-right p-3">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order?.items?.length ? order.items.map(item => (
                                            <tr key={item.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                                <td className="p-3 text-gray-300">
                                                    {item.product?.name ?? `Producto #${item.product_id}`}
                                                    {item.product?.sku && <div className="text-gray-500 text-xs">{item.product.sku}</div>}
                                                </td>
                                                <td className="p-3 text-right font-mono text-gray-300">S/ {fmt(item.price ?? item.unit_price)}</td>
                                                <td className="p-3 text-right text-gray-300">{item.quantity}</td>
                                                <td className="p-3 text-right font-mono text-white">
                                                    S/ {fmt((item.price ?? item.unit_price ?? 0) * item.quantity)}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="p-6 text-center text-gray-500">Sin productos</td></tr>
                                        )}
                                    </tbody>
                                    {order?.items?.length > 0 && (
                                        <tfoot className="border-t border-gray-700/50">
                                            <tr>
                                                <td colSpan={3} className="p-3 text-right text-gray-400 font-medium">Total</td>
                                                <td className="p-3 text-right font-mono font-bold text-white text-base">
                                                    S/ {fmt(order?.total)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>

                        {/* Invoices */}
                        {order?.invoices?.length > 0 && (
                            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden mt-4">
                                <div className="p-4 border-b border-gray-700/50">
                                    <h2 className="text-white font-semibold">Comprobantes Emitidos</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-700/50 text-gray-400">
                                                <th className="text-left p-3">N° Comprobante</th>
                                                <th className="text-left p-3">Tipo</th>
                                                <th className="text-left p-3">Estado</th>
                                                <th className="text-right p-3">Total</th>
                                                <th className="p-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.invoices.map(inv => (
                                                <tr key={inv.id} className="border-b border-gray-700/30">
                                                    <td className="p-3 text-indigo-400">{inv.invoice_number}</td>
                                                    <td className="p-3 text-gray-300 capitalize">{inv.type}</td>
                                                    <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">{inv.status}</span></td>
                                                    <td className="p-3 text-right font-mono text-white">S/ {fmt(inv.total)}</td>
                                                    <td className="p-3">
                                                        <Link href={route('invoices.show', inv.id)}
                                                            className="text-indigo-400 hover:underline text-xs">Ver</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
