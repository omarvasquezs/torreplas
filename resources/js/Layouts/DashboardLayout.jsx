import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    CreditCard,
    Settings,
    Menu,
    X,
    LogOut,
    Boxes,
    Truck,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }) {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Inicio', href: route('dashboard'), icon: LayoutDashboard, current: route().current('dashboard') },
        { name: 'Gestión de Productos', href: route('products.index'), icon: Package, current: route().current('products.*') },
        { name: 'Inventario', href: route('inventory.index'), icon: Boxes, current: route().current('inventory.*') },
        { name: 'Ventas y Facturación', href: route('orders.index'), icon: ShoppingCart, current: route().current('orders.*') },
        { name: 'Compras', href: route('purchases.index'), icon: Truck, current: route().current('purchases.*') },
        { name: 'Clientes', href: route('clients.index'), icon: Users, current: route().current('clients.*') },
        { name: 'Finanzas', href: route('finance.index'), icon: CreditCard, current: route().current('finance.*') },
        { name: 'Configuración', href: route('settings.index'), icon: Settings, current: route().current('settings.*') },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-slate-700">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        TORREPLAS
                    </span>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex flex-col h-[calc(100vh-4rem)] justify-between p-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                        item.current
                                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400"
                                    )}
                                >
                                    <item.icon size={20} className={cn(
                                        "transition-colors",
                                        !item.current && "group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                    )} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                {auth.user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {auth.user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {auth.user.email}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                            Cerrar Sesión
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
                {/* Topbar (Mobile only mostly) */}
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 lg:hidden">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-700">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-900 dark:text-white">Torreplas SIGC</span>
                </header>

                <main className="flex-1 p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
