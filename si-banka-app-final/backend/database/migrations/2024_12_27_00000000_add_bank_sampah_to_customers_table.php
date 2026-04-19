<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add bank_sampah_id column only if it doesn't exist
        if (!Schema::hasColumn('customers', 'bank_sampah_id')) {
            Schema::table('customers', function (Blueprint $table) {
                $table->uuid('bank_sampah_id')->nullable()->after('id');
                
                // Foreign key constraint
                $table->foreign('bank_sampah_id')
                      ->references('id')
                      ->on('bank_sampah')
                      ->onDelete('set null');
            });
        }

        // Note: We keep rt and rw columns for display purposes
        // but they will be auto-filled from bank_sampah when adding customers
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropForeign(['bank_sampah_id']);
            $table->dropColumn('bank_sampah_id');
        });
    }
};
