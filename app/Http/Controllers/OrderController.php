<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Client;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['client', 'user']);

        if ($request->search) {
            $query->where('code', 'like', '%' . $request->search . '%')
                ->orWhereHas('client', function ($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%');
                });
        }

        $orders = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Orders/Form', [
            'clients' => Client::where('is_active', true)->get(),
            'products' => Product::with('unit')->where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'date_issue' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $total = 0;
            $subtotal = 0;

            // Calculate totals
            foreach ($validated['items'] as $item) {
                $lineTotal = $item['quantity'] * $item['unit_price'];
                $total += $lineTotal;
            }

            $tax = $total * 0.18; // IGV 18% assumption, or included. 
            // Lets assume prices include IGV for simplicity or excluded. 
            // Simplification: Input prices are final for now.
            // If we want rigorous tax: subtotal = total / 1.18; tax = total - subtotal;
            $subtotal = $total / 1.18;
            $tax = $total - $subtotal;

            $order = Order::create([
                'client_id' => $validated['client_id'],
                'user_id' => auth()->id(),
                'code' => 'ORD-' . strtoupper(Str::random(8)),
                'date_issue' => $validated['date_issue'],
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total,
                'payment_status' => 'unpaid'
            ]);

            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);

                // Inventory Logic could go here (ProductWarehouse::decrement...)
                // For now, keeping it simple
            }
        });

        return redirect()->route('orders.index')->with('success', 'Pedido creado exitosamente.');
    }

    public function show(Order $order)
    {
        $order->load(['client', 'items.product', 'user']);
        return Inertia::render('Orders/Show', [
            'order' => $order
        ]);
    }
}
