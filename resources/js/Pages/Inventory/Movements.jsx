import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, RefreshCw, X } from 'lucide-react';

const TYPE_COLORS = {
    entrada:'bg-green-500/20 text-green-400',
    salida:'bg-red-500/20 text-red-400',
    ajuste:'bg-blue-500/20 text-blue-400',
    transferencia:'bg-purple-500/20 text-purple-400',
};

function MovementModal({ warehouses, products, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type:         'entrada',
        product_id:   '',
        warehouse_id: '',
        quantity:     '',
        reason:       '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('inventory.movement'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Nuevo Movimiento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Tipo <span className="text-red-400">*</span></label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                                <option value="entrada">Entrada</option>
                                <option value="salida">Salida</option>
                                <option value="ajuste">Ajuste</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Cantidad <span className="text-red-400">*</span></label>
                            <input type="number" min="1" value={data.quantity} onChange={e => setData('quantity', e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Producto <span className="text-red-400">*</span></label>
                        <select value={data.product_id} onChange={e => setData('product_id', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required>
                            <option value="">Seleccione...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {errors.product_id && <p className="text-red-400 text-xs mt-1">{errors.product_id}</p>}
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Almacén <span className="text-red-400">*</span></label>
                        <select value={data.warehouse_id} onChange={e => setData('warehouse_id', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required>
                            <option value="">Seleccione...</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Motivo / Referencia</label>
                        <input type="text" value={data.reason} onChange={e => setData('reason', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function TransferModal({ warehouses, products, onClose }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id:     '',
        from_warehouse: '',
        to_warehouse:   '',
        quantity:       '',
        reason:         '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('inventory.transfer'), {
            onSuccess: () => { reset(); onClose(); },
        });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Transferencia entre Almacenes</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18}/></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Producto <span className="text-red-400">*</span></label>
                        <select value={data.product_id} onChange={e => setData('product_id', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required>
                            <option value="">Seleccione...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Origen <span className="text-red-400">*</span></label>
                            <select value={data.from_warehouse} onChange={e => setData('from_warehouse', e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required>
                                <option value="">—</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Destino <span className="text-red-400">*</span></label>
                            <select value={data.to_warehouse} onChange={e => setData('to_warehouse', e.target.value)}
                                className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required>
                                <option value="">—</option>
                                {warehouses.filter(w => w.id != data.from_warehouse).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Cantidad <span className="text-red-400">*</span></label>
                        <input type="number" min="1" value={data.quantity} onChange={e => setData('quantity', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" required />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Motivo</label>
                        <input type="text" value={data.reason} onChange={e => setData('reason', e.target.value)}
                            className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={processing}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                            Transferir
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function InventoryMovements({ movements, warehouses, products, filters }) {
    const [showMove,     setShowMove    ] = useState(false);
    const [showTransfer, setShowTransfer] = useState(false);
    const [type,         setType        ] = useState(filters?.type ?? '');
    const [warehouseId,  setWarehouse   ] = useState(filters?.warehouse_id ?? '');

    function applyFilters() {
        router.get(route('inventory.movements'), { type, warehouse_id: warehouseId }, { preserveScroll: true });
    }

    return (
        <DashboardLayout>
            <Head title="Movimientos de Inventario" />
            {showMove     && <MovementModal  warehouses={warehouses} products={products} onClose={() => setShowMove(false)} />}
            {showTransfer && <TransferModal  warehouses={warehouses} products={products} onClose={() => setShowTransfer(false)} />}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Movimientos de Inventario</h1>
                        <p className="text-gray-400 text-sm">Historial de entradas, salidas y transferencias</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowTransfer(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-lg text-sm">
                            <RefreshCw size={16} /> Transferir
                        </button>
                        <button onClick={() => setShowMove(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm">
                            <Plus size={16} /> Movimiento
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                    <div>
                        <label className="block text-gray-400 text-xs mb-1">Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                            <option value="">Todos</option>
                            <option value="entrada">Entrada</option>
                            <option value="salida">Salida</option>
                            <option value="ajuste">Ajuste</option>
                            <option value="transferencia">Transferencia</option>
                        </select>
                    </div>
                    {warehouses.length > 0 && (
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Almacén</label>
                            <select value={warehouseId} onChange={e => setWarehouse(e.target.value)}
                                className="bg-gray-700/50 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm">
                                <option value="">Todos</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={applyFilters}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium">
                        Filtrar
                    </button>
                </div>

                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
                        <h2 className="text-white font-semibold">Historial</h2>
                        <span className="text-gray-400 text-sm">{movements?.total ?? 0} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-700/50 text-gray-400">
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="text-left p-3">Tipo</th>
                                    <th className="text-left p-3">Producto</th>
                                    <th className="text-left p-3">Almacén</th>
                                    <th className="text-right p-3">Cantidad</th>
                                    <th className="text-left p-3">Motivo</th>
                                    <th className="text-left p-3">Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements?.data?.length ? movements.data.map(m => (
                                    <tr key={m.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                                        <td className="p-3 text-gray-400 text-xs">{m.created_at?.split('T')[0]}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[m.type] ?? 'bg-gray-500/20 text-gray-400'}`}>
                                                {m.type === 'entrada' ? <ArrowDown size={12}/> : m.type === 'salida' ? <ArrowUp size={12}/> : <RefreshCw size={12}/>}
                                                {m.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-300">{m.product?.name ?? '—'}</td>
                                        <td className="p-3 text-gray-400">{m.warehouse?.name ?? '—'}</td>
                                        <td className={`p-3 text-right font-bold ${m.type === 'entrada' ? 'text-green-400' : m.type === 'salida' ? 'text-red-400' : 'text-gray-300'}`}>
                                            {m.type === 'entrada' ? '+' : m.type === 'salida' ? '-' : ''}{m.quantity}
                                        </td>
                                        <td className="p-3 text-gray-400 text-xs truncate max-w-32">{m.reason ?? '—'}</td>
                                        <td className="p-3 text-gray-400 text-xs">{m.user?.name ?? '—'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={7} className="p-8 text-center text-gray-500">Sin movimientos</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {movements?.links?.length > 3 && (
                        <div className="p-4 flex gap-1 flex-wrap">
                            {movements.links.map((l, i) => (
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
