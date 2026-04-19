<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankSampah;
use App\Models\Customer;
use App\Models\User;
use App\Services\AccountService;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

/**
 * CustomerController
 * 
 * Mengelola CRUD data nasabah (Customer).
 * Untuk manajemen akun login nasabah, lihat CustomerAccountController.
 */
class CustomerController extends Controller
{
    public function __construct(
        private readonly AccountService $accountService,
        private readonly StockService $stockService
    ) {}

    // ──────────────────────────────────────────────
    //  READ
    // ──────────────────────────────────────────────

    /**
     * Tampilkan daftar nasabah.
     * Multi-tenant: filter berdasarkan bank_sampah_id.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->canViewAllData()) {
            $customers = Customer::with('bankSampah:id,name,rt,rw,alamat,kecamatan,kelurahan')->get();
        } else {
            $customers = Customer::where('bank_sampah_id', $user->bank_sampah_id)
                ->with('bankSampah:id,name,rt,rw,alamat,kecamatan,kelurahan')
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $customers,
        ]);
    }

    // ──────────────────────────────────────────────
    //  CREATE
    // ──────────────────────────────────────────────

    /**
     * Tambah nasabah baru.
     * Otomatis membuat akun user untuk nasabah.
     */
    public function store(Request $request)
    {
        $currentUser = $request->user();
        $autoAssignLocation = $currentUser->bank_sampah_id !== null;

        // Validation rules
        $rules = [
            'id' => 'required|string|max:255|unique:customers,id',
            'name' => 'required|string|max:255',
            'alamat' => 'nullable|string|max:500',
            'balance' => 'sometimes|numeric|min:0',
            'last_deposit' => 'sometimes|date',
            'photo' => 'nullable|image|max:10240',
            'password' => 'required|string|min:6',
        ];

        if (!$autoAssignLocation) {
            $rules['rt'] = 'required|string|max:10';
            $rules['rw'] = 'required|string|max:10';
            $rules['bank_sampah_id'] = 'required|uuid|exists:bank_sampah,id';
        }

        $validated = $request->validate($rules);

        // Auto-assign lokasi dari Bank Sampah admin
        if ($autoAssignLocation) {
            $bankSampah = BankSampah::find($currentUser->bank_sampah_id);
            $validated['bank_sampah_id'] = $currentUser->bank_sampah_id;
            $validated['rt'] = $bankSampah->rt;
            $validated['rw'] = $bankSampah->rw;
        }

        // Upload foto jika ada
        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('profile_photos', 'public');
        }

        // Cek apakah nasabah dengan nama sama sudah ada (termasuk soft-deleted)
        $existingCustomer = Customer::withTrashed()
            ->where('name', $validated['name'])
            ->where('bank_sampah_id', $validated['bank_sampah_id'])
            ->first();

        if ($existingCustomer) {
            if ($existingCustomer->trashed()) {
                $existingCustomer->restore();
            }

            if (isset($validated['photo_path'])) {
                $existingCustomer->photo_path = $validated['photo_path'];
            }

            $existingCustomer->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Customer restored and updated',
                'data' => $existingCustomer,
            ], 200);
        }

        // Buat customer baru
        $customer = Customer::create($validated);

        // Buat akun user nasabah via AccountService
        $user = $this->accountService->createNasabahAccount(
            $customer,
            $validated['password'],
            $validated['bank_sampah_id']
        );

        return response()->json([
            'status' => 'success',
            'data' => $customer,
            'user_account' => [
                'username' => $user->username,
                'message' => 'Akun nasabah berhasil dibuat. Login dengan username: ' . $user->username,
            ],
        ], 201);
    }

    // ──────────────────────────────────────────────
    //  UPDATE
    // ──────────────────────────────────────────────

    /**
     * Update data nasabah.
     * Multi-tenant: verifikasi akses sebelum update.
     */
    public function update(Request $request, Customer $customer)
    {
        $user = $request->user();

        // Nasabah tidak boleh update data nasabah lain
        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk mengubah data nasabah lain.',
            ], 403);
        }

        // Verifikasi tenant access
        if (!$user->isSuperAdminKota() && $customer->bank_sampah_id !== $user->bank_sampah_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke nasabah ini.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'rt' => 'sometimes|string|max:10',
            'rw' => 'sometimes|string|max:10',
            'alamat' => 'sometimes|nullable|string|max:500',
            'photo' => 'nullable|image|max:10240',
        ]);

        // Upload foto baru, hapus foto lama
        if ($request->hasFile('photo')) {
            if ($customer->photo_path && Storage::disk('public')->exists($customer->photo_path)) {
                Storage::disk('public')->delete($customer->photo_path);
            }

            $validated['photo_path'] = $request->file('photo')->store('profile_photos', 'public');
            unset($validated['photo']);
        }

        $customer->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $customer,
        ]);
    }

    // ──────────────────────────────────────────────
    //  TRANSFER
    // ──────────────────────────────────────────────

    /**
     * Transfer nasabah ke Bank Sampah lain.
     * Hanya Super Admin Kota yang bisa melakukan transfer.
     * 
     * POST /api/customers/{customer}/transfer
     */
    public function transfer(Request $request, Customer $customer)
    {
        $user = $request->user();

        if (!$user->isSuperAdminKota()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Super Admin Kota yang dapat memindahkan nasabah antar Bank Sampah.',
            ], 403);
        }

        $validated = $request->validate([
            'bank_sampah_id' => 'required|uuid|exists:bank_sampah,id',
        ]);

        $targetBankSampah = BankSampah::find($validated['bank_sampah_id']);

        if (!$targetBankSampah) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bank Sampah tujuan tidak ditemukan.',
            ], 404);
        }

        // Cek duplikasi nama di Bank Sampah tujuan
        $existingCustomer = Customer::where('name', $customer->name)
            ->where('bank_sampah_id', $validated['bank_sampah_id'])
            ->where('id', '!=', $customer->id)
            ->first();

        if ($existingCustomer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nasabah dengan nama yang sama sudah ada di Bank Sampah tujuan.',
            ], 422);
        }

        $oldBankSampah = $customer->bankSampah;

        // Update customer
        $customer->bank_sampah_id = $validated['bank_sampah_id'];
        $customer->rt = $targetBankSampah->rt;
        $customer->rw = $targetBankSampah->rw;
        $customer->save();

        // Update akun user terkait
        $userAccount = User::where('customer_id', $customer->id)->first();
        if ($userAccount) {
            $userAccount->bank_sampah_id = $validated['bank_sampah_id'];
            $userAccount->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Nasabah berhasil dipindahkan ke ' . $targetBankSampah->name,
            'data' => [
                'customer' => $customer->fresh()->load('bankSampah'),
                'from' => $oldBankSampah ? $oldBankSampah->name : 'Tidak diketahui',
                'to' => $targetBankSampah->name,
            ],
        ]);
    }

    // ──────────────────────────────────────────────
    //  DELETE
    // ──────────────────────────────────────────────

    /**
     * Hapus nasabah beserta data terkait (transaksi, stok, foto).
     * Multi-tenant: verifikasi akses sebelum hapus.
     */
    public function destroy(Request $request, Customer $customer)
    {
        $user = $request->user();

        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk menghapus data.',
            ], 403);
        }

        if (!$user->isSuperAdminKota() && $customer->bank_sampah_id !== $user->bank_sampah_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak memiliki akses ke nasabah ini.',
            ], 403);
        }

        DB::transaction(function () use ($customer) {
            // 1. Revert stok untuk setiap transaksi nasabah
            $transactions = \App\Models\Transaction::where('customerId', $customer->id)->get();

            foreach ($transactions as $transaction) {
                if (!empty($transaction->items)) {
                    $this->stockService->revertStock($transaction->items);
                }
                $transaction->delete();
            }

            // 2. Hapus foto
            if ($customer->photo_path && Storage::disk('public')->exists($customer->photo_path)) {
                Storage::disk('public')->delete($customer->photo_path);
            }

            // 3. Hapus customer
            $customer->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Customer and related data deleted successfully',
        ], 200);
    }
}
