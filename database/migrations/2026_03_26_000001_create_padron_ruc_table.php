<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('padron_ruc', function (Blueprint $table) {
            $table->string('ruc', 11)->primary();
            $table->string('nombre', 200)->index();
            $table->string('estado', 30)->nullable();    // ACTIVO, BAJA DEFINITIVA, etc.
            $table->string('condicion', 30)->nullable(); // HABIDO, NO HABIDO, etc.
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('padron_ruc');
    }
};
