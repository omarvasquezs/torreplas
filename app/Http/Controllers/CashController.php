<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use App\Models\CashMovement;
use App\Models\BankAccount;
use App\Models\BankTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashController extends Controller
{
    public function index()
    {
        $cashRegisters = CashRegister::with('user')
            ->withCount('movements')
            ->get();

        $bankAccounts = BankAccount::where('is_active', true)->get();

        return Inertia::render('Cash/Index', [
            'cashRegisters' => $cashRegisters,
            'bankAccounts'  => $bankAccounts,
        ]);
    }

    public function open(Request $request, CashRegister $cashRegister)
    {
        $request->validate([
            'opening_balance' => 'required|numeric|min:0',
        ]);

        $cashRegister->update([
            'is_open'         => true,
            'user_id'         => Auth::id(),
            'opened_at'       => now(),
            'opening_balance' => $request->opening_balance,
            'current_balance' => $request->opening_balance,
        ]);

        return back()->with('success', 'Caja abierta.');
    }

    public function close(CashRegister $cashRegister)
    {
        $cashRegister->update([
            'is_open'   => false,
            'closed_at' => now(),
        ]);

        return back()->with('success', 'Caja cerrada.');
    }

    public function show(CashRegister $cashRegister)
    {
        $cashRegister->load('user');

        $movements = CashMovement::where('cash_register_id', $cashRegister->id)
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate(20);

        return Inertia::render('Cash/Show', [
            'cashRegister' => $cashRegister,
            'movements'    => $movements,
        ]);
    }

    public function storeMovement(Request $request, CashRegister $cashRegister)
    {
        $data = $request->validate([
            'type'        => 'required|in:IN,OUT',
            'amount'      => 'required|numeric|min:0.01',
            'description' => 'required|string|max:300',
        ]);

        DB::transaction(function () use ($cashRegister, $data) {
            CashMovement::create([
                'cash_register_id' => $cashRegister->id,
                'user_id'          => Auth::id(),
                'type'             => $data['type'],
                'amount'           => $data['amount'],
                'description'      => $data['description'],
            ]);

            $delta = $data['type'] === 'IN' ? $data['amount'] : -$data['amount'];
            $cashRegister->increment('current_balance', $delta);
        });

        return back()->with('success', 'Movimiento registrado.');
    }

    // Bank
    public function storeBank(Request $request)
    {
        $data = $request->validate([
            'bank_name'      => 'required|string|max:100',
            'account_number' => 'required|string|max:50|unique:bank_accounts',
            'account_type'   => 'required|in:corriente,ahorros,mancomunada',
            'currency'       => 'required|in:PEN,USD',
            'current_balance'=> 'required|numeric|min:0',
        ]);

        BankAccount::create($data);

        return back()->with('success', 'Cuenta bancaria registrada.');
    }

    public function storeBankTransaction(Request $request, BankAccount $bankAccount)
    {
        $data = $request->validate([
            'type'             => 'required|in:IN,OUT',
            'amount'           => 'required|numeric|min:0.01',
            'description'      => 'required|string|max:300',
            'reference'        => 'nullable|string|max:100',
            'transaction_date' => 'required|date',
        ]);

        DB::transaction(function () use ($bankAccount, $data) {
            BankTransaction::create([
                'bank_account_id'  => $bankAccount->id,
                'user_id'          => Auth::id(),
                'type'             => $data['type'],
                'amount'           => $data['amount'],
                'description'      => $data['description'],
                'reference'        => $data['reference'] ?? null,
                'transaction_date' => $data['transaction_date'],
            ]);

            $delta = $data['type'] === 'IN' ? $data['amount'] : -$data['amount'];
            $bankAccount->increment('current_balance', $delta);
        });

        return back()->with('success', 'Movimiento bancario registrado.');
    }

    public function reconciliation(BankAccount $bankAccount)
    {
        $bankAccount->load(['transactions' => fn($q) => $q->orderByDesc('transaction_date')]);
        $bankAccounts = BankAccount::orderBy('name')->get(['id','bank','name','current_balance']);

        $reconciled    = $bankAccount->transactions->where('reconciled', true);
        $unreconciled  = $bankAccount->transactions->where('reconciled', false);
        $summary = [
            'reconciled_count'   => $reconciled->count(),
            'unreconciled_count' => $unreconciled->count(),
            'reconciled_amount'  => $reconciled->sum(fn($t) => $t->type === 'IN' ? $t->amount : -$t->amount),
        ];

        return Inertia::render('Cash/Reconciliation', [
            'bankAccount'  => $bankAccount,
            'bankAccounts' => $bankAccounts,
            'summary'      => $summary,
        ]);
    }

    public function toggleReconcile(BankTransaction $transaction)
    {
        $transaction->update([
            'reconciled'    => !$transaction->reconciled,
            'reconciled_at' => $transaction->reconciled ? null : now()->toDateString(),
        ]);
        return back()->with('success', 'Estado de conciliación actualizado.');
    }
}
