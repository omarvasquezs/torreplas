<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchSuggestionsController extends Controller
{
    /**
     * Return up to 8 suggestions for a given CRUD resource and query.
     * 
     * GET /api/suggestions?resource=products&q=ley
     */
    public function __invoke(Request $request)
    {
        $q        = trim($request->q ?? '');
        $resource = $request->resource ?? '';

        if (strlen($q) < 2 || !$resource) {
            return response()->json([]);
        }

        $like = "%{$q}%";

        $results = match ($resource) {

            'products' => DB::table('products')
                ->where(fn($w) =>
                    $w->where('name', 'like', $like)
                      ->orWhere('code', 'like', $like)
                )
                ->orderBy('name')
                ->limit(8)
                ->get(['id', 'name', 'code as subtitle']),

            'clients' => DB::table('clients')
                ->where(fn($w) =>
                    $w->where('name', 'like', $like)
                      ->orWhere('document_number', 'like', $like)
                )
                ->orderBy('name')
                ->limit(8)
                ->get(['id', 'name', 'document_number as subtitle']),

            'orders' => DB::table('orders')
                ->leftJoin('clients', 'orders.client_id', '=', 'clients.id')
                ->where(fn($w) =>
                    $w->where('orders.code', 'like', $like)
                      ->orWhere('clients.name', 'like', $like)
                )
                ->orderByDesc('orders.id')
                ->limit(8)
                ->get([
                    'orders.id',
                    'orders.code as name',
                    'clients.name as subtitle',
                ]),

            'invoices' => DB::table('invoices')
                ->leftJoin('clients', 'invoices.client_id', '=', 'clients.id')
                ->where(fn($w) =>
                    $w->where(DB::raw("CONCAT(invoices.serie, '-', invoices.number)"), 'like', $like)
                      ->orWhere('clients.name', 'like', $like)
                      ->orWhere('invoices.serie', 'like', $like)
                )
                ->orderByDesc('invoices.id')
                ->limit(8)
                ->get([
                    'invoices.id',
                    DB::raw("CONCAT(invoices.serie, '-', invoices.number) as name"),
                    'clients.name as subtitle',
                ]),

            'quotations' => DB::table('quotations')
                ->leftJoin('clients', 'quotations.client_id', '=', 'clients.id')
                ->where(fn($w) =>
                    $w->where('quotations.quote_number', 'like', $like)
                      ->orWhere('clients.name', 'like', $like)
                )
                ->orderByDesc('quotations.id')
                ->limit(8)
                ->get([
                    'quotations.id',
                    'quotations.quote_number as name',
                    'clients.name as subtitle',
                ]),

            'suppliers' => DB::table('suppliers')
                ->where(fn($w) =>
                    $w->where('name', 'like', $like)
                      ->orWhere('document_number', 'like', $like)
                )
                ->orderBy('name')
                ->limit(8)
                ->get(['id', 'name', 'document_number as subtitle']),

            'purchases' => DB::table('purchase_orders')
                ->leftJoin('suppliers', 'purchase_orders.supplier_id', '=', 'suppliers.id')
                ->where(fn($w) =>
                    $w->where('purchase_orders.code', 'like', $like)
                      ->orWhere('suppliers.name', 'like', $like)
                )
                ->orderByDesc('purchase_orders.id')
                ->limit(8)
                ->get([
                    'purchase_orders.id',
                    'purchase_orders.code as name',
                    'suppliers.name as subtitle',
                ]),

            default => collect([]),
        };

        return response()->json($results->values());
    }
}
