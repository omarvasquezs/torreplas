<?php

namespace App\Http\Controllers;

use App\Models\AccountPlan;
use App\Models\JournalEntry;
use App\Models\JournalEntryLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AccountingController extends Controller
{
    // ── Plan contable ─────────────────────────────────────────────────────────

    public function accounts(Request $request)
    {
        $accounts = AccountPlan::with('parent')
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%")
                ->orWhere('code', 'like', "%$s%"))
            ->orderBy('code')
            ->get();

        $totals = [];
        foreach (['asset','liability','equity','income','expense'] as $t) {
            $totals[$t] = $accounts->where('type', $t)
                ->whereNull('parent_id')
                ->sum(fn($a) => $a->balance);
        }

        return Inertia::render('Accounting/Accounts', [
            'accounts' => $accounts,
            'totals'   => $totals,
            'filters'  => $request->only('type','search'),
        ]);
    }

    public function storeAccount(Request $request)
    {
        $data = $request->validate([
            'code'      => 'required|string|max:20|unique:account_plans,code',
            'name'      => 'required|string|max:200',
            'type'      => 'required|in:asset,liability,equity,income,expense',
            'parent_id' => 'nullable|exists:account_plans,id',
            'is_active' => 'boolean',
        ]);
        AccountPlan::create($data);
        return redirect()->route('accounting.accounts')->with('success', 'Cuenta creada.');
    }

    public function updateAccount(Request $request, AccountPlan $account)
    {
        $data = $request->validate([
            'code'      => 'required|string|max:20|unique:account_plans,code,' . $account->id,
            'name'      => 'required|string|max:200',
            'type'      => 'required|in:asset,liability,equity,income,expense',
            'parent_id' => 'nullable|exists:account_plans,id',
            'is_active' => 'boolean',
        ]);
        $account->update($data);
        return redirect()->route('accounting.accounts')->with('success', 'Cuenta actualizada.');
    }

    public function destroyAccount(AccountPlan $account)
    {
        if ($account->lines()->exists() || $account->children()->exists()) {
            return redirect()->back()->with('error', 'No se puede eliminar: tiene movimientos o subcuentas.');
        }
        $account->delete();
        return redirect()->route('accounting.accounts')->with('success', 'Cuenta eliminada.');
    }

    // ── Asientos contables ────────────────────────────────────────────────────

    public function entries(Request $request)
    {
        $entries = JournalEntry::with(['user', 'lines.account'])
            ->when($request->from, fn($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($request->to,   fn($q, $d) => $q->whereDate('date', '<=', $d))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('date')
            ->paginate(30)
            ->withQueryString();

        $accounts = AccountPlan::where('is_active', true)->orderBy('code')->get(['id','code','name','type']);

        return Inertia::render('Accounting/Entries', [
            'entries'  => $entries,
            'accounts' => $accounts,
            'filters'  => $request->only('from','to','status'),
        ]);
    }

    public function storeEntry(Request $request)
    {
        $data = $request->validate([
            'date'        => 'required|date',
            'description' => 'required|string|max:300',
            'reference'   => 'nullable|string|max:100',
            'status'      => 'required|in:draft,posted',
            'lines'       => 'required|array|min:2',
            'lines.*.account_plan_id' => 'required|exists:account_plans,id',
            'lines.*.description'     => 'nullable|string',
            'lines.*.debit'           => 'required|numeric|min:0',
            'lines.*.credit'          => 'required|numeric|min:0',
        ]);

        $totalDebit  = collect($data['lines'])->sum('debit');
        $totalCredit = collect($data['lines'])->sum('credit');
        if (abs($totalDebit - $totalCredit) > 0.01) {
            return redirect()->back()->withErrors(['lines' => 'El asiento no cuadra: débitos ≠ créditos.']);
        }

        DB::transaction(function () use ($data) {
            $entry = JournalEntry::create([
                'date'        => $data['date'],
                'description' => $data['description'],
                'reference'   => $data['reference'] ?? null,
                'status'      => $data['status'],
                'user_id'     => auth()->id(),
            ]);
            foreach ($data['lines'] as $line) {
                $entry->lines()->create($line);
            }
        });

        return redirect()->route('accounting.entries')->with('success', 'Asiento registrado.');
    }

    public function updateEntryStatus(Request $request, JournalEntry $entry)
    {
        $request->validate(['status' => 'required|in:draft,posted']);
        $entry->update(['status' => $request->status]);
        return redirect()->back()->with('success', 'Estado actualizado.');
    }

    public function destroyEntry(JournalEntry $entry)
    {
        if ($entry->status === 'posted') {
            return redirect()->back()->with('error', 'No se puede eliminar un asiento contabilizado.');
        }
        $entry->delete();
        return redirect()->route('accounting.entries')->with('success', 'Asiento eliminado.');
    }

    // ── Balance / Estado de cuentas ───────────────────────────────────────────

    public function balance(Request $request)
    {
        $to   = $request->to   ?? now()->toDateString();
        $from = $request->from ?? now()->startOfYear()->toDateString();

        $accounts = AccountPlan::with([
            'lines' => fn($q) => $q->whereHas('journalEntry', fn($je) =>
                $je->where('status', 'posted')->whereDate('date', '<=', $to)
            ),
        ])->whereNull('parent_id')->orderBy('code')->get();

        $summary = [
            'assets'      => $accounts->where('type', 'asset')->sum(fn($a) => $a->balance),
            'liabilities' => $accounts->where('type', 'liability')->sum(fn($a) => $a->balance),
            'equity'      => $accounts->where('type', 'equity')->sum(fn($a) => $a->balance),
            'income'      => $accounts->where('type', 'income')->sum(fn($a) => $a->balance),
            'expenses'    => $accounts->where('type', 'expense')->sum(fn($a) => $a->balance),
        ];
        $summary['net_income'] = $summary['income'] - $summary['expenses'];

        return Inertia::render('Accounting/Balance', [
            'accounts' => $accounts,
            'summary'  => $summary,
            'filters'  => ['from' => $from, 'to' => $to],
        ]);
    }
}
