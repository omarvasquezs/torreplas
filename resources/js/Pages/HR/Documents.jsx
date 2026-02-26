import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { ArrowLeft, Upload, FileText, Download, Trash2 } from 'lucide-react';
import { useRef } from 'react';

const DOC_TYPES = ['Contrato', 'DNI', 'RUC', 'Título Profesional', 'Certificado', 'Otro'];

const TYPE_COLORS = {
    'Contrato': 'bg-indigo-500/20 text-indigo-400',
    'DNI':      'bg-green-500/20 text-green-400',
    'RUC':      'bg-blue-500/20 text-blue-400',
    'Título Profesional': 'bg-purple-500/20 text-purple-400',
    'Certificado': 'bg-yellow-500/20 text-yellow-400',
    'Otro':     'bg-gray-500/20 text-gray-600',
};

export default function HRDocuments({ employee, documents }) {
    const fileRef = useRef();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'Contrato',
        file: null,
    });

    function submit(e) {
        e.preventDefault();
        post(route('employees.documents.store', employee.id), {
            forceFormData: true,
            onSuccess: () => { reset(); if (fileRef.current) fileRef.current.value = ''; },
        });
    }

    function destroy(docId) {
        if (!confirm('¿Eliminar este documento?')) return;
        router.delete(route('employees.documents.destroy', [employee.id, docId]), { preserveScroll: true });
    }

    return (
        <DashboardLayout>
            <Head title={`Documentos — ${employee.full_name ?? employee.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Link href={route('employees.index')}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"><ArrowLeft size={18}/></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Documentos Laborales</h1>
                        <p className="text-gray-600 text-sm">
                            {employee.full_name ?? `${employee.first_name} ${employee.last_name}`} — {employee.document_number}
                        </p>
                    </div>
                </div>

                {/* Upload form */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                        <Upload size={16} className="text-indigo-400"/> Subir nuevo documento
                    </h2>
                    <form onSubmit={submit} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Nombre del documento</label>
                            <input value={data.name} onChange={e => setData('name', e.target.value)}
                                className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm" required
                                placeholder="Ej. Contrato 2024" />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Tipo</label>
                            <select value={data.type} onChange={e => setData('type', e.target.value)}
                                className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 text-sm">
                                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-xs mb-1">Archivo</label>
                            <input ref={fileRef} type="file" onChange={e => setData('file', e.target.files[0])}
                                className="w-full bg-gray-100 border border-gray-200 text-gray-900 rounded-lg px-3 py-1.5 text-sm
                                           file:mr-3 file:bg-indigo-600 file:hover:bg-indigo-500 file:text-white file:text-xs
                                           file:border-0 file:rounded file:px-3 file:py-1 file:cursor-pointer" required />
                            {errors.file && <p className="text-red-400 text-xs mt-1">{errors.file}</p>}
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                            <button type="submit" disabled={processing}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                                <Upload size={14}/> {processing ? 'Subiendo...' : 'Subir archivo'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Documents list */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-white font-semibold text-sm">Documentos ({documents?.length ?? 0})</h2>
                    </div>
                    {documents?.length ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-600">
                                    <th className="text-left p-3">Nombre</th>
                                    <th className="text-left p-3">Tipo</th>
                                    <th className="text-left p-3">Archivo</th>
                                    <th className="text-left p-3">Fecha</th>
                                    <th className="p-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(doc => (
                                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 text-gray-700 flex items-center gap-2">
                                            <FileText size={14} className="text-indigo-400 shrink-0"/>
                                            {doc.name}
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${TYPE_COLORS[doc.type] ?? 'bg-gray-500/20 text-gray-600'}`}>
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600 text-xs font-mono truncate max-w-36">{doc.original_name}</td>
                                        <td className="p-3 text-gray-600 text-xs">{doc.created_at?.split('T')[0]}</td>
                                        <td className="p-3 flex gap-1 justify-end">
                                            <a href={`/storage/${doc.path}`} target="_blank" rel="noreferrer"
                                                className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 rounded-lg">
                                                <Download size={14}/>
                                            </a>
                                            <button onClick={() => destroy(doc.id)}
                                                className="p-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-lg">
                                                <Trash2 size={14}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-gray-500">No hay documentos subidos para este empleado</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
