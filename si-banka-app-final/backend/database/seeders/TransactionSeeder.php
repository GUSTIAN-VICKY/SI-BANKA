<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('transactions')->insert([
            ['id' => 'TRX-001', 'customerId' => 'NSB-0014', 'date' => '2025-11-08', 'total' => 15000, 'items' => json_encode([['name' => 'Kardus', 'qty' => 10]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-002', 'customerId' => 'NSB-0012', 'date' => '2025-11-09', 'total' => 20000, 'items' => json_encode([['name' => 'Botol', 'qty' => 10]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-003', 'customerId' => 'NSB-0013', 'date' => '2025-11-10', 'total' => 8000, 'items' => json_encode([['name' => 'Kertas', 'qty' => 8]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-004', 'customerId' => 'NSB-0014', 'date' => '2025-11-10', 'total' => 25000, 'items' => json_encode([['name' => 'Minyak', 'qty' => 5]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-005', 'customerId' => 'NSB-0016', 'date' => '2025-11-11', 'total' => 30000, 'items' => json_encode([['name' => 'Kaleng', 'qty' => 10]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-006', 'customerId' => 'NSB-0017', 'date' => '2025-11-11', 'total' => 12000, 'items' => json_encode([['name' => 'Botol Plastik', 'qty' => 6]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-007', 'customerId' => 'NSB-0014', 'date' => '2025-11-11', 'total' => 30000, 'items' => json_encode([['name' => 'Kardus', 'qty' => 20]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-008', 'customerId' => 'NSB-0018', 'date' => '2025-11-09', 'total' => 40000, 'items' => json_encode([['name' => 'Besi Bekas', 'qty' => 10]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-009', 'customerId' => 'NSB-0015', 'date' => '2025-11-08', 'total' => 15000, 'items' => json_encode([['name' => 'Kardus', 'qty' => 10]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-010', 'customerId' => 'NSB-0013', 'date' => '2025-11-07', 'total' => 22000, 'items' => json_encode([['name' => 'Kertas', 'qty' => 10], ['name' => 'Botol Plastik', 'qty' => 6]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-011', 'customerId' => 'NSB-0020', 'date' => '2025-11-10', 'total' => 15000, 'items' => json_encode([['name' => 'Kertas', 'qty' => 15]]), 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'TRX-012', 'customerId' => 'NSB-0019', 'date' => '2025-11-07', 'total' => 30000, 'items' => json_encode([['name' => 'Kaleng', 'qty' => 10]]), 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
