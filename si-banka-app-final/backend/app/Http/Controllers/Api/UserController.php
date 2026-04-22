<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     * Multi-tenant: Super Admin RT hanya bisa lihat user dari bank sampah mereka.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Super Admin Kota dan Admin Kota bisa lihat semua user
        if ($user->canViewAllData()) {
            $users = User::with(['customer', 'bankSampah:id,name,rt,rw,alamat'])->latest()->get();
        } else {
            // Super Admin RT hanya bisa lihat user dari bank sampah mereka
            $users = User::with(['customer', 'bankSampah:id,name,rt,rw,alamat'])
                ->where('bank_sampah_id', $user->bank_sampah_id)
                ->latest()
                ->get();
        }
        
        return response()->json($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Enforce RBAC - Only Super Admin (Kota/RT) can manage users
        if (!$request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized. Hanya Super Admin yang bisa membuat user.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'photo' => 'nullable|image|max:2048',
            'role' => 'nullable|in:super_admin_kota,admin_kota,super_admin_rt,admin_rt,nasabah,super_admin,admin', // Include legacy
            'customer_id' => 'nullable|exists:customers,id', // Link ke nasabah jika role=nasabah
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation Error', 'errors' => $validator->errors()], 422);
        }

        $user = new User();
        $user->name = $request->name;
        $user->email = $request->email;
        $user->password = Hash::make($request->password);
        $user->role = $request->role ?? 'admin_rt'; // Default to admin_rt
        
        // Jika role adalah nasabah, set customer_id
        if ($request->role === 'nasabah' && $request->customer_id) {
            $user->customer_id = $request->customer_id;
        }

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->photo_path = $path;
        }

        // Admin-created users are auto-verified
        $user->email_verified_at = now();

        $user->save();

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Enforce RBAC - Only Super Admin can manage users
        if (!$request->user()->canManageUsers()) {
             // Optional: Allow user to update their own profile via this endpoint? 
             // Usually updateProfile is for self, this is for admin managing others.
             // We'll restrict strict management to super_admin.
             return response()->json(['message' => 'Unauthorized. Hanya Super Admin yang bisa mengubah user.'], 403);
        }

        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'photo' => 'nullable|image|max:2048',
            'role' => 'nullable|in:super_admin_kota,admin_kota,super_admin_rt,admin_rt,nasabah,super_admin,admin',
            'customer_id' => 'nullable|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation Error', 'errors' => $validator->errors()], 422);
        }

        $user->name = $request->name;
        $user->email = $request->email;
        if ($request->filled('role')) {
             $user->role = $request->role;
        }
        
        // Update customer_id jika role adalah nasabah
        if ($request->role === 'nasabah') {
            $user->customer_id = $request->customer_id;
        } elseif ($request->role && $request->role !== 'nasabah') {
            $user->customer_id = null; // Clear customer_id jika bukan nasabah
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->photo_path && Storage::disk('public')->exists($user->photo_path)) {
                Storage::disk('public')->delete($user->photo_path);
            }
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->photo_path = $path;
        } elseif ($request->reset_photo == 'true') {
             $user->photo_path = null;
        }

        // Ensure user is verified if managed by admin
        if (!$user->email_verified_at) {
            $user->email_verified_at = now();
        }

        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        // Enforce RBAC - Only Super Admin can manage users
        if (!$request->user()->canManageUsers()) {
            return response()->json(['message' => 'Unauthorized. Hanya Super Admin yang bisa menghapus user.'], 403);
        }

        $user = User::findOrFail($id);

        // Prevent deleting self
        if ($request->user()->id == $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        // Logic to handle Bank Sampah deletion if this is the last Super Admin RT
        if ($user->isSuperAdminRT() && $user->bank_sampah_id) {
            $bankSampahId = $user->bank_sampah_id;
            
            // Check if there are other Super Admin RTs for this Bank Sampah
            $otherAdminsCount = User::where('bank_sampah_id', $bankSampahId)
                ->where('role', 'super_admin_rt')     
                ->where('id', '!=', $user->id)
                ->count();
            
            if ($otherAdminsCount === 0) {
                 // This was the only admin, delete the Bank Sampah
                 // Use find to avoid error if already deleted
                 $bankSampah = \App\Models\BankSampah::find($bankSampahId);
                 if ($bankSampah) {
                     $bankSampah->delete();
                 }
            }
        }

        if ($user->photo_path && Storage::disk('public')->exists($user->photo_path)) {
            Storage::disk('public')->delete($user->photo_path);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
