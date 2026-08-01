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
            $table->uuid('uuid')->unique();
            // Belongs to a college; deleting the college removes its events.
            $table->foreignId('college_id')->constrained()->cascadeOnDelete();
            // Created/managed by a user; keep the event if the user is removed.
            $table->foreignId('organizer_id')->nullable()->constrained('users')->nullOnDelete();
            // Optional classification; keep the event if the category is removed.
            $table->foreignId('event_category_id')->nullable()->constrained('event_categories')->nullOnDelete();
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
            $table->index('event_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
