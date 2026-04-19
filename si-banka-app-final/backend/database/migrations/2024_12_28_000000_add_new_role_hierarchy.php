<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Migrate legacy roles to new 5-role hierarchy:
     * - 'super_admin' -> keep as-is (mapped to super_admin_kota in code)
     * - 'admin' -> keep as-is (mapped to admin_rt in code)
     * 
     * New roles available:
     * - super_admin_kota
     * - admin_kota
     * - super_admin_rt
     * - admin_rt
     * - nasabah
     */
    public function up(): void
    {
        // Optional: Rename 'super_admin' to 'super_admin_kota' for cleanliness
        // Uncomment if you want to migrate existing data
        // DB::table('users')->where('role', 'super_admin')->update(['role' => 'super_admin_kota']);
        
        // Optional: Rename 'admin' to 'admin_rt' for cleanliness
        // Uncomment if you want to migrate existing data
        // DB::table('users')->where('role', 'admin')->update(['role' => 'admin_rt']);
        
        // Note: The code already handles both legacy and new role names via:
        // - isAdminKota() checks for 'admin_kota'
        // - isAdminRT() checks for both 'admin_rt' AND 'admin'
        // - isSuperAdminKota() checks for both 'super_admin_kota' AND 'super_admin'
        // 
        // So migration is optional and can be done when convenient.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert if needed
        // DB::table('users')->where('role', 'super_admin_kota')->update(['role' => 'super_admin']);
        // DB::table('users')->where('role', 'admin_rt')->update(['role' => 'admin']);
    }
};
