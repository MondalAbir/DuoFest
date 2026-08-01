<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // `users` is created by the framework migration before `colleges` exists,
        // so the FK constraint must be added once both tables are present.
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('college_id')->references('id')->on('colleges')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['college_id']);
        });
    }
};
