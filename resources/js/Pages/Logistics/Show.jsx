import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Truck, MapPin } from 'lucide-react';

const STATUS_MAP = {
    pending:    { label: 'Pendiente',   color: 'bg-yellow-500/20 text-yellow-400' },
    in_transit: { label: 'En tránsito', color: 'bg-blue-500/20 text-blue-400' },
    delivered:  { label: 'Entregado',   color: 'bg-green-500/20 text-green-400' },
    failed:     { label: 'Fallido',     color: 'bg-red-500/20 text-red-400' },
};

export default function LogisticsShow({ delivery }) {
    const st = STATUS_MAP[delivery.status] || STATUS_MAP.pending;
    const { data, setData, put, processing } = useForm({
        status:       delivery.status,
        carrier_id:   delivery.carrier_id || '',
        delivered_at: delivery.delivered_at || '',
        notes:        delivery.notes || '',
    });

    function update(e) {
        e.preventDefault();
        put(route('deliveries.update', delivery.id));
    }

    return (
        <DashboardLayout>
            <Head title={`Despacho ${delivery.code}`} />
            <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('deliveries.index')} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Truck size={22} className="text-indigo-400" /> {delivery.code}
                        </h1>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Detalles</h2>
                        {[
                            ['Fecha programada', delivery.scheduled_date],
                            ['Entregado el', delivery.delivered_at || '—'],
                            ['Transportista', delivery.carrier?.name || '—'],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-400">{k}</span>
                                <span className="text-white">{v}</span>
                            </div>
                        ))}
                        <div className="flex gap-2 items-start text-sm">
                            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300">{delivery.destination_address}</span>
                        </div>
                    </div>

                    {delivery.order && (
                        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-3">
                            <h2 className="text-white font-semibold text-sm">Pedido Asociado</h2>
                            <p className="text-white font-mono">{delivery.order.code}</p>
                            <p className="text-gray-400 text-sm">{delivery.order.client?.name}</p>
                            <div className="border-t border-gray-700/50 pt-2 space-y-1">
                                {delivery.order.items?.map(item => (
                                    <div key={item.id} className="flex justify-between text-xs text-gray-400">
                                        <span>{item.product?.name}</span>
                                        <span>x{item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Update status */}
                <form onSubmit={update} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-4">
                    <h2 className="text-white font-semibold">Actualizar Estado</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Estado</label>
                            <select value={data.status} onChange={e => setData('status', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none">
                                <option value="pending">Pendiente</option>
                                <option value="in_transit">En tránsito</option>
                                <option value="delivered">Entregado</option>
                                <option value="failed">Fallido</option>
                            </select>
                        </div>
                        {data.status === 'delivered' && (
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Fecha/hora entrega</label>
                                <input type="datetime-local" value={data.delivered_at} onChange={e => setData('delivered_at', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none" />
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Notas</label>
                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none resize-none" />
                    </div>
                    <button type="submit" disabled={processing}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                        Guardar cambios
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
