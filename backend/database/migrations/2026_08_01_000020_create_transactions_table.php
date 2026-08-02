<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            // Payment is tied to a registration; deleting it removes the payment.
            $table->foreignId('registration_id')->constrained()->cascadeOnDelete();
            // Denormalized convenience for per-event reporting.
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            // Guest registrations have no linked account.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('payment_method', 50)->nullable();
            $table->string('reference', 191)->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamps();

            $table->index(['event_id', 'status']);
            $table->index(['registration_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
