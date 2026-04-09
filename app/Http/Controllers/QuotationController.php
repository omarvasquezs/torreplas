<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Product;
use App\Models\Quotation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index(Request $request)
    {
        $quotations = Quotation::with(['client', 'user'])
            ->when($request->search, fn($q, $s) =>
                $q->where('quote_number', 'like', "%$s%")
                  ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%$s%"))
            )
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'filters'    => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id'   => 'nullable|exists:clients,id',
            'quote_number' => 'required|string|max:30|unique:quotations,quote_number',
            'issue_date'  => 'required|date',
            'valid_until' => 'nullable|date',
            'attention'   => 'nullable|string|max:120',
            'notes'       => 'nullable|string|max:1000',
            'items'       => 'required|array|min:1',
            'items.*.product_id'  => 'nullable|exists:products,id',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity'    => 'required|numeric|min:0.01',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);

        $subtotal = collect($data['items'])->sum(fn($i) => $i['quantity'] * $i['unit_price']);
        $tax      = $subtotal * 0.18;
        $total    = $subtotal + $tax;

        DB::transaction(function () use ($data, $subtotal, $tax, $total) {
            $quotation = Quotation::create([
                'client_id'    => $data['client_id'] ?: null,
                'user_id'      => Auth::id(),
                'quote_number' => $data['quote_number'],
                'issue_date'   => $data['issue_date'],
                'valid_until'  => $data['valid_until'] ?? null,
                'attention'    => $data['attention'] ?? null,
                'notes'        => $data['notes'] ?? null,
                'subtotal'     => $subtotal,
                'tax'          => $tax,
                'total'        => $total,
                'status'       => 'draft',
            ]);

            foreach ($data['items'] as $item) {
                $quotation->items()->create([
                    'product_id'  => $item['product_id'] ?: null,
                    'description' => $item['description'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('quotations.index')->with('success', 'Cotización guardada exitosamente.');
    }

    public function show(Quotation $quotation)
    {
        $quotation->load(['client', 'user', 'items.product']);

        $clients  = Client::orderBy('name')->get(['id', 'name', 'document_type', 'document_number']);
        $products = Product::orderBy('name')->get(['id', 'name', 'code', 'price']);

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
            'clients'   => $clients,
            'products'  => $products,
        ]);
    }

    public function destroy(Quotation $quotation)
    {
        $quotation->delete();
        return redirect()->route('quotations.index')->with('success', 'Cotización eliminada.');
    }

    public function pdf(Quotation $quotation)
    {
        $quotation->load(['client', 'user', 'items.product']);

        $company = DB::table('company_settings')->first();

        $pdf = Pdf::loadView('pdf.quotation', [
            'quotation' => $quotation,
            'company'   => $company,
        ])->setPaper('a4');

        $filename = 'cotizacion_' . str_replace('/', '-', $quotation->quote_number) . '.pdf';
        return $pdf->download($filename);
    }
}
