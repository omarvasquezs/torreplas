import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function SuppliersForm({ supplier }) {
    const isEdit = !!supplier;

    const { data, setData, post, put, processing, errors } = useForm({
        name:            supplier?.name            || '',
        document_type:   supplier?.document_type   || 'RUC',
        document_number: supplier?.document_number || '',
        email:           supplier?.email           || '',
        phone:           supplier?.phone           || '',
        address:         supplier?.address         || '',
        contact_person:  supplier?.contact_person  || '',
    });

    function submit(e) {
        e.preventDefault();
        isEdit
            ? put(route('suppliers.update', supplier.id))
            : post(route('suppliers.store'));
    }

    const field = (label, name, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={data[name]}
                onChange={e => setData(name, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <DashboardLayout>
            <Head title={isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'} />
            <div className="max-w-2xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('suppliers.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h1>
                        <p className="text-gray-600 text-sm mt-0.5">{isEdit ? `Editando: ${supplier.name}` : 'Registrar nuevo proveedor'}</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Información Fiscal */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Información Fiscal</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tipo Doc.</label>
                                <select
                                    value={data.document_type}
                                    onChange={e => setData('document_type', e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="RUC">RUC</option>
                                    <option value="DNI">DNI</option>
                                    <option value="CE">C.E.</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                {field('N° Documento', 'document_number', 'text', '20XXXXXXXXXX')}
                            </div>
                        </div>
                        {field('Razón Social / Nombre', 'name', 'text', 'EMPRESA S.A.C.')}
                    </section>

                    {/* Contacto */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Contacto</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Teléfono', 'phone', 'tel', '+51 999 999 999')}
                            {field('Email', 'email', 'email', 'contacto@empresa.com')}
                        </div>
                        {field('Dirección', 'address', 'text', 'Av. ...')}
                        {field('Persona de contacto', 'contact_person', 'text', 'Nombre del contacto')}
                    </section>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
                        >
                            <Save size={16} /> {isEdit ? 'Guardar cambios' : 'Crear proveedor'}
                        </button>
                        <Link href={route('suppliers.index')} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
