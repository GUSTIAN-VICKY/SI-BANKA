<?php

namespace App\Console\Commands;

use App\Services\BalanceService;
use Illuminate\Console\Command;

/**
 * Artisan Command: Sinkronisasi ulang saldo nasabah dari data transaksi.
 * 
 * Menggantikan inline route /sync-balances.
 * 
 * Usage: php artisan sync:balances
 */
class SyncBalances extends Command
{
    protected $signature = 'sync:balances';
    protected $description = 'Sinkronisasi ulang saldo nasabah dari semua data transaksi';

    public function handle(BalanceService $balanceService): int
    {
        $this->info('Memulai sinkronisasi saldo...');

        $balances = $balanceService->syncAllBalances();

        $this->info('Saldo berhasil disinkronisasi!');
        $this->table(
            ['Customer ID', 'Total Balance'],
            collect($balances)->map(fn($total, $id) => [$id, number_format($total, 0, ',', '.')])->toArray()
        );

        return Command::SUCCESS;
    }
}
