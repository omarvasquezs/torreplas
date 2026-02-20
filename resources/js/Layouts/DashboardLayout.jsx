import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    CreditCard,
    Menu,
    X,
    LogOut,
    Boxes,
    Truck,
    FileText,
    Building2,
    Wallet,
    ArrowDownCircle,
    ArrowUpCircle,
    UserCog,
    BarChart2,
    ChevronDown,
    BookOpen,
    AlignLeft,
    PieChart,
    Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const GROUPS = [
    {
        label: 'Principal',
        items: [
            { name: 'Inicio',     href: () => route('dashboard'),      icon: LayoutDashboard, match: 'dashboard'     },
        ],
    },
    {
        label: 'Ventas',
        items: [
            { name: 'Pedidos',    href: () => route('orders.index'),   icon: ShoppingCart,    match: 'orders.*'      },
            { name: 'Clientes',   href: () => route('clients.index'),  icon: Users,           match: 'clients.*'     },
            { name: 'Facturación',href: () => route('invoices.index'), icon: FileText,        match: 'invoices.*'    },
        ],
    },
    {
        label: 'Inventario',
        items: [
            { name: 'Productos',  href: () => route('products.index'), icon: Package,         match: 'products.*'    },
            { name: 'Almacenes',  href: () => route('inventory.index'),icon: Boxes,           match: 'inventory.*'   },
            { name: 'Logística',  href: () => route('deliveries.index'),icon: Truck,          match: 'deliveries.*'  },
        ],
    },
    {
        label: 'Compras',
        items: [
            { name: 'Órdenes de Compra', href: () => route('purchases.index'), icon: Truck,       match: 'purchases.*'   },
            { name: 'Proveedores',       href: () => route('suppliers.index'), icon: Building2,   match: 'suppliers.*'   },
        ],
    },
    {
        label: 'Finanzas',
        items: [
            { name: 'Caja y Bancos',    href: () => route('cash.index'),           icon: Wallet,          match: 'cash.*'          },
            { name: 'Cuentas x Cobrar', href: () => route('accounts.receivable'),  icon: ArrowDownCircle, match: 'accounts.receivable' },
            { name: 'Cuentas x Pagar',  href: () => route('accounts.payable'),     icon: ArrowUpCircle,   match: 'accounts.payable'    },
        ],
    },
    {
        label: 'RRHH',
        items: [
            { name: 'Empleados', href: () => route('employees.index'), icon: Users, match: 'employees.*' },
        ],
    },
    {
        label: 'Contabilidad',
        items: [
            { name: 'Plan Contable', href: () => route('accounting.accounts'), icon: BookOpen,  match: 'accounting.accounts' },
            { name: 'Asientos',      href: () => route('accounting.entries'),  icon: AlignLeft, match: 'accounting.entries'  },
            { name: 'Balance',       href: () => route('accounting.balance'),  icon: PieChart,  match: 'accounting.balance'  },
        ],
    },
    {
        label: 'Administración',
        items: [
            { name: 'Reportes',      href: () => route('reports.index'),   icon: BarChart2, match: 'reports.*'  },
            { name: 'Usuarios',      href: () => route('users.index'),     icon: UserCog,   match: 'users.*'    },
            { name: 'Configuración', href: () => route('settings.index'),  icon: Settings,  match: 'settings.*' },
        ],
    },
];

function NavGroup({ group, setSidebarOpen }) {
    const [open, setOpen] = useState(true);
    const isAnyActive = group.items.some(item => {
        try { return route().current(item.match); } catch { return false; }
    });

    return (
        <div>
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-300">
                <span>{group.label}</span>
                <ChevronDown size={12} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
            </button>
            {open && (
                <ul className="space-y-0.5 mt-0.5">
                    {group.items.map(item => {
                        let current = false;
                        let href = '#';
                        try { current = route().current(item.match); } catch {}
                        try { href = item.href(); } catch {}
                        return (
                            <li key={item.name}>
                                <Link href={href} onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm group",
                                        current
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                            : "text-gray-400 hover:bg-gray-700/60 hover:text-white"
                                    )}>
                                    <item.icon size={16} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function DashboardLayout({ children }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700/50 transition-transform duration-300 lg:translate-x-0 flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-14 items-center justify-between px-4 border-b border-gray-700/50 shrink-0">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        TORREPLAS
                    </span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                    {GROUPS.map(group => (
                        <NavGroup key={group.label} group={group} setSidebarOpen={setSidebarOpen} />
                    ))}
                </nav>

                <div className="border-t border-gray-700/50 p-3 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-800/50 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{auth.user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{auth.user.email}</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col min-h-screen bg-gray-950">
                {/* Topbar (Mobile) */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-md px-4 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
                        <Menu size={22} />
                    </button>
                    <span className="font-bold text-white">Torreplas</span>
                </header>

                <main className="flex-1 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
