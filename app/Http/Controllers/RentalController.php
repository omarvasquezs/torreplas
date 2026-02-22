<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Rental;
use App\Models\RentalPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $rentals = Rental::with(['client', 'payments' => fn($q) => $q->whereIn('status', ['pending','overdue'])])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('description', 'like', "%{$s}%")
                ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%{$s}%")))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $summary = [
            'active'          => Rental::where('status', 'active')->count(),
            'monthly_income'  => Rental::where('status', 'active')->sum('monthly_fee'),
            'overdue_payments'=> RentalPayment::where('status', 'overdue')->count(),
            'pending_payments'=> RentalPayment::where('status', 'pending')->count(),
        ];

        return Inertia::render('Rentals/Index', [
            'rentals' => $rentals,
            'clients' => Client::orderBy('name')->get(['id', 'name', 'document_number']),
            'summary' => $summary,
            'filters' => $request->only('status', 'search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id'   => 'required|exists:clients,id',
            'description' => 'required|string|max:300',
            'address'     => 'nullable|string|max:300',
            'monthly_fee' => 'required|numeric|min:0',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after:start_date',
            'payment_day' => 'required|integer|min:1|max:28',
            'notes'       => 'nullable|string|max:500',
        ]);

        $rental = Rental::create([...$data, 'user_id' => Auth::id(), 'status' => 'active']);

        // Auto-generate payment for current month
        $rental->generatePaymentForPeriod(now()->format('Y-m'));

        return redirect()->route('rentals.show', $rental)->with('success', 'Contrato creado.');
    }

    public function show(Rental $rental)
    {
        $rental->load(['client', 'user', 'payments' => fn($q) => $q->orderByDesc('period')]);

        // Auto-mark overdue
        foreach ($rental->payments as $p) { $p->checkOverdue(); }
        $rental->refresh()->load('payments');

        $overdue = $rental->payments->where('status', 'overdue')->count();

        return Inertia::render('Rentals/Show', [
            'rental'  => $rental,
            'overdue' => $overdue,
        ]);
    }

    public function update(Request $request, Rental $rental)
    {
        $data = $request->validate([
            'description' => 'required|string|max:300',
            'address'     => 'nullable|string|max:300',
            'monthly_fee' => 'required|numeric|min:0',
            'end_date'    => 'nullable|date',
            'payment_day' => 'required|integer|min:1|max:28',
            'status'      => 'required|in:active,suspended,ended',
            'notes'       => 'nullable|string|max:500',
        ]);

        $rental->update($data);
        return redirect()->back()->with('success', 'Contrato actualizado.');
    }

    public function destroy(Rental $rental)
    {
        $rental->delete();
        return redirect()->route('rentals.index')->with('success', 'Contrato eliminado.');
    }

    /** Generate payment record for a specific period (YYYY-MM) */
    public function generatePayment(Request $request, Rental $rental)
    {
        $data = $request->validate([
            'period' => 'required|date_format:Y-m',
            'amount' => 'nullable|numeric|min:0',
        ]);

        $payment = $rental->generatePaymentForPeriod($data['period']);

        if (!empty($data['amount'])) {
            $payment->update(['amount' => $data['amount']]);
        }

        return redirect()->back()->with('success', "Cobro generado para {$data['period']}.");
    }

    /** Bulk-generate payments for ALL active rentals for a given period */
    public function bulkGenerate(Request $request)
    {
        $period = $request->validate(['period' => 'required|date_format:Y-m'])['period'];

        $count = 0;
        foreach (Rental::where('status', 'active')->get() as $rental) {
            $rental->generatePaymentForPeriod($period);
            $count++;
        }

        return redirect()->back()->with('success', "Cobros generados para {$count} contratos activos ({$period}).");
    }

    /** Register a payment (mark as paid) */
    public function registerPayment(Request $request, RentalPayment $payment)
    {
        $data = $request->validate([
            'paid_date'      => 'required|date',
            'payment_method' => 'nullable|string|max:50',
            'reference'      => 'nullable|string|max:100',
            'notes'          => 'nullable|string|max:300',
        ]);

        $payment->update([...$data, 'status' => 'paid']);

        return redirect()->back()->with('success', 'Pago registrado correctamente.');
    }

    /** Undo a payment (revert to pending) */
    public function revertPayment(RentalPayment $payment)
    {
        $payment->update(['status' => 'pending', 'paid_date' => null, 'payment_method' => null, 'reference' => null]);
        return redirect()->back()->with('success', 'Pago revertido.');
    }
}
