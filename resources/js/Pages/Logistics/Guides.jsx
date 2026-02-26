import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Plus, Search, FileText, Truck, Package, X, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

function today() {
    return new Date().toISOString().slice(0, 10);
}

export default function GuidesIndex({ guides, products, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [form, setForm] = useState({
        series: 'T001',
        issue_date: today(),
        recipient_name: '',
        observations: '',
        origin_ubigeo: '',
        origin_address: '',
        destination_ubigeo: '',
        destination_address: '',
        products: [],
    });

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((p) => map.set(p.id, p));
        return map;
    }, [products]);

    function handleSearch(e) {
        e.preventDefault();
        router.get(route('dispatch-guides.index'), { search }, { preserveState: true });
    }

    function resetForm() {
        setForm({
            series: 'T001',
            issue_date: today(),
            recipient_name: '',
            observations: '',
            origin_ubigeo: '',
            origin_address: '',
            destination_ubigeo: '',
            destination_address: '',
            products: [],
        });
        setActiveTab('basic');
    }

    function openModal() {
        resetForm();
        setShowModal(true);
    }

    function closeModal() {
        setShowModal(false);
    }

    function addProductRow() {
        setForm((prev) => ({
            ...prev,
            products: [...prev.products, { product_id: '', quantity: 1 }],
        }));
    }

    function updateProductRow(index, key, value) {
        const next = [...form.products];
        next[index] = { ...next[index], [key]: value };
        setForm((prev) => ({ ...prev, products: next }));
    }

    function removeProductRow(index) {
        const next = form.products.filter((_, i) => i !== index);
        setForm((prev) => ({ ...prev, products: next }));
    }

    function submitGuide(e) {
        e.preventDefault();
        if (form.products.length === 0) {
            setActiveTab('products');
            alert('Agrega al menos un producto para registrar la guía.');
            return;
        }

        const payload = {
            ...form,
            products: form.products
                .filter((p) => p.product_id && Number(p.quantity) > 0)
                .map((p) => ({ product_id: Number(p.product_id), quantity: Number(p.quantity) })),
        };

        if (payload.products.length === 0) {
            setActiveTab('products');
            alert('Completa los productos con cantidad válida.');
            return;
        }

        router.post(route('dispatch-guides.store'), payload, {
            onSuccess: () => {
                setShowModal(false);
                resetForm();
            },
        });
    }

    return (
        <DashboardLayout>
            <Head title="Guías de Remisión" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Guías de Remisión</h1>
                        <p className="text-gray-600 text-sm mt-1">Registro y control de guías de traslado</p>
                    </div>
                    <button
                        onClick={openModal}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        <Plus size={16} /> Nueva guía
                    </button>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Código o destinatario..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Buscar</button>
                </form>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/80">
                            <tr className="text-gray-600 text-left">
                                <th className="px-4 py-3 font-medium">Código</th>
                                <th className="px-4 py-3 font-medium">Destinatario</th>
                                <th className="px-4 py-3 font-medium">Fecha</th>
                                <th className="px-4 py-3 font-medium">Productos</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {guides.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No se encontraron guías</td>
                                </tr>
                            )}
                            {guides.data.map((g) => (
                                <tr key={g.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-mono text-gray-900">{g.code}</td>
                                    <td className="px-4 py-3 text-gray-700">{g.recipient_name}</td>
                                    <td className="px-4 py-3 text-gray-700">{g.issue_date}</td>
                                    <td className="px-4 py-3 text-gray-700">{g.items?.length ?? 0}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Procesado</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && typeof window !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] bg-black/45" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="h-full w-full flex items-center justify-center p-4">
                        <div className="w-full max-w-5xl h-[86vh] max-h-[760px] min-h-[640px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="bg-indigo-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
                            <h2 className="text-4xl leading-none font-semibold">Guía de Remisión - Remitente</h2>
                            <button onClick={closeModal} className="text-white/90 hover:text-white">
                                <X size={28} />
                            </button>
                        </div>

                        <div className="bg-indigo-700 text-white border-t border-indigo-600 shrink-0">
                            <div className="grid grid-cols-2 gap-0">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basic')}
                                    className={`relative flex flex-col items-center justify-center py-4 ${activeTab === 'basic' ? 'text-white' : 'text-white/60'}`}
                                >
                                    <FileText size={24} />
                                    <span className="mt-2 text-sm font-semibold uppercase">Información Básica</span>
                                    {activeTab === 'basic' && <span className="absolute bottom-0 left-5 right-5 h-2 bg-sky-400 rounded-t-full" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('products')}
                                    className={`relative flex flex-col items-center justify-center py-4 ${activeTab === 'products' ? 'text-white' : 'text-white/60'}`}
                                >
                                    <Package size={24} />
                                    <span className="mt-2 text-sm font-semibold uppercase">Productos</span>
                                    {activeTab === 'products' && <span className="absolute bottom-0 left-5 right-5 h-2 bg-sky-400 rounded-t-full" />}
                                </button>
                            </div>
                        </div>

                        <form onSubmit={submitGuide} className="flex-1 min-h-0 flex flex-col bg-gray-100">
                            {activeTab === 'basic' && (
                                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-gray-100">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Serie *</label>
                                            <input
                                                value={form.series}
                                                onChange={(e) => setForm((prev) => ({ ...prev, series: e.target.value }))}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Fecha de emisión *</label>
                                            <input
                                                type="date"
                                                value={form.issue_date}
                                                onChange={(e) => setForm((prev) => ({ ...prev, issue_date: e.target.value }))}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Destinatario *</label>
                                        <input
                                            value={form.recipient_name}
                                            onChange={(e) => setForm((prev) => ({ ...prev, recipient_name: e.target.value }))}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Observaciones</label>
                                        <input
                                            value={form.observations}
                                            onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-1">
                                        <div>
                                            <p className="text-xs text-gray-700 uppercase tracking-wider mb-2">Origen</p>
                                            <div className="space-y-3">
                                                <input
                                                    placeholder="Ubigeo *"
                                                    value={form.origin_ubigeo}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, origin_ubigeo: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                                />
                                                <input
                                                    placeholder="Dirección *"
                                                    value={form.origin_address}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, origin_address: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-700 uppercase tracking-wider mb-2">Destino</p>
                                            <div className="space-y-3">
                                                <input
                                                    placeholder="Ubigeo *"
                                                    value={form.destination_ubigeo}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, destination_ubigeo: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                                />
                                                <input
                                                    placeholder="Dirección *"
                                                    value={form.destination_address}
                                                    onChange={(e) => setForm((prev) => ({ ...prev, destination_address: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'products' && (
                                <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-gray-100 space-y-4">
                                    <button
                                        type="button"
                                        onClick={addProductRow}
                                        className="w-full border border-sky-300 text-sky-600 font-semibold rounded-lg py-2 hover:bg-sky-50"
                                    >
                                        AGREGAR PRODUCTO
                                    </button>

                                    <div className="space-y-3 min-h-[48vh]">
                                        {form.products.length === 0 && (
                                            <div className="h-full min-h-[40vh] flex items-center justify-center text-sm text-gray-500">Sin productos agregados.</div>
                                        )}

                                        {form.products.map((row, index) => {
                                            const selected = productMap.get(Number(row.product_id));
                                            return (
                                                <div key={index} className="grid grid-cols-12 gap-3 items-center border border-gray-200 rounded-lg p-3">
                                                    <div className="col-span-7">
                                                        <select
                                                            value={row.product_id}
                                                            onChange={(e) => updateProductRow(index, 'product_id', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                                            required
                                                        >
                                                            <option value="">Seleccionar producto...</option>
                                                            {products.map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.code ? `${p.code} - ` : ''}{p.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={row.quantity}
                                                            onChange={(e) => updateProductRow(index, 'quantity', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-span-1 text-xs text-gray-500">
                                                        {selected?.unit?.abbreviation ?? 'UND'}
                                                    </div>
                                                    <div className="col-span-1 flex justify-end">
                                                        <button type="button" onClick={() => removeProductRow(index)} className="p-2 rounded-md text-red-500 hover:bg-red-50">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="px-6 py-4 border-t border-gray-300 bg-white flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={closeModal} className="px-6 py-2 border border-indigo-300 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50">
                                    CANCELAR
                                </button>
                                <button type="submit" className="px-6 py-2 bg-indigo-700 text-white rounded-xl font-semibold hover:bg-indigo-800">
                                    PROCESAR
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </DashboardLayout>
    );
}
