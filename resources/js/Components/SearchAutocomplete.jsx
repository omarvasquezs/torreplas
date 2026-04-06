import React, { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

/**
 * SearchAutocomplete — drop-in replacement for the basic search <form>.
 *
 * Props:
 *  - resource  (string)   — one of: products, clients, orders, invoices, quotations, suppliers, purchases
 *  - value     (string)   — current search value
 *  - onChange  (fn)       — called with new string value
 *  - onSearch  (fn)       — called when user submits (Enter / click suggestion / form submit)
 *  - placeholder (string) — input placeholder
 *  - className (string)   — extra classes on wrapper
 */
export default function SearchAutocomplete({
    resource,
    value,
    onChange,
    onSearch,
    placeholder = 'Buscar...',
    className = '',
}) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading]         = useState(false);
    const [open, setOpen]               = useState(false);
    const debounce                      = useRef(null);
    const inputRef                      = useRef(null);

    const fetchSuggestions = useCallback(async (q) => {
        if (!q || q.length < 2) { setSuggestions([]); setOpen(false); return; }
        try {
            setLoading(true);
            const { data } = await axios.get('/api/suggestions', { params: { resource, q } });
            setSuggestions(data ?? []);
            setOpen((data ?? []).length > 0);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }, [resource]);

    function handleInput(e) {
        const v = e.target.value;
        onChange(v);
        clearTimeout(debounce.current);
        debounce.current = setTimeout(() => fetchSuggestions(v), 280);
    }

    function handleSelect(suggestion) {
        // Prefer name field for search
        const text = suggestion.name ?? '';
        onChange(text);
        setSuggestions([]);
        setOpen(false);
        if (onSearch) onSearch(text);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSuggestions([]);
        setOpen(false);
        if (onSearch) onSearch(value);
    }

    function handleBlur() {
        // Small delay so click on suggestion fires first
        setTimeout(() => { setSuggestions([]); setOpen(false); }, 180);
    }

    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`} autoComplete="off">
            {/* Icon */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />

            {/* Spinner */}
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            )}

            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInput}
                onBlur={handleBlur}
                placeholder={placeholder}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
            />

            {/* Dropdown */}
            {open && suggestions.length > 0 && (
                <ul className="absolute z-50 top-full mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-xl">
                    {suggestions.map((s, i) => (
                        <li
                            key={s.id ?? i}
                            onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                            className="flex items-start gap-3 px-4 py-2.5 hover:bg-indigo-50 dark:hover:bg-slate-700 cursor-pointer group transition-colors border-b border-gray-100 dark:border-slate-700 last:border-b-0"
                        >
                            <Search size={13} className="mt-0.5 text-gray-300 group-hover:text-indigo-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                                {s.subtitle && (
                                    <p className="text-xs text-gray-400 truncate">{s.subtitle}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </form>
    );
}
