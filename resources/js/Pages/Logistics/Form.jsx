import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function LogisticsForm({ orders, carriers }) {
    const { data, setData, post, processing, errors } = useForm({
        code:                '',
        order_id:            '',
        carrier_id:          '',
        scheduled_date:      new Date().toISOString().slice(0, 10),
        destination_address: '',
        notes:               '',
    });

    function handleOrderChange(orderId) {
        setData(d => ({ ...d, order_id: orderId }));
        if (orderId) {
            const order = orders.find(o => o.id == orderId);
            if (order?.client?.address) {
                setData(d => ({ ...d, order_id: orderId, destination_address: order.client.address }));
            }
        }
    }

    function submit(e) {
        e.preventDefault();
        post(route('deliveries.store'));
    }

    return (
        <DashboardLayout>
            <Head title="Nuevo Despacho" />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('deliveries.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Nuevo Despacho</h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Datos del Despacho</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Código</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value)} placeholder="DSP-001"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                {errors.code && <p className="text-red-400 text-xs mt-1">{errors.code}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Fecha programada</label>
                                <input type="date" value={data.scheduled_date} onChange={e => setData('scheduled_date', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                {errors.scheduled_date && <p className="text-red-400 text-xs mt-1">{errors.scheduled_date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Pedido asociado (opcional)</label>
                            <select value={data.order_id} onChange={e => handleOrderChange(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Sin pedido</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>{o.code} — {o.client?.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Transportista (opcional)</label>
                            <select value={data.carrier_id} onChange={e => setData('carrier_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Sin transportista asignado</option>
                                {carriers.map(c => <option key={c.id} value={c.id}>{c.name} {c.license_plate ? `(${c.license_plate})` : ''}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Dirección de entrega</label>
                            <input type="text" value={data.destination_address} onChange={e => setData('destination_address', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            {errors.destination_address && <p className="text-red-400 text-xs mt-1">{errors.destination_address}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Notas</label>
                            <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={3}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                        </div>
                    </section>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            <Save size={16} /> Programar Despacho
                        </button>
                        <Link href={route('deliveries.index')} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
