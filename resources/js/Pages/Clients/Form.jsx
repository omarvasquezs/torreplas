import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Save, ArrowLeft } from 'lucide-react';

export default function Form({ client }) {
    const isEditing = !!client;

    const { data, setData, post, put, processing, errors } = useForm({
        name: client?.name || '',
        document_type: client?.document_type || 'RUC',
        document_number: client?.document_number || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
        credit_limit: client?.credit_limit || '',
        credit_days: client?.credit_days || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('clients.update', client.id));
        } else {
            post(route('clients.store'));
        }
    };

    return (
        <DashboardLayout>
            <Head title={isEditing ? `Editar ${client.name}` : 'Nuevo Cliente'} />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href={route('clients.index')} className="flex items-center text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" />
                            Regresar a lista
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
                        </h1>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Información Fiscal</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo Documento</label>
                                <select
                                    value={data.document_type}
                                    onChange={(e) => setData('document_type', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                    <option value="RUC">RUC</option>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">Carnet Extranjería</option>
                                </select>
                                {errors.document_type && <p className="text-red-500 text-xs mt-1">{errors.document_type}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número Documento</label>
                                <input
                                    type="text"
                                    value={data.document_number}
                                    onChange={(e) => setData('document_number', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                {errors.document_number && <p className="text-red-500 text-xs mt-1">{errors.document_number}</p>}
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razón Social / Nombre Completo</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Contacto y Dirección</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Fiscal / Entrega</label>
                                <input
                                    type="text"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>

                            <div className="col-span-1 md:col-span-2 mt-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">Crédito Comercial</h3>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Días de Crédito</label>
                                <input
                                    type="number"
                                    value={data.credit_days}
                                    onChange={(e) => setData('credit_days', e.target.value)}
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    placeholder="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Límite de Crédito</label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">S/</span>
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={data.credit_limit}
                                        onChange={(e) => setData('credit_limit', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 pl-8 focus:border-blue-500 focus:ring-blue-500 shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <Link
                                href={route('clients.index')}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-700 font-medium transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isEditing ? 'Actualizar Cliente' : 'Guardar Cliente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
