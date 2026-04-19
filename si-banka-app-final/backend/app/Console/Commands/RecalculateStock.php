<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Transaction;
use App\Models\WasteType;

class RecalculateStock extends Command
{
    protected $signature = 'stock:recalculate';
    protected $description = 'Recalculate stock from transaction history';

    public function handle()
    {
        // Reset all stock to 0
        WasteType::query()->update(['stok' => 0]);
        $this->info('All stock reset to 0');

        // Get all transactions
        $transactions = Transaction::all();
        $this->info('Processing ' . $transactions->count() . ' transactions...');

        foreach ($transactions as $trx) {
            $items = $trx->items;
            
            // Debug: show items structure
            $this->info('Transaction ID: ' . $trx->id);
            $this->info('Items: ' . json_encode($items));
            
            if ($items && is_array($items)) {
                foreach ($items as $item) {
                    $this->info('Item: ' . json_encode($item));
                    // Use 'id' field - items have id, name, qty, price structure
                    $wasteTypeId = $item['id'] ?? $item['wasteTypeId'] ?? null;
                    $qty = floatval($item['qty'] ?? 0);
                    
                    if ($wasteTypeId && $qty > 0) {
                        $wasteType = WasteType::find($wasteTypeId);
                        if ($wasteType) {
                            $wasteType->stok += $qty;
                            $wasteType->save();
                            $this->info("Added {$qty}kg to {$wasteType->name}");
                        } else {
                            $this->warn("WasteType not found: {$wasteTypeId}");
                        }
                    }
                }
            }
        }

        $this->info('');
        $this->info('Final Stock:');
        $wasteTypes = WasteType::all();
        foreach ($wasteTypes as $wt) {
            $this->line("{$wt->name}: {$wt->stok} kg");
        }

        $this->info('');
        $this->info('Done!');
        
        return 0;
    }
}
