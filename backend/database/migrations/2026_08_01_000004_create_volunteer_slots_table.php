<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('volunteer_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->unsignedInteger('capacity')->default(1);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('volunteer_slot_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('volunteer_slot_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('status', 20)->default('assigned');
            $table->timestamps();

            $table->unique(['volunteer_slot_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('volunteer_slot_user');
        Schema::dropIfExists('volunteer_slots');
    }
};
