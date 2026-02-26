import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-white to-indigo-50 px-4 py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_45%)]" />

            <div className="relative mb-6 text-center">
                <Link href="/" className="inline-flex flex-col items-center gap-3">
                    <img
                        src="/logo_torre_plas.png"
                        alt="Torreplas"
                        className="h-20 w-20 rounded-2xl object-contain bg-white p-2 shadow-md ring-1 ring-indigo-100"
                    />
                    <div>
                        <p className="text-2xl font-bold tracking-tight text-indigo-700">TORREPLAS</p>
                        <p className="text-sm text-gray-600">Sistema Intranet ERP</p>
                    </div>
                </Link>
            </div>

            <div className="relative w-full overflow-hidden rounded-2xl border border-indigo-100 bg-white/95 px-6 py-6 shadow-xl backdrop-blur sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
