<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Fix invoices table
        DB::table('invoices')->where('type', 'boleta')->where('serie', 'F001')->update(['serie' => 'B001']);
        DB::table('invoices')->where('type', 'nota_credito')->where('serie', 'F001')->update(['serie' => 'FC01']);
        DB::table('invoices')->where('type', 'nota_venta')->where('serie', 'NV00')->update(['serie' => 'NV01']);

        // 2. Fix document_series table for next records
        DB::table('document_series')->where('type', 'boleta')->where('series', 'F001')->update(['series' => 'B001']);
        DB::table('document_series')->where('type', 'nota_credito')->where('series', 'F001')->update(['series' => 'FC01']);
        DB::table('document_series')->where('type', 'nota_venta')->where('series', 'NV00')->update(['series' => 'NV01']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Not reversing to incorrect state to prevent data loss
    }
};
