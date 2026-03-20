import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { AlertTriangle, ShieldCheck, DollarSign, Building2 } from 'lucide-react';

function money(value) {
    return Number(value || 0).toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function BlackBox({ code, metrics }) {
    const cards = [
        {
            title: 'Ventas reales diarias',
            value: metrics?.daily_real_sales,
            icon: DollarSign,
            tone: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        },
        {
            title: 'Ventas declaradas diarias',
            value: metrics?.daily_declared_sales,
            icon: ShieldCheck,
            tone: 'bg-blue-50 border-blue-200 text-blue-700',
        },
        {
            title: 'Ventas no declaradas',
            value: metrics?.daily_undeclared_sales,
            icon: AlertTriangle,
            tone: 'bg-amber-50 border-amber-200 text-amber-700',
        },
        {
            title: 'Alquileres diarios',
            value: metrics?.daily_rentals,
            icon: Building2,
            tone: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Caja Negra" />

            <div className="space-y-6">
                <section className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Soporte Tecnico - Caja Negra</h1>
                            <p className="text-sm text-gray-600 mt-1">Monitoreo diario de ventas reales, ventas declaradas y alquileres.</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold tracking-wide">
                            Codigo de acceso: {code}
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <article key={card.title} className={`rounded-xl border p-4 ${card.tone}`}>
                            <div className="flex items-start justify-between">
                                <p className="text-sm font-medium">{card.title}</p>
                                <card.icon size={18} />
                            </div>
                            <p className="text-2xl font-bold mt-3">S/ {money(card.value)}</p>
                        </article>
                    ))}
                </section>

                <section className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Notas operativas</h2>
                    <ul className="mt-3 text-sm text-gray-700 space-y-1 list-disc list-inside">
                        <li>Ventas reales diarias: total de pedidos emitidos hoy.</li>
                        <li>Ventas declaradas diarias: total facturado hoy.</li>
                        <li>Ventas no declaradas: diferencia entre ventas reales y declaradas.</li>
                        <li>Alquileres diarios: pagos de alquiler vencidos o pagados hoy.</li>
                    </ul>
                </section>
            </div>
        </DashboardLayout>
    );
}
