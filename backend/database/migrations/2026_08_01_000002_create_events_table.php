<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('college_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organizer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('venue')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('status', 20)->default('draft')->index();
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedBigInteger('registration_count')->default(0);
            $table->boolean('requires_approval')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('cover_image_url')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['college_id', 'status']);
            $table->index(['starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
