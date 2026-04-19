<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WasteTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('waste_types')->insert([
            ['id' => 'kardus', 'name' => 'Kardus', 'icon' => '📦', 'stok' => 250.00, 'price' => 1500.00, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'botol', 'name' => 'Botol Plastik', 'icon' => '🍾', 'stok' => 420.00, 'price' => 2000.00, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'kaleng', 'name' => 'Kaleng Logam', 'icon' => '🥫', 'stok' => 150.00, 'price' => 3000.00, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'kertas', 'name' => 'Kertas HVS', 'icon' => '📄', 'stok' => 300.00, 'price' => 1000.00, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'minyak', 'name' => 'Minyak Jelantah', 'icon' => '🛢️', 'stok' => 50.00, 'price' => 5000.00, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'besi', 'name' => 'Besi Bekas', 'icon' => '🔩', 'stok' => 120.00, 'price' => 4000.00, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
