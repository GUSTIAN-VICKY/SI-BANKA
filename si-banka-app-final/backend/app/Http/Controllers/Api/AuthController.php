<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string', // Accept email or username
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Invalid Credentials', 'errors' => $validator->errors()], 422);
        }

        $loginField = trim($request->email);
        $password = trim($request->password);
        
        // Cek apakah input adalah email atau username
        // Jika mengandung @, treat as email. Otherwise treat as username
        if (str_contains($loginField, '@')) {
            // Login via email (untuk admin)
            $user = User::where('email', $loginField)->first();
        } else {
            // Login via username (untuk nasabah)
            // Format username: nama_depan.nama_belakang (misal: gustian.hernandy)
            $usernameFormatted = strtolower(str_replace(' ', '.', $loginField));
            // Jika user ketik dengan format lain (spasi/underscore), normalisasi
            $usernameFormatted = preg_replace('/[\\s_]+/', '.', $usernameFormatted);
            $user = User::where('username', $usernameFormatted)->first();
        }

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['message' => 'Email/Username atau password salah.'], 401);
        }

        if (!$user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email belum diverifikasi. Silakan cek inbox email Anda.'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $user->load(['bankSampah', 'customer']);

        return response()->json([
            'message' => 'Login success',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        // Eager load relations so frontend always has Bank Sampah / Customer data
        $user->load(['bankSampah', 'customer']);
        
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'photo' => 'nullable|image|max:2048', // Max 2MB
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation Error', 'errors' => $validator->errors()], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->photo_path && Storage::disk('public')->exists($user->photo_path)) {
                Storage::disk('public')->delete($user->photo_path);
            }

            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->photo_path = $path;
        } elseif ($request->reset_photo == 'true') {
             // Handle photo deletion if requested
             if ($user->photo_path && Storage::disk('public')->exists($user->photo_path)) {
                Storage::disk('public')->delete($user->photo_path);
            }
            $user->photo_path = null;
        }

        $user->save();

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }
}
