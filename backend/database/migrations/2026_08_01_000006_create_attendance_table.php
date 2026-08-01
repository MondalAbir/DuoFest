<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Physical presence records: who attended an event (or a specific
        // registration) and when they walked in.
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Optional link to the registration the ticket was issued against.
            $table->foreignId('registration_id')->nullable()->constrained()->nullOnDelete();
            // Staff member who marked the person present.
            $table->foreignId('checked_in_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('attended_at')->nullable()->index();
            $table->string('status', 20)->default('present')->index();
            $table->timestamps();

            // One attendance row per user per event.
            $table->unique(['event_id', 'user_id']);
            $table->index('registration_id');
            $table->index(['event_id', 'attended_at']);
            $table->index('checked_in_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
