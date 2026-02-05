<?php

namespace App\Http\Controllers;

use App\Models\CashRegister;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        return Inertia::render('Finance/Index', [
            'registers' => CashRegister::with('user')->get()
        ]);
    }
}
