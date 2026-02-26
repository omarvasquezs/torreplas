import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, TrendingUp, TrendingDown, Package } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

const TYPE_COLORS = {
    entrada: 'text-green-400 bg-green-500/10',
    salida:  'text-red-400 bg-red-500/10',
    ajuste:  'text-yellow-400 bg-yellow-500/10',
    transferencia: 'text-blue-400 bg-blue-500/10',
};
const TYPE_LABELS = { entrada:'Entrada', salida:'Salida', ajuste:'Ajuste', transferencia:'Transferencia' };

export default function Kardex({ product, movements, stock }) {
    // Build running balance
    let running = 0;
    const rows = movements.map(m => {
        const qty = parseFloat(m.quantity);
        if (m.type === 'entrada' || m.type === 'transferencia_in') {
            running += qty;
        } else {
            running -= qty;
        }
        return { ...m, running };
    });

    const totalIn  = movements.filter(m => m.type === 'entrada').reduce((s, m) => s + parseFloat(m.quantity), 0);
    const totalOut = movements.filter(m => m.type === 'salida').reduce((s, m) => s + parseFloat(m.quantity), 0);

    return (
        <DashboardLayout>
            <Head title={`Kardex — ${product.name}`} />
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href={route('products.index')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 mt-1"><ArrowLeft size={18}/></Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">{product.name}</h1>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                            <span>SKU: <span className="text-indigo-400 font-mono">{product.sku ?? '—'}</span></span>
                            <span>Categoría: <span className="text-white">{product.category?.name ?? '—'}</span></span>
                            <span>Marca: <span className="text-white">{product.brand?.name ?? '—'}</span></span>
                            <span>Unidad: <span className="text-white">{product.unit?.name ?? '—'}</span></span>
                        </div>
                    </div>
                </div>

                {/* Stock per warehouse */}
                {stock?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {stock.map(w => (
                            <div key={w.id} className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package size={16} className="text-indigo-400"/>
                                    <span className="text-gray-600 text-xs">{w.name}</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{fmt(w.stock)}</p>
                                <p className="text-gray-500 text-xs">{product.unit?.abbreviation ?? 'und'}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-green-400"/>
                            <span className="text-green-400 text-xs">Total Entradas</span>
                        </div>
                        <p className="text-xl font-bold text-white mt-1">{fmt(totalIn)}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <TrendingDown size={16} className="text-red-400"/>
                            <span className="text-red-400 text-xs">Total Salidas</span>
                        </div>
                        <p className="text-xl font-bold text-white mt-1">{fmt(totalOut)}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <Package size={16} className="text-indigo-400"/>
                            <span className="text-indigo-400 text-xs">Stock Total</span>
                        </div>
                        <p className="text-xl font-bold text-white mt-1">{fmt(totalIn - totalOut)}</p>
                    </div>
                </div>

                {/* Movements table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <h2 className="text-white font-semibold text-sm">Historial de movimientos</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-600">
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-left p-3">Tipo</th>
                                    <th className="text-left p-3">Motivo</th>
                                    <th className="text-left p-3">Almacén</th>
                                    <th className="text-left p-3">Usuario</th>
                                    <th className="text-right p-3">Cantidad</th>
                                    <th className="text-right p-3">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length ? rows.map(m => {
                                    const isIn = m.type === 'entrada' || m.type === 'transferencia_in';
                                    return (
                                        <tr key={m.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="p-3 text-gray-600 text-xs">{m.created_at?.split('T')[0]}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[m.type] ?? 'bg-gray-500/20 text-gray-600'}`}>
                                                    {TYPE_LABELS[m.type] ?? m.type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-700 text-xs">{m.reason ?? '—'}</td>
                                            <td className="p-3 text-gray-600 text-xs">{m.warehouse?.name ?? '—'}</td>
                                            <td className="p-3 text-gray-600 text-xs">{m.user?.name ?? '—'}</td>
                                            <td className={`p-3 text-right font-mono text-sm font-bold ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                                                {isIn ? '+' : '-'}{fmt(Math.abs(m.quantity))}
                                            </td>
                                            <td className="p-3 text-right font-mono text-white">{fmt(m.running)}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Sin movimientos registrados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
