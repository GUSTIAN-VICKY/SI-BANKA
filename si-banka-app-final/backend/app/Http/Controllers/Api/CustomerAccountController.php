<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * CustomerAccountController
 * 
 * Mengelola akun login nasabah (pembuatan akun, cek status, update password).
 * Dipisahkan dari CustomerController agar fokus pada domain masing-masing:
 * - CustomerController     → CRUD data nasabah
 * - CustomerAccountController → Manajemen akun login nasabah
 */
class CustomerAccountController extends Controller
{
    public function __construct(
        private readonly AccountService $accountService
    ) {}

    /**
     * Cek apakah nasabah punya akun login.
     * 
     * GET /api/customers/{customer}/account-status
     */
    public function checkAccountStatus(Customer $customer)
    {
        $user = User::where('customer_id', $customer->id)->first();

        return response()->json([
            'status' => 'success',
            'hasAccount' => $user !== null,
            'username' => $user?->username,
        ]);
    }

    /**
     * Update password akun nasabah.
     * 
     * PUT /api/customers/{customer}/password
     */
    public function updatePassword(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('customer_id', $customer->id)->first();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akun user untuk nasabah ini tidak ditemukan.',
            ], 404);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah untuk username: ' . $user->username,
        ]);
    }

    /**
     * Buat akun login untuk nasabah yang belum punya akun.
     * 
     * POST /api/customers/{customer}/create-account
     */
    public function createAccount(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        // Cek apakah sudah punya akun
        $existingUser = User::where('customer_id', $customer->id)->first();
        if ($existingUser) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nasabah ini sudah punya akun dengan username: ' . $existingUser->username,
            ], 400);
        }

        $user = $this->accountService->createNasabahAccount($customer, $validated['password']);

        return response()->json([
            'status' => 'success',
            'message' => 'Akun berhasil dibuat',
            'username' => $user->username,
        ]);
    }

    /**
     * Generate akun untuk SEMUA nasabah yang belum punya akun.
     * 
     * POST /api/customers/generate-all-accounts
     */
    public function generateAllAccounts(Request $request)
    {
        $defaultPassword = $request->input('password', '123456');

        $created = $this->accountService->generateAllAccounts($defaultPassword);

        return response()->json([
            'status' => 'success',
            'message' => count($created) . ' akun berhasil dibuat dengan password default: ' . $defaultPassword,
            'created' => $created,
            'total_created' => count($created),
        ]);
    }
}
