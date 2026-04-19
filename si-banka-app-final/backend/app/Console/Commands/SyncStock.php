<?php

namespace App\Console\Commands;

use App\Services\StockService;
use Illuminate\Console\Command;

/**
 * Artisan Command: Sinkronisasi ulang stok dari data transaksi.
 * 
 * Menggantikan inline route /sync-stock dan file recalculate_stock.php.
 * 
 * Usage: php artisan sync:stock
 */
class SyncStock extends Command
{
    protected $signature = 'sync:stock';
    protected $description = 'Sinkronisasi ulang stok waste type dari semua data transaksi';

    public function handle(StockService $stockService): int
    {
        $this->info('Memulai sinkronisasi stok...');

        $stockCounts = $stockService->syncAllStock();

        $this->info('Stok berhasil disinkronisasi!');
        $this->table(
            ['Waste Type ID', 'Total Qty'],
            collect($stockCounts)->map(fn($qty, $id) => [$id, $qty])->toArray()
        );

        return Command::SUCCESS;
    }
}
