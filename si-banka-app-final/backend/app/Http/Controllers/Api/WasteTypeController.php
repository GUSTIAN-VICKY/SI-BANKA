<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WasteType;
use App\Models\BankSampah;
use Illuminate\Http\Request;

class WasteTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     * Multi-tenant: Filter by bank_sampah_id based on user role.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Super Admin Kota dan Admin Kota can see all waste types
        if ($user->canViewAllData()) {
            $wasteTypes = WasteType::with('bankSampah:id,name,rt,rw,alamat,kecamatan,kelurahan')->get();
        } else {
            // Other users can only see their bank sampah's waste types
            // Also include global waste types (bank_sampah_id is null)
            $wasteTypes = WasteType::where(function ($query) use ($user) {
                $query->where('bank_sampah_id', $user->bank_sampah_id)
                      ->orWhereNull('bank_sampah_id');
            })->get();
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $wasteTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * Multi-tenant: Auto-assign bank_sampah_id from the current user.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Nasabah cannot create waste types
        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk menambah jenis sampah.'
            ], 403);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'bank_sampah_id' => 'nullable|exists:bank_sampah,id',
        ]);

        // Auto-assign bank_sampah_id for non level-kota users
        if (!$user->canViewAllData()) {
            $validated['bank_sampah_id'] = $user->bank_sampah_id;
        }
        
        // Check unique name within the same bank_sampah
        $existingWasteType = WasteType::where('name', $validated['name'])
            ->where('bank_sampah_id', $validated['bank_sampah_id'] ?? null)
            ->first();
            
        if ($existingWasteType) {
            return response()->json([
                'status' => 'error',
                'message' => 'Jenis sampah dengan nama tersebut sudah ada di Bank Sampah ini.'
            ], 422);
        }

        $wasteType = WasteType::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $wasteType
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     * Multi-tenant: Verify ownership before updating.
     */
    public function update(Request $request, WasteType $wasteType)
    {
        $user = $request->user();
        
        // Nasabah cannot update waste types
        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk mengubah jenis sampah.'
            ], 403);
        }
        
        // Super Admin Kota can modify all waste types
        // Admin Kota can only view, not modify
        // RT-level admins can only modify their own bank sampah's waste types
        if (!$user->isSuperAdminKota()) {
            if ($user->isAdminKota()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Admin Kota hanya dapat melihat data, tidak dapat mengubah.'
                ], 403);
            }
            if ($wasteType->bank_sampah_id !== $user->bank_sampah_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke jenis sampah ini.'
                ], 403);
            }
        }
        
        $validated = $request->validate([
            'price' => 'sometimes|required|numeric|min:0',
            'stok' => 'sometimes|required|numeric',
            'name' => 'sometimes|string|max:255',
        ]);
        
        // Check unique name within the same bank_sampah (excluding current)
        if (isset($validated['name'])) {
            $existingWasteType = WasteType::where('name', $validated['name'])
                ->where('bank_sampah_id', $wasteType->bank_sampah_id)
                ->where('id', '!=', $wasteType->id)
                ->first();
                
            if ($existingWasteType) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Jenis sampah dengan nama tersebut sudah ada.'
                ], 422);
            }
        }

        // Log price change
        if ($request->has('price') && $request->price != $wasteType->price) {
            \App\Models\UpdateLog::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'date' => now()->timezone(config('app.timezone')), 
                'itemId' => $wasteType->id,
                'itemName' => $wasteType->name,
                'changeType' => 'Harga',
                'oldValue' => $wasteType->price,
                'newValue' => $request->price,
                'admin' => $request->user()->name,
                'user_id' => $request->user()->id,
                'bank_sampah_id' => $wasteType->bank_sampah_id,
            ]);
        }

        $wasteType->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $wasteType
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * Multi-tenant: Verify ownership before deleting.
     */
    public function destroy(Request $request, WasteType $wasteType)
    {
        $user = $request->user();
        
        // Nasabah cannot delete waste types
        if ($user->isNasabah()) {
            return response()->json([
                'message' => 'Nasabah tidak memiliki akses untuk menghapus jenis sampah.'
            ], 403);
        }
        
        // Super Admin Kota can delete all waste types
        // Admin Kota cannot delete
        // RT-level admins can only delete their own bank sampah's waste types
        if (!$user->isSuperAdminKota()) {
            if ($user->isAdminKota()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Admin Kota tidak dapat menghapus jenis sampah.'
                ], 403);
            }
            if ($wasteType->bank_sampah_id !== $user->bank_sampah_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak memiliki akses ke jenis sampah ini.'
                ], 403);
            }
        }
        
        $wasteType->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Jenis sampah berhasil dihapus'
        ], 204);
    }
}
