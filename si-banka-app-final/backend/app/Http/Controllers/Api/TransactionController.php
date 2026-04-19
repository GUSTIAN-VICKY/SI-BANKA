<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionLog;
use App\Services\BalanceService;
use App\Services\StockService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * TransactionController
 * 
 * Mengelola CRUD transaksi setoran sampah.
 * Menggunakan StockService dan BalanceService untuk operasi stok dan saldo,
 * sehingga controller fokus pada orchestration (validasi, authorize, response).
 */
class TransactionController extends Controller
{
    public function __construct(
        private readonly StockService $stockService,
        private readonly BalanceService $balanceService
    ) {}

    // ──────────────────────────────────────────────
    //  READ
    // ──────────────────────────────────────────────

    /**
     * Tampilkan daftar transaksi.
     * Multi-tenant: filter berdasarkan bank_sampah_id.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->canViewAllData()) {
            $transactions = Transaction::with([
                'user',
                'customer.bankSampah:id,name,rt,rw,alamat,kecamatan,kelurahan',
            ])->get();
        } else {
            $transactions = Transaction::where('bank_sampah_id', $user->bank_sampah_id)
                ->with(['user', 'customer'])
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }

    // ──────────────────────────────────────────────
    //  CREATE
    // ──────────────────────────────────────────────

    /**
     * Buat transaksi baru.
     * Otomatis update saldo nasabah dan stok sampah.
     * Multi-tenant: auto-assign bank_sampah_id.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk membuat transaksi.',
            ], 403);
        }

        $validated = $request->validate([
            'customerId' => 'required|exists:customers,id',
            'items' => 'required',
            'total' => 'required|numeric',
            'date' => 'required',
            'image' => 'nullable|image|max:10240',
        ]);

        // Verifikasi customer milik bank sampah yang sama
        $customer = Customer::find($validated['customerId']);
        if (!$user->canViewAllData() && $customer->bank_sampah_id !== $user->bank_sampah_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nasabah tidak terdaftar di Bank Sampah Anda.',
            ], 403);
        }

        // Persiapan data transaksi
        $validated['id'] = Str::uuid()->toString();
        $validated['bank_sampah_id'] = $user->canViewAllData()
            ? $customer->bank_sampah_id
            : $user->bank_sampah_id;
        $validated['user_id'] = $user->id;

        if ($request->hasFile('image')) {
            $validated['proof_image'] = $request->file('image')->store('proofs', 'public');
        }

        if (is_string($validated['items'])) {
            $validated['items'] = json_decode($validated['items'], true);
        }

        // Eksekusi dalam database transaction
        $transaction = DB::transaction(function () use ($validated, $customer, $request) {
            // 1. Simpan transaksi
            $validated['date'] = Carbon::parse($validated['date'])
                ->setTimezone(config('app.timezone'))
                ->format('Y-m-d H:i:s');

            $transaction = Transaction::create($validated);

            // 2. Update saldo nasabah
            if ($customer) {
                $this->balanceService->addBalance($customer, $validated['total'], $validated['date']);
            }

            // 3. Update stok sampah
            $this->stockService->addStock($validated['items']);

            // 4. Catat log
            TransactionLog::create([
                'transaction_id' => $transaction->id,
                'user_id' => $request->user()->id,
                'action' => 'CREATE',
                'details' => [
                    'transaction' => $transaction->toArray(),
                    'items' => $validated['items'],
                    'customer_balance_after' => $customer ? $customer->balance : null,
                ],
            ]);

            return $transaction;
        });

        return response()->json([
            'status' => 'success',
            'data' => $transaction,
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  UPDATE
    // ──────────────────────────────────────────────

    /**
     * Update transaksi.
     * Revert efek lama (stok & saldo), lalu apply efek baru.
     * Multi-tenant: verifikasi akses sebelum update.
     */
    public function update(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk mengubah transaksi.',
            ], 403);
        }

        if (!$user->isSuperAdminKota() && $transaction->bank_sampah_id !== $user->bank_sampah_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke transaksi ini.',
            ], 403);
        }

        $validated = $request->validate([
            'customerId' => 'sometimes|required|exists:customers,id',
            'items' => 'sometimes|required',
            'total' => 'sometimes|required|numeric',
            'date' => 'sometimes|required',
            'proof_image' => 'nullable|image|max:10240',
        ]);

        // Upload gambar bukti baru
        if ($request->hasFile('proof_image')) {
            if ($transaction->proof_image && Storage::disk('public')->exists($transaction->proof_image)) {
                Storage::disk('public')->delete($transaction->proof_image);
            }
            $validated['proof_image'] = $request->file('proof_image')->store('proofs', 'public');
        }

        if (isset($validated['items']) && is_string($validated['items'])) {
            $validated['items'] = json_decode($validated['items'], true);
        }

        $validated['date'] = now()->timezone(config('app.timezone'))->format('Y-m-d H:i:s');

        DB::transaction(function () use ($transaction, $validated, $request) {
            // Simpan data lama untuk logging
            $originalTotal = $transaction->total;
            $originalItems = $transaction->items;
            $originalDate = $transaction->date;

            // 1. Revert efek lama
            $customer = Customer::find($transaction->customerId);
            if ($customer) {
                $this->balanceService->revertBalance($customer, $transaction->total);
            }

            if (!empty($transaction->items)) {
                $this->stockService->revertStock($transaction->items);
            }

            // 2. Update transaksi
            $transaction->update($validated);
            $transaction->refresh();

            // 3. Apply efek baru
            if ($customer) {
                $this->balanceService->addBalance($customer, $transaction->total, $validated['date']);
            }

            if (!empty($transaction->items)) {
                $this->stockService->addStock(
                    is_string($transaction->items) ? json_decode($transaction->items, true) : $transaction->items
                );
            }

            // 4. Catat log
            TransactionLog::create([
                'transaction_id' => $transaction->id,
                'user_id' => $request->user()->id,
                'action' => 'UPDATE',
                'details' => [
                    'old_data' => [
                        'total' => $originalTotal,
                        'items' => is_string($originalItems) ? json_decode($originalItems, true) : $originalItems,
                        'date' => $originalDate,
                    ],
                    'new_data' => [
                        'total' => $transaction->total,
                        'items' => $validated['items'] ?? $transaction->items,
                        'date' => $transaction->date,
                    ],
                ],
            ]);
        });

        return response()->json([
            'status' => 'success',
            'data' => $transaction,
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE
    // ──────────────────────────────────────────────

    /**
     * Hapus transaksi.
     * Revert efek stok dan saldo, lalu hapus data.
     * Multi-tenant: verifikasi akses sebelum hapus.
     */
    public function destroy(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk menghapus transaksi.',
            ], 403);
        }

        if (!$user->isSuperAdminKota() && $transaction->bank_sampah_id !== $user->bank_sampah_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke transaksi ini.',
            ], 403);
        }

        DB::transaction(function () use ($transaction, $request) {
            // 1. Revert saldo nasabah
            $customer = Customer::find($transaction->customerId);
            if ($customer) {
                $this->balanceService->revertBalance($customer, $transaction->total);
            }

            // 2. Revert stok sampah
            if (!empty($transaction->items)) {
                $this->stockService->revertStock($transaction->items);
            }

            // 3. Catat log sebelum hapus
            TransactionLog::create([
                'transaction_id' => $transaction->id,
                'user_id' => $request->user()->id,
                'action' => 'DELETE',
                'details' => [
                    'transaction' => $transaction->toArray(),
                    'items' => is_string($transaction->items) ? json_decode($transaction->items, true) : $transaction->items,
                ],
            ]);

            // 4. Hapus transaksi
            $transaction->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Transaksi berhasil dihapus dan efeknya telah dibatalkan',
        ], 204);
    }
}
