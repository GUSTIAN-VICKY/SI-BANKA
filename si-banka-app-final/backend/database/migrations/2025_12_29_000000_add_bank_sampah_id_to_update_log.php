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
        Schema::table('update_log', function (Blueprint $table) {
            if (!Schema::hasColumn('update_log', 'bank_sampah_id')) {
                $table->uuid('bank_sampah_id')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('update_log', function (Blueprint $table) {
            if (Schema::hasColumn('update_log', 'bank_sampah_id')) {
                $table->dropColumn('bank_sampah_id');
            }
        });
    }
};
