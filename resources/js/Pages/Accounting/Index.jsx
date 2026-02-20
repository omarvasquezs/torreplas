import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { BookOpen, AlignLeft, BarChart2, ArrowRight } from 'lucide-react';

const MODULES = [
    { title:'Plan Contable',    desc:'Cuentas del catálogo contable.',           icon:<BookOpen size={22} className="text-indigo-400"/>,  bg:'bg-indigo-500/10 border-indigo-500/20', href:'accounting.accounts' },
    { title:'Asientos Contables', desc:'Registro de asientos manuales y automáticos.', icon:<AlignLeft size={22} className="text-green-400"/>, bg:'bg-green-500/10 border-green-500/20',   href:'accounting.entries'  },
    { title:'Balance',          desc:'Estado de saldos por cuenta.',             icon:<BarChart2 size={22} className="text-yellow-400"/>, bg:'bg-yellow-500/10 border-yellow-500/20', href:'accounting.balance'  },
];

export default function AccountingIndex() {
    return (
        <DashboardLayout>
            <Head title="Contabilidad" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Contabilidad</h1>
                    <p className="text-gray-400 text-sm mt-1">Plan contable, asientos y estados financieros</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MODULES.map(m => (
                        <Link key={m.title} href={route(m.href)} className={`flex items-center gap-4 p-5 rounded-xl border transition hover:scale-[1.02] ${m.bg}`}>
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${m.bg}`}>{m.icon}</div>
                            <div className="flex-1">
                                <h2 className="text-white font-semibold">{m.title}</h2>
                                <p className="text-gray-400 text-xs mt-0.5">{m.desc}</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-500" />
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
