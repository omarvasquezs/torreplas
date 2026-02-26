<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rental_payments', function (Blueprint $table) {
            $table->string('receipt_number', 20)->nullable()->unique()->after('reference');
        });
    }

    public function down(): void
    {
        Schema::table('rental_payments', function (Blueprint $table) {
            $table->dropUnique(['receipt_number']);
            $table->dropColumn('receipt_number');
        });
    }
};
