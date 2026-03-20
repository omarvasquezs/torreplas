<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\RentalPayment;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function blackBox()
    {
        $today = now()->toDateString();

        $dailyRealSales = (float) Order::query()
            ->whereDate('date_issue', $today)
            ->sum('total');

        $dailyDeclaredSales = (float) Invoice::query()
            ->whereDate('issue_date', $today)
            ->sum('total_amount');

        $dailyRentals = (float) RentalPayment::query()
            ->whereDate(DB::raw('COALESCE(paid_date, due_date)'), $today)
            ->sum('amount');

        $dailyUndeclaredSales = max(0, $dailyRealSales - $dailyDeclaredSales);

        return Inertia::render('Support/BlackBox', [
            'code' => '2103',
            'metrics' => [
                'daily_real_sales' => round($dailyRealSales, 2),
                'daily_declared_sales' => round($dailyDeclaredSales, 2),
                'daily_undeclared_sales' => round($dailyUndeclaredSales, 2),
                'daily_rentals' => round($dailyRentals, 2),
            ],
        ]);
    }
}
