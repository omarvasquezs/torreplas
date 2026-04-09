<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Client;
use App\Models\Product;
use App\Models\Invoice;

class AsyncSelectController extends Controller
{
    /**
     * Return paginated suggestions for a given CRUD resource and query.
     * 
     * GET /api/select/search?resource=products&q=ley&page=1
     */
    public function __invoke(Request $request)
    {
        $q        = trim($request->q ?? '');
        $resource = $request->resource ?? '';
        $perPage  = 15;

        if (!$resource) {
            return response()->json([]);
        }

        switch ($resource) {
            case 'products':
                $query = Product::with('unit')->where('is_active', true);
                if ($q) {
                    $like = "%{$q}%";
                    $query->where(function($w) use ($like) {
                        $w->where('name', 'like', $like)
                          ->orWhere('code', 'like', $like);
                    });
                }
                return response()->json($query->orderBy('name')->paginate($perPage));

            case 'clients':
                $query = Client::where('is_active', true);
                if ($q) {
                    $like = "%{$q}%";
                    $query->where(function($w) use ($like) {
                        $w->where('name', 'like', $like)
                          ->orWhere('document_number', 'like', $like);
                    });
                }
                return response()->json($query->orderBy('name')->paginate($perPage));

            case 'invoices':
                $query = Invoice::with(['client', 'order.items.product']);
                if ($q) {
                    $like = "%{$q}%";
                    $query->where(function($w) use ($like) {
                        $w->where('serie', 'like', $like)
                          ->orWhere('number', 'like', $like)
                          ->orWhereHas('client', function($c) use ($like) {
                              $c->where('name', 'like', $like)
                                ->orWhere('document_number', 'like', $like);
                          });
                    });
                }
                return response()->json($query->orderByDesc('id')->paginate($perPage));

            default:
                return response()->json(['data' => [], 'next_page_url' => null]);
        }
    }
}
