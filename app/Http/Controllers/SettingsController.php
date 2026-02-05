<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/Index', [
            // Mock settings for now or pull from DB if Config model existed
            'company' => [
                'name' => 'TORREPLAS SAC',
                'ruc' => '20123456789',
                'address' => 'Av. Industrial 123',
                'phone' => '01-234-5678',
                'email' => 'contacto@torreplas.com'
            ],
            'system' => [
                'tax_rate' => 18,
                'currency' => 'PEN',
                'timezone' => 'America/Lima'
            ]
        ]);
    }

    public function update(Request $request)
    {
        // Placeholder for saving settings
        return redirect()->back()->with('success', 'Configuración actualizada (Simulado).');
    }
}
