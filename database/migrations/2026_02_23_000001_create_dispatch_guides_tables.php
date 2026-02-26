<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispatch_guides', function (Blueprint $table) {
            $table->id();
            $table->string('series', 10)->default('T001');
            $table->unsignedInteger('correlative')->default(1);
            $table->string('code', 30)->unique();

            $table->date('issue_date');
            $table->string('recipient_name', 180);
            $table->text('observations')->nullable();

            $table->string('origin_ubigeo', 12);
            $table->string('origin_address', 255);
            $table->string('destination_ubigeo', 12);
            $table->string('destination_address', 255);

            $table->enum('status', ['draft', 'processed'])->default('processed');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->index(['series', 'correlative']);
        });

        Schema::create('dispatch_guide_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispatch_guide_id')->constrained('dispatch_guides')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('product_name', 180);
            $table->string('unit_name', 30)->nullable();
            $table->decimal('quantity', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispatch_guide_items');
        Schema::dropIfExists('dispatch_guides');
    }
};
