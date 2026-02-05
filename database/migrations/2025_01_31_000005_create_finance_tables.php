<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Caja Principal');
            $table->foreignId('user_id')->nullable()->constrained(); // Current assigned user

            $table->boolean('is_open')->default(false);
            $table->dateTime('opened_at')->nullable();
            $table->dateTime('closed_at')->nullable();

            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('current_balance', 12, 2)->default(0);

            $table->timestamps();
        });

        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();

            $table->enum('type', ['IN', 'OUT']);
            $table->decimal('amount', 12, 2);
            $table->string('description');

            $table->nullableMorphs('reference'); // Sale Payment, Expense, etc.

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
        Schema::dropIfExists('cash_registers');
    }
};
