<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A certificate is always tied to a registration (which already links
        // user + event), keeping the design normalized: no duplicated FKs.
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            // Deleting a registration removes its certificate.
            $table->foreignId('registration_id')->constrained()->cascadeOnDelete();
            // Denormalized convenience for "all certificates of a user".
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('certificate_number', 40)->unique();
            $table->string('template', 100)->nullable();
            $table->string('file_path')->nullable();
            $table->string('status', 20)->default('issued')->index();
            $table->timestamp('issued_at')->nullable()->index();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('registration_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
