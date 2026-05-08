<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\DocumentSeries;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SettingsController extends Controller
{
    private array $defaults = [
        'company_name'    => 'TORREPLAS SAC',
        'company_ruc'     => '20123456789',
        'company_address' => 'Av. Industrial 123',
        'company_phone'   => '01-234-5678',
        'company_email'   => 'contacto@torreplas.com',
        'tax_rate'        => '18',
        'currency'        => 'PEN',
        'currency_symbol' => 'S/',
        'timezone'        => 'America/Lima',
        'invoice_note'    => '',
    ];

    public function index()
    {
        $stored  = Setting::all_flat();
        $settings = array_merge($this->defaults, $stored);

        $series = DB::table('document_series')->orderBy('type')->get();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'series'   => $series,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'company_name'    => 'required|string|max:200',
            'company_ruc'     => 'required|string|max:20',
            'company_address' => 'nullable|string|max:300',
            'company_phone'   => 'nullable|string|max:50',
            'company_email'   => 'nullable|email',
            'tax_rate'        => 'required|numeric|min:0|max:100',
            'currency'        => 'required|string|max:10',
            'currency_symbol' => 'required|string|max:5',
            'timezone'        => 'required|string',
            'invoice_note'    => 'nullable|string|max:500',
        ]);

        $group_map = [
            'company_name'    => 'general',
            'company_ruc'     => 'general',
            'company_address' => 'general',
            'company_phone'   => 'general',
            'company_email'   => 'general',
            'tax_rate'        => 'finance',
            'currency'        => 'finance',
            'currency_symbol' => 'finance',
            'timezone'        => 'general',
            'invoice_note'    => 'billing',
        ];

        foreach ($data as $key => $value) {
            Setting::set($key, $value, $group_map[$key] ?? 'general');
        }

        return redirect()->back()->with('success', 'Configuración guardada correctamente.');
    }

    public function storeSeries(Request $request)
    {
        $data = $request->validate([
            'type'   => 'required|string|max:50',
            'series' => 'required|string|max:5',
        ]);
        DB::table('document_series')->insert([
            'type'        => $data['type'],
            'series'      => strtoupper($data['series']),
            'next_number' => 1,
            'is_active'   => true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
        return redirect()->back()->with('success', 'Serie creada.');
    }

    public function destroySeries(int $id)
    {
        DB::table('document_series')->where('id', $id)->delete();
        return redirect()->back()->with('success', 'Serie eliminada.');
    }
}
