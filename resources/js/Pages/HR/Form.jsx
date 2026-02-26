import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function HRForm({ employee }) {
    const isEdit = !!employee;

    const { data, setData, post, put, processing, errors } = useForm({
        code:            employee?.code            || '',
        first_name:      employee?.first_name      || '',
        last_name:       employee?.last_name       || '',
        document_type:   employee?.document_type   || 'DNI',
        document_number: employee?.document_number || '',
        email:           employee?.email           || '',
        phone:           employee?.phone           || '',
        address:         employee?.address         || '',
        birth_date:      employee?.birth_date      || '',
        hire_date:       employee?.hire_date       || new Date().toISOString().slice(0, 10),
        position:        employee?.position        || '',
        department:      employee?.department      || '',
        salary:          employee?.salary          || '',
        payment_method:  employee?.payment_method  || 'efectivo',
        bank_account:    employee?.bank_account    || '',
        status:          employee?.status          || 'active',
    });

    function submit(e) {
        e.preventDefault();
        isEdit ? put(route('employees.update', employee.id)) : post(route('employees.store'));
    }

    const field = (label, name, type = 'text', placeholder = '') => (
        <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input type={type} value={data[name]} onChange={e => setData(name, e.target.value)} placeholder={placeholder}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
        </div>
    );

    const select = (label, name, options) => (
        <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <select value={data[name]} onChange={e => setData(name, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <DashboardLayout>
            <Head title={isEdit ? 'Editar Colaborador' : 'Nuevo Colaborador'} />
            <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('employees.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    {/* Identification */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Identificación</h2>
                        <div className="grid grid-cols-3 gap-4">
                            {field('Código', 'code', 'text', 'EMP-001')}
                            {select('Tipo Doc.', 'document_type', [['DNI','DNI'],['CE','C.E.'],['Pasaporte','Pasaporte']])}
                            {field('N° Documento', 'document_number')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Nombres', 'first_name')}
                            {field('Apellidos', 'last_name')}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Fecha de Nacimiento', 'birth_date', 'date')}
                            {field('Fecha de Ingreso', 'hire_date', 'date')}
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Contacto</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Email', 'email', 'email')}
                            {field('Teléfono', 'phone', 'tel')}
                        </div>
                        {field('Dirección', 'address')}
                    </section>

                    {/* Work */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Datos Laborales</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {field('Cargo', 'position')}
                            {field('Área / Departamento', 'department')}
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {field('Sueldo (S/)', 'salary', 'number')}
                            {select('Forma de Pago', 'payment_method', [['efectivo','Efectivo'],['transferencia','Transferencia']])}
                            {isEdit && select('Estado', 'status', [['active','Activo'],['inactive','Inactivo'],['on_leave','Con licencia']])}
                        </div>
                        {data.payment_method === 'transferencia' && field('N° Cuenta Bancaria', 'bank_account')}
                    </section>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            <Save size={16} /> {isEdit ? 'Guardar cambios' : 'Registrar colaborador'}
                        </button>
                        <Link href={route('employees.index')} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
