<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\Carrier;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $deliveries = Delivery::with(['order.client', 'carrier', 'user'])
            ->when($request->search, fn($q, $s) =>
                $q->where('code', 'like', "%$s%")
                  ->orWhere('destination_address', 'like', "%$s%")
                  ->orWhereHas('order.client', fn($c) => $c->where('name', 'like', "%$s%"))
            )
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('scheduled_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Logistics/Index', [
            'deliveries' => $deliveries,
            'filters'    => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Logistics/Form', [
            'orders'   => Order::with('client')
                ->whereIn('status', ['approved'])
                ->get(),
            'carriers' => Carrier::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'                 => 'required|string|max:30|unique:deliveries',
            'order_id'             => 'nullable|exists:orders,id',
            'carrier_id'           => 'nullable|exists:carriers,id',
            'scheduled_date'       => 'required|date',
            'destination_address'  => 'required|string|max:300',
            'notes'                => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();
        $data['status']  = 'pending';

        Delivery::create($data);

        return redirect()->route('deliveries.index')->with('success', 'Despacho programado.');
    }

    public function show(Delivery $delivery)
    {
        $delivery->load(['order.items.product', 'carrier', 'user']);

        return Inertia::render('Logistics/Show', ['delivery' => $delivery]);
    }

    public function update(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'status'       => 'required|in:pending,in_transit,delivered,failed',
            'carrier_id'   => 'nullable|exists:carriers,id',
            'delivered_at' => 'nullable|date',
            'notes'        => 'nullable|string',
        ]);

        if ($data['status'] === 'delivered' && empty($data['delivered_at'])) {
            $data['delivered_at'] = now();
        }

        $delivery->update($data);

        return back()->with('success', 'Despacho actualizado.');
    }

    public function destroy(Delivery $delivery)
    {
        $delivery->delete();
        return redirect()->route('deliveries.index')->with('success', 'Despacho eliminado.');
    }

    // Carriers CRUD
    public function carriers()
    {
        $carriers = Carrier::orderBy('name')->paginate(15);
        return Inertia::render('Logistics/Carriers', ['carriers' => $carriers]);
    }

    public function storeCarrier(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|max:150',
            'document_number' => 'nullable|string|max:20',
            'license_plate'   => 'nullable|string|max:20',
            'phone'           => 'nullable|string|max:30',
        ]);

        Carrier::create($data);

        return back()->with('success', 'Transportista registrado.');
    }
}
