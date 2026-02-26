<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Product;
use Inertia\Inertia;

class QuotationController extends Controller
{
    public function index()
    {
        return Inertia::render('Quotations/Index', [
            'clients' => Client::orderBy('name')->get(['id', 'name', 'document_type', 'document_number']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'code', 'price']),
        ]);
    }
}
