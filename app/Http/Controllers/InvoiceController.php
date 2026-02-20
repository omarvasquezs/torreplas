<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $invoices = Invoice::with(['client', 'order'])
            ->when($request->search, fn($q, $s) =>
                $q->where('serie', 'like', "%$s%")
                  ->orWhere('number', 'like', "%$s%")
                  ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%$s%"))
            )
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderByDesc('issue_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Invoices/Index', [
            'invoices' => $invoices,
            'filters'  => $request->only(['search', 'type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Invoices/Form', [
            'clients' => Client::where('is_active', true)->orderBy('name')->get(),
            'orders'  => Order::with('client')
                ->whereIn('status', ['approved', 'delivered'])
                ->whereDoesntHave('invoice')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id'     => 'nullable|exists:orders,id',
            'client_id'    => 'required|exists:clients,id',
            'type'         => 'required|in:factura,boleta,nota_credito,nota_debito',
            'serie'        => 'required|string|max:10',
            'number'       => 'required|string|max:20',
            'issue_date'   => 'required|date',
            'total_amount' => 'required|numeric|min:0',
        ]);

        Invoice::create(array_merge($data, ['status' => 'generated']));

        return redirect()->route('invoices.index')->with('success', 'Comprobante registrado.');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['client', 'order.items.product']);

        return Inertia::render('Invoices/Show', ['invoice' => $invoice]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $data = $request->validate([
            'status' => 'required|in:generated,sent_sunat,accepted,rejected',
        ]);

        $invoice->update($data);

        return redirect()->route('invoices.index')->with('success', 'Estado actualizado.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->route('invoices.index')->with('success', 'Comprobante eliminado.');
    }
}
