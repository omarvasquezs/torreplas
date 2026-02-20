<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PurchaseOrder;
use App\Models\Movement;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    // ── Sales ─────────────────────────────────────────────────────────────────

    public function sales(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $query = Order::with(['client'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()]);

        $orders  = (clone $query)->paginate(30)->withQueryString();
        $all     = (clone $query)->get();

        $summary = [
            'total'   => $all->sum('total'),
            'count'   => $all->count(),
            'paid'    => $all->where('payment_status', 'paid')->sum('total'),
            'pending' => $all->whereIn('payment_status', ['unpaid','partial'])->sum('total'),
        ];

        $byClient = $all->groupBy('client_id')->map(fn($g) => [
            'client_id'    => $g->first()->client_id,
            'client_name'  => $g->first()->client?->name ?? 'N/A',
            'orders_count' => $g->count(),
            'total'        => $g->sum('total'),
        ])->sortByDesc('total')->values()->take(10);

        return Inertia::render('Reports/Sales', [
            'orders'   => $orders,
            'summary'  => $summary,
            'byClient' => $byClient,
            'filters'  => ['from' => $from, 'to' => $to],
        ]);
    }

    public function exportSales(Request $request): StreamedResponse
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $orders = Order::with(['client'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()])
            ->get();

        return $this->csvResponse("ventas_{$from}_{$to}.csv", function () use ($orders) {
            echo "\xEF\xBB\xBF"; // UTF-8 BOM for Excel
            echo "N°,Cliente,Fecha,Total,Estado Pago\n";
            foreach ($orders as $o) {
                echo implode(',', [
                    $o->order_number ?? $o->id,
                    '"' . str_replace('"', '""', $o->client?->name ?? '') . '"',
                    $o->created_at->format('d/m/Y'),
                    number_format($o->total, 2),
                    $o->payment_status ?? '',
                ]) . "\n";
            }
        });
    }

    // ── Purchases ─────────────────────────────────────────────────────────────

    public function purchases(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $query = PurchaseOrder::with(['supplier'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()]);

        $orders  = (clone $query)->paginate(30)->withQueryString();
        $all     = (clone $query)->get();

        $summary = [
            'total'    => $all->sum('total'),
            'count'    => $all->count(),
            'received' => $all->where('status', 'received')->sum('total'),
        ];

        return Inertia::render('Reports/Purchases', [
            'orders'  => $orders,
            'summary' => $summary,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function exportPurchases(Request $request): StreamedResponse
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $orders = PurchaseOrder::with(['supplier'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()])
            ->get();

        return $this->csvResponse("compras_{$from}_{$to}.csv", function () use ($orders) {
            echo "\xEF\xBB\xBF";
            echo "N°,Proveedor,Fecha,Total,Estado\n";
            foreach ($orders as $o) {
                echo implode(',', [
                    $o->id,
                    '"' . str_replace('"', '""', $o->supplier?->name ?? '') . '"',
                    $o->created_at->format('d/m/Y'),
                    number_format($o->total, 2),
                    $o->status ?? '',
                ]) . "\n";
            }
        });
    }

    // ── Inventory ─────────────────────────────────────────────────────────────

    public function inventory(Request $request)
    {
        $products = Product::with(['category', 'brand', 'unit', 'warehouses'])
            ->when($request->low_stock, fn($q) => $q->where('stock', '<=', DB::raw('min_stock')))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")
                ->orWhere('sku', 'like', "%$s%"))
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        $allProducts = Product::withSum('warehouses as total_stock', 'product_warehouse.current_stock')->get();
        $summary = [
            'total_products'  => $allProducts->count(),
            'low_stock_count' => $allProducts->filter(fn($p) => $p->stock <= ($p->min_stock ?? 0))->count(),
            'total_value'     => $allProducts->sum(fn($p) => $p->price * $p->stock),
            'low_stock_value' => $allProducts->filter(fn($p) => $p->stock <= ($p->min_stock ?? 0))
                                              ->sum(fn($p) => $p->price * $p->stock),
        ];

        return Inertia::render('Reports/Inventory', [
            'products' => $products,
            'summary'  => $summary,
            'filters'  => $request->only(['low_stock','search']),
        ]);
    }

    public function exportInventory(Request $request): StreamedResponse
    {
        $products = Product::with(['category'])
            ->when($request->low_stock, fn($q) => $q->where('stock', '<=', DB::raw('min_stock')))
            ->orderBy('name')->get();

        return $this->csvResponse("inventario_" . now()->format('Y-m-d') . ".csv", function () use ($products) {
            echo "\xEF\xBB\xBF";
            echo "Código,Producto,Categoría,Stock Actual,Stock Mínimo,Precio Unitario,Valor Total\n";
            foreach ($products as $p) {
                echo implode(',', [
                    '"' . ($p->sku ?? $p->code ?? $p->id) . '"',
                    '"' . str_replace('"', '""', $p->name) . '"',
                    '"' . ($p->category?->name ?? '') . '"',
                    $p->stock,
                    $p->min_stock ?? 0,
                    number_format($p->price, 2),
                    number_format($p->price * $p->stock, 2),
                ]) . "\n";
            }
        });
    }

    // ── Movements ─────────────────────────────────────────────────────────────

    public function movements(Request $request)
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $movements = Movement::with(['product', 'warehouse', 'user'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()])
            ->when($request->type,         fn($q, $t) => $q->where('type', $t))
            ->when($request->warehouse_id, fn($q, $w) => $q->where('warehouse_id', $w))
            ->when($request->product_id,   fn($q, $p) => $q->where('product_id', $p))
            ->orderByDesc('created_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Reports/Movements', [
            'movements'  => $movements,
            'warehouses' => Warehouse::orderBy('name')->get(['id','name']),
            'products'   => Product::orderBy('name')->get(['id','name']),
            'filters'    => ['from' => $from, 'to' => $to,
                             'type' => $request->type,
                             'warehouse_id' => $request->warehouse_id,
                             'product_id'   => $request->product_id],
        ]);
    }

    public function exportMovements(Request $request): StreamedResponse
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to   ?? now()->toDateString();

        $movements = Movement::with(['product', 'warehouse', 'user'])
            ->whereBetween('created_at', [$from, now()->parse($to)->endOfDay()])
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderByDesc('created_at')->get();

        return $this->csvResponse("movimientos_{$from}_{$to}.csv", function () use ($movements) {
            echo "\xEF\xBB\xBF";
            echo "Fecha,Tipo,Producto,Almacén,Cantidad,Motivo,Usuario\n";
            foreach ($movements as $m) {
                echo implode(',', [
                    $m->created_at->format('d/m/Y H:i'),
                    $m->type,
                    '"' . str_replace('"', '""', $m->product?->name ?? '') . '"',
                    '"' . str_replace('"', '""', $m->warehouse?->name ?? '') . '"',
                    $m->quantity,
                    '"' . str_replace('"', '""', $m->reason ?? '') . '"',
                    '"' . str_replace('"', '""', $m->user?->name ?? '') . '"',
                ]) . "\n";
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function csvResponse(string $filename, callable $callback): StreamedResponse
    {
        return response()->streamDownload($callback, $filename, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
