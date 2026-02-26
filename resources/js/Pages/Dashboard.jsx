import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 }); }

const TYPE_COLORS = {
    entrada: 'bg-green-500/20 text-green-400',
    salida:  'bg-red-500/20 text-red-400',
    ajuste:  'bg-blue-500/20 text-blue-400',
    transferencia: 'bg-purple-500/20 text-purple-400',
};
const TYPE_ICONS = {
    entrada: <ArrowDown size={12}/>,
    salida:  <ArrowUp size={12}/>,
    transferencia: <RefreshCw size={12}/>,
};

export default function Dashboard({ auth, kpis, salesChart, topProducts, recentMovements, paymentSummary }) {
    const stats = [
        {
            name: 'Ventas del Día',
            value: `S/ ${fmt(kpis?.salesToday)}`,
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'bg-green-500/10 border-green-500/20',
        },
        {
            name: 'Pedidos Pendientes',
            value: kpis?.pendingOrders ?? 0,
            icon: ShoppingCart,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10 border-blue-500/20',
            href: route('orders.index'),
        },
        {
            name: 'Bajo Stock',
            value: kpis?.lowStockCount ?? 0,
            icon: Package,
            color: 'text-red-400',
            bg: 'bg-red-500/10 border-red-500/20',
            href: route('reports.inventory') + '?low_stock=1',
        },
        {
            name: 'Total Clientes',
            value: kpis?.totalClients ?? 0,
            icon: Users,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10 border-purple-500/20',
            href: route('clients.index'),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">
                    Bienvenido, {auth.user.name}
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                    Resumen de actividad — Torreplas SAC
                </p>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.name}
                        className={`bg-white border rounded-xl p-5 flex items-center justify-between ${s.bg}`}>
                        <div>
                            <p className="text-gray-600 text-xs">{s.name}</p>
                            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} bg-gray-100`}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Caja abierta */}
            {kpis?.openCash && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                    <DollarSign size={16} />
                    <span>Caja abierta — Saldo: <strong>S/ {fmt(kpis.openCash.balance)}</strong></span>
                    <Link href={route('cash.show', kpis.openCash.id)} className="ml-auto text-green-300 underline text-xs">Ver caja</Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                {/* Sales chart (7 days) */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Ventas últimos 7 días</h2>
                    {salesChart?.length ? (
                        <div className="space-y-2">
                            {(() => {
                                const max = Math.max(...salesChart.map(d => d.total), 1);
                                return salesChart.map(day => (
                                    <div key={day.date} className="flex items-center gap-3 text-sm">
                                        <span className="text-gray-600 w-20 shrink-0 text-xs">{day.date}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all"
                                                style={{ width: `${(day.total / max) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-gray-700 font-mono text-xs w-20 text-right">S/ {fmt(day.total)}</span>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-8">Sin datos de ventas</p>
                    )}
                </div>

                {/* Top products */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Top Productos (mes)</h2>
                    {topProducts?.length ? (
                        <div className="space-y-3">
                            {topProducts.map((p, i) => (
                                <div key={p.product_id ?? i} className="flex items-center gap-3 text-sm">
                                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 text-xs flex items-center justify-center font-bold shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="flex-1 text-gray-700 truncate">{p.name}</span>
                                    <span className="text-gray-600 text-xs">{p.total_sold} uds</span>
                                    <span className="font-mono text-white text-xs">S/ {fmt(p.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-8">Sin datos de productos</p>
                    )}
                </div>

                {/* Recent movements */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Últimos Movimientos</h2>
                    {recentMovements?.length ? (
                        <div className="space-y-2">
                            {recentMovements.map(m => (
                                <div key={m.id} className="flex items-center gap-3 text-sm">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[m.type] ?? 'bg-gray-500/20 text-gray-600'}`}>
                                        {TYPE_ICONS[m.type]}
                                        {m.type}
                                    </span>
                                    <span className="flex-1 text-gray-700 truncate">{m.product?.name ?? '—'}</span>
                                    <span className={`font-bold text-xs ${m.type === 'entrada' ? 'text-green-400' : m.type === 'salida' ? 'text-red-400' : 'text-gray-700'}`}>
                                        {m.type === 'entrada' ? '+' : m.type === 'salida' ? '-' : ''}{m.quantity}
                                    </span>
                                    <span className="text-gray-500 text-xs">{m.created_at?.split('T')[0]}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-8">Sin movimientos recientes</p>
                    )}
                    <Link href={route('inventory.movements')} className="block mt-3 text-indigo-400 text-xs hover:underline text-right">
                        Ver todos →
                    </Link>
                </div>

                {/* Payment summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-white font-semibold mb-4">Resumen de Cobros/Pagos</h2>
                    {paymentSummary ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600 text-sm">Cuentas x Cobrar</span>
                                <span className="font-mono text-yellow-400 font-bold">S/ {fmt(paymentSummary.receivable)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                <span className="text-gray-600 text-sm">Cuentas x Pagar</span>
                                <span className="font-mono text-red-400 font-bold">S/ {fmt(paymentSummary.payable)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 text-sm">Balance Neto</span>
                                <span className={`font-mono font-bold ${(paymentSummary.receivable - paymentSummary.payable) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    S/ {fmt(paymentSummary.receivable - paymentSummary.payable)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-8">Sin datos financieros</p>
                    )}
                    <div className="flex gap-2 mt-3">
                        <Link href={route('accounts.receivable')} className="flex-1 text-center text-xs text-green-400 hover:underline">
                            Ver x Cobrar →
                        </Link>
                        <Link href={route('accounts.payable')} className="flex-1 text-center text-xs text-red-400 hover:underline">
                            Ver x Pagar →
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
