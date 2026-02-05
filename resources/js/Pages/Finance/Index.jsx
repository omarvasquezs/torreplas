import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { CreditCard, DollarSign } from 'lucide-react';

export default function Index({ registers }) {
    return (
        <DashboardLayout>
            <Head title="Finanzas" />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finanzas y Caja</h1>
                <p className="text-gray-500 dark:text-gray-400">Gestión de cajas y movimientos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registers.map(reg => (
                    <div key={reg.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{reg.name}</h3>
                                <p className="text-sm text-gray-500">{reg.user ? `Asignado a: ${reg.user.name}` : 'Sin asignar'}</p>
                            </div>
                            <div className={`p-2 rounded-lg ${reg.is_open ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <CreditCard size={20} />
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-1">Saldo Actual</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                S/ {parseFloat(reg.current_balance).toFixed(2)}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center">
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${reg.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {reg.is_open ? 'ABIERTA' : 'CERRADA'}
                            </span>
                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                Ver Movimientos
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
