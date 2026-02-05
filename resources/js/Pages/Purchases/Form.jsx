import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Save, ArrowLeft, Plus, Trash, ShoppingBag } from 'lucide-react';

export default function Form({ suppliers, products }) {
    const [lineItems, setLineItems] = useState([
        { product_id: '', quantity: 1, unit_cost: 0, total_cost: 0 }
    ]);

    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        date_issue: new Date().toISOString().split('T')[0],
        items: [],
        notes: ''
    });

    useEffect(() => {
        setData('items', lineItems);
    }, [lineItems]);

    const addLine = () => {
        setLineItems([...lineItems, { product_id: '', quantity: 1, unit_cost: 0, total_cost: 0 }]);
    };

    const removeLine = (index) => {
        if (lineItems.length === 1) return;
        const newLines = [...lineItems];
        newLines.splice(index, 1);
        setLineItems(newLines);
    };

    const updateLine = (index, field, value) => {
        const newLines = [...lineItems];
        newLines[index][field] = value;

        if (field === 'product_id') {
            const product = products.find(p => p.id == value);
            if (product) {
                newLines[index].unit_cost = parseFloat(product.cost) || 0;
            }
        }

        if (field === 'quantity' || field === 'unit_cost' || field === 'product_id') {
            const qty = parseFloat(newLines[index].quantity) || 0;
            const cost = parseFloat(newLines[index].unit_cost) || 0;
            newLines[index].total_cost = qty * cost;
        }

        setLineItems(newLines);
    };

    const calculateTotal = () => {
        return lineItems.reduce((acc, item) => acc + (item.total_cost || 0), 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('purchases.store'));
    };

    return (
        <DashboardLayout>
            <Head title="Nueva Compra" />
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href={route('purchases.index')} className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" />
                            Regresar
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Registrar Orden de Compra</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Información del Proveedor</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                                    <select
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    >
                                        <option value="">Seleccionar Proveedor...</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                    {errors.supplier_id && <p className="text-red-500 text-xs mt-1">{errors.supplier_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha Emisión</label>
                                    <input
                                        type="date"
                                        value={data.date_issue}
                                        onChange={(e) => setData('date_issue', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Items a Comprar</h3>
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
                                                <option value="">Producto...</option>
                                                {products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
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
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.unit_cost}
                                                onChange={(e) => updateLine(index, 'unit_cost', e.target.value)}
                                                className="w-full rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-800 dark:border-slate-600 dark:text-white text-right"
                                                placeholder="Costo Unit."
                                            />
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
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingBag className="text-blue-600" />
                                Resumen
                            </h3>
                            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-slate-700">
                                <span>Total a Pagar</span>
                                <span>S/ {calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="mt-8 space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                    Generar Compra
                                </button>
                                <Link
                                    href={route('purchases.index')}
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
