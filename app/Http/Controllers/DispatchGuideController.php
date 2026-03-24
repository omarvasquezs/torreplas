<?php

namespace App\Http\Controllers;

use App\Models\DispatchGuide;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class DispatchGuideController extends Controller
{
    public function index(Request $request)
    {
        $guides = DispatchGuide::with(['user', 'items'])
            ->when($request->search, function ($query, $search) {
                $query->where('code', 'like', "%{$search}%")
                    ->orWhere('recipient_name', 'like', "%{$search}%");
            })
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $products = Product::with('unit')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'unit_id']);

        return Inertia::render('Logistics/Guides', [
            'guides' => $guides,
            'products' => $products,
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'series' => 'required|string|max:10',
            'issue_date' => 'required|date',
            'recipient_name' => 'required|string|max:180',
            'observations' => 'nullable|string|max:500',
            'origin_ubigeo' => 'required|string|max:12',
            'origin_address' => 'required|string|max:255',
            'destination_ubigeo' => 'required|string|max:12',
            'destination_address' => 'required|string|max:255',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.quantity' => 'required|numeric|min:0.01',
        ]);

        DB::transaction(function () use ($data) {
            $correlative = (DispatchGuide::where('series', $data['series'])->max('correlative') ?? 0) + 1;
            $code = $data['series'] . '-' . str_pad((string) $correlative, 8, '0', STR_PAD_LEFT);

            $guide = DispatchGuide::create([
                'series' => $data['series'],
                'correlative' => $correlative,
                'code' => $code,
                'issue_date' => $data['issue_date'],
                'recipient_name' => $data['recipient_name'],
                'observations' => $data['observations'] ?? null,
                'origin_ubigeo' => $data['origin_ubigeo'],
                'origin_address' => $data['origin_address'],
                'destination_ubigeo' => $data['destination_ubigeo'],
                'destination_address' => $data['destination_address'],
                'status' => 'processed',
                'user_id' => Auth::id(),
            ]);

            $productMap = Product::with('unit')
                ->whereIn('id', collect($data['products'])->pluck('product_id'))
                ->get()
                ->keyBy('id');

            foreach ($data['products'] as $item) {
                $product = $productMap->get($item['product_id']);
                if (!$product) {
                    continue;
                }

                $guide->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'unit_name' => $product->unit?->abbreviation,
                    'quantity' => $item['quantity'],
                ]);
            }
        });

        return redirect()->route('dispatch-guides.index')->with('success', 'Guía de remisión registrada.');
    }

    public function pdf(DispatchGuide $dispatchGuide)
    {
        $dispatchGuide->load(['user', 'items.product']);

        $pdf = Pdf::loadView('pdf.dispatch-guide', ['guide' => $dispatchGuide])
            ->setPaper('a4');

        $filename = 'guia_remision_' . str_replace('/', '-', $dispatchGuide->code) . '.pdf';
        return $pdf->download($filename);
    }
}
