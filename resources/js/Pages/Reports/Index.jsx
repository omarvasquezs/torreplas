import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { BarChart2, ShoppingCart, Package, TrendingUp, ArrowRight } from 'lucide-react';

const REPORTS = [
    {
        title: 'Reporte de Ventas',
        desc:  'Ventas por período, cliente y estado de pago.',
        icon:  <TrendingUp size={24} className="text-green-400" />,
        bg:    'bg-green-500/10 border-green-500/20',
        href:  'reports.sales',
    },
    {
        title: 'Reporte de Compras',
        desc:  'Órdenes de compra por período y proveedor.',
        icon:  <ShoppingCart size={24} className="text-blue-400" />,
        bg:    'bg-blue-500/10 border-blue-500/20',
        href:  'reports.purchases',
    },
    {
        title: 'Reporte de Inventario',
        desc:  'Stock actual por producto y almacén.',
        icon:  <Package size={24} className="text-orange-400" />,
        bg:    'bg-orange-500/10 border-orange-500/20',
        href:  'reports.inventory',
    },
    {
        title: 'Reporte de Movimientos',
        desc:  'Entradas y salidas de inventario por período.',
        icon:  <BarChart2 size={24} className="text-purple-400" />,
        bg:    'bg-purple-500/10 border-purple-500/20',
        href:  'reports.movements',
    },
];

export default function ReportsIndex() {
    return (
        <DashboardLayout>
            <Head title="Reportes" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Reportes</h1>
                    <p className="text-gray-600 text-sm mt-1">Genera reportes detallados por módulo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {REPORTS.map(r => (
                        <Link key={r.title} href={route(r.href)}
                            className={`flex items-center gap-4 p-5 rounded-xl border transition hover:scale-[1.02] ${r.bg}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${r.bg}`}>
                                {r.icon}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-white font-semibold">{r.title}</h2>
                                <p className="text-gray-600 text-sm mt-0.5">{r.desc}</p>
                            </div>
                            <ArrowRight size={18} className="text-gray-500" />
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
