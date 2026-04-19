<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Transaction;
use Carbon\Carbon;

/**
 * BalanceService
 * 
 * Mengelola semua operasi terkait saldo (balance) nasabah.
 * Digunakan oleh TransactionController dan Artisan Commands.
 */
class BalanceService
{
    /**
     * Tambah saldo nasabah setelah transaksi baru.
     *
     * @param Customer $customer
     * @param float    $amount
     * @param string   $date     Tanggal transaksi (untuk update last_deposit)
     */
    public function addBalance(Customer $customer, float $amount, string $date): void
    {
        $customer->balance += $amount;
        $customer->last_deposit = Carbon::parse($date);
        $customer->save();
    }

    /**
     * Kurangi (revert) saldo nasabah saat transaksi diupdate/dihapus.
     *
     * @param Customer $customer
     * @param float    $amount
     */
    public function revertBalance(Customer $customer, float $amount): void
    {
        $customer->balance -= $amount;
        $customer->save();
    }

    /**
     * Sinkronisasi ulang SEMUA saldo nasabah dari data transaksi.
     * Reset semua saldo ke 0, lalu hitung ulang dari seluruh transaksi.
     *
     * @return array  Map of customerId => totalBalance
     */
    public function syncAllBalances(): array
    {
        // 1. Reset semua saldo ke 0
        Customer::query()->update(['balance' => 0]);

        // 2. Hitung ulang dari semua transaksi
        $transactions = Transaction::all();
        $balances = [];

        foreach ($transactions as $transaction) {
            $customerId = $transaction->customerId;
            if (!isset($balances[$customerId])) {
                $balances[$customerId] = 0;
            }
            $balances[$customerId] += $transaction->total;
        }

        // 3. Update customers
        foreach ($balances as $customerId => $total) {
            $customer = Customer::find($customerId);
            if ($customer) {
                $customer->balance = $total;
                $customer->save();
            }
        }

        return $balances;
    }
}
