<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            // Guest tickets have no linked account.
            $table->foreignId('user_id')->nullable()->change();

            // A ticket can only be scanned once per event.
            $table->unique(['event_id', 'registration_id']);
        });
    }

    public function down(): void
    {
        Schema::table('attendance', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'registration_id']);

            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
