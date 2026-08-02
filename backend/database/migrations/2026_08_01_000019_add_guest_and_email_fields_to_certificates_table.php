<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            // Guest attendees have no linked account.
            $table->foreignId('user_id')->nullable()->change();
            $table->timestamp('emailed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn('emailed_at');

            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
