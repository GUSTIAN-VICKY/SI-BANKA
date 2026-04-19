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
        Schema::table('waste_types', function (Blueprint $table) {
            // Add bank_sampah_id column (NULL = harga default kota)
            $table->uuid('bank_sampah_id')->nullable()->after('id');
            
            // Foreign key constraint
            $table->foreign('bank_sampah_id')
                  ->references('id')
                  ->on('bank_sampah')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('waste_types', function (Blueprint $table) {
            $table->dropForeign(['bank_sampah_id']);
            $table->dropColumn('bank_sampah_id');
        });
    }
};
