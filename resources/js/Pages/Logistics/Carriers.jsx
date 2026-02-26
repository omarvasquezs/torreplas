import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Plus, Truck } from 'lucide-react';

export default function LogisticsCarriers({ carriers }) {
    const [show, setShow] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', document_number: '', license_plate: '', phone: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('carriers.store'), { onSuccess: () => { reset(); setShow(false); } });
    }

    return (
        <DashboardLayout>
            <Head title="Transportistas" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('deliveries.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1 className="text-2xl font-bold text-white">Transportistas</h1>
                    </div>
                    <button onClick={() => setShow(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                        <Plus size={16} /> Nuevo Transportista
                    </button>
                </div>

                {show && (
                    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Nuevo Transportista</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ['Nombre / Empresa', 'name', 'text'],
                                ['RUC / DNI', 'document_number', 'text'],
                                ['Placa', 'license_plate', 'text'],
                                ['Teléfono', 'phone', 'tel'],
                            ].map(([label, name, type]) => (
                                <div key={name}>
                                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                                    <input type={type} value={data[name]} onChange={e => setData(name, e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none" />
                                    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" disabled={processing}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm">
                                Guardar
                            </button>
                            <button type="button" onClick={() => setShow(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/80">
                            <tr className="text-gray-600 text-left">
                                <th className="px-4 py-3 font-medium">Transportista</th>
                                <th className="px-4 py-3 font-medium">Documento</th>
                                <th className="px-4 py-3 font-medium">Placa</th>
                                <th className="px-4 py-3 font-medium">Teléfono</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {carriers.data.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No hay transportistas</td></tr>
                            )}
                            {carriers.data.map(c => (
                                <tr key={c.id} className="hover:bg-gray-100/30">
                                    <td className="px-4 py-3 flex items-center gap-2 text-white">
                                        <Truck size={14} className="text-indigo-400" />{c.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{c.document_number || '—'}</td>
                                    <td className="px-4 py-3 text-gray-700 font-mono">{c.license_plate || '—'}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
