import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Edit, DollarSign, Plus } from 'lucide-react';

function PayrollModal({ employee, onClose }) {
    const today = new Date();
    const { data, setData, post, processing, errors } = useForm({
        period:       `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        base_salary:  employee.salary || '',
        bonuses:      '0',
        deductions:   '0',
        payment_date: today.toISOString().slice(0, 10),
        notes:        '',
    });

    const net = (parseFloat(data.base_salary) || 0) + (parseFloat(data.bonuses) || 0) - (parseFloat(data.deductions) || 0);

    function submit(e) {
        e.preventDefault();
        post(route('employees.payrolls.store', employee.id), { onSuccess: onClose });
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-96 space-y-4">
                <h2 className="text-white font-bold text-lg">Generar Planilla</h2>
                <form onSubmit={submit} className="space-y-3">
                    {[
                        ['Período (YYYY-MM)', 'period', 'text'],
                        ['Sueldo base (S/)', 'base_salary', 'number'],
                        ['Bonificaciones (S/)', 'bonuses', 'number'],
                        ['Descuentos (S/)', 'deductions', 'number'],
                        ['Fecha de pago', 'payment_date', 'date'],
                    ].map(([label, name, type]) => (
                        <div key={name}>
                            <label className="block text-sm text-gray-400 mb-1">{label}</label>
                            <input type={type} value={data[name]} onChange={e => setData(name, e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none" />
                            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
                        </div>
                    ))}
                    <div className="bg-gray-700/50 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Neto a pagar</span>
                        <span className="text-white font-bold">S/ {net.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={processing}
                            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
                            Generar
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function HRShow({ employee, stats }) {
    const [showPayroll, setShowPayroll] = useState(false);

    return (
        <DashboardLayout>
            <Head title={`${employee.first_name} ${employee.last_name}`} />
            {showPayroll && <PayrollModal employee={employee} onClose={() => setShowPayroll(false)} />}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route('employees.index')} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 transition">
                            <ArrowLeft size={18} />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold">
                                {employee.first_name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{employee.first_name} {employee.last_name}</h1>
                                <p className="text-gray-400 text-sm">{employee.position} · {employee.department}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setShowPayroll(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                            <Plus size={16}/> Planilla
                        </button>
                        <Link href={route('employees.edit', employee.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
                            <Edit size={16}/> Editar
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        ['Sueldo mensual', `S/ ${parseFloat(employee.salary).toFixed(2)}`, 'text-green-400'],
                        ['Asistencias (mes)', stats.attendance_this_month, 'text-blue-400'],
                        ['Ausencias (mes)', stats.absences_this_month, 'text-red-400'],
                        ['Fecha ingreso', employee.hire_date, 'text-gray-300'],
                    ].map(([label, val, cls]) => (
                        <div key={label} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4">
                            <p className="text-gray-400 text-xs">{label}</p>
                            <p className={`text-lg font-bold mt-1 ${cls}`}>{val}</p>
                        </div>
                    ))}
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Información Personal</h2>
                        {[
                            ['Código', employee.code],
                            ['Documento', `${employee.document_type}: ${employee.document_number}`],
                            ['Email', employee.email],
                            ['Teléfono', employee.phone],
                            ['Dirección', employee.address],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-400">{k}</span>
                                <span className="text-white text-right max-w-48 truncate">{v || '—'}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 space-y-3">
                        <h2 className="text-white font-semibold text-sm">Datos Laborales</h2>
                        {[
                            ['Cargo', employee.position],
                            ['Departamento', employee.department],
                            ['Forma de pago', employee.payment_method],
                            ['Cuenta bancaria', employee.bank_account],
                        ].map(([k, v]) => (
                            <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-400">{k}</span>
                                <span className="text-white">{v || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payrolls */}
                {employee.payrolls && employee.payrolls.length > 0 && (
                    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                            <h2 className="text-white font-semibold flex items-center gap-2">
                                <DollarSign size={16} className="text-green-400" /> Historial de Planillas
                            </h2>
                        </div>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-900/50">
                                <tr className="text-gray-400 text-left">
                                    <th className="px-4 py-3 font-medium">Período</th>
                                    <th className="px-4 py-3 font-medium">Base</th>
                                    <th className="px-4 py-3 font-medium">Bonif.</th>
                                    <th className="px-4 py-3 font-medium">Descuentos</th>
                                    <th className="px-4 py-3 font-medium">Neto</th>
                                    <th className="px-4 py-3 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {employee.payrolls.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-700/30">
                                        <td className="px-4 py-3 text-white font-mono">{p.period}</td>
                                        <td className="px-4 py-3 text-gray-300">S/ {parseFloat(p.base_salary).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-green-400">+S/ {parseFloat(p.bonuses).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-red-400">-S/ {parseFloat(p.deductions).toFixed(2)}</td>
                                        <td className="px-4 py-3 text-white font-bold">S/ {parseFloat(p.net_salary).toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                {p.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
