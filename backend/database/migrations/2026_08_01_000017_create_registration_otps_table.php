<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_otps', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('email', 255);
            $table->string('name', 255);
            $table->string('phone', 32)->nullable();
            $table->json('attendee_details')->nullable();
            $table->string('otp_hash', 255);
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'email']);
            $table->index(['email', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_otps');
    }
};
