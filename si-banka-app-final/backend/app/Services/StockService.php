<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\WasteType;

/**
 * StockService
 * 
 * Mengelola semua operasi terkait stok jenis sampah (WasteType).
 * Digunakan oleh TransactionController, CustomerController, dan Artisan Commands.
 */
class StockService
{
    /**
     * Tambah stok waste type berdasarkan items transaksi.
     * Dipanggil saat transaksi baru dibuat.
     *
     * @param array $items  Array of items [{id, qty, ...}]
     */
    public function addStock(array $items): void
    {
        foreach ($items as $item) {
            if (isset($item['id']) && isset($item['qty'])) {
                $wasteType = WasteType::find($item['id']);
                if ($wasteType) {
                    $wasteType->stok += floatval($item['qty']);
                    $wasteType->save();
                }
            }
        }
    }

    /**
     * Kurangi (revert) stok waste type berdasarkan items transaksi.
     * Dipanggil saat transaksi diupdate atau dihapus.
     *
     * @param array|string $items  Array or JSON string of items [{id, qty, ...}]
     */
    public function revertStock(array|string $items): void
    {
        $parsedItems = is_string($items) ? json_decode($items, true) : $items;

        if (!is_array($parsedItems)) {
            return;
        }

        foreach ($parsedItems as $item) {
            if (isset($item['id']) && isset($item['qty'])) {
                $wasteType = WasteType::find($item['id']);
                if ($wasteType) {
                    $wasteType->stok -= floatval($item['qty']);
                    if ($wasteType->stok < 0) {
                        $wasteType->stok = 0;
                    }
                    $wasteType->save();
                }
            }
        }
    }

    /**
     * Sinkronisasi ulang SEMUA stok dari data transaksi.
     * Reset semua stok ke 0, lalu hitung ulang dari seluruh transaksi.
     *
     * @return array  Map of wasteTypeId => totalQty
     */
    public function syncAllStock(): array
    {
        // 1. Reset semua stok ke 0
        WasteType::query()->update(['stok' => 0]);

        // 2. Hitung ulang dari semua transaksi
        $transactions = Transaction::all();
        $stockCounts = [];

        foreach ($transactions as $transaction) {
            $items = is_string($transaction->items)
                ? json_decode($transaction->items, true)
                : $transaction->items;

            if (is_array($items)) {
                foreach ($items as $item) {
                    if (isset($item['id']) && isset($item['qty'])) {
                        $id = $item['id'];
                        if (!isset($stockCounts[$id])) {
                            $stockCounts[$id] = 0;
                        }
                        $stockCounts[$id] += floatval($item['qty']);
                    }
                }
            }
        }

        // 3. Update waste types
        foreach ($stockCounts as $id => $totalQty) {
            $wasteType = WasteType::find($id);
            if ($wasteType) {
                $wasteType->stok = $totalQty;
                $wasteType->save();
            }
        }

        return $stockCounts;
    }
}
