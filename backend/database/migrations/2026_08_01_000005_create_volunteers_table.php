<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A user volunteers for an event. Replaces the previous
        // volunteer_slots + volunteer_slot_user pair with one normalized row.
        Schema::create('volunteers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            // Belongs to an event; deleting the event removes its volunteers.
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            // The person volunteering.
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Who recruited/assigned this volunteer.
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('role', 100)->nullable();
            $table->timestamp('shift_start_at')->nullable();
            $table->timestamp('shift_end_at')->nullable();
            $table->decimal('hours_volunteered', 5, 2)->default(0.00);
            $table->string('status', 20)->default('assigned')->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            // A user can only volunteer for a given event once.
            $table->unique(['event_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['event_id', 'status']);
            $table->index(['shift_start_at', 'shift_end_at']);
            $table->index('assigned_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteers');
    }
};
