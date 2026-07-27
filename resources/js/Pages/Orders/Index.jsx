import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import Modal from '@/Components/Modal';
import { Eye, Plus, FileText, CheckCircle, Save, X } from 'lucide-react';
import SearchAutocomplete from '@/Components/SearchAutocomplete';
import axios from 'axios';

function InvoiceOrderModal({ show, onClose, order, series = [], clients = [] }) {
    if (!order) return null;

    const defaultSeriesByType = useMemo(() => {
        const map = {};
        series.forEach((row) => {
            if (!map[row.type]) map[row.type] = row.series;
        });
        return map;
    }, [series]);

    const initialType = defaultSeriesByType.factura ? 'factura' : (series[0]?.type || 'factura');
    const initialSerie = defaultSeriesByType[initialType] || series.find(s => s.type === initialType)?.series || '';

    const initialClient = order.client || {};
    const isClientRuc = initialClient.document_type === 'RUC';
    const isClientDni = initialClient.document_type === 'DNI';

    const { data, setData, post, processing, errors } = useForm({
        order_id: order.id,
        client_id: order.client_id || '',
        type: initialType,
        serie: initialSerie,
        issue_date: new Date().toISOString().slice(0, 10),
        total_amount: order.total || '0.00',
        customer_ruc: isClientRuc ? (initialClient.document_number || '') : '',
        customer_name: initialClient.name || '',
        customer_dni: isClientDni ? (initialClient.document_number || '') : '',
        payment_method: 'efectivo',
        payment_bank: '',
    });

    useEffect(() => {
        if (order) {
            const client = order.client || {};
            const isRuc = client.document_type === 'RUC';
            const isDni = client.document_type === 'DNI';
            const reqType = isRuc ? 'factura' : (defaultSeriesByType.boleta ? 'boleta' : initialType);
            const reqSerie = defaultSeriesByType[reqType] || series.find(s => s.type === reqType)?.series || '';

            setData({
                order_id: order.id,
                client_id: order.client_id || '',
                type: reqType,
                serie: reqSerie,
                issue_date: new Date().toISOString().slice(0, 10),
                total_amount: order.total || '0.00',
                customer_ruc: isRuc ? (client.document_number || '') : '',
                customer_name: client.name || '',
                customer_dni: isDni ? (client.document_number || '') : '',
                payment_method: 'efectivo',
                payment_bank: '',
            });
        }
    }, [order]);

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

    const needsRuc = data.type === 'factura';
    const needsDni = data.type === 'boleta' || data.type === 'nota_venta';

    useEffect(() => {
        let docNumber = '';
        let name = data.customer_name;

        if (needsRuc && data.customer_ruc?.length === 11) {
            docNumber = data.customer_ruc;
        } else if (needsDni && data.customer_dni?.length >= 8) {
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

    const [padronResults, setPadronResults] = useState([]);
    const [padronLoading, setPadronLoading] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const debounceTimer = useRef(null);

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

    function submit(e) {
        e.preventDefault();
        post(route('invoices.store'), {
            onSuccess: () => {
                onClose();
            }
        });
    }

    const inputCls = 'w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';
    const errorCls = 'text-red-500 text-xs mt-1';

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-slate-700">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Facturar Pedido</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Pedido <span className="font-mono font-semibold text-indigo-600">{order.code}</span> — Total: <span className="font-bold text-gray-900 dark:text-white">S/ {parseFloat(order.total).toFixed(2)}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Datos del comprobante */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo Comprobante</label>
                            <select
                                value={data.type}
                                onChange={e => {
                                    const newType = e.target.value;
                                    const availableSeries = series.filter(s => s.type === newType);
                                    const newSerie = availableSeries.length > 0 ? availableSeries[0].series : '';
                                    setData(d => ({ ...d, type: newType, serie: newSerie }));
                                }}
                                className={inputCls}
                            >
                                <option value="factura">Factura</option>
                                <option value="boleta">Boleta de Venta</option>
                                <option value="nota_venta">Nota de Venta</option>
                                <option value="nota_credito">Nota de Crédito</option>
                                <option value="nota_debito">Nota Débito</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serie</label>
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número Correlativo</label>
                            <input
                                type="text"
                                value={suggestedNumber}
                                readOnly
                                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-600 dark:text-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Emisión</label>
                            <input type="date" value={data.issue_date} onChange={e => setData('issue_date', e.target.value)} className={inputCls} />
                            {errors.issue_date && <p className={errorCls}>{errors.issue_date}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto Total (S/)</label>
                            <input type="number" step="0.01" value={data.total_amount} onChange={e => setData('total_amount', e.target.value)} className={inputCls} />
                            {errors.total_amount && <p className={errorCls}>{errors.total_amount}</p>}
                        </div>
                    </div>

                    {/* Campos dinámicos del adquiriente */}
                    {needsRuc && (
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3">
                            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                Datos del Adquiriente — Factura
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        RUC <span className="text-red-500">*</span> (11 dígitos)
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
                                        <div className="absolute right-3 top-8 border-t-transparent border-indigo-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'ruc' && (
                                        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronFactura(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{r.ruc}</div>
                                                    <div className="text-xs text-gray-500 truncate">{r.nombre}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_ruc && <p className={errorCls}>{errors.customer_ruc}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Razón Social <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={onRazonSocialInput}
                                        onBlur={closeDropdown}
                                        placeholder="RAZÓN SOCIAL S.A.C."
                                        className={inputCls}
                                        autoComplete="off"
                                    />
                                    {padronLoading && activeField === 'razon_social' && (
                                        <div className="absolute right-3 top-8 border-t-transparent border-indigo-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'razon_social' && (
                                        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronFactura(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{r.ruc}</div>
                                                    <div className="text-xs text-gray-500 truncate">{r.nombre}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_name && <p className={errorCls}>{errors.customer_name}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {needsDni && (
                        <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-xl space-y-3">
                            <h3 className="text-sm font-semibold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                Datos del Receptor — {data.type === 'boleta' ? 'Boleta de Venta' : 'Nota de Venta'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        DNI <span className="text-gray-400 text-xs">(opcional, 8 dígitos)</span>
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
                                        <div className="absolute right-3 top-8 border-t-transparent border-sky-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'dni' && (
                                        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronBoleta(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{r.nombre}</div>
                                                    <div className="text-xs text-gray-500">RUC: {r.ruc}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_dni && <p className={errorCls}>{errors.customer_dni}</p>}
                                </div>
                                <div className="relative">
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Nombre Completo <span className="text-gray-400 text-xs">(opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.customer_name}
                                        onChange={onNombreBoletaInput}
                                        onBlur={closeDropdown}
                                        placeholder="Nombres y apellidos"
                                        className={inputCls}
                                        autoComplete="off"
                                    />
                                    {padronLoading && activeField === 'nombre_boleta' && (
                                        <div className="absolute right-3 top-8 border-t-transparent border-sky-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                                    )}
                                    {padronResults.length > 0 && activeField === 'nombre_boleta' && (
                                        <ul className="absolute z-50 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md shadow-lg max-h-48 overflow-auto mt-1">
                                            {padronResults.map(r => (
                                                <li key={r.ruc}
                                                    onMouseDown={(e) => { e.preventDefault(); selectPadronBoleta(r); }}
                                                    className="px-3 py-2 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer">
                                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">{r.nombre}</div>
                                                    <div className="text-xs text-gray-500">RUC: {r.ruc}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.customer_name && <p className={errorCls}>{errors.customer_name}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Forma de pago */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Forma de Pago</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { value: 'efectivo', label: 'Efectivo', icon: '💵' },
                                { value: 'yape', label: 'Yape', icon: '📱' },
                                { value: 'plin', label: 'Plin', icon: '📲' },
                                { value: 'transferencia', label: 'Transf. Banco', icon: '🏦' },
                            ].map(m => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setData('payment_method', m.value)}
                                    className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition ${
                                        data.payment_method === m.value
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                                            : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span>{m.icon}</span>
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        {data.payment_method === 'transferencia' && (
                            <div className="mt-2">
                                <select value={data.payment_bank} onChange={e => setData('payment_bank', e.target.value)} className={inputCls}>
                                    <option value="">Seleccionar banco...</option>
                                    <option value="BCP">BCP — Banco de Crédito del Perú</option>
                                    <option value="BBVA">BBVA</option>
                                    <option value="Interbank">Interbank</option>
                                    <option value="Scotiabank">Scotiabank</option>
                                    <option value="BanBif">BanBif</option>
                                    <option value="Banco Pichincha">Banco Pichincha</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 flex justify-end gap-3 border-t border-gray-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium shadow-md shadow-indigo-600/20 transition"
                        >
                            <Save size={16} /> {processing ? 'Generando…' : 'Generar Comprobante'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default function Index({ orders, filters, series = [], clients = [] }) {
    const { data, setData } = useForm({ search: filters.search || '' });
    const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);

    function handleSearch(val) {
        const v = val !== undefined ? val : data.search;
        router.get(route('orders.index'), { search: v }, { preserveState: true });
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleApprove = (id) => {
        if (confirm('¿Está seguro de aprobar este pedido? Esto permitirá facturarlo.')) {
            router.patch(route('orders.approve', id), {}, { preserveScroll: true });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Pedidos" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pedidos de Venta</h1>
                    <p className="text-gray-500 dark:text-gray-600">Administre las órdenes de venta y facturación.</p>
                </div>
                <Link
                    href={route('orders.create')}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-600/20 transition-all"
                >
                    <Plus size={18} />
                    Nuevo Pedido
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                <SearchAutocomplete
                    resource="orders"
                    value={data.search}
                    onChange={(v) => setData('search', v)}
                    onSearch={handleSearch}
                    placeholder="Buscar por código o cliente..."
                    className="max-w-sm"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-600">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 uppercase text-xs font-semibold text-gray-900 dark:text-white">
                            <tr>
                                <th className="px-6 py-4">Código</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">
                                            {order.code}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">
                                            {order.client?.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.date_issue}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                                            S/ {parseFloat(order.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleApprove(order.id)}
                                                        title="Aprobar Pedido"
                                                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-600 dark:text-green-500 transition-colors"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 cursor-not-allowed" title="Ver detalle (Próximamente)">
                                                    <Eye size={16} />
                                                </button>

                                                {order.invoice ? (
                                                    <Link
                                                        href={route('invoices.show', order.invoice.id)}
                                                        className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-xs font-semibold flex items-center gap-1 transition-colors"
                                                        title={`Ver Comprobante ${order.invoice.serie}-${order.invoice.number}`}
                                                    >
                                                        <FileText size={15} />
                                                        <span>{order.invoice.serie}-{order.invoice.number}</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        onClick={() => setInvoiceModalOrder(order)}
                                                        className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 rounded-lg text-indigo-600 dark:text-indigo-400 font-medium text-xs flex items-center gap-1 transition-colors"
                                                        title="Facturar Pedido"
                                                    >
                                                        <FileText size={15} />
                                                        <span>Facturar</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron pedidos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <InvoiceOrderModal
                show={!!invoiceModalOrder}
                onClose={() => setInvoiceModalOrder(null)}
                order={invoiceModalOrder}
                series={series}
                clients={clients}
            />
        </DashboardLayout>
    );
}
