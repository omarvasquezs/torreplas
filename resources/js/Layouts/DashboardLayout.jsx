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
    KeyRound,
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
            { name: 'Pedidos',     href: () => route('orders.index'),      icon: ShoppingCart, match: 'orders.*', permission: 'sales.access' },
            { name: 'Cotización',  href: () => route('quotations.index'),  icon: FileText,     match: 'quotations.*', permission: 'sales.access' },
            { name: 'Facturación', href: () => route('invoices.index'),    icon: FileText,     match: 'invoices.*', permission: 'sales.access' },
        ],
    },
    {
        label: 'Inventario',
        items: [
            { name: 'Productos',  href: () => route('products.index'),        icon: Package,  match: 'products.*', permission: 'logistics.access' },
            { name: 'Almacenes',  href: () => route('inventory.index'),       icon: Boxes,    match: 'inventory.*', permission: 'logistics.access' },
            { name: 'Logística',  href: () => route('deliveries.index'),      icon: Truck,    match: 'deliveries.*', permission: 'logistics.access' },
            { name: 'Guías de Remisión', href: () => route('dispatch-guides.index'), icon: FileText, match: 'dispatch-guides.*', permission: 'logistics.access' },
        ],
    },
    {
        label: 'Compras',
        items: [
            { name: 'Órdenes de Compra', href: () => route('purchases.index'), icon: Truck,       match: 'purchases.*', permission: 'logistics.access' },
            { name: 'Proveedores',       href: () => route('suppliers.index'), icon: Building2,   match: 'suppliers.*', permission: 'logistics.access' },
        ],
    },
    {
        label: 'Finanzas',
        items: [
            { name: 'Caja y Bancos',    href: () => route('cash.index'),           icon: Wallet,          match: 'cash.*', permission: 'finance.access' },
            { name: 'Cuentas x Cobrar', href: () => route('accounts.receivable'),  icon: ArrowDownCircle, match: 'accounts.receivable', permission: 'finance.access' },
            { name: 'Cuentas x Pagar',  href: () => route('accounts.payable'),     icon: ArrowUpCircle,   match: 'accounts.payable', permission: 'finance.access' },
        ],
    },
    {
        label: 'RRHH',
        items: [
            { name: 'Mis Permisos', href: () => route('hr.my-requests'), icon: FileText, match: 'hr.my-requests', permission: 'hr.self' },
            { name: 'Solicitudes RRHH', href: () => route('hr.requests.index'), icon: FileText, match: 'hr.requests.*', permission: 'hr.manage' },
            { name: 'Empleados', href: () => route('employees.index'), icon: Users, match: 'employees.*', permission: 'admin.access' },
        ],
    },
    {
        label: 'Contabilidad',
        items: [
            { name: 'Plan Contable', href: () => route('accounting.accounts'), icon: BookOpen,  match: 'accounting.accounts', permission: 'accounting.access' },
            { name: 'Asientos',      href: () => route('accounting.entries'),  icon: AlignLeft, match: 'accounting.entries', permission: 'accounting.access'  },
            { name: 'Balance',       href: () => route('accounting.balance'),  icon: PieChart,  match: 'accounting.balance', permission: 'accounting.access'  },
        ],
    },
    {
        label: 'Administración',
        items: [
            { name: 'Reportes',      href: () => route('reports.index'),   icon: BarChart2, match: 'reports.*', permission: 'admin.access' },
            { name: 'Usuarios',      href: () => route('users.index'),     icon: UserCog,   match: 'users.*', permission: 'admin.access' },
            { name: 'Configuración', href: () => route('settings.index'),  icon: Settings,  match: 'settings.*', permission: 'admin.access' },
            { name: 'Alquileres',    href: () => route('rentals.index'),   icon: KeyRound,  match: 'rentals.*', permission: 'admin.access' },
        ],
    },
    {
        label: 'Soporte',
        items: [
            { name: 'Caja Negra 2103', href: () => route('support.blackbox'), icon: CreditCard, match: 'support.blackbox', permission: 'support.blackbox' },
        ],
    },
];

function NavGroup({ group, auth, setSidebarOpen }) {
    const [open, setOpen] = useState(true);
    const roleName = auth?.user?.role?.name;
    const isAdmin = roleName === 'admin' || roleName === 'gerencial_general';
    const permissions = Array.isArray(auth?.permissions) ? auth.permissions : [];

    const can = (permission) => {
        if (!permission) return true;
        if (isAdmin) return true;
        return permissions.includes(permission);
    };

    const visibleItems = group.items.filter(item => can(item.permission));
    if (visibleItems.length === 0) return null;

    const isAnyActive = visibleItems.some(item => {
        try { return route().current(item.match); } catch { return false; }
    });

    return (
        <div>
            <button onClick={() => setOpen(v => !v)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-700">
                <span>{group.label}</span>
                <ChevronDown size={12} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
            </button>
            {open && (
                <ul className="space-y-0.5 mt-0.5">
                    {visibleItems.map(item => {
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
                                            : "text-gray-600 hover:bg-gray-100/60 hover:text-gray-900"
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
        <div className="intranet-light min-h-screen bg-gray-100 text-gray-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-white/80 backdrop-blur-sm xl:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 xl:translate-x-0 flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="relative flex h-20 items-center justify-center px-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center justify-center w-full">
                        <img
                            src="/logo_torre_plas.png"
                            alt="Torreplas"
                            className="h-14 w-auto object-contain"
                        />
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="xl:hidden absolute right-4 text-gray-600 hover:text-gray-900">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                    {GROUPS.map(group => (
                        <NavGroup key={group.label} group={group} auth={auth} setSidebarOpen={setSidebarOpen} />
                    ))}
                </nav>

                <div className="border-t border-gray-200 p-3 shrink-0">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-white mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{auth.user.name}</p>
                            <p className="text-xs text-gray-600 truncate">{auth.user.email}</p>
                        </div>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="xl:pl-64 flex flex-col min-h-screen bg-gray-100">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white/95 backdrop-blur-md px-4">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-600 hover:text-gray-900 xl:hidden">
                        <Menu size={22} />
                    </button>
                </header>

                <main className="flex-1 p-3 md:p-4 xl:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
