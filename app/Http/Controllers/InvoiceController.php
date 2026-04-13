<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Client;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

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
        $series = DB::table('document_series')
            ->where('is_active', true)
            ->orderBy('type')
            ->orderBy('series')
            ->get(['type', 'series', 'next_number']);

        return Inertia::render('Invoices/Form', [
            'clients' => Client::where('is_active', true)->orderBy('name')->get(),
            'orders'  => Order::with('client')
                ->whereIn('status', ['approved', 'delivered'])
                ->whereDoesntHave('invoice')
                ->get(),
            'series' => $series,
        ]);
    }

    public function store(Request $request)
    {
        $isBoleta   = $request->input('type') === 'boleta';
        $isFactura  = $request->input('type') === 'factura';
        $isNotaVenta = $request->input('type') === 'nota_venta';

        $data = $request->validate([
            'order_id'       => 'nullable|exists:orders,id',
            'client_id'      => 'required',
            'type'           => 'required|in:factura,boleta,nota_venta,nota_credito,nota_debito',
            'serie'          => 'required|string|max:10',
            'issue_date'     => 'required|date',
            'total_amount'   => 'required|numeric|min:0',
            'customer_ruc'   => $isFactura ? 'required|digits:11' : 'nullable|digits:11',
            'customer_name'  => $isFactura ? 'required|string|max:200' : 'nullable|string|max:200',
            'customer_dni'   => 'nullable|digits:8',
            'payment_method' => 'nullable|string|max:30',
            'payment_bank'   => 'nullable|string|max:50',
        ]);

        $serie = strtoupper(trim($data['serie']));

        if ($data['client_id'] === 'new') {
            $docType = $isFactura ? 'RUC' : ($request->filled('customer_dni') ? 'DNI' : 'SIN RUC/DNI');
            $docNum = $isFactura ? ($data['customer_ruc'] ?? '00000000000') : ($data['customer_dni'] ?? '00000000');
            $name = $data['customer_name'] ?: 'CLIENTE VARIOS';

            $client = Client::firstOrCreate(
                ['document_number' => $docNum],
                [
                    'document_type' => $docType,
                    'name' => $name,
                    'is_active' => true,
                ]
            );
            $data['client_id'] = $client->id;
        } else {
            $request->validate(['client_id' => 'exists:clients,id']);
        }

        DB::transaction(function () use ($data, $serie) {
            $seriesRow = DB::table('document_series')
                ->where('type', $data['type'])
                ->where('series', $serie)
                ->lockForUpdate()
                ->first();

            if ($seriesRow) {
                $nextNumber = (int) $seriesRow->next_number;

                DB::table('document_series')
                    ->where('id', $seriesRow->id)
                    ->update([
                        'next_number' => $nextNumber + 1,
                        'updated_at' => now(),
                    ]);
            } else {
                $lastInvoiceNumber = Invoice::query()
                    ->where('type', $data['type'])
                    ->where('serie', $serie)
                    ->lockForUpdate()
                    ->max('number');

                $nextNumber = is_numeric($lastInvoiceNumber) ? ((int) $lastInvoiceNumber) + 1 : 1;

                DB::table('document_series')->insert([
                    'type' => $data['type'],
                    'series' => $serie,
                    'next_number' => $nextNumber + 1,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            Invoice::create([
                'order_id'       => $data['order_id'] ?: null,
                'client_id'      => $data['client_id'],
                'type'           => $data['type'],
                'serie'          => $serie,
                'number'         => str_pad((string) $nextNumber, 8, '0', STR_PAD_LEFT),
                'issue_date'     => $data['issue_date'],
                'total_amount'   => $data['total_amount'],
                'customer_ruc'   => $data['customer_ruc']  ?? null,
                'customer_name'  => $data['customer_name'] ?? null,
                'customer_dni'   => $data['customer_dni']  ?? null,
                'payment_method' => $data['payment_method'] ?? 'efectivo',
                'payment_bank'   => $data['payment_bank']  ?? null,
                'status'         => 'generated',
            ]);
        });

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

    public function pdf(Request $request, Invoice $invoice)
    {
        $invoice->load(['client', 'order.items.product']);

        $format = $request->query('format', 'a4');

        if ($format === 'ticket') {
            // Thermal ticket: 80mm width (approx 226.77 pt)
            $pdf = Pdf::loadView('pdf.ticket', ['invoice' => $invoice])
                ->setPaper([0, 0, 226.77, 841.89]);
        } else {
            $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice])
                ->setPaper('a4');
        }

        $filename = 'comprobante_' . $invoice->serie . '-' . $invoice->number . '.pdf';
        return $pdf->download($filename);
    }
}
