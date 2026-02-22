<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('description');          // Objeto/local alquilado
            $table->string('address')->nullable();  // Dirección del bien
            $table->decimal('monthly_fee', 12, 2);  // Canon mensual
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->integer('payment_day')->default(1); // Día del mes de vencimiento
            $table->enum('status', ['active', 'suspended', 'ended'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('rental_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_id')->constrained()->cascadeOnDelete();
            $table->string('period', 7);             // YYYY-MM
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'paid', 'overdue'])->default('pending');
            $table->string('payment_method')->nullable(); // efectivo, transferencia, etc.
            $table->string('reference')->nullable();      // nro. operación
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rental_payments');
        Schema::dropIfExists('rentals');
    }
};
