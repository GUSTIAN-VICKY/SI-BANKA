<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('update_log')->insert([
            ['id' => 'LOG-001', 'date' => '2025-11-10', 'itemId' => 'kaleng', 'itemName' => 'Kaleng Logam', 'changeType' => 'Harga', 'oldValue' => 2800.00, 'newValue' => 3000.00, 'admin' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'LOG-002', 'date' => '2025-11-09', 'itemId' => 'botol', 'itemName' => 'Botol Plastik', 'changeType' => 'Stok', 'oldValue' => 400.00, 'newValue' => 420.00, 'admin' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'LOG-003', 'date' => '2025-11-05', 'itemId' => 'kardus', 'itemName' => 'Kardus', 'changeType' => 'Harga', 'oldValue' => 1300.00, 'newValue' => 1500.00, 'admin' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'LOG-004', 'date' => '2025-11-01', 'itemId' => 'besi', 'itemName' => 'Besi Bekas', 'changeType' => 'Stok', 'oldValue' => 100.00, 'newValue' => 120.00, 'admin' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'LOG-005', 'date' => '2025-10-01', 'itemId' => 'kaleng', 'itemName' => 'Kaleng Logam', 'changeType' => 'Harga', 'oldValue' => 2500.00, 'newValue' => 2800.00, 'admin' => 'Admin', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
