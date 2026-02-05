import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Activity, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard({ auth }) {
    const stats = [
        { name: 'Ventas del Día', value: 'S/ 0.00', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
        { name: 'Pedidos Pendientes', value: '0', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
        { name: 'Productos Bajo Stock', value: '0', icon: Package, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
        { name: 'Actividad Reciente', value: '+12%', icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    ];

    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Bienvenido, {auth.user.name}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Resumen de actividad de Torreplas SAC
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {stat.name}
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-80 flex flex-col items-center justify-center text-gray-400">
                    <p>Gráfico de Ventas (Próximamente)</p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-sm border border-gray-100 dark:border-slate-700 h-80 flex flex-col items-center justify-center text-gray-400">
                    <p>Últimos Movimientos (Próximamente)</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
