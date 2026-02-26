import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function UsersForm({ user, roles }) {
    const isEdit = !!user;

    const { data, setData, post, put, processing, errors } = useForm({
        name:                  user?.name     || '',
        email:                 user?.email    || '',
        role_id:               user?.role_id  || '',
        is_active:             user?.is_active !== false,
        password:              '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        isEdit ? put(route('users.update', user.id)) : post(route('users.store'));
    }

    return (
        <DashboardLayout>
            <Head title={isEdit ? 'Editar Usuario' : 'Nuevo Usuario'} />
            <div className="max-w-xl space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('users.index')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                        <ArrowLeft size={18} />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">Información</h2>
                        {[
                            ['Nombre completo', 'name', 'text'],
                            ['Email', 'email', 'email'],
                        ].map(([label, name, type]) => (
                            <div key={name}>
                                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                                <input type={type} value={data[name]} onChange={e => setData(name, e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Rol</label>
                            <select value={data.role_id} onChange={e => setData('role_id', e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                <option value="">Sin rol asignado</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                            </select>
                        </div>

                        {isEdit && (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600" />
                                <span className="text-sm text-gray-700">Usuario activo</span>
                            </label>
                        )}
                    </section>

                    <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                        <h2 className="text-white font-semibold">{isEdit ? 'Cambiar Contraseña' : 'Contraseña'}</h2>
                        {isEdit && <p className="text-gray-500 text-xs">Dejar en blanco para mantener la contraseña actual.</p>}
                        {[
                            ['Contraseña', 'password'],
                            ['Confirmar contraseña', 'password_confirmation'],
                        ].map(([label, name]) => (
                            <div key={name}>
                                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                                <input type="password" value={data[name]} onChange={e => setData(name, e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                    </section>

                    <div className="flex gap-3">
                        <button type="submit" disabled={processing}
                            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            <Save size={16} /> {isEdit ? 'Guardar cambios' : 'Crear usuario'}
                        </button>
                        <Link href={route('users.index')} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition">
                            Cancelar
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
