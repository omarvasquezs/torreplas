<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Para facturas: RUC del cliente (obligatorio)
            $table->string('customer_ruc', 11)->nullable()->after('client_id');
            // Para facturas: razón social (obligatorio)
            $table->string('customer_name')->nullable()->after('customer_ruc');
            // Para boletas: DNI del cliente (opcional)
            $table->string('customer_dni', 8)->nullable()->after('customer_name');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['customer_ruc', 'customer_name', 'customer_dni']);
        });
    }
};
