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
            if (!Schema::hasColumn('update_log', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('admin');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            }
            if (Schema::hasColumn('update_log', 'date')) {
                 $table->dropColumn('date');
            }
            // Re-adding outside the if to ensure it exists, but dropColumn above ensures no collision
            $table->datetime('date')->nullable()->after('id'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('update_log', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->date('date')->change(); // Revert to date
        });
    }
};
