<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Models\Product;
use App\Models\Movement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index(Request $request)
    {
        $warehouses = Warehouse::withCount('products')->get();

        $products = Product::with(['category', 'brand', 'unit', 'warehouses'])
            ->when($request->search, fn($q, $s) =>
                $q->where('name', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%")
            )
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/Index', [
            'warehouses' => $warehouses,
            'products'   => $products,
            'filters'    => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:150',
            'address' => 'nullable|string|max:300',
        ]);

        Warehouse::create($data);

        return back()->with('success', 'Almacén registrado.');
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:150',
            'address'   => 'nullable|string|max:300',
            'is_active' => 'boolean',
        ]);

        $warehouse->update($data);

        return back()->with('success', 'Almacén actualizado.');
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();
        return back()->with('success', 'Almacén eliminado.');
    }

    public function movements(Request $request)
    {
        $movements = Movement::with(['product', 'warehouse', 'user'])
            ->when($request->product_id, fn($q, $p) => $q->where('product_id', $p))
            ->when($request->warehouse_id, fn($q, $w) => $q->where('warehouse_id', $w))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Inventory/Movements', [
            'movements'  => $movements,
            'warehouses' => Warehouse::where('is_active', true)->get(),
            'products'   => Product::orderBy('name')->get(['id', 'name', 'code']),
            'filters'    => $request->only(['product_id', 'warehouse_id', 'type']),
        ]);
    }

    public function storeMovement(Request $request)
    {
        $data = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'type'         => 'required|in:IN,OUT',
            'quantity'     => 'required|numeric|min:1',
            'concept'      => 'required|string|max:200',
            'notes'        => 'nullable|string',
        ]);

        DB::transaction(function () use ($data) {
            $pivot = DB::table('product_warehouse')
                ->where('product_id', $data['product_id'])
                ->where('warehouse_id', $data['warehouse_id'])
                ->first();

            $prevStock = $pivot ? $pivot->current_stock : 0;
            $newStock  = $data['type'] === 'IN'
                ? $prevStock + $data['quantity']
                : max(0, $prevStock - $data['quantity']);

            DB::table('product_warehouse')->updateOrInsert(
                ['product_id' => $data['product_id'], 'warehouse_id' => $data['warehouse_id']],
                ['current_stock' => $newStock, 'updated_at' => now(), 'created_at' => now()]
            );

            Movement::create([
                'product_id'     => $data['product_id'],
                'warehouse_id'   => $data['warehouse_id'],
                'user_id'        => Auth::id(),
                'type'           => $data['type'],
                'quantity'       => $data['quantity'],
                'previous_stock' => $prevStock,
                'new_stock'      => $newStock,
                'concept'        => $data['concept'],
                'notes'          => $data['notes'] ?? null,
            ]);
        });

        return back()->with('success', 'Movimiento registrado.');
    }

    public function transfer(Request $request)
    {
        $data = $request->validate([
            'product_id'      => 'required|exists:products,id',
            'from_warehouse'  => 'required|exists:warehouses,id|different:to_warehouse',
            'to_warehouse'    => 'required|exists:warehouses,id',
            'quantity'        => 'required|numeric|min:1',
            'notes'           => 'nullable|string',
        ]);

        DB::transaction(function () use ($data) {
            foreach ([
                ['warehouse_id' => $data['from_warehouse'], 'type' => 'OUT'],
                ['warehouse_id' => $data['to_warehouse'],   'type' => 'IN'],
            ] as $leg) {
                $pivot = DB::table('product_warehouse')
                    ->where('product_id', $data['product_id'])
                    ->where('warehouse_id', $leg['warehouse_id'])
                    ->first();

                $prevStock = $pivot ? $pivot->current_stock : 0;
                $newStock  = $leg['type'] === 'IN'
                    ? $prevStock + $data['quantity']
                    : max(0, $prevStock - $data['quantity']);

                DB::table('product_warehouse')->updateOrInsert(
                    ['product_id' => $data['product_id'], 'warehouse_id' => $leg['warehouse_id']],
                    ['current_stock' => $newStock, 'updated_at' => now(), 'created_at' => now()]
                );

                Movement::create([
                    'product_id'     => $data['product_id'],
                    'warehouse_id'   => $leg['warehouse_id'],
                    'user_id'        => Auth::id(),
                    'type'           => $leg['type'],
                    'quantity'       => $data['quantity'],
                    'previous_stock' => $prevStock,
                    'new_stock'      => $newStock,
                    'concept'        => 'Transferencia entre almacenes',
                    'notes'          => $data['notes'] ?? null,
                ]);
            }
        });

        return back()->with('success', 'Transferencia realizada.');
    }
}
