import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Save, ArrowLeft, Plus, Trash, ShoppingBag } from 'lucide-react';

export default function Form({ clients, products }) {
    // Initial Items State
    const [lineItems, setLineItems] = useState([
        { product_id: '', quantity: 1, unit_price: 0, total: 0 }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        client_id: '',
        date_issue: new Date().toISOString().split('T')[0],
        items: [],
        notes: ''
    });

    // Update form data when line items change
    useEffect(() => {
        setData('items', lineItems);
    }, [lineItems]);

    // Add new line
    const addLine = () => {
        setLineItems([...lineItems, { product_id: '', quantity: 1, unit_price: 0, total: 0 }]);
    };

    // Remove line
    const removeLine = (index) => {
        if (lineItems.length === 1) return;
        const newLines = [...lineItems];
        newLines.splice(index, 1);
        setLineItems(newLines);
    };

    // Update Line Value
    const updateLine = (index, field, value) => {
        const newLines = [...lineItems];
        newLines[index][field] = value;

        // Auto-fill price if product changes
        if (field === 'product_id') {
            const product = products.find(p => p.id == value);
            if (product) {
                newLines[index].unit_price = parseFloat(product.price);
            }
        }

        // Recalculate total line
        if (field === 'quantity' || field === 'unit_price' || field === 'product_id') {
            const qty = parseFloat(newLines[index].quantity) || 0;
            const price = parseFloat(newLines[index].unit_price) || 0;
            newLines[index].total = qty * price;
        }

        setLineItems(newLines);
    };

    const calculateTotal = () => {
        return lineItems.reduce((acc, item) => acc + (item.total || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('orders.store'));
    };

    return (
        <DashboardLayout>
            <Head title="Nuevo Pedido" />

            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href={route('orders.index')} className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" />
                            Regresar a lista
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Generar Nuevo Pedido</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Client & Items */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Client Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Datos del Cliente</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente</label>
                                    <select
                                        value={data.client_id}
                                        onChange={(e) => setData('client_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="">Seleccionar Cliente...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name} - {client.document_number}</option>
                                        ))}
                                    </select>
                                    {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Emisión</label>
                                    <input
                                        type="date"
                                        value={data.date_issue}
                                        onChange={(e) => setData('date_issue', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                    {errors.date_issue && <p className="text-red-500 text-xs mt-1">{errors.date_issue}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Detalle del Pedido</h3>
                                <button type="button" onClick={addLine} className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center gap-1">
                                    <Plus size={16} /> Agregar Item
                                </button>
                            </div>

                            <div className="space-y-4">
                                {lineItems.map((item, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                        <div className="flex-1 w-full">
                                            <select
                                                value={item.product_id}
                                                onChange={(e) => updateLine(index, 'product_id', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                                            >
                                                <option value="">Seleccionar Producto...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.warehouse_stock || 'N/A'})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white text-right"
                                                placeholder="Cant."
                                            />
                                        </div>
                                        <div className="w-32">
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                                    <span className="text-gray-500 sm:text-xs">S/</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unit_price}
                                                    onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 text-sm pl-6 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white text-right"
                                                    placeholder="Precio"
                                                />
                                            </div>
                                        </div>
                                        <div className="w-28 text-right font-medium text-gray-900 dark:text-white">
                                            S/ {item.total.toFixed(2)}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeLine(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {errors.items && <p className="text-red-500 text-xs mt-2 text-center">{errors.items}</p>}
                        </div>
                    </div>

                    {/* Right Column: Totals & Actions */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingBag className="text-blue-600" />
                                Resumen
                            </h3>

                            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>S/ {(calculateTotal() / 1.18).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>IGV (18%)</span>
                                    <span>S/ {(calculateTotal() - (calculateTotal() / 1.18)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-slate-700">
                                    <span>Total</span>
                                    <span>S/ {calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-8 space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    Generar Pedido
                                </button>
                                <Link
                                    href={route('orders.index')}
                                    className="block w-full text-center py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all font-medium"
                                >
                                    Cancelar
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
