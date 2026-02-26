import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function InvoicesForm({ clients, orders, series = [] }) {
    const defaultSeriesByType = useMemo(() => {
        const map = {};
        series.forEach((row) => {
            if (!map[row.type]) map[row.type] = row.series;
        });
        return map;
    }, [series]);

    const { data, setData, post, processing, errors } = useForm({
        client_id:    '',
        order_id:     '',
        type:         'factura',
        serie:        defaultSeriesByType.factura ?? 'F001',
        issue_date:   new Date().toISOString().slice(0, 10),
        total_amount: '',
    });

    const seriesOptions = useMemo(
        () => series.filter((row) => row.type === data.type),
        [series, data.type]
    );

    const suggestedNumber = useMemo(() => {
        const selected = series.find((row) => row.type === data.type && row.series === data.serie);
        const next = selected?.next_number ?? 1;
        return String(next).padStart(8, '0');
    }, [series, data.type, data.serie]);

    useEffect(() => {
        if (seriesOptions.length === 0) return;
        if (!seriesOptions.some((row) => row.series === data.serie)) {
            setData('serie', seriesOptions[0].series);
        }
    }, [seriesOptions, data.serie, setData]);

    function submit(e) {
        e.preventDefault();
        post(route('invoices.store'));
    }

    function handleOrderChange(orderId) {
        setData('order_id', orderId);
        if (orderId) {
            const order = orders.find(o => o.id == orderId);
            if (order) {
                setData(d => ({ ...d, order_id: orderId, client_id: order.client_id, total_amount: order.total }));
            }
        }
    }

    return (
        <DashboardLayout>
            <Head title="Nuevo Comprobante" />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('invoices.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Comprobante</h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-gray-900 font-semibold">Datos del Comprobante</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="factura">Factura</option>
                                    <option value="boleta">Boleta</option>
                                    <option value="nota_credito">Nota Crédito</option>
                                    <option value="nota_debito">Nota Débito</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Fecha Emisión</label>
                                <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                {errors.issue_date && <p className="text-red-400 text-xs mt-1">{errors.issue_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Serie</label>
                                <select value={data.serie} onChange={e => setData('serie', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {(seriesOptions.length > 0 ? seriesOptions : [{ series: data.serie }]).map((row) => (
                                        <option key={row.series} value={row.series}>{row.series}</option>
                                    ))}
                                </select>
                                {errors.serie && <p className="text-red-400 text-xs mt-1">{errors.serie}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Número</label>
                                <input type="text" value={suggestedNumber} readOnly
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Pedido (opcional)</label>
                            <select value={data.order_id} onChange={e => handleOrderChange(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Sin pedido asociado</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>{o.code} — {o.client?.name} (S/ {parseFloat(o.total).toFixed(2)})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                            <select value={data.client_id} onChange={e => setData('client_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Seleccionar cliente...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.document_type}: {c.document_number})</option>)}
                            </select>
                            {errors.client_id && <p className="text-red-400 text-xs mt-1">{errors.client_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Monto Total (S/)</label>
                            <input type="number" step="0.01" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            {errors.total_amount && <p className="text-red-400 text-xs mt-1">{errors.total_amount}</p>}
                        </div>
                    </section>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            <Save size={16} /> Registrar Comprobante
                        </button>
                        <Link href={route('invoices.index')} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
