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
        DB::table('document_series')->where('type', 'invoice')->update(['type' => 'factura']);
        DB::table('document_series')->where('type', 'receipt')->update(['type' => 'boleta']);
        DB::table('document_series')->where('type', 'credit_note')->update(['type' => 'nota_credito']);
        DB::table('document_series')->where('type', 'debit_note')->update(['type' => 'nota_debito']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('document_series')->where('type', 'factura')->update(['type' => 'invoice']);
        DB::table('document_series')->where('type', 'boleta')->update(['type' => 'receipt']);
        DB::table('document_series')->where('type', 'nota_credito')->update(['type' => 'credit_note']);
        DB::table('document_series')->where('type', 'nota_debito')->update(['type' => 'debit_note']);
    }
};
