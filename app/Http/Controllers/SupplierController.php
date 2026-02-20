<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::query()
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%$s%")
                  ->orWhere('document_number', 'like', "%$s%")
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters'   => $request->only('search'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Suppliers/Form');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:200',
            'document_type'   => 'required|in:RUC,DNI,CE',
            'document_number' => 'required|string|max:20|unique:suppliers',
            'email'           => 'nullable|email|max:150',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string|max:300',
            'contact_person'  => 'nullable|string|max:150',
        ]);

        Supplier::create($data);

        return redirect()->route('suppliers.index')->with('success', 'Proveedor creado.');
    }

    public function edit(Supplier $supplier)
    {
        return Inertia::render('Suppliers/Form', ['supplier' => $supplier]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:200',
            'document_type'   => 'required|in:RUC,DNI,CE',
            'document_number' => 'required|string|max:20|unique:suppliers,document_number,' . $supplier->id,
            'email'           => 'nullable|email|max:150',
            'phone'           => 'nullable|string|max:30',
            'address'         => 'nullable|string|max:300',
            'contact_person'  => 'nullable|string|max:150',
        ]);

        $supplier->update($data);

        return redirect()->route('suppliers.index')->with('success', 'Proveedor actualizado.');
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();
        return redirect()->route('suppliers.index')->with('success', 'Proveedor eliminado.');
    }
}
