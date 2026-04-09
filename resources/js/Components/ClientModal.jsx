import React, { useState, useRef } from 'react';
import Modal from '@/Components/Modal';
import { X } from 'lucide-react';
import axios from 'axios';

export default function ClientModal({ show, onClose, onClientCreated }) {
    const [clientForm, setClientForm] = useState({
        document_number: '',
        document_type: 'RUC',
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [clientSaving, setClientSaving] = useState(false);
    const [clientErrors, setClientErrors] = useState({});
    
    // SUNAT Padron Search states
    const [padronResults, setPadronResults] = useState([]);
    const [padronLoading, setPadronLoading] = useState(false);
    const [activeField, setActiveField] = useState(null); // 'doc' or 'name'
    const debounceTimer = useRef(null);

    const closeDropdown = () => {
        setTimeout(() => { setPadronResults([]); setActiveField(null); }, 200);
    };

    const fetchPadron = async (q, tipo, fieldTarget) => {
        try {
            setPadronLoading(true);
            setActiveField(fieldTarget);
            const res = await axios.get('/api/padron/buscar', { params: { q, tipo, limit: 8 } });
            setPadronResults(res.data);
        } catch (e) {
            setPadronResults([]);
        } finally {
            setPadronLoading(false);
        }
    };

    const onDocInput = (e) => {
        const val = e.target.value.replace(/\D/g, '');
        setClientForm({ ...clientForm, document_number: val });
        clearTimeout(debounceTimer.current);
        if (val.length < 6) { setPadronResults([]); return; }
        
        const tipo = clientForm.document_type === 'DNI' ? 'dni' : 'ruc';
        
        debounceTimer.current = setTimeout(() => fetchPadron(val, tipo, 'doc'), 350);
    };

    const onNameInput = (e) => {
        const val = e.target.value;
        setClientForm({ ...clientForm, name: val });
        clearTimeout(debounceTimer.current);
        if (val.length < 3) { setPadronResults([]); return; }
        debounceTimer.current = setTimeout(() => fetchPadron(val, 'nombre', 'name'), 400);
    };

    const selectPadronClient = (r) => {
        let dni = r.ruc;
        let cType = 'RUC';
        if (dni.startsWith('10') && dni.length === 11 && clientForm.document_number.length < 11) {
            dni = dni.substring(2, 10);
            cType = 'DNI';
        } else if (dni.startsWith('20') && clientForm.document_number.length < 11) {
            dni = '';
        } else if (dni.length === 8) {
            cType = 'DNI';
        }
        setClientForm(f => ({ ...f, document_number: dni, name: r.nombre, document_type: cType }));
        setPadronResults([]);
        setActiveField(null);
    };

    const saveClient = async () => {
        setClientSaving(true);
        setClientErrors({});
        try {
            const res = await axios.post(route('clients.store'), clientForm, {
                headers: { 'Accept': 'application/json' }
            });
            const newClient = res.data.client;
            
            // Invoke the callback function passing the newly created client
            if (onClientCreated) onClientCreated(newClient);
            
            closeModal();
        } catch (err) {
            if (err.response?.data?.errors) {
                setClientErrors(err.response.data.errors);
            }
        } finally {
            setClientSaving(false);
        }
    };

    const closeModal = () => {
        setClientForm({ document_number: '', document_type: 'RUC', name: '', email: '', phone: '', address: '' });
        setClientErrors({});
        setPadronResults([]);
        if (onClose) onClose();
    };

    return (
        <Modal show={show} onClose={closeModal} maxWidth="2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Agregar Nuevo Cliente</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4 mb-6 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                        <select
                            value={clientForm.document_type}
                            onChange={(e) => setClientForm({ ...clientForm, document_type: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm bg-gray-50"
                        >
                            <option value="RUC">RUC</option>
                            <option value="DNI">DNI</option>
                            <option value="CE">CE</option>
                            <option value="OTROS">OTROS</option>
                        </select>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento (RUC/DNI) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            maxLength={11}
                            value={clientForm.document_number}
                            onChange={onDocInput}
                            onBlur={closeDropdown}
                            placeholder="Ej. 20123456789"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            autoComplete="off"
                        />
                        {padronLoading && activeField === 'doc' && (
                            <div className="absolute right-3 top-9 border-t-transparent border-indigo-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        )}
                        {padronResults.length > 0 && activeField === 'doc' && (
                            <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                {padronResults.map(r => (
                                    <li key={r.ruc} onMouseDown={(e) => { e.preventDefault(); selectPadronClient(r); }} className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                                        <div className="text-sm font-semibold text-indigo-700">{r.ruc}</div>
                                        <div className="text-xs text-gray-600">{r.nombre}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {clientErrors.document_number && <p className="text-red-500 text-xs mt-1">{clientErrors.document_number[0]}</p>}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social / Nombre <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={clientForm.name}
                            onChange={onNameInput}
                            onBlur={closeDropdown}
                            placeholder="Nombre del cliente"
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                            autoComplete="off"
                        />
                        {padronLoading && activeField === 'name' && (
                            <div className="absolute right-3 top-9 border-t-transparent border-indigo-600 w-4 h-4 border-2 rounded-full animate-spin"></div>
                        )}
                        {padronResults.length > 0 && activeField === 'name' && (
                            <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                {padronResults.map(r => (
                                    <li key={r.ruc} onMouseDown={(e) => { e.preventDefault(); selectPadronClient(r); }} className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                                        <div className="text-sm font-semibold text-indigo-700">{r.ruc}</div>
                                        <div className="text-xs text-gray-600">{r.nombre}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {clientErrors.name && <p className="text-red-500 text-xs mt-1">{clientErrors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 text-xs">(Opcional)</span></label>
                        <input
                            type="email"
                            value={clientForm.email}
                            onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                        {clientErrors.email && <p className="text-red-500 text-xs mt-1">{clientErrors.email[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400 text-xs">(Opcional)</span></label>
                        <input
                            type="text"
                            value={clientForm.phone}
                            onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección <span className="text-gray-400 text-xs">(Opcional)</span></label>
                        <input
                            type="text"
                            value={clientForm.address}
                            onChange={e => setClientForm({ ...clientForm, address: e.target.value })}
                            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={saveClient}
                        disabled={clientSaving}
                        className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {clientSaving ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
