<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BankSampahController;
use App\Http\Controllers\Api\CustomerAccountController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\LocationStatsController;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\TransactionLogController;
use App\Http\Controllers\Api\UpdateLogController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WasteTypeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Si-Banka (Sistem Informasi Bank Sampah)
|--------------------------------------------------------------------------
|
| Route dikelompokkan berdasarkan domain fungsi:
| 1. Auth & Registration (Public)
| 2. Auth Profile (Protected)
| 3. User Management
| 4. Bank Sampah
| 5. Customer (Nasabah) — Data & Account
| 6. Waste Type (Jenis Sampah)
| 7. Transaction (Transaksi)
| 8. Logs (Riwayat Perubahan)
| 9. Statistics (Statistik Lokasi)
|
*/

// ─────────────────────────────────────────────────────
//  1. AUTH & REGISTRATION (Public)
// ─────────────────────────────────────────────────────

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [RegistrationController::class, 'register']);
Route::post('/resend-verification', [RegistrationController::class, 'resendVerification']);
Route::post('/email/resend-verification', [RegistrationController::class, 'resendVerification']);
Route::get('/verify-email/{id}/{hash}', [RegistrationController::class, 'verifyEmail'])->name('verification.verify');


// ─────────────────────────────────────────────────────
//  PROTECTED ROUTES (require auth:sanctum)
// ─────────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {

    // ─────────────────────────────────────────────
    //  2. AUTH PROFILE
    // ─────────────────────────────────────────────

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);

    // ─────────────────────────────────────────────
    //  3. USER MANAGEMENT
    // ─────────────────────────────────────────────

    Route::apiResource('users', UserController::class);

    // ─────────────────────────────────────────────
    //  4. BANK SAMPAH
    // ─────────────────────────────────────────────

    Route::get('/bank-sampah', [BankSampahController::class, 'index']);
    Route::post('/bank-sampah', [BankSampahController::class, 'store']);
    Route::get('/bank-sampah/statistics', [BankSampahController::class, 'statistics']);
    Route::get('/bank-sampah/{bankSampah}', [BankSampahController::class, 'show']);
    Route::put('/bank-sampah/{bankSampah}', [BankSampahController::class, 'update']);

    // ─────────────────────────────────────────────
    //  5. CUSTOMER (NASABAH) — Data
    // ─────────────────────────────────────────────

    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::post('/customers/{customer}/update', [CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
    Route::post('/customers/{customer}/transfer', [CustomerController::class, 'transfer']);

    // ─────────────────────────────────────────────
    //  5b. CUSTOMER (NASABAH) — Account Management
    // ─────────────────────────────────────────────

    Route::get('/customers/{customer}/account-status', [CustomerAccountController::class, 'checkAccountStatus']);
    Route::put('/customers/{customer}/password', [CustomerAccountController::class, 'updatePassword']);
    Route::post('/customers/{customer}/create-account', [CustomerAccountController::class, 'createAccount']);
    Route::post('/customers/generate-all-accounts', [CustomerAccountController::class, 'generateAllAccounts']);

    // ─────────────────────────────────────────────
    //  6. WASTE TYPE (JENIS SAMPAH)
    // ─────────────────────────────────────────────

    Route::get('/waste-types', [WasteTypeController::class, 'index']);
    Route::post('/waste-types', [WasteTypeController::class, 'store']);
    Route::put('/waste-types/{wasteType}', [WasteTypeController::class, 'update']);
    Route::delete('/waste-types/{wasteType}', [WasteTypeController::class, 'destroy']);

    // ─────────────────────────────────────────────
    //  7. TRANSACTION (TRANSAKSI)
    // ─────────────────────────────────────────────

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::post('/transactions/{transaction}/update', [TransactionController::class, 'update']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

    // ─────────────────────────────────────────────
    //  8. LOGS (RIWAYAT PERUBAHAN)
    // ─────────────────────────────────────────────

    Route::get('/update-log', [UpdateLogController::class, 'index']);
    Route::get('/transaction-logs', [TransactionLogController::class, 'index']);

    // ─────────────────────────────────────────────
    //  9. STATISTICS (DISTRIBUSI LOKASI)
    // ─────────────────────────────────────────────

    Route::get('/location-stats', [LocationStatsController::class, 'index']);
});
