<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Registration settings
            $table->boolean('registration_enabled')->default(true)->after('requires_approval');
            $table->timestamp('registration_open_at')->nullable()->after('registration_enabled');
            $table->timestamp('registration_closes_at')->nullable()->after('registration_open_at');
            // Archive support: remember the status an event had before archiving
            // so un-archiving can restore it.
            $table->string('archived_from', 20)->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['registration_enabled', 'registration_open_at', 'registration_closes_at', 'archived_from']);
        });
    }
};
