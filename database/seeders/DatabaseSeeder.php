<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        $adminRole = Role::create(['name' => 'admin', 'label' => 'Administrador']);
        $sellerRole = Role::create(['name' => 'seller', 'label' => 'Vendedor']);

        // Admin User
        User::factory()->create([
            'name' => 'Administrador',
            'email' => 'admin@torreplas.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
        ]);

        // Base Logistics Data
        $cat1 = Category::create(['name' => 'Botellas PET', 'slug' => 'botellas-pet']);
        $cat2 = Category::create(['name' => 'Preformas', 'slug' => 'preformas']);

        Brand::create(['name' => 'Torreplas', 'slug' => 'torreplas']);
        Brand::create(['name' => 'Genérica', 'slug' => 'generica']);

        Unit::create(['name' => 'Unidad', 'abbreviation' => 'UND']);
        Unit::create(['name' => 'Millar', 'abbreviation' => 'MLL']);
        Unit::create(['name' => 'Paquete', 'abbreviation' => 'PAQ']);
    }
}
