<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained();
            $table->foreignId('user_id')->constrained(); // Salesperson
            $table->string('code')->unique(); // Order #

            $table->date('date_issue');
            $table->date('date_due')->nullable();

            $table->string('status')->default('pending'); // pending, approved, delivered, cancelled
            $table->string('payment_status')->default('unpaid'); // unpaid, partial, paid

            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax', 12, 2); // IGV
            $table->decimal('total', 12, 2);

            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained();

            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 12, 2);

            $table->timestamps();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('client_id')->constrained();

            $table->string('type'); // FACTURA, BOLETA
            $table->string('serie'); // F001, B001
            $table->string('number'); // 000001
            $table->unique(['type', 'serie', 'number']);

            $table->date('issue_date');
            $table->decimal('total_amount', 12, 2);
            $table->string('status')->default('generated'); // generated, sent_sunat, accepted, rejected

            $table->string('xml_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->string('cdr_path')->nullable();

            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('payable'); // Order, Invoice
            $table->decimal('amount', 12, 2);
            $table->string('method'); // CASH, TRANSFER, YAPE, PLIN
            $table->string('reference')->nullable(); // Helper for transaction ID
            $table->date('payment_date');

            $table->foreignId('user_id')->constrained(); // Who recorded it
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
