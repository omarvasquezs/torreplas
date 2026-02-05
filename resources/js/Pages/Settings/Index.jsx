import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Save, Settings } from 'lucide-react';

export default function Index({ company, system }) {
    const { data, setData, post, processing } = useForm({
        ...company,
        ...system
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('settings.index')); // Mock update
    };

    return (
        <DashboardLayout>
            <Head title="Configuración" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración del Sistema</h1>
                <p className="text-gray-500 dark:text-gray-400">Parámetros generales de la empresa y sistema.</p>
            </div>

            <div className="max-w-4xl">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-slate-700">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Settings size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Datos de la Empresa</h3>
                            <p className="text-sm text-gray-500">Información visible en reportes y facturas.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razón Social</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RUC</label>
                            <input
                                type="text"
                                value={data.ruc}
                                onChange={(e) => setData('ruc', e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Fiscal</label>
                            <input
                                type="text"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-slate-700">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                        >
                            <Save size={18} />
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
