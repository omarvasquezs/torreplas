<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Parámetros generales del sistema (key-value)
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general'); // general, billing, finance
            $table->timestamps();
        });

        // Auditoría de acciones
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');          // created, updated, deleted, login
            $table->string('model')->nullable();
            $table->unsignedBigInteger('model_id')->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        // Documentos laborales de empleados
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type'); // contract, dni, certificate, other
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->timestamps();
        });

        // Conciliación bancaria: mark transactions as reconciled
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->boolean('reconciled')->default(false)->after('type');
            $table->date('reconciled_at')->nullable()->after('reconciled');
        });

        // Series de comprobantes
        Schema::create('document_series', function (Blueprint $table) {
            $table->id();
            $table->string('type');         // factura, boleta, nota_credito, etc.
            $table->string('series', 10);   // F001, B001, NC001
            $table->unsignedInteger('next_number')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_series');
        Schema::table('bank_transactions', function (Blueprint $table) {
            $table->dropColumn(['reconciled', 'reconciled_at']);
        });
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('settings');
    }
};
