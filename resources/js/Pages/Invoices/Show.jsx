import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, FileText, Download, Printer, ChevronDown } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
                    <Link href={route('invoices.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FileText size={22} className="text-indigo-400" />
                            {invoice.serie}-{invoice.number}
                        </h1>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={route('invoices.pdf', invoice.id)}
                            target="_blank"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                        >
                            <Download size={16} /> Descargar PDF
                        </a>

                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition shadow-sm">
                                <Printer size={16} /> Imprimir <ChevronDown size={14} />
                            </Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    href={route('invoices.pdf', { invoice: invoice.id, format: 'a4', action: 'stream' })}
                                                    target="_blank"
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } block px-4 py-2 text-sm`}
                                                >
                                                    Imprimir en A4
                                                </a>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <a
                                                    href={route('invoices.pdf', { invoice: invoice.id, format: 'ticket', action: 'stream' })}
                                                    target="_blank"
                                                    className={`${
                                                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                    } block px-4 py-2 text-sm`}
                                                >
                                                    Imprimir 58mm
                                                </a>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Datos del Comprobante</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Tipo</span><span className="text-white">{invoice.type}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Fecha</span><span className="text-white">{invoice.issue_date}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Total</span><span className="text-white font-bold">S/ {parseFloat(invoice.total_amount).toFixed(2)}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Cliente</h2>
                        <div className="space-y-1 text-sm">
                            <p className="text-white">{invoice.client?.name}</p>
                            <p className="text-gray-600">{invoice.client?.document_type}: {invoice.client?.document_number}</p>
                            <p className="text-gray-600">{invoice.client?.email}</p>
                        </div>
                    </div>
                </div>

                {invoice.order && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h2 className="text-white font-semibold text-sm mb-3">Pedido Asociado: {invoice.order.code}</h2>
                        <table className="w-full text-sm">
                            <thead><tr className="text-gray-600"><th className="text-left py-1">Producto</th><th className="text-right py-1">Cant.</th><th className="text-right py-1">Precio</th><th className="text-right py-1">Total</th></tr></thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {invoice.order.items?.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-2 text-gray-700">{item.product?.name}</td>
                                        <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                                        <td className="py-2 text-right text-gray-600">S/ {parseFloat(item.unit_price).toFixed(2)}</td>
                                        <td className="py-2 text-right text-white">S/ {parseFloat(item.total_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Update Status */}
                <form onSubmit={updateStatus} className="bg-white rounded-xl border border-gray-200 p-4 flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-sm text-gray-600 mb-1">Actualizar Estado SUNAT</label>
                        <select value={data.status} onChange={e => setData('status', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
