<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        return Inertia::render('Inventory/Index', [
            'warehouses' => Warehouse::withCount('products')->get(),
            'products' => Product::with(['warehouses'])->paginate(10)
        ]);
    }
}
