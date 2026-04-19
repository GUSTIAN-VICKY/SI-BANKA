<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('customers')->insert([
            ['id' => 'NSB-0014', 'name' => 'Ahmad Dahlan', 'rt' => '05', 'rw' => '06', 'balance' => 210000.00, 'last_deposit' => '2025-11-10', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0016', 'name' => 'Joko Susilo', 'rt' => '03', 'rw' => '06', 'balance' => 150000.00, 'last_deposit' => '2025-11-11', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0012', 'name' => 'Budi Santoso', 'rt' => '04', 'rw' => '06', 'balance' => 120000.00, 'last_deposit' => '2025-11-09', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0013', 'name' => 'Siti Aminah', 'rt' => '02', 'rw' => '06', 'balance' => 85000.00, 'last_deposit' => '2025-11-10', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0017', 'name' => 'Dewi Lestari', 'rt' => '01', 'rw' => '06', 'balance' => 75000.00, 'last_deposit' => '2025-11-11', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0018', 'name' => 'Eko Prasetyo', 'rt' => '05', 'rw' => '06', 'balance' => 62000.00, 'last_deposit' => '2025-11-09', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0015', 'name' => 'Rina Wati', 'rt' => '01', 'rw' => '06', 'balance' => 45000.00, 'last_deposit' => '2025-11-08', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0019', 'name' => 'Surya Saputra', 'rt' => '02', 'rw' => '06', 'balance' => 30000.00, 'last_deposit' => '2025-11-07', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0020', 'name' => 'Indah Permata', 'rt' => '03', 'rw' => '06', 'balance' => 15000.00, 'last_deposit' => '2025-11-10', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0021', 'name' => 'Fajar Nugroho', 'rt' => '04', 'rw' => '06', 'balance' => 95000.00, 'last_deposit' => '2025-11-05', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0022', 'name' => 'Lia Karmila', 'rt' => '05', 'rw' => '06', 'balance' => 112000.00, 'last_deposit' => '2025-11-06', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'NSB-0023', 'name' => 'Agus Setiawan', 'rt' => '01', 'rw' => '06', 'balance' => 5000.00, 'last_deposit' => '2025-09-15', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
