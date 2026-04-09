import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * AsyncSelect - A Select2-like component with infinite scrolling and async fuzzy search.
 * 
 * Props:
 *  - resource: 'clients' or 'products' (matches API)
 *  - value: the currently selected complex object or ID
 *  - onChange: (obj) => void
 *  - placeholder: string
 *  - renderOption: (item) => string/node to display in list
 *  - renderDisplay: (item) => string to display in input when selected
 *  - className: string
 */
export default function AsyncSelect({
    resource,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    renderOption = (item) => item.name,
    renderDisplay = (item) => item?.name || '',
    className = ''
}) {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(false);

    const observer = useRef();
    const timeout = useRef();
    const isFirstRun = useRef(true);

    const fetchItems = async (searchQuery, p, append = false) => {
        try {
            setLoading(true);
            setError(false);
            const { data } = await axios.get('/api/select/search', {
                params: { resource, q: searchQuery, page: p }
            });

            if (append) {
                setItems(prev => [...prev, ...data.data]);
            } else {
                setItems(data.data);
            }
            setHasMore(data.next_page_url !== null);
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    // Initial load & debounced search
    useEffect(() => {
        if (isFirstRun.current) {
            fetchItems('', 1, false);
            isFirstRun.current = false;
            return;
        }

        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            setPage(1);
            fetchItems(query, 1, false);
        }, 350);

        return () => clearTimeout(timeout.current);
    }, [query]);

    // Handle intersection observer to trigger next page load
    const lastElementRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                const next = page + 1;
                setPage(next);
                fetchItems(query, next, true);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, query, page]);

    return (
        <div className={`relative ${className}`}>
            <Combobox value={value} onChange={onChange}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-gray-50 dark:bg-slate-700 text-left border border-gray-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-blue-500 sm:text-sm transition-all focus-within:border-transparent">
                        <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-white bg-transparent focus:ring-0 outline-none"
                            displayValue={renderDisplay}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={placeholder}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {loading && items.length === 0 ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden="true" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            )}
                        </Combobox.Button>
                    </div>
                    <Combobox.Options anchor="bottom" className="w-[var(--input-width)] empty:invisible mt-1 max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-[9999] border border-gray-100 dark:border-slate-700 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0">
                            {items.length === 0 && !loading ? (
                                <div className="relative cursor-default select-none px-4 py-2 text-gray-500 text-xs">
                                    No se encontraron resultados.
                                </div>
                            ) : (
                                items.map((item, index) => (
                                    <Combobox.Option
                                        key={item.id}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-4 pr-9 ${
                                                active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                            }`
                                        }
                                        value={item}
                                    >
                                        {({ selected, active }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                    {renderOption(item)}
                                                </span>
                                                {selected ? (
                                                    <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${active ? 'text-white' : 'text-blue-600'}`}>
                                                        <Check className="h-4 w-4" aria-hidden="true" />
                                                    </span>
                                                ) : null}
                                            </>
                                        )}
                                    </Combobox.Option>
                                ))
                            )}

                            {/* Infinite scroll loader trigger */}
                            {hasMore && (
                                <div ref={lastElementRef} className="py-2 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin text-gray-400" /> Cargando...
                                </div>
                            )}
                        </Combobox.Options>
                </div>
            </Combobox>
        </div>
    );
}
