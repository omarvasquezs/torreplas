<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Client;
use App\Models\PurchaseOrder;
use App\Models\CashRegister;
use App\Models\Movement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = today();

        // KPIs
        $salesToday = Order::whereDate('date_issue', $today)
            ->whereIn('status', ['approved', 'delivered'])
            ->sum('total');

        $pendingOrders = Order::where('status', 'pending')->count();

        $lowStockCount = Product::whereHas('warehouses', function ($q) {
            $q->whereRaw('product_warehouse.current_stock <= products.min_stock');
        })->count();

        $totalClients = Client::where('is_active', true)->count();

        // Sales last 7 days
        $salesChart = Order::select(
                DB::raw('DATE(date_issue) as date'),
                DB::raw('SUM(total) as total')
            )
            ->where('date_issue', '>=', now()->subDays(6))
            ->whereIn('status', ['approved', 'delivered'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top 5 products by orders this month
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereMonth('orders.date_issue', $today->month)
            ->whereIn('orders.status', ['approved', 'delivered'])
            ->select('products.name', DB::raw('SUM(order_items.quantity) as qty'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        // Recent movements
        $recentMovements = Movement::with(['product', 'warehouse'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Cash registers open
        $openCash = CashRegister::where('is_open', true)->sum('current_balance');

        // Orders by payment status
        $paymentSummary = Order::select('payment_status', DB::raw('count(*) as count'))
            ->groupBy('payment_status')
            ->get()
            ->keyBy('payment_status');

        return Inertia::render('Dashboard', [
            'kpis' => [
                'sales_today'    => $salesToday,
                'pending_orders' => $pendingOrders,
                'low_stock'      => $lowStockCount,
                'total_clients'  => $totalClients,
                'open_cash'      => $openCash,
            ],
            'salesChart'      => $salesChart,
            'topProducts'     => $topProducts,
            'recentMovements' => $recentMovements,
            'paymentSummary'  => $paymentSummary,
        ]);
    }
}
