<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            // Guest registrations do not require an account.
            $table->foreignId('user_id')->nullable()->change();

            $table->string('name', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 32)->nullable();

            // Ticket artifacts (encrypted QR payload, generated files).
            $table->text('ticket_payload')->nullable();
            $table->string('ticket_qr_path', 500)->nullable();
            $table->string('ticket_pdf_path', 500)->nullable();
            $table->timestamp('ticket_issued_at')->nullable();

            $table->unique(['event_id', 'email']);
            $table->index(['email', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table) {
            $table->dropUnique(['event_id', 'email']);
            $table->dropIndex(['email', 'status']);

            $table->dropColumn(['name', 'email', 'phone', 'ticket_payload', 'ticket_qr_path', 'ticket_pdf_path', 'ticket_issued_at']);

            $table->foreignId('user_id')->nullable(false)->change();
        });
    }
};
