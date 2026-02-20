<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PurchaseOrder;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountsController extends Controller
{
    // ── Cuentas por Cobrar ────────────────────────────────────────
    public function receivable(Request $request)
    {
        $orders = Order::with(['client', 'payments'])
            ->whereIn('payment_status', ['unpaid', 'partial'])
            ->when($request->search, fn($q, $s) =>
                $q->where('code', 'like', "%$s%")
                  ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%$s%"))
            )
            ->orderBy('date_due')
            ->paginate(15)
            ->withQueryString();

        $totals = [
            'total_pending' => Order::whereIn('payment_status', ['unpaid', 'partial'])->sum('total'),
            'overdue'       => Order::whereIn('payment_status', ['unpaid', 'partial'])
                ->where('date_due', '<', today())->sum('total'),
        ];

        return Inertia::render('Accounts/Receivable', [
            'orders'  => $orders,
            'totals'  => $totals,
            'filters' => $request->only('search'),
        ]);
    }

    public function storeReceivablePayment(Request $request, Order $order)
    {
        $data = $request->validate([
            'amount'       => 'required|numeric|min:0.01',
            'method'       => 'required|in:efectivo,transferencia,tarjeta,cheque',
            'reference'    => 'nullable|string|max:100',
            'payment_date' => 'required|date',
        ]);

        Payment::create([
            'payable_type' => Order::class,
            'payable_id'   => $order->id,
            'user_id'      => Auth::id(),
            'amount'       => $data['amount'],
            'method'       => $data['method'],
            'reference'    => $data['reference'] ?? null,
            'payment_date' => $data['payment_date'],
        ]);

        $totalPaid = Payment::where('payable_type', Order::class)
            ->where('payable_id', $order->id)
            ->sum('amount');

        $status = $totalPaid >= $order->total ? 'paid'
                : ($totalPaid > 0 ? 'partial' : 'unpaid');

        $order->update(['payment_status' => $status]);

        return back()->with('success', 'Pago registrado.');
    }

    // ── Cuentas por Pagar ────────────────────────────────────────
    public function payable(Request $request)
    {
        $purchases = PurchaseOrder::with(['supplier', 'payments'])
            ->whereIn('status', ['pending', 'received'])
            ->when($request->search, fn($q, $s) =>
                $q->where('code', 'like', "%$s%")
                  ->orWhereHas('supplier', fn($c) => $c->where('name', 'like', "%$s%"))
            )
            ->orderBy('date_due')
            ->paginate(15)
            ->withQueryString();

        $totals = [
            'total_pending' => PurchaseOrder::whereIn('status', ['pending', 'received'])->sum('total'),
            'overdue'       => PurchaseOrder::whereIn('status', ['pending', 'received'])
                ->where('date_due', '<', today())->sum('total'),
        ];

        return Inertia::render('Accounts/Payable', [
            'purchases' => $purchases,
            'totals'    => $totals,
            'filters'   => $request->only('search'),
        ]);
    }

    public function storePayablePayment(Request $request, PurchaseOrder $purchase)
    {
        $data = $request->validate([
            'amount'       => 'required|numeric|min:0.01',
            'method'       => 'required|in:efectivo,transferencia,tarjeta,cheque',
            'reference'    => 'nullable|string|max:100',
            'payment_date' => 'required|date',
        ]);

        Payment::create([
            'payable_type' => PurchaseOrder::class,
            'payable_id'   => $purchase->id,
            'user_id'      => Auth::id(),
            'amount'       => $data['amount'],
            'method'       => $data['method'],
            'reference'    => $data['reference'] ?? null,
            'payment_date' => $data['payment_date'],
        ]);

        return back()->with('success', 'Pago registrado.');
    }
}
