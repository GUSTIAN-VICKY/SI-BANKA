<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BankSampah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BankSampahController extends Controller
{
    /**
     * Display a listing of Bank Sampah
     * Super Admin Kota: All
     * Super Admin RT/Admin: Only their own
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Super Admin Kota can see all active/managed Bank Sampahs
        if ($user->isSuperAdminKota()) {
            $bankSampah = BankSampah::with(['superAdmin:id,name,email,bank_sampah_id'])
                ->has('superAdmin') // Only show Bank Sampah that has an active Super Admin RT
                ->withCount(['customers', 'transactions', 'users'])
                ->orderBy('kota')
                ->orderBy('kecamatan')
                ->orderBy('kelurahan')
                ->orderBy('rw')
                ->orderBy('rt')
                ->get();
        } else {
            // Others can only see their own
            $bankSampah = BankSampah::where('id', $user->bank_sampah_id)
                ->with(['superAdmin:id,name,email,bank_sampah_id'])
                ->withCount(['customers', 'transactions', 'users'])
                ->get();
        }

        return response()->json([
            'status' => 'success',
            'data' => $bankSampah
        ]);
    }

    /**
     * Store a newly created Bank Sampah (Super Admin Kota only)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdminKota()) {
            return response()->json([
                'message' => 'Unauthorized. Only Super Admin Kota can create Bank Sampah.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
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

        // Check if location already exists
        $exists = BankSampah::where('rt', $request->rt)
            ->where('rw', $request->rw)
            ->where('kelurahan', $request->kelurahan)
            ->where('kecamatan', $request->kecamatan)
            ->where('kota', $request->kota)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Bank Sampah untuk lokasi ini sudah ada'
            ], 422);
        }

        $bankSampah = BankSampah::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'rt' => $request->rt,
            'rw' => $request->rw,
            'kelurahan' => $request->kelurahan,
            'kecamatan' => $request->kecamatan,
            'kota' => $request->kota,
            'alamat' => $request->alamat,
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Bank Sampah created successfully',
            'data' => $bankSampah
        ], 201);
    }

    /**
     * Display the specified Bank Sampah
     */
    public function show(Request $request, string $id)
    {
        $user = $request->user();
        $bankSampah = BankSampah::with(['superAdmin', 'users'])
            ->withCount(['customers', 'transactions'])
            ->findOrFail($id);

        // Check access
        if (!$user->isSuperAdminKota() && $user->bank_sampah_id !== $id) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json($bankSampah);
    }

    /**
     * Update the specified Bank Sampah
     */
    public function update(Request $request, string $id)
    {
        $user = $request->user();
        $bankSampah = BankSampah::findOrFail($id);

        // Only Super Admin Kota or Super Admin RT of that bank can update
        if (!$user->isSuperAdminKota() && 
            !($user->isSuperAdminRT() && $user->bank_sampah_id === $id)) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'alamat' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $bankSampah->update($request->only(['name', 'alamat', 'is_active']));

        return response()->json([
            'message' => 'Bank Sampah updated successfully',
            'data' => $bankSampah
        ]);
    }

    /**
     * Get statistics for dashboard
     */
    public function statistics(Request $request)
    {
        $user = $request->user();

        if ($user->isSuperAdminKota()) {
            // City-wide statistics
            return response()->json([
                'total_bank_sampah' => BankSampah::has('superAdmin')->count(),
                'total_active' => BankSampah::has('superAdmin')->where('is_active', true)->count(),
                'by_kota' => BankSampah::has('superAdmin')
                    ->selectRaw('kota, COUNT(*) as count')
                    ->groupBy('kota')
                    ->get(),
            ]);
        } else {
            // Single Bank Sampah statistics
            $bankSampah = BankSampah::withCount(['customers', 'transactions', 'users'])
                ->find($user->bank_sampah_id);

            return response()->json([
                'bank_sampah' => $bankSampah,
            ]);
        }
    }
}
