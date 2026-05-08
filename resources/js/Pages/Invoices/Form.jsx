import { Head, Link, useForm } from '@inertiajs/react';
import React, { useEffect, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';
import axios from 'axios';

const isFactura    = (type) => type === 'factura';
const isBoleta     = (type) => type === 'boleta';
const isNotaVenta  = (type) => type === 'nota_venta';
const needsRuc     = (type) => isFactura(type);
const needsDni     = (type) => isBoleta(type) || isNotaVenta(type);

export default function InvoicesForm({ clients, orders, series = [] }) {
    const defaultSeriesByType = useMemo(() => {
        const map = {};
        series.forEach((row) => {
            if (!map[row.type]) map[row.type] = row.series;
        });
        return map;
    }, [series]);

    const { data, setData, post, processing, errors } = useForm({
        client_id:      '',
        order_id:       '',
        type:           'factura',
        serie:          defaultSeriesByType.factura ?? 'F001',
        issue_date:     new Date().toISOString().slice(0, 10),
        total_amount:   '',
        customer_ruc:   '',
        customer_name:  '',
        customer_dni:   '',
        payment_method: 'efectivo',
        payment_bank:   '',
    });

    // Autocomplete states
    const [padronResults, setPadronResults] = React.useState([]);
    const [padronLoading, setPadronLoading] = React.useState(false);
    const [activeField, setActiveField] = React.useState(null); // 'ruc', 'razon_social', 'dni', 'nombre_boleta'
    const debounceTimer = React.useRef(null);

    const closeDropdown = () => {
        setTimeout(() => { setPadronResults([]); setActiveField(null); }, 200);
    };

    const fetchPadron = async (q, tipo, fieldTarget) => {
        try {
            setPadronLoading(true);
            setActiveField(fieldTarget);
            const { data } = await axios.get('/api/padron/buscar', { params: { q, tipo, limit: 8 } });
            setPadronResults(data);
        } catch (e) {
            setPadronResults([]);
        } finally {
            setPadronLoading(false);
        }
    };

    const onRucInput = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setData('customer_ruc', val);
        clearTimeout(debounceTimer.current);
        if (val.length < 6) { setPadronResults([]); return; }
        debounceTimer.current = setTimeout(() => fetchPadron(val, 'ruc', 'ruc'), 350);
    };

    const onRazonSocialInput = (e) => {
        const val = e.target.value;
        setData('customer_name', val);
        clearTimeout(debounceTimer.current);
        if (val.length < 3) { setPadronResults([]); return; }
        debounceTimer.current = setTimeout(() => fetchPadron(val, 'nombre', 'razon_social'), 400);
    };

    const selectPadronFactura = (r) => {
        setData(d => ({ ...d, customer_ruc: r.ruc, customer_name: r.nombre }));
        setPadronResults([]);
        setActiveField(null);
    };

    // Boleta Handlers
    const onDniInput = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setData('customer_dni', val);
        clearTimeout(debounceTimer.current);
        if (val.length < 6) { setPadronResults([]); return; }
        debounceTimer.current = setTimeout(() => fetchPadron(val, 'dni', 'dni'), 350);
    };

    const onNombreBoletaInput = (e) => {
        const val = e.target.value;
        setData('customer_name', val);
        clearTimeout(debounceTimer.current);
        if (val.length < 3) { setPadronResults([]); return; }
        debounceTimer.current = setTimeout(() => fetchPadron(val, 'nombre', 'nombre_boleta'), 400);
    };

    const selectPadronBoleta = (r) => {
        let dni = r.ruc;
        if (dni.startsWith('10') && dni.length === 11) dni = dni.substring(2, 10);
        else if (dni.startsWith('20')) dni = '';
        setData(d => ({ ...d, customer_name: r.nombre, customer_dni: dni }));
        setPadronResults([]);
        setActiveField(null);
    };

    const displayedClients = useMemo(() => {
        let docNumber = '';
        let name = data.customer_name;

        if (needsRuc(data.type) && data.customer_ruc?.length === 11) {
            docNumber = data.customer_ruc;
        } else if (needsDni(data.type) && data.customer_dni?.length >= 8) {
            docNumber = data.customer_dni;
        }

        const existingClient = clients.find(c => c.document_number === docNumber);
        
        if (docNumber && name && !existingClient) {
            return [
                 { id: 'new', name: `${name} (NUEVO CLIENTE)`, document_type: needsRuc(data.type) ? 'RUC' : 'DNI', document_number: docNumber },
                 ...clients
            ];
        }

        return clients;
    }, [clients, data.customer_ruc, data.customer_dni, data.customer_name, data.type]);

    useEffect(() => {
        let docNumber = '';
        let name = data.customer_name;

        if (needsRuc(data.type) && data.customer_ruc?.length === 11) {
            docNumber = data.customer_ruc;
        } else if (needsDni(data.type) && data.customer_dni?.length >= 8) {
            docNumber = data.customer_dni;
        }

        if (docNumber && name) {
            const existingClient = clients.find(c => c.document_number === docNumber);
            if (existingClient) {
                if (data.client_id !== existingClient.id) {
                    setData('client_id', existingClient.id);
                }
            } else {
                if (data.client_id !== 'new') {
                    setData('client_id', 'new');
                }
            }
        }
    }, [data.customer_ruc, data.customer_dni, data.customer_name, data.type, clients]);

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
    }, [seriesOptions]);

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
                                <select 
                                    value={data.type} 
                                    onChange={e => {
                                        const newType = e.target.value;
                                        const availableSeries = series.filter(s => s.type === newType);
                                        const newSerie = availableSeries.length > 0 ? availableSeries[0].series : '';
                                        setData(data => ({ ...data, type: newType, serie: newSerie }));
                                    }} 
                                    className={inputCls}
                                >
                                    <option value="factura">Factura</option>
                                    <option value="boleta">Boleta</option>
                                    <option value="nota_venta">Nota de Venta</option>
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
                                    {seriesOptions.length > 0 ? (
                                        seriesOptions.map((row) => (
                                            <option key={row.series} value={row.series}>{row.series}</option>
                                        ))
                                    ) : (
                                        <option value="">-- No configurado --</option>
                                    )}
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
                                {displayedClients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.document_type}: {c.document_number})</option>)}
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
                                <div className="relative">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        RUC <span className="text-red-500">*</span>
                                        <span className="text-gray-400 text-xs ml-1">(11 dígitos)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={11}
                                        value={data.customer_ruc}
                                        onChange={onRucInput}
                                        onBlur={closeDropdown}
                                        placeholder="20XXXXXXXXX"
                                        className={inputCls}
                                        autoComplete="off"
                                    />
                                    {padronLoading && activeField === 'ruc' && (
                                        <div className="absolute right-3 top-9 border-t-transparent border-indigo-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'ruc' && (
                                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronFactura(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                                    <div className="text-sm font-semibold text-gray-900">{r.ruc}</div>
                                                    <div className="text-xs text-gray-500 truncate">{r.nombre}</div>
                                                    {r.estado && (
                                                        <span className={`inline-block mt-1 px-2 py-0.5 text-[0.65rem] rounded-full text-white ${r.estado === 'ACTIVO' ? 'bg-green-500' : 'bg-gray-500'}`}>
                                                            {r.estado}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_ruc && <p className={errorCls}>{errors.customer_ruc}</p>}
                                </div>
                                <div className="md:col-span-1 relative">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Razón Social <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={onRazonSocialInput}
                                        onBlur={closeDropdown}
                                        placeholder="EMPRESA S.A.C."
                                        className={inputCls}
                                        autoComplete="off"
                                    />
                                    {padronLoading && activeField === 'razon_social' && (
                                        <div className="absolute right-3 top-9 border-t-transparent border-indigo-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'razon_social' && (
                                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronFactura(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                                    <div className="text-sm font-semibold text-gray-900">{r.ruc}</div>
                                                    <div className="text-xs text-gray-500 truncate">{r.nombre}</div>
                                                    {r.estado && (
                                                        <span className={`inline-block mt-1 px-2 py-0.5 text-[0.65rem] rounded-full text-white ${r.estado === 'ACTIVO' ? 'bg-green-500' : 'bg-gray-500'}`}>
                                                            {r.estado}
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        DNI
                                        <span className="text-gray-400 text-xs ml-1">(opcional, 8 dígitos)</span>
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={8}
                                        value={data.customer_dni}
                                        onChange={onDniInput}
                                        onBlur={closeDropdown}
                                        placeholder="12345678"
                                        className={inputCls}
                                        autoComplete="off"
                                    />
                                    {padronLoading && activeField === 'dni' && (
                                        <div className="absolute right-3 top-9 border-t-transparent border-sky-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'dni' && (
                                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronBoleta(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                                    <div className="text-sm font-semibold text-gray-900">{r.nombre}</div>
                                                    <div className="text-xs text-gray-500">RUC: {r.ruc}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_dni && <p className={errorCls}>{errors.customer_dni}</p>}
                                </div>
                                <div className="md:col-span-1 relative">
                                    <label className="block text-sm text-gray-600 mb-1">
                                        Nombre Completo
                                        <span className="text-gray-400 text-xs ml-1">(opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={onNombreBoletaInput}
                                        onBlur={closeDropdown}
                                        placeholder="Nombres y apellidos del cliente"
                                        className={inputCls}
                                        autoComplete="off"
                                    />
                                    {padronLoading && activeField === 'nombre_boleta' && (
                                        <div className="absolute right-3 top-9 border-t-transparent border-sky-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'nombre_boleta' && (
                                        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronBoleta(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                                                    <div className="text-sm font-semibold text-gray-900">{r.nombre}</div>
                                                    <div className="text-xs text-gray-500">RUC: {r.ruc}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_name && <p className={errorCls}>{errors.customer_name}</p>}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── Forma de Pago ── */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-gray-900 font-semibold">Forma de Pago</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: 'efectivo',    label: 'Efectivo',     icon: '💵' },
                                { value: 'yape',        label: 'Yape',         icon: '📱' },
                                { value: 'plin',        label: 'Plin',         icon: '📲' },
                                { value: 'transferencia', label: 'Transf. Banco', icon: '🏦' },
                            ].map(m => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setData('payment_method', m.value)}
                                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition ${
                                        data.payment_method === m.value
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                                >
                                    <span className="text-xl">{m.icon}</span>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        {data.payment_method === 'transferencia' && (
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Banco / Número de Cuenta <span className="text-gray-400 text-xs">(opcional)</span></label>
                                <select value={data.payment_bank} onChange={e => setData('payment_bank', e.target.value)} className={inputCls}>
                                    <option value="">Seleccionar banco...</option>
                                    <option value="BCP">BCP — Banco de Crédito del Perú</option>
                                    <option value="BBVA">BBVA</option>
                                    <option value="Interbank">Interbank</option>
                                    <option value="Scotiabank">Scotiabank</option>
                                    <option value="BanBif">BanBif</option>
                                    <option value="Banbco Pichincha">Banco Pichincha</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        )}
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
