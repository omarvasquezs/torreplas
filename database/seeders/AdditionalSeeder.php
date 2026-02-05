<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\CashRegister;
use App\Models\User;
use App\Models\Client;

class AdditionalSeeder extends Seeder
{
    public function run()
    {
        // Warehouses
        $mainWh = Warehouse::firstOrCreate(['name' => 'Almacén Principal'], [
            'address' => 'Av. Industrial 123',
            'is_active' => true
        ]);

        $secondaryWh = Warehouse::firstOrCreate(['name' => 'Almacén Tienda'], [
            'address' => 'Jr. Comercio 456',
            'is_active' => true
        ]);

        // Stock (Attach if not attached)
        $products = Product::all();
        foreach ($products as $product) {
            if (!$product->warehouses()->where('warehouse_id', $mainWh->id)->exists()) {
                $product->warehouses()->attach($mainWh->id, ['current_stock' => rand(100, 1000)]);
            }
            if (!$product->warehouses()->where('warehouse_id', $secondaryWh->id)->exists()) {
                $product->warehouses()->attach($secondaryWh->id, ['current_stock' => rand(10, 50)]);
            }
        }

        // Cash Register
        $admin = User::where('email', 'admin@torreplas.com')->first();
        if ($admin) {
            CashRegister::firstOrCreate(['name' => 'Caja Principal 01'], [
                'user_id' => $admin->id,
                'is_open' => true,
                'current_balance' => 0,
                'opening_balance' => 0
            ]);
        }

        // Ensure at least one client
        if (Client::count() == 0) {
            Client::create([
                'name' => 'Cliente General',
                'document_type' => 'DNI',
                'document_number' => '00000000',
                'address' => 'Ciudad'
            ]);
        }
    }
}
