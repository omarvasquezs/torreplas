import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Download, Printer } from 'lucide-react';

function fmt(n) { return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits:2 }); }

export default function ReportsInventory({ products, summary, filters }) {
    const [lowStock, setLowStock] = useState(filters?.low_stock === 'true' || filters?.low_stock === true);
    const [search,   setSearch  ] = useState(filters?.search ?? '');

    function apply() {
        router.get(route('reports.inventory'), { search, low_stock: lowStock ? 1 : 0 }, { preserveScroll: true });
    }

    return (
        <DashboardLayout>
            <Head title="Reporte de Inventario" />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('reports.index')}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
                        <ArrowLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Reporte de Inventario</h1>
                        <p className="text-gray-400 text-sm">Stock actual por producto</p>
                    </div>
                    <a href={`${route('reports.inventory.export')}?search=${search}&low_stock=${lowStock ? 1 : 0}`}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">
                        <Download size={15}/> CSV
                    </a>
                    <button onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                        <Printer size={15}/> Imprimir
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-40">
                        <label className="block text-gray-400 text-xs mb-1">Buscar producto</label>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Nombre, SKU..."
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer pb-2">
                        <input type="checkbox" checked={lowStock} onChange={e => setLowStock(e.target.checked)}
                            className="rounded" />
                        Solo stock bajo
                    </label>
                    <button onClick={apply}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        Aplicar
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label:'Total Productos', value: summary?.total_products ?? 0,              color:'text-white'        },
                        { label:'Stock Bajo',       value: summary?.low_stock_count ?? 0,            color:'text-red-400'      },
                        { label:'Valor Total',      value:`S/ ${fmt(summary?.total_value)}`,         color:'text-green-400'    },
                        { label:'Valor Stock Bajo', value:`S/ ${fmt(summary?.low_stock_value)}`,     color:'text-yellow-400'   },
                    ].map(c => (
                        <div key={c.label} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                            <p className="text-gray-400 text-xs">{c.label}</p>
                            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <h2 className="text-white font-semibold">Productos</h2>
                        <span className="text-gray-400 text-sm">{products?.total ?? 0} productos</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">Producto</th>
                                    <th className="text-left p-3">SKU</th>
                                    <th className="text-left p-3">Categoría</th>
                                    <th className="text-right p-3">Stock</th>
                                    <th className="text-right p-3">Stock Mín.</th>
                                    <th className="text-right p-3">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products?.data?.length ? products.data.map(p => {
                                    const isLow = p.stock <= p.min_stock;
                                    return (
                                        <tr key={p.id} className={`border-b border-gray-700/30 hover:bg-gray-700/20 ${isLow ? 'bg-red-900/10' : ''}`}>
                                            <td className="p-3 text-gray-300 flex items-center gap-2">
                                                {isLow && <AlertTriangle size={14} className="text-red-400 shrink-0" />}
                                                {p.name}
                                            </td>
                                            <td className="p-3 text-gray-400 font-mono text-xs">{p.sku ?? '—'}</td>
                                            <td className="p-3 text-gray-400">{p.category?.name ?? '—'}</td>
                                            <td className={`p-3 text-right font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>{p.stock}</td>
                                            <td className="p-3 text-right text-gray-400">{p.min_stock ?? 0}</td>
                                            <td className="p-3 text-right font-mono text-white">S/ {fmt(p.price)}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr><td colSpan={6} className="p-8 text-center text-gray-500">Sin resultados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {products?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap">
                            {products.links.map((l, i) => (
                                <button key={i} disabled={!l.url}
                                    onClick={() => l.url && router.get(l.url)}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                    className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40'}`} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
