<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\PurchaseOrder;
use App\Models\Movement;
use App\Models\Product;
use App\Models\Client;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    public function sales(Request $request)
    {
        $request->validate([
            'from' => 'nullable|date',
            'to'   => 'nullable|date|after_or_equal:from',
        ]);

        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $orders = Order::with(['client', 'user'])
            ->whereBetween('date_issue', [$from, $to])
            ->whereIn('status', ['approved', 'delivered'])
            ->get();

        $summary = [
            'total_orders'  => $orders->count(),
            'total_amount'  => $orders->sum('total'),
            'paid_amount'   => $orders->where('payment_status', 'paid')->sum('total'),
            'pending_amount'=> $orders->whereIn('payment_status', ['unpaid', 'partial'])->sum('total'),
        ];

        $byClient = $orders->groupBy('client_id')->map(fn($g) => [
            'client' => $g->first()->client?->name ?? 'N/A',
            'count'  => $g->count(),
            'total'  => $g->sum('total'),
        ])->values();

        return Inertia::render('Reports/Sales', [
            'orders'  => $orders,
            'summary' => $summary,
            'byClient'=> $byClient,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function purchases(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $purchases = PurchaseOrder::with(['supplier', 'user'])
            ->whereBetween('date_issue', [$from, $to])
            ->get();

        $summary = [
            'total_orders' => $purchases->count(),
            'total_amount' => $purchases->sum('total'),
        ];

        return Inertia::render('Reports/Purchases', [
            'purchases' => $purchases,
            'summary'   => $summary,
            'filters'   => ['from' => $from, 'to' => $to],
        ]);
    }

    public function inventory(Request $request)
    {
        $products = Product::with(['category', 'brand', 'unit', 'warehouses'])
            ->when($request->low_stock, fn($q) => $q->whereHas('warehouses', fn($w) =>
                $w->whereRaw('product_warehouse.current_stock <= products.min_stock')
            ))
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('Reports/Inventory', [
            'products' => $products,
            'filters'  => $request->only('low_stock'),
        ]);
    }

    public function movements(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $movements = Movement::with(['product', 'warehouse', 'user'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()])
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderByDesc('created_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Reports/Movements', [
            'movements' => $movements,
            'filters'   => ['from' => $from, 'to' => $to, 'type' => $request->type],
        ]);
    }
}
