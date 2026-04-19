<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankSampah;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class RegistrationController extends Controller
{
    /**
     * Register a new Bank Sampah and Super Admin RT
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'bank_sampah_name' => 'required|string|max:255',
            'rt' => 'required|string|max:10',
            'rw' => 'required|string|max:10',
            'kelurahan' => 'nullable|string|max:100',
            'kecamatan' => 'nullable|string|max:100',
            'kota' => 'required|string|max:100',
            'alamat' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if Bank Sampah location already exists
        $existingBankSampah = BankSampah::where('rt', $request->rt)
            ->where('rw', $request->rw)
            ->where('kelurahan', $request->kelurahan)
            ->where('kecamatan', $request->kecamatan)
            ->where('kota', $request->kota)
            ->first();

        if ($existingBankSampah) {
            return response()->json([
                'message' => 'Bank Sampah untuk lokasi ini sudah terdaftar',
                'errors' => ['location' => ['Lokasi RT/RW ini sudah memiliki Bank Sampah terdaftar']]
            ], 422);
        }

        // Use Transaction to rollback if email fails (only works for sync errors)
        try {
            \Illuminate\Support\Facades\DB::beginTransaction();

            // Create Bank Sampah
            $bankSampah = BankSampah::create([
                'id' => Str::uuid(),
                'name' => $request->bank_sampah_name,
                'rt' => $request->rt,
                'rw' => $request->rw,
                'kelurahan' => $request->kelurahan,
                'kecamatan' => $request->kecamatan,
                'kota' => $request->kota,
                'alamat' => $request->alamat,
                'is_active' => true,
            ]);

            // Create Super Admin RT user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => User::ROLE_SUPER_ADMIN_RT,
                'bank_sampah_id' => $bankSampah->id,
            ]);

            // Trigger email verification
            event(new Registered($user));

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'message' => 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
                'user' => $user->only(['id', 'name', 'email', 'role']),
                'bank_sampah' => $bankSampah,
            ], 201);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json([
                'message' => 'Gagal registrasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Resend email verification
     */
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email sudah terverifikasi'
            ], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Link verifikasi telah dikirim ulang ke email Anda'
        ]);
    }

    /**
     * Verify email
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Link verifikasi tidak valid'
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return view('auth.already-verified');
        }

        $user->markEmailAsVerified();

        // Return Backend View for stability
        return view('auth.verified');
    }
}
