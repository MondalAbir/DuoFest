<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40)->index();
            $table->string('description')->nullable();
            $table->morphs('subject');
            $table->foreignId('causer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('causer_type', 40)->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['causer_id', 'type']);
            $table->index(['subject_type', 'subject_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
