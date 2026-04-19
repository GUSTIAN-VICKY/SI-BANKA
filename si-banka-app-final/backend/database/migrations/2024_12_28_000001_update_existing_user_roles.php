<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Update existing users to new role hierarchy:
     * - GUSTIAN VICKY HERNANDY -> super_admin_kota
     * - BARU -> admin_kota
     */
    public function up(): void
    {
        // Update GUSTIAN VICKY HERNANDY to super_admin_kota
        DB::table('users')
            ->where('name', 'LIKE', '%GUSTIAN%')
            ->update(['role' => 'super_admin_kota']);
        
        // Update BARU to admin_kota
        DB::table('users')
            ->where('name', 'BARU')
            ->update(['role' => 'admin_kota']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert if needed
        DB::table('users')
            ->where('name', 'LIKE', '%GUSTIAN%')
            ->update(['role' => 'super_admin']);
            
        DB::table('users')
            ->where('name', 'BARU')
            ->update(['role' => 'admin']);
    }
};
