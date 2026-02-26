import { Head, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Save, Plus, Trash2 } from 'lucide-react';

const SERIES_TYPES = [
    { value: 'invoice',        label: 'Factura' },
    { value: 'receipt',        label: 'Boleta de Venta' },
    { value: 'credit_note',    label: 'Nota de Crédito' },
    { value: 'debit_note',     label: 'Nota de Débito' },
    { value: 'purchase_order', label: 'Orden de Compra' },
    { value: 'quote',          label: 'Cotización' },
];

export default function SettingsIndex({ settings = {}, series = [] }) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({ ...settings });

    const addForm = useForm({ type: 'invoice', series: 'F001', next_number: 1 });

    function saveSettings(e) {
        e.preventDefault();
        post(route('settings.update'));
    }

    function addSeries(e) {
        e.preventDefault();
        addForm.post(route('settings.series.store'), {
            onSuccess: () => addForm.reset('series', 'next_number'),
        });
    }

    function deleteSeries(id) {
        if (!confirm('¿Eliminar esta serie?')) return;
        router.delete(route('settings.series.destroy', id));
    }

    return (
        <DashboardLayout>
            <Head title="Configuración" />
            <div className="space-y-8 max-w-3xl">

                <div>
                    <h1 className="text-2xl font-bold text-white">Configuración</h1>
                    <p className="text-gray-600 text-sm mt-1">Parámetros generales del sistema</p>
                </div>

                <form onSubmit={saveSettings} className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-white font-semibold text-sm mb-4">Datos de la Empresa</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { key:'company_name',    label:'Razón Social',    type:'text' },
                                { key:'company_ruc',     label:'RUC',             type:'text' },
                                { key:'company_address', label:'Dirección',       type:'text' },
                                { key:'company_phone',   label:'Teléfono',        type:'text' },
                                { key:'company_email',   label:'Email',           type:'email' },
                            ].map(f => (
                                <div key={f.key} className={f.key === 'company_address' ? 'md:col-span-2' : ''}>
                                    <label className="block text-gray-600 text-xs mb-1">{f.label}</label>
                                    <input
                                        type={f.type}
                                        value={data[f.key] ?? ''}
                                        onChange={e => setData(f.key, e.target.value)}
                                        className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-white font-semibold text-sm mb-4">Configuración Financiera</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-gray-600 text-xs mb-1">IGV / Impuesto (%)</label>
                                <input type="number" step="0.01" min="0" max="100"
                                    value={data.tax_rate ?? '18'}
                                    onChange={e => setData('tax_rate', e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm font-mono" />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-xs mb-1">Moneda</label>
                                <select value={data.currency ?? 'PEN'} onChange={e => setData('currency', e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                                    <option value="PEN">Soles (PEN)</option>
                                    <option value="USD">Dólares (USD)</option>
                                    <option value="EUR">Euros (EUR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-600 text-xs mb-1">Símbolo</label>
                                <input type="text" maxLength={4}
                                    value={data.currency_symbol ?? 'S/'}
                                    onChange={e => setData('currency_symbol', e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-gray-600 text-xs mb-1">Zona horaria</label>
                                <select value={data.timezone ?? 'America/Lima'} onChange={e => setData('timezone', e.target.value)}
                                    className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                                    <option value="America/Lima">America/Lima</option>
                                    <option value="America/Bogota">America/Bogota</option>
                                    <option value="America/New_York">America/New York</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <h2 className="text-white font-semibold text-sm mb-4">Notas en Comprobantes</h2>
                        <textarea value={data.invoice_note ?? ''} onChange={e => setData('invoice_note', e.target.value)}
                            rows={3} placeholder="Texto al pie de facturas y boletas..."
                            className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm resize-none" />
                    </div>

                    <div className="flex items-center justify-between">
                        {recentlySuccessful && <p className="text-green-400 text-sm">✓ Configuración guardada</p>}
                        <button type="submit" disabled={processing}
                            className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium">
                            <Save size={15}/> {processing ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>

                {/* Series */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-200">
                        <h2 className="text-white font-semibold text-sm">Series de Comprobantes</h2>
                    </div>
                    <form onSubmit={addSeries} className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Tipo</label>
                            <select value={addForm.data.type} onChange={e => addForm.setData('type', e.target.value)}
                                className="bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                                {SERIES_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Serie</label>
                            <input value={addForm.data.series} onChange={e => addForm.setData('series', e.target.value)}
                                className="w-24 bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm font-mono"
                                required placeholder="F001" />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Próximo N°</label>
                            <input type="number" min="1" value={addForm.data.next_number} onChange={e => addForm.setData('next_number', e.target.value)}
                                className="w-24 bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm font-mono" required />
                        </div>
                        <button type="submit" disabled={addForm.processing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">
                            <Plus size={15}/> Agregar
                        </button>
                    </form>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 text-gray-600">
                                <th className="text-left p-3">Tipo</th>
                                <th className="text-left p-3">Serie</th>
                                <th className="text-right p-3">Próximo N°</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {series?.length ? series.map(s => (
                                <tr key={s.id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3 text-gray-700">{SERIES_TYPES.find(t => t.value === s.type)?.label ?? s.type}</td>
                                    <td className="p-3 font-mono text-indigo-400">{s.series}</td>
                                    <td className="p-3 text-right font-mono text-white">{String(s.next_number).padStart(8, '0')}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => deleteSeries(s.id)}
                                            className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-6 text-center text-gray-500">No hay series configuradas</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
