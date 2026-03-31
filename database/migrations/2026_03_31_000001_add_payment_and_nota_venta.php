<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add payment fields to invoices
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('payment_method')->default('efectivo')->after('status');
            $table->string('payment_bank')->nullable()->after('payment_method');
        });

        // Add Nota de Venta series (NV001)
        DB::table('document_series')->insertOrIgnore([
            ['type' => 'nota_venta', 'series' => 'NV001', 'next_number' => 1, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_bank']);
        });
    }
};
