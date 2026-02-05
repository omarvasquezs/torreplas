import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Boxes, MapPin, Search } from 'lucide-react';

export default function Index({ warehouses, products }) {

    // Simple view of stock per warehouse
    return (
        <DashboardLayout>
            <Head title="Inventario" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventario</h1>
                <p className="text-gray-500 dark:text-gray-400">Control de stock por almacén.</p>
            </div>

            {/* Warehouses Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {warehouses.map(wh => (
                    <div key={wh.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start justify-between">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{wh.name}</h3>
                            <p className="text-sm text-gray-400 mt-1">{wh.address || 'Sin dirección'}</p>
                            <div className="mt-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {wh.products_count} Items
                            </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded-lg text-blue-600">
                            <MapPin size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Stock Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Stock General</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-slate-700/50 uppercase text-xs font-semibold text-gray-900 dark:text-white">
                            <tr>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Código</th>
                                {warehouses.map(wh => (
                                    <th key={wh.id} className="px-6 py-4 text-center">{wh.name}</th>
                                ))}
                                <th className="px-6 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {products.data.map(product => {
                                const totalStock = product.warehouses.reduce((acc, wh) => acc + parseFloat(wh.pivot.current_stock), 0);
                                return (
                                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {product.name}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {product.code || '-'}
                                        </td>
                                        {warehouses.map(wh => {
                                            const stock = product.warehouses.find(w => w.id === wh.id)?.pivot?.current_stock || 0;
                                            return (
                                                <td key={wh.id} className="px-6 py-4 text-center">
                                                    {parseFloat(stock) > 0 ? (
                                                        <span className="font-bold text-gray-800 dark:text-gray-200">{parseFloat(stock)}</span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4 text-right font-bold text-blue-600">
                                            {totalStock}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
