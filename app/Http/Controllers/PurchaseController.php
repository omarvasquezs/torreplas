<?php

namespace App\Http\Controllers;

use App\Models\PurchaseOrder;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'user']);

        if ($request->search) {
            $query->where('code', 'like', '%' . $request->search . '%')
                ->orWhereHas('supplier', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
        }

        return Inertia::render('Purchases/Index', [
            'purchases' => $query->latest()->paginate(10)->withQueryString(),
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Purchases/Form', [
            'suppliers' => Supplier::all(),
            'products' => Product::with('unit')->where('is_active', true)->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'date_issue' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            $total = 0;
            foreach ($validated['items'] as $item) {
                $total += $item['quantity'] * $item['unit_cost'];
            }

            $po = PurchaseOrder::create([
                'supplier_id' => $validated['supplier_id'],
                'user_id' => auth()->id(),
                'code' => 'OC-' . strtoupper(Str::random(8)),
                'date_issue' => $validated['date_issue'],
                'total' => $total,
                'status' => 'pending'
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseItem::create([
                    'purchase_order_id' => $po->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $item['quantity'] * $item['unit_cost'],
                ]);
            }
        });

        return redirect()->route('purchases.index')->with('success', 'Orden de compra creada.');
    }
}
