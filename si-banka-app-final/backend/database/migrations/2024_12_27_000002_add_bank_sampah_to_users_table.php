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
        Schema::table('users', function (Blueprint $table) {
            // Add bank_sampah_id column (NULL for Super Admin Kota)
            if (!Schema::hasColumn('users', 'bank_sampah_id')) {
                $table->uuid('bank_sampah_id')->nullable()->after('customer_id');
            }
            
            // Add email verification columns (might already exist from default Laravel)
            if (!Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('email');
            }
        });

        // Add foreign key separately to avoid issues
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'bank_sampah_id')) {
                try {
                    $table->foreign('bank_sampah_id')
                          ->references('id')
                          ->on('bank_sampah')
                          ->onDelete('set null');
                } catch (\Exception $e) {
                    // Foreign key might already exist
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'bank_sampah_id')) {
                try {
                    $table->dropForeign(['bank_sampah_id']);
                } catch (\Exception $e) {}
                $table->dropColumn('bank_sampah_id');
            }
        });
    }
};

