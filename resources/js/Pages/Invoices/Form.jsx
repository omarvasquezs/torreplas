import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

const isFactura  = (type) => type === 'factura';
const isBoleta   = (type) => type === 'boleta';
const needsRuc   = (type) => isFactura(type);
const needsDni   = (type) => isBoleta(type);

export default function InvoicesForm({ clients, orders, series = [] }) {
    const defaultSeriesByType = useMemo(() => {
        const map = {};
        series.forEach((row) => {
            if (!map[row.type]) map[row.type] = row.series;
        });
        return map;
    }, [series]);

    const { data, setData, post, processing, errors } = useForm({
        client_id:     '',
        order_id:      '',
        type:          'factura',
        serie:         defaultSeriesByType.factura ?? 'F001',
        issue_date:    new Date().toISOString().slice(0, 10),
        total_amount:  '',
        customer_ruc:  '',
        customer_name: '',
        customer_dni:  '',
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

    // Auto-rellenar RUC / Nombre / DNI desde el cliente seleccionado
    useEffect(() => {
        if (!data.client_id) return;
        const client = clients.find((c) => String(c.id) === String(data.client_id));
        if (!client) return;

        if (isFactura(data.type)) {
            setData((d) => ({
                ...d,
                customer_ruc:  client.document_type === 'RUC' ? (client.document_number ?? '') : '',
                customer_name: client.name ?? '',
                customer_dni:  '',
            }));
        } else if (isBoleta(data.type)) {
            setData((d) => ({
                ...d,
                customer_ruc:  '',
                customer_name: '',
                customer_dni:  client.document_type === 'DNI' ? (client.document_number ?? '') : '',
            }));
        }
    }, [data.client_id, data.type]);

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

    const inputCls = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
    const errorCls = 'text-red-500 text-xs mt-1';

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
                    {/* ── Datos del Comprobante ── */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-gray-900 font-semibold">Datos del Comprobante</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tipo</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} className={inputCls}>
                                    <option value="factura">Factura</option>
                                    <option value="boleta">Boleta</option>
                                    <option value="nota_credito">Nota Crédito</option>
                                    <option value="nota_debito">Nota Débito</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Fecha Emisión</label>
                                <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className={inputCls} />
                                {errors.issue_date && <p className={errorCls}>{errors.issue_date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Serie</label>
                                <select value={data.serie} onChange={e => setData('serie', e.target.value)} className={inputCls}>
                                    {(seriesOptions.length > 0 ? seriesOptions : [{ series: data.serie }]).map((row) => (
                                        <option key={row.series} value={row.series}>{row.series}</option>
                                    ))}
                                </select>
                                {errors.serie && <p className={errorCls}>{errors.serie}</p>}
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Número</label>
                                <input type="text" value={suggestedNumber} readOnly
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Pedido (opcional)</label>
                            <select value={data.order_id} onChange={e => handleOrderChange(e.target.value)} className={inputCls}>
                                <option value="">Sin pedido asociado</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>{o.code} — {o.client?.name} (S/ {parseFloat(o.total).toFixed(2)})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Cliente</label>
                            <select value={data.client_id} onChange={e => setData('client_id', e.target.value)} className={inputCls}>
                                <option value="">Seleccionar cliente...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.document_type}: {c.document_number})</option>)}
                            </select>
                            {errors.client_id && <p className={errorCls}>{errors.client_id}</p>}
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Monto Total (S/)</label>
                            <input type="number" step="0.01" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} className={inputCls} />
                            {errors.total_amount && <p className={errorCls}>{errors.total_amount}</p>}
                        </div>
                    </section>

                    {/* ── Datos del Adquiriente (condicional por tipo) ── */}
                    {needsRuc(data.type) && (
                        <section className="bg-white rounded-xl border border-indigo-200 p-5 space-y-4">
                            <h2 className="text-gray-900 font-semibold flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
                                Datos del Adquiriente — Factura
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">
                                        RUC <span className="text-red-500">*</span>
                                        <span className="text-gray-400 text-xs ml-1">(11 dígitos)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={11}
                                        value={data.customer_ruc}
                                        onChange={e => setData('customer_ruc', e.target.value.replace(/\D/g, ''))}
                                        placeholder="20XXXXXXXXX"
                                        className={inputCls}
                                    />
                                    {errors.customer_ruc && <p className={errorCls}>{errors.customer_ruc}</p>}
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Razón Social <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        placeholder="EMPRESA S.A.C."
                                        className={inputCls}
                                    />
                                    {errors.customer_name && <p className={errorCls}>{errors.customer_name}</p>}
                                </div>
                            </div>
                        </section>
                    )}

                    {needsDni(data.type) && (
                        <section className="bg-white rounded-xl border border-sky-200 p-5 space-y-4">
                            <h2 className="text-gray-900 font-semibold flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
                                Datos del Receptor — Boleta
                            </h2>
                            <div className="w-full md:w-64">
                                <label className="block text-sm text-gray-600 mb-1">
                                    DNI
                                    <span className="text-gray-400 text-xs ml-1">(opcional, 8 dígitos)</span>
                                </label>
                                <input
                                    type="text"
                                    maxLength={8}
                                    value={data.customer_dni}
                                    onChange={e => setData('customer_dni', e.target.value.replace(/\D/g, ''))}
                                    placeholder="12345678"
                                    className={inputCls}
                                />
                                {errors.customer_dni && <p className={errorCls}>{errors.customer_dni}</p>}
                            </div>
                        </section>
                    )}

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
