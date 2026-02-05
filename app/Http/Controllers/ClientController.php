<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                ->orWhere('document_number', 'like', '%' . $request->search . '%');
        }

        $clients = $query->paginate(10)->withQueryString();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'required|string|max:20',
            'document_number' => 'required|string|max:20|unique:clients',
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'credit_days' => 'nullable|integer|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
        ]);

        Client::create($validated);

        return redirect()->route('clients.index')->with('success', 'Cliente registrado exitosamente.');
    }

    public function edit(Client $client)
    {
        return Inertia::render('Clients/Form', [
            'client' => $client
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document_type' => 'required|string|max:20',
            'document_number' => 'required|string|max:20|unique:clients,document_number,' . $client->id,
            'email' => 'nullable|email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'credit_days' => 'nullable|integer|min:0',
            'credit_limit' => 'nullable|numeric|min:0',
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')->with('success', 'Cliente actualizado exitosamente.');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('clients.index')->with('success', 'Cliente eliminado.');
    }
}
